# 修复 PDF 导出只截取左上角问题

## 概述

当前导出的 PDF 只有简历预览页的左上角部分，并非完整简历内容。根因在于被 `html2canvas` 捕获的 `#resume-preview` 元素本身没有明确的 A4 尺寸（尺寸在它的父级 wrapper 上），且捕获元素位于 `overflow-auto` 滚动容器内的 Splitpanes `Pane` 中，导致 `html2canvas` 退化为只截取可视区域的左上角部分。

本计划采用「移动 `id` 到 A4 wrapper」方案直击根因，并最小化改动范围。多页分页维持现状（`html2pdf.js` 的 `pagebreak: avoid-all` 自动分页）。

---

## 当前状态分析

### 导出链路

```
WorkbenchHeader「导出 PDF」按钮
  → emit('export-pdf')
  → workbench/[id].vue handleExportPdf()
  → usePdfExport.exportToPdf()
  → html2pdf.js 捕获 #resume-preview DOM
```

### 关键 DOM 层级（[app/pages/workbench/[id].vue#L28-L35](file:///Users/songang/LinkProjects/ziyoujianli/app/pages/workbench/[id].vue#L28-L35)）

```html
<div class="h-full overflow-auto bg-gray-100 p-6 ...">   <!-- 滚动容器 (Pane) -->
  <div class="mx-auto bg-white shadow-lg"
       style="width: 794px; min-height: 1123px;">          <!-- A4 wrapper（尺寸在此） -->
    <ResumePreview />                                       <!-- #resume-preview（被捕获，但只 width:100%） -->
      <TemplateComponent />
  </div>
</div>
```

### 根因（三处叠加）

