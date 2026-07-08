# PDF 导出样式错乱修复计划

## 问题摘要

PDF 导出后，**模块标题前缀样式**和**列表样式**与预览不一致，所有模板均受影响。

## 根因分析

`html2canvas` 存在以下已知渲染缺陷：

1. **列表标记（list-style）渲染不可靠** — `list-style: disc` / `decimal` 的原生浏览器列表标记在 html2canvas 中经常丢失或错位
2. **`em` 单位解析异常** — 如 `.title-bar { height: 1em }` 在离屏渲染环境中可能解析为错误值
3. **`border-radius` + 小尺寸元素** — 如 `.title-bar { border-radius: 2px }` 和 `.badge { border-radius: 9999px }` 在 html2canvas 中可能被裁切或丢失
4. **`box-shadow` 渲染丢失** — 如 creative 模板的 `.badge { box-shadow: ... }` 在 html2canvas 中可能不渲染

## 修复方案

### 1. 修复模块标题前缀样式（4 个 SectionTitle 组件）

**Professional** — [SectionTitle.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/templates/professional/sections/SectionTitle.vue)
- `.title-bar`: `height: 1em` → `height: 18px`（固定像素值）
- `border-radius: 2px` 保留但确认 html2canvas 可渲染

**Modern** — [SectionTitle.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/templates/modern/sections/SectionTitle.vue)
- `.title-underline` 使用 `position: absolute` + 固定尺寸，问题较小
- 确认 `width: 36px; height: 2px` 在离屏容器中正确渲染

**Elegant** — [SectionTitle.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/templates/elegant/sections/SectionTitle.vue)
- `.title-line`: 确认 `width: 48px; height: 1px` 在 html2canvas 中可见
- 如果 1px 高度丢失，改为 `height: 2px`

**Creative** — [SectionTitle.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/templates/creative/sections/SectionTitle.vue)
- `.badge`: `border-radius: 9999px` 可能在 html2canvas 中不生效
- `box-shadow` 可能丢失
- 考虑用 `border` 替代 `box-shadow`，或接受阴影丢失

### 2. 修复列表样式（所有模板的 rich-content 和原生列表）

**核心策略**：将原生 `list-style` 替换为 html2canvas 可靠的自定义标记渲染方式。

**方案 A（推荐）— 使用 CSS `::before` 伪元素 + `counter-reset`**：

```css
/* 无序列表 */
.rich-content :deep(ul) {
  list-style: none;
  padding-left: 0;
  margin: 4px 0;
}
.rich-content :deep(ul li) {
  position: relative;
  padding-left: 16px;
  margin-bottom: 2px;
}
.rich-content :deep(ul li::before) {
  content: '';
  position: absolute;
  left: 4px;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

/* 有序列表 */
.rich-content :deep(ol) {
  list-style: none;
  padding-left: 0;
  margin: 4px 0;
  counter-reset: item;
}
.rich-content :deep(ol li) {
  position: relative;
  padding-left: 20px;
  margin-bottom: 2px;
  counter-increment: item;
}
.rich-content :deep(ol li::before) {
  content: counter(item) '.';
  position: absolute;
  left: 0;
  font-weight: 600;
}
```

> **注意**：html2canvas 对 `::before` 伪元素的支持取决于版本。如果伪元素也不可靠，则使用**方案 B**。

**方案 B（备选）— 在模板中用自定义 HTML 元素替代 `<ul>/<ol>`**：
- 在 rich-content 渲染中，将 `<ul><li>` 替换为 `<div class="custom-list"><div class="list-item"><span class="bullet">•</span><span>内容</span></div>`
- 这需要在数据层或渲染层做转换，改动较大

### 3. 需要修改的文件清单

| 文件 | 修改内容 |
|------|----------|
| `app/components/templates/professional/sections/SectionTitle.vue` | `.title-bar` 的 `height: 1em` → 固定像素 |
| `app/components/templates/modern/sections/SectionTitle.vue` | 确认 `.title-underline` 渲染正常，必要时微调 |
| `app/components/templates/elegant/sections/SectionTitle.vue` | `.title-line` 的 `height: 1px` → `2px` 防止丢失 |
| `app/components/templates/creative/sections/SectionTitle.vue` | `.badge` 的 `box-shadow` 改用 `border` 或接受降级 |
| `app/components/templates/professional/sections/ExperienceSection.vue` | rich-content 列表样式替换 |
| `app/components/templates/professional/sections/EducationSection.vue` | rich-content 列表样式替换 |
| `app/components/templates/professional/sections/ProjectSection.vue` | rich-content 列表样式替换 |
| `app/components/templates/professional/sections/SkillSection.vue` | 列表样式替换 |
| `app/components/templates/professional/sections/SelfEvaluationSection.vue` | 列表样式替换 |
| `app/components/templates/professional/sections/CertificateSection.vue` | 列表样式替换 |
| `app/components/templates/professional/sections/CustomSection.vue` | 列表样式替换 |
| `app/components/templates/modern/sections/ExperienceSection.vue` | 列表样式替换 |
| `app/components/templates/modern/sections/EducationSection.vue` | 列表样式替换 |
| `app/components/templates/modern/sections/ProjectSection.vue` | 列表样式替换 |
| `app/components/templates/modern/sections/SelfEvaluationSection.vue` | 列表样式替换 |
| `app/components/templates/modern/sections/CertificateSection.vue` | 列表样式替换 |
| `app/components/templates/modern/sections/CustomSection.vue` | 列表样式替换 |
| `app/components/templates/modern/sections/SideBar.vue` | 列表样式替换 |
| `app/components/templates/elegant/sections/*.vue` | 列表样式替换（已用 `list-style: none` 的可能不需要） |
| `app/components/templates/creative/sections/*.vue` | 列表样式替换 |

### 4. 优化 `usePdfExport.ts` 的 `clearConstraints`

当前 [clearConstraints](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts#L99-L115) 递归修改**所有子元素**的 `overflow`/`maxHeight`/`minHeight`，可能破坏列表容器的布局上下文。

**改进**：
- 不修改 `list-style-type` 相关的 `display` 属性
- 考虑只对已知会截断内容的容器（如滚动容器）清除约束，而非递归所有元素
- 或者在清除约束时跳过 `li`、`ul`、`ol` 元素

## 假设与决策

1. **优先使用方案 A（CSS 伪元素替代原生列表标记）** — 改动量适中，不需要修改数据结构
2. **如果伪元素在 html2canvas 中也不可靠**，则回退到方案 B（自定义 HTML 元素）
3. **标题前缀使用固定像素值** — 避免 `em` 单位在离屏环境中的不确定性
4. **接受 `box-shadow` 降级** — creative 模板的阴影效果在 PDF 中可能无法完美还原，优先保证布局正确

## 验证步骤

1. 启动开发服务器，打开工作台页面
2. 确认预览中所有模板的标题前缀和列表样式正常
3. 点击"导出 PDF"，检查生成的 PDF 文件：
   - 各模板的标题前缀（竖线/下划线/装饰线/badge）是否正确显示
   - 无序列表的圆点标记是否可见
   - 有序列表的数字标记是否可见
   - 列表缩进和对齐是否正确
4. 对比预览和 PDF 的视觉效果，确认一致性
5. 运行现有单元测试确保无回归
