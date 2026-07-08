# PDF 导出功能优化计划

## 概述

当前 PDF 导出虽然实现了分页功能，但导出的 PDF 仅显示简历预览的左上角部分内容，无法完整呈现所有信息。本计划将彻底修复此问题，确保导出的 PDF 完整、分页准确、排版美观。

---

## 当前状态分析

### 导出链路

```
WorkbenchHeader「导出 PDF」按钮
  → emit('export-pdf')
  → workbench/[id].vue handleExportPdf()
  → usePdfExport.exportToPdf()
  → html2canvas 渲染完整内容到 canvas
  → canvas.toDataURL 转为隐藏 img
  → html2pdf.js 对 img 进行分页
  → jsPDF 生成 PDF 文件
```

### 关键 DOM 层级

```html
<Splitpanes>
  <Pane :size="60">
    <div class="h-full overflow-auto bg-gray-100 p-6">   <!-- 滚动容器 -->
      <div id="resume-preview"
           class="mx-auto bg-white shadow-lg"
           style="width: 794px; min-height: 1123px;">    <!-- A4 wrapper(被捕获) -->
        <ResumePreview>
          <div class="resume-preview-container">
            <TemplateComponent />                         <!-- 模板内容 -->
          </div>
        </ResumePreview>
      </div>
    </div>
  </Pane>
</Splitpanes>
```

### 当前导出配置

```typescript
// app/composables/usePdfExport.ts
const canvas = await html2canvas(sourceEl, {
  scale: 2,
  useCORS: true,
  logging: false,
  backgroundColor: '#ffffff',
  windowWidth: sourceEl.scrollWidth,
  windowHeight: sourceEl.scrollHeight,
  scrollX: 0,
  scrollY: 0,
  onclone: (clonedDoc) => {
    const clonedEl = clonedDoc.getElementById(elementId)
    if (clonedEl?.parentElement) {
      clonedEl.parentElement.style.overflow = 'visible'
      clonedEl.parentElement.style.height = 'auto'
      clonedEl.parentElement.style.maxHeight = 'none'
    }
  },
})

// 转为隐藏 img 后交给 html2pdf.js 分页
const img = document.createElement('img')
img.src = canvas.toDataURL('image/jpeg', 0.98)
img.style.width = '794px'
// ...

html2pdf().set({
  html2canvas: {
    windowWidth: 794,
    windowHeight: img.naturalHeight / 2,
    // ...
  },
  // ...
}).from(img).save()
```

### 根本原因分析

#### 问题 1：滚动容器内的元素测量不准确（主要原因）

`#resume-preview` 位于 Splitpanes 的 `overflow-auto` 滚动容器内：
- 父容器高度被 `h-full` 限制为 Pane 的可视高度
- `sourceEl.scrollHeight` 可能无法正确反映完整内容高度
- html2canvas 对位于滚动容器内的元素存在已知裁剪问题
- `onclone` 回调只修复了父元素的 overflow，但未解决根本的测量问题

#### 问题 2：两步渲染导致信息丢失

当前方案分两步：
1. html2canvas 渲染 sourceEl 到 canvas
2. canvas 转为 img 后，html2pdf.js 再次对 img 进行渲染

第二步中 `windowHeight: img.naturalHeight / 2` 假设 img 的 naturalHeight 是 2x 缩放后的值，但如果第一步捕获的内容就不完整，后续处理也无法恢复丢失的内容。

#### 问题 3：缺少 CSS 分页规则

项目中没有 `break-inside: avoid` 等分页规则，`pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }` 中的 `css` 模式无法生效，长简历可能在 section 中间断页。

---

## 改动计划

### 改动 1：重构 usePdfExport.ts，采用"克隆到离屏容器"方案

**文件**：[app/composables/usePdfExport.ts](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts)

**方案**：在导出前，将 `#resume-preview` 元素克隆到一个离屏的固定尺寸容器中（挂载到 `document.body` 下，脱离 Splitpanes 滚动容器），然后对克隆节点执行 html2canvas 截图。这彻底解决了滚动容器裁剪和测量不准确的问题。

**具体改动**：

