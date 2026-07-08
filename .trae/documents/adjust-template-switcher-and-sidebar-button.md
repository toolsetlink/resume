# 调整简历编辑页面模板切换功能与顶部按钮文案

## 概述

针对简历编辑页面（workbench）的两项调整：
1. **模板列表预览**：让 `TemplateSwitcher.vue` 弹窗中 4 个模板能清晰展示**运行时渲染的预览样式**（而非静态 PNG 缩略图），含视觉样式与名称标识。
2. **顶部按钮文案修正**：`WorkbenchHeader.vue` 中间工具区第一个按钮（`PanelLeft` 图标）实际功能为折叠/展开左侧编辑栏，但其 tooltip 误用了 `t('nav.templates')`（"模板选择"/"Templates"），需改为准确反映"折叠侧边栏"语义的文案。

## 现状分析

### TemplateSwitcher.vue
- 文件：[app/components/workbench/TemplateSwitcher.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/workbench/TemplateSwitcher.vue)
- 第 71 行 `thumbnailMap: Record<string, string> = {}` 为空对象，注释明示"阶段 7 会替换为真实缩略图"。
- 第 25-33 行：因 `thumbnailMap` 为空，模板卡片只渲染占位图（`LayoutTemplate` 图标 + 模板名称），**没有真实视觉样式预览**。
- 已注册的 4 个模板配置（[registry.ts](file:///Users/songang/LinkProjects/ziyoujianli/app/components/templates/registry.ts#L21-L26)）：professional / modern / elegant / creative，每个 `config.thumbnail` 字段值与 `/public/templates/thumbnails/<id>.png` 文件名一致。
- 用户已选定方案：**运行时渲染模板组件缩略图**（动态渲染小型预览，非静态 PNG）。

### WorkbenchHeader.vue
- 文件：[app/components/workbench/WorkbenchHeader.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/workbench/WorkbenchHeader.vue)
- 第 21-25 行（第一个按钮）：
  - 图标：`PanelLeft`
  - 触发事件：`emit('toggle-sidebar')`
  - tooltip：`:content="t('nav.templates')"` → 中文"模板选择" / 英文"Templates" — **错误**
- 第 26-30 行（第二个按钮，真实模板按钮）：
  - 图标：`LayoutTemplate`
  - 触发事件：`emit('open-template-switcher')`
  - tooltip：`content="模板"` — 硬编码中文，未走 i18n
- 在 [workbench/[id].vue](file:///Users/songang/LinkProjects/ziyoujianli/app/pages/workbench/%5Bid%5D.vue#L8-L10) 中确认 `toggle-sidebar` 对应 `toggleSidebar()`，作用是切换 `sidebarVisible`，进而改变左侧 Splitpanes 的 Pane 大小（40 ↔ 0），即折叠/展开左侧编辑栏。

### i18n 现状
- [zh.json](file:///Users/songang/LinkProjects/ziyoujianli/i18n/locales/zh.json) / [en.json](file:///Users/songang/LinkProjects/ziyoujianli/i18n/locales/en.json) 已有 `templates.selectTemplate` / `templates.currentTemplate` / `templates.switchSuccess` 等键，但没有"折叠侧边栏"相关键。

## 改动方案

### 改动 1：TemplateSwitcher.vue —— 运行时渲染模板预览

**文件**：[app/components/workbench/TemplateSwitcher.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/workbench/TemplateSwitcher.vue)

**思路**：删除 `thumbnailMap` 占位逻辑，改为在卡片内用 `<ResumePreview>` 渲染每个模板的实时小型预览。使用 `initialResumeState` 作为示例数据，将 `templateId` 强制为当前模板 id（与 [snapshot/[template].vue](file:///Users/songang/LinkProjects/ziyoujianli/app/pages/snapshot/%5Btemplate%5D.vue) 一致的做法），保证预览有真实内容。

**具体修改**：

1. **script 部分**：
   - 删除 `thumbnailMap` 变量及其上方注释。
   - 引入 `ResumePreview` 组件与 `initialResumeState`：
     ```ts
     import ResumePreview from '~/components/preview/ResumePreview.vue'
     import { initialResumeState } from '#shared/config/initialResumeData'
     import type { ResumeData } from '#shared/types/resume'
     ```
   - 新增 `getPreviewData(templateId)` 函数，返回将 `initialResumeState` 的 `templateId` 覆盖为指定模板 id 的对象：
     ```ts
     const getPreviewData = (templateId: string): ResumeData => ({
       ...(initialResumeState as ResumeData),
       templateId,
     })
     ```
   - 移除未使用的 `LayoutTemplate` import（不再需要占位图标）。

2. **template 部分**（替换原占位图 `<div>` 块，第 20-34 行）：
   - 用一个固定 3:4 比例、`overflow-hidden`、缩放变换（`scale` + `transform-origin: top left`）的容器包裹 `<ResumePreview>`，将 794px 宽的模板等比缩小到卡片宽度。
   - 关键样式：预览容器原始宽度 794px，通过 CSS `transform: scale(var)` 缩放至卡片可视宽度（约 220px），并设置容器高度 = 1123 * scale，避免布局溢出。
   - 保留选中态边框 / ring 高亮逻辑不变。
   - 名称 + 描述区域（第 36-44 行）保留不变，确保"名称标识"清晰可识别。

3. **样式调整**：
   - 在 `<style scoped>` 中新增 `.template-preview-wrapper`、`.template-preview-scaled` 类，使用 `transform: scale()` 实现等比缩放，并配合 `transform-origin: top left` + 外层固定尺寸 + `overflow: hidden` 裁切溢出部分。
   - 缩放比例：以卡片实际可视宽度 ~220px 计算，scale ≈ 220/794 ≈ 0.277；预览高度 = 1123 * 0.277 ≈ 311px，对应 `aspect-[3/4]` 视觉比例。

### 改动 2：WorkbenchHeader.vue —— 修正第一个按钮 tooltip

**文件**：[app/components/workbench/WorkbenchHeader.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/workbench/WorkbenchHeader.vue)

**具体修改**（第 21 行）：
- 将第一个按钮的 tooltip 从 `:content="t('nav.templates')"` 改为 `:content="t('workbench.collapseSidebar')"`。
- 按钮位置、`PanelLeft` 图标、`variant="text" shape="square"` 样式、`@click="emit('toggle-sidebar')"` 事件均保持不变。
- 同时修正第二个按钮（真实模板按钮，第 26 行）的硬编码 `content="模板"` 为 `:content="t('nav.templates')"`，使其走 i18n（中："模板选择"，英："Templates"），消除硬编码。**此为附带 i18n 修复，保持与原"模板"语义一致，不改变位置与样式。**

### 改动 3：i18n 新增 `workbench.collapseSidebar` 键

**文件**：
- [i18n/locales/zh.json](file:///Users/songang/LinkProjects/ziyoujianli/i18n/locales/zh.json)
- [i18n/locales/en.json](file:///Users/songang/LinkProjects/ziyoujianli/i18n/locales/en.json)

**具体修改**：在两份 JSON 中各新增 `workbench` 命名空间（顶层不存在，需新建），含一个键：
- zh.json：
  ```json
  "workbench": {
    "collapseSidebar": "折叠侧边栏"
  }
  ```
- en.json：
  ```json
  "workbench": {
    "collapseSidebar": "Collapse Sidebar"
  }
  ```
- 插入位置：放在 `templates` 命名空间之后、`resume` 命名空间之前，保持字母序与文件现有风格一致（参考现有 `templates`/`resume`/`editor`/`ai`/`settings` 的排列）。

## 假设与决策

1. **预览示例数据来源**：复用 `#shared/config/initialResumeData` 中的 `initialResumeState`，与 snapshot 页面保持一致，确保 4 个模板预览都有完整、统一的内容样本。
2. **缩放方案**：采用 CSS `transform: scale()` 而非 `zoom`，兼容性更好且不影响布局流。外层容器固定 `aspect-[3/4]` + `overflow-hidden`，内层 ResumePreview 原始 794px 宽缩放至卡片可视宽度。
3. **tooltip 文案**：根据用户答复，采用"折叠侧边栏 / Collapse Sidebar"（强调"缩减"语义，符合需求描述）。虽然按钮本身是 toggle（双向），但用户已明确选择此文案。
4. **附带修复**：第二个按钮（真实模板按钮）的硬编码 `content="模板"` 顺带改为走 i18n（`nav.templates`），消除硬编码 inconsistency，**不改变其功能与位置**。
5. **不动项**：`WorkbenchHeader.vue` 中其他按钮（主题色、设置、导出 PDF）、按钮顺序、`emit` 事件签名、`workbench/[id].vue` 中 `toggleSidebar` 逻辑均不修改。
6. **已有 PNG 缩略图**：`/public/templates/thumbnails/*.png` 保留不动（供 landing 页 `TemplatePreviewSection.vue` 等其他场景使用，本任务不删除）。

## 验证步骤

### 功能测试
1. `pnpm dev` 启动 dev server，访问 `/workbench/<任一简历id>`。
2. 点击顶部中间第二个按钮（LayoutTemplate 图标），打开模板切换弹窗。
3. 验证：4 个模板卡片均显示**实时渲染的小型简历预览**（非占位图），名称（专业简约/现代极简/优雅经典/创意活泼）与描述清晰可见。
4. 验证：当前选中模板有蓝色边框 + ring 高亮，并显示"确认"标签。
5. 点击另一个模板：弹窗关闭，右侧预览区模板样式切换成功，store 中 `templateId` 更新。
6. 重新打开弹窗：高亮态已移到新选中的模板。

### 按钮文案验证
7. 鼠标悬停顶部中间第一个按钮（PanelLeft 图标）：tooltip 显示"折叠侧边栏"（中文环境）/ "Collapse Sidebar"（英文环境）。
8. 鼠标悬停第二个按钮（LayoutTemplate 图标）：tooltip 显示"模板选择"/"Templates"（i18n 生效，非硬编码"模板"）。
9. 点击第一个按钮：左侧编辑栏宽度缩减为 0（折叠）；再次点击恢复展开，功能无回归。

### 界面兼容性
10. 切换语言（中↔英）：tooltip 文案随之切换，无未翻译键告警。
11. 切换暗色模式：模板预览卡片背景、边框、文字颜色自适应，无对比度问题。
12. 不同视口宽度（窄屏）：弹窗 `width="800px"` 在窄屏下响应式正常，模板卡片网格 `grid-cols-2 md:grid-cols-3` 表现符合预期。
13. 运行 `pnpm lint` 和 `pnpm typecheck`（如可用），确保无新增 lint / 类型错误。

### 单元测试（可选，如时间允许）
14. 现有 [tests/unit/components/preview/ResumePreview.spec.ts](file:///Users/songang/LinkProjects/ziyoujianli/tests/unit/components/preview/ResumePreview.spec.ts) 应仍通过（未改动 ResumePreview.vue）。
15. 可为 TemplateSwitcher 增加简单单测：渲染时传入 `visible=true`，断言渲染出 4 个 `.template-card`，每个含模板名称文本。

## 涉及文件清单

| 文件 | 操作 |
|---|---|
| `app/components/workbench/TemplateSwitcher.vue` | 改：替换占位图为 ResumePreview 实时渲染 |
| `app/components/workbench/WorkbenchHeader.vue` | 改：第一个按钮 tooltip 文案；附带修复第二个按钮硬编码 |
| `i18n/locales/zh.json` | 改：新增 `workbench.collapseSidebar` |
| `i18n/locales/en.json` | 改：新增 `workbench.collapseSidebar` |
