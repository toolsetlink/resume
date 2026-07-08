# PDF 导出多余空白页问题修复方案

## 问题摘要
导出的 PDF 内容正确占 2 页，但多出了一页空白页（共 3 页）。

## 根本原因

`contentHeight` 被高估，导致分页计算多出一页。

**分页计算逻辑**（[usePdfExport.ts:156-159](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts#L156-L159)）：
```
contentHeightPerPage = A4_HEIGHT - margin * 2 = 1123 - 64 = 1059
totalPages = Math.ceil(contentHeight / 1059)
```

**contentHeight 的计算**（[usePdfExport.ts:124](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts#L124)）：
```typescript
const contentHeight = Math.max(sourceEl.scrollHeight, sourceEl.offsetHeight, A4_HEIGHT)
```

**问题链**：
1. `sourceEl`（#resume-preview）的 `minHeight` 已被设为 `'0'`（第 94 行）
2. 但 `clearConstraints` 递归清除子元素时，**只处理了 `overflow` 和 `maxHeight`，没有处理 `minHeight`**
3. 子元素 `.resume-preview-container` 有 `min-height: 100%`，各模板根元素也有 `min-height: 100%`
4. 这些子元素的 `min-height: 100%` 基于父容器高度计算，会反向撑大 `sourceEl` 的 `scrollHeight`
5. 导致 `scrollHeight` 比实际渲染内容多出若干像素（比如内容实际 2118px，但 scrollHeight 变成 2120px+）
6. `Math.ceil(2120 / 1059) = 3` → 多出一页空白

## 修复方案

在 `clearConstraints` 函数中增加对 `minHeight` 的清除（[usePdfExport.ts:99-112](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts#L99-L112)）：

```typescript
const clearConstraints = (el: Element) => {
  if (el instanceof HTMLElement) {
    const computed = window.getComputedStyle(el)
    if (computed.overflow !== 'visible') {
      el.style.overflow = 'visible'
    }
    if (computed.maxHeight !== 'none') {
      el.style.maxHeight = 'none'
    }
    // 新增：清除 min-height 限制，防止子元素反向撑大父容器高度
    if (computed.minHeight !== '0px') {
      el.style.minHeight = '0'
    }
  }
  Array.from(el.children).forEach(clearConstraints)
}
```

## 文件变更

- [app/composables/usePdfExport.ts](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts) — `clearConstraints` 函数增加 3 行 minHeight 处理

## 验证

1. 运行 `pnpm test` 确保无回归
2. 手动测试：导出 2 页内容的 PDF，确认只有 2 页无空白页
3. 手动测试：导出 1 页内容的 PDF，确认只有 1 页
4. 检查导出后页面布局正常（样式已恢复）