1. **新增辅助函数 `cloneToOffscreenContainer`**：将原元素深拷贝，挂载到 `position: fixed; left: -99999px; top: 0; width: 794px;` 的离屏 div 中
2. **重构 `exportToPdf`**：
   - 在调用 html2canvas 前克隆节点到离屏容器
   - 使用显式 `width: 794` 和 `height: clone.scrollHeight` 选项
   - 移除 `windowWidth` 和 `windowHeight` 选项（避免虚拟窗口高度不足）
   - 保留 `scrollX: 0, scrollY: 0`
   - 导出完成后移除离屏容器
3. **简化流程**：不再使用"canvas → img → html2pdf.js"的两步方案，直接用 html2pdf.js 处理克隆节点

**修改后核心代码**：

```typescript
export function usePdfExport() {
  const resumeStore = useResumeStore()
  const isExporting = ref(false)

  // 把原元素克隆到离屏容器，脱离 Splitpanes 滚动容器
  const cloneToOffscreen = (sourceEl: HTMLElement): { clone: HTMLElement; cleanup: () => void } => {
    const offscreen = document.createElement('div')
    offscreen.style.position = 'fixed'
    offscreen.style.left = '-99999px'
    offscreen.style.top = '0'
    offscreen.style.width = '794px'
    offscreen.style.background = '#ffffff'
    
    const clone = sourceEl.cloneNode(true) as HTMLElement
    clone.style.margin = '0'
    clone.style.boxShadow = 'none'
    offscreen.appendChild(clone)
    document.body.appendChild(offscreen)
    
    return {
      clone,
      cleanup: () => offscreen.remove(),
    }
  }

  const exportToPdf = async (options?: {
    elementId?: string
    title?: string
    margin?: number
  }) => {
    if (!import.meta.client) return

    const elementId = options?.elementId || 'resume-preview'
    const title = options?.title || resumeStore.activeResume?.title || '简历'
    const margin = options?.margin ?? resumeStore.activeResume?.globalSettings?.pagePadding ?? 32

    const sourceEl = document.getElementById(elementId)
    if (!sourceEl) {
      throw new Error(`找不到导出元素 #${elementId}`)
    }

    isExporting.value = true
    const { clone, cleanup } = cloneToOffscreen(sourceEl)

    try {
      const html2pdf = (await import('html2pdf.js')).default

      // 显式捕获宽高，确保完整截取
      const captureWidth = 794
      const captureHeight = Math.max(clone.scrollHeight, 1123)

      const opt = {
        margin: [margin, margin, margin, margin],
        filename: `${getSafeFileName(title)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: captureWidth,
          height: captureHeight,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: 'px',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }

      await html2pdf().set(opt).from(clone).save()
    } finally {
      cleanup()
      isExporting.value = false
    }
  }

  return { isExporting, exportToPdf }
}
```

**理由**：
- 离屏容器脱离 Splitpanes 滚动父级，html2canvas 不再受 `overflow-auto` 裁剪影响
- 显式 `width: 794` 和 `height: scrollHeight` 确保 html2canvas 捕获完整内容
- 移除 `windowWidth` 避免虚拟窗口高度不足导致的顶部截取
- 克隆节点保留原始 DOM 结构与计算样式，导出效果与预览一致

### 改动 2：为模板 section 组件添加 `break-inside: avoid` 分页规则

**文件**：[app/assets/css/main.css](file:///Users/songang/LinkProjects/ziyoujianli/app/assets/css/main.css)

**目标**：让 `pagebreak.css` 模式真正生效，避免长简历中段落/列表项/卡片被从中间切断。

**改动**：在 main.css 末尾新增：

```css
/* PDF 导出分页规则：避免在 section/卡片/列表项内部断页 */
@media print {
  .experience-item,
  .education-item,
  .project-item,
  .custom-item,
  .certificate-item {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

**说明**：
- `@media print` 规则会被 html2pdf.js 的 `pagebreak.css` 模式识别
- html2pdf.js 在 DOM 阶段处理分页，若元素跨越页边界且 `break-inside: avoid`，会在元素前插入 padding 推到下一页
- 此改动同时改善浏览器原生打印（Ctrl+P）的分页效果

### 改动 3：更新单元测试（可选）

**文件**：新增 `tests/unit/composables/usePdfExport.spec.ts`

**目标**：为 `usePdfExport` 新增单元测试，验证：
1. `import.meta.client` 为 false 时直接返回（不报错）
2. 找不到元素时抛出正确错误
3. 调用时会创建离屏容器并在完成后清理

**说明**：由于 `usePdfExport` 依赖 `document` 和动态 import，单元测试需要 mock `html2pdf.js` 模块。如果 mock 成本过高，可跳过单元测试，仅依赖 E2E 测试验证。

---

## 假设与决策

1. **假设**：html2canvas 1.4.1 在显式传入 `width` 和 `height` 选项时，会按指定尺寸捕获元素，不依赖虚拟窗口尺寸
2. **假设**：克隆节点能正确继承原元素的计算样式（html2canvas 内部会处理 `cloneNode(true)` 的样式继承）
3. **决策**：采用"克隆到离屏容器"方案而非"直接修改原元素样式"，因为前者不影响用户预览体验，且能彻底脱离滚动容器
4. **决策**：保留 `html2pdf.js` 作为导出工具，不切换到纯 `html2canvas + jsPDF` 手动分页，以降低改动风险
5. **决策**：保留 `pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }` 配置，配合改动 2 的 CSS 规则让 `css` 模式生效
6. **决策**：不修改 `margin` 默认值（32px）和 `jsPDF` 配置，保持与现有用户体验一致

---

## 验证步骤

### 1. 启动与基础验证

- `pnpm dev`（已有终端运行中，terminal_id: 3）
- 进入工作台页 `/workbench/{resumeId}`
- 确认预览页正常显示，A4 wrapper 尺寸为 794×1123px

### 2. PDF 导出功能验证

点击右上角「导出 PDF」按钮，打开导出的 PDF，确认：

- **完整性**：PDF 包含完整简历内容（基本信息 + 所有启用模块），不再是左上角片段
- **分页**：长简历自动分页，无大段空白或内容缺失
- **清晰度**：文字清晰可辨，图片（如头像）正常显示
- **格式**：PDF 页面为 A4 纵向，边距均匀

### 3. 多场景测试

- **短简历**（只有基本信息）：导出 1 页，无多余空白页
- **中等简历**（基本信息 + 1-2 个模块）：导出 1 页，内容完整
- **长简历**（所有模块 + 大量数据）：导出 2-3 页，分页合理，section 不被从中间切断
- **4 个模板**（professional / modern / elegant / creative）：分别导出，确认所有模板均能完整导出

### 4. 回归检查

- 预览页本身在浏览器中的显示不受影响（离屏容器在 `left: -99999px`，不可见）
- 点击导出按钮后，按钮状态正常（isExporting 状态正确切换）
- 导出失败时显示错误提示

### 5. 测试与构建

- `pnpm test`（运行单元测试，确认现有测试通过）
- `pnpm test:e2e`（运行 E2E 测试，确认 PDF 导出相关测试通过）
- 如有 `pnpm lint` 或 `pnpm typecheck` 命令，运行确认无错误

---

## 风险与回滚

### 风险

1. **克隆节点样式继承不完整**：某些动态计算样式（如 `v-bind` in `<style>`）可能未正确继承到克隆节点。**缓解**：导出后人工检查 PDF 效果，如有样式缺失，改用 `getComputedStyle` 显式复制关键样式。
2. **离屏容器影响布局**：虽然 `position: fixed; left: -99999px` 不可见，但极端情况下可能影响滚动条。**缓解**：导出完成后立即 `cleanup()` 移除容器。
3. **`break-inside: avoid` 在 html2canvas 中不生效**：html2canvas 的 Canvas 切片方式可能忽略 CSS 分页规则。**缓解**：即使 CSS 分页不生效，核心问题（内容截取不完整）已通过改动 1 解决，分页准确性通过 `avoid-all` 模式保证。

### 回滚

如方案无效，回滚步骤：
1. 恢复 `usePdfExport.ts` 到改动前状态（`git checkout app/composables/usePdfExport.ts`）
2. 移除新增的 CSS 分页规则
3. 重新评估是否需要切换到纯 `html2canvas + jsPDF` 手动分页方案