1. **捕获目标与 A4 wrapper 不匹配**：`#resume-preview` 自身 CSS 是 `width: 100%; min-height: 100%`，没有显式 A4 尺寸；A4 尺寸在它的父级 wrapper 上。`html2canvas` 测量 `#resume-preview` 的 `getBoundingClientRect()` 时，在 Splitpanes 布局下会回落到 Pane 可视尺寸（通常 < 794px），只截到左上角。
2. **滚动容器裁剪**：捕获元素位于 `overflow-auto` 的滚动容器内，`html2canvas` 对滚动出视图的内容存在已知裁剪问题。
3. **未给 `html2canvas` 传显式宽高**：[app/composables/usePdfExport.ts#L45-L50](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts#L45-L50) 的 `html2canvas` 选项缺少 `width` / `height` / `windowWidth` / `scrollX` / `scrollY`，无法纠正上述测量误差。

### 相关文件

- [app/composables/usePdfExport.ts](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts) — 导出核心逻辑
- [app/pages/workbench/[id].vue](file:///Users/songang/LinkProjects/ziyoujianli/app/pages/workbench/[id].vue) — A4 wrapper 与导出按钮事件绑定
- [app/components/preview/ResumePreview.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/preview/ResumePreview.vue) — `#resume-preview` 当前所在
- [app/components/workbench/WorkbenchHeader.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/workbench/WorkbenchHeader.vue) — 导出按钮（仅触发，无需改动）

---

## 改动计划

### 改动 1：把 `#resume-preview` 从 `ResumePreview.vue` 根元素移到 A4 wrapper

**文件**：[app/pages/workbench/[id].vue](file:///Users/songang/LinkProjects/ziyoujianli/app/pages/workbench/[id].vue)

**位置**：模板中右侧预览区，A4 wrapper div（约 32-34 行）

**改法**：把 `id="resume-preview"` 和 `data-preview-scroll-container="true"` 从 `ResumePreview.vue` 根元素上移到 A4 wrapper div 上，使被捕获元素自身拥有 `width: 794px; min-height: 1123px` 的显式尺寸。

修改后形如：
```html
<div
  v-if="resumeData"
  id="resume-preview"
  data-preview-scroll-container="true"
  class="mx-auto bg-white shadow-lg"
  style="width: 794px; min-height: 1123px;"
>
  <ResumePreview :resume-data="resumeData" />
</div>
```

**理由**：让被 `html2canvas` 捕获的元素自带确定性的 A4 尺寸，避免依赖父级布局的继承尺寸在 Splitpanes 下发生测量误差。

### 改动 2：移除 `ResumePreview.vue` 根元素上的 `id` 与 `data-preview-scroll-container`

**文件**：[app/components/preview/ResumePreview.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/preview/ResumePreview.vue)

**位置**：模板根 `<div>`（约 2-6 行）

**改法**：移除 `id="resume-preview"` 与 `data-preview-scroll-container="true"`，仅保留 `class="resume-preview-container"`。

修改后形如：
```vue
<template>
  <div class="resume-preview-container">
    <component
      :is="TemplateComponent"
      v-if="TemplateComponent"
      :data="resumeData"
      :template="templateConfig"
    />
    <div v-else class="flex items-center justify-center h-64 text-gray-400">
      请选择模板
    </div>
  </div>
</template>
```

**理由**：避免出现两个同 `id` 元素（HTML 不允许 id 重复），并明确「捕获目标在外层 A4 wrapper」。

### 改动 3：增强 `html2canvas` 配置以应对滚动容器

**文件**：[app/composables/usePdfExport.ts](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts)

**位置**：`html2canvas` 选项（约 45-50 行）

**改法**：在 `html2canvas` 选项中补充：
- `windowWidth: 794` — 让 `html2canvas` 以 794px 宽度的「虚拟窗口」渲染，避免受 Splitpanes Pane 实际宽度影响。
- `scrollX: 0`、`scrollY: 0` — 重置滚动偏移，避免捕获到滚动后位置。
- 保留 `scale: 2`、`useCORS: true`、`backgroundColor: '#ffffff'`。

修改后形如：
```ts
html2canvas: {
  scale: 2,
  useCORS: true,
  logging: false,
  backgroundColor: '#ffffff',
  windowWidth: 794,
  scrollX: 0,
  scrollY: 0,
},
```

**理由**：即使 `#resume-preview` 已具备 794px 显式宽度，`html2canvas` 在某些浏览器/布局下仍可能基于当前 `window` 尺寸计算媒体查询或视口相关样式。显式 `windowWidth: 794` 确保渲染环境与 A4 宽度一致；`scrollX/Y: 0` 防止捕获到因滚动条偏移导致的内容错位。

### 改动 4（可选，防御性）：`#resume-preview` 临时移除阴影与外边距

**不做**。A4 wrapper 的 `shadow-lg` 与 `mx-auto` 在 `html2canvas` 渲染时不会影响内容区域尺寸（`box-shadow` 不占布局空间，`mx-auto` 在捕获单元素时不影响），故无需改动样式类。

---

## 假设与决策

1. **假设**：`html2pdf.js` 的 `pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }` 在长简历场景下分页行为可接受，本次不做改动。
2. **假设**：所有 4 个模板（professional / modern / elegant / creative）的根组件均为 `width: 100%`，依赖外层 A4 wrapper 提供宽度。改动 1 之后，`#resume-preview`（A4 wrapper）的 `width: 794px` 会传递给所有模板。
3. **决策**：不引入 `@media print` 规则，保持单一导出路径（`html2canvas` 栅格化），避免双路径维护成本。
4. **决策**：不改 `usePdfExport.ts` 的 `margin` / `jsPDF` 配置，仅增强 `html2canvas` 配置。
5. **决策**：不修改 [tests/e2e/pdf-export.spec.ts](file:///Users/songang/LinkProjects/ziyoujianli/tests/e2e/pdf-export.spec.ts)，现有 e2e 测试不校验 PDF 内容，仍可通过。

---

## 验证步骤

1. **启动 dev**：`pnpm dev`（已有终端运行中，terminal_id: 2）。
2. **手动验证**：
   - 进入工作台页 `/workbench/{resumeId}`。
   - 点击右上角「导出 PDF」按钮。
   - 打开导出的 PDF，确认：
     - PDF 包含完整简历内容（基本信息 + 所有启用模块），不再是左上角片段。
     - PDF 页面宽度为 A4（约 794px @ 96dpi）。
     - 长简历自动分页，无大段空白或内容缺失。
   - 分别测试 professional / modern / elegant / creative 四个模板，确认所有模板均能完整导出。
3. **回归检查**：预览页本身在浏览器中的显示不受影响（A4 wrapper 尺寸未变，仅 `id` 迁移）。
4. **类型检查**：如有 `pnpm typecheck` 命令，运行一次确认无类型错误。
5. **Lint**：如有 `pnpm lint` 命令，运行一次确认无 lint 错误。
