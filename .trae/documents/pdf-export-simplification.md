# PDF 导出功能简化优化方案

## 一、Summary 概述

针对 `/plan` 中 PDF 导出功能的优化需求，将当前"导出 PDF"按钮下的四选项对话框简化为**直接触发客户端 PDF 导出**。移除服务端 PDF、JSON、Markdown 三种导出方式及其相关 UI、代码、测试和依赖。仅保留 `html2pdf.js` 客户端导出，确保生成的 PDF 格式正确、内容完整、排版符合预期。

## 二、Current State Analysis 当前状态分析

### 当前 UI 流程
```
WorkbenchHeader.vue（顶部"导出 PDF"按钮）
  └─ emit('export-pdf') →
     workbench/[id].vue（handleExportPdf → pdfExportVisible = true）
        └─ PdfExport.vue（t-dialog 对话框，2×2 网格 4 个卡片）
              ├─ 卡片1：PDF 导出（客户端）→ usePdfExport.exportToPdf()（html2pdf.js）
              ├─ 卡片2：PDF 导出（服务端）→ POST /api/export/pdf（puppeteer + chromium）
              ├─ 卡片3：导出 JSON → usePdfExport.exportAsJson()
              └─ 卡片4：导出 Markdown → usePdfExport.exportAsMarkdown()
```

### 当前四个导出选项
| 序号 | 名称 | 实现 |
|---|---|---|
| 1 | PDF 导出（客户端） | `usePdfExport.ts` 的 `exportToPdf`（html2pdf.js）✅ 保留 |
| 2 | PDF 导出（服务端） | `PdfExport.vue` + `server/api/export/pdf.post.ts`（puppeteer-core + @sparticuz/chromium）❌ 移除 |
| 3 | 导出 JSON | `usePdfExport.ts` 的 `exportAsJson` ❌ 移除 |
| 4 | 导出 Markdown | `usePdfExport.ts` 的 `exportAsMarkdown` + `generateMarkdown` ❌ 移除 |

### 关键文件清单（绝对路径）
- `app/components/workbench/WorkbenchHeader.vue` - 顶部"导出 PDF"按钮（L49-52）
- `app/pages/workbench/[id].vue` - 事件桥接 + 挂载 PdfExport 对话框（L9, L69, L120, L125-128）
- `app/components/shared/PdfExport.vue` - 4 选项对话框（核心 UI）
- `app/composables/usePdfExport.ts` - 客户端 PDF + JSON + Markdown 实现
- `server/api/export/pdf.post.ts` - 服务端 PDF API（整体移除）
- `shared/config/constants.ts` - `PDF_EXPORT_CONFIG` 常量（L16-20，仅服务端使用）
- `tests/unit/components/shared/PdfExport.spec.ts` - 组件单元测试
- `tests/unit/server/api/export/pdf.spec.ts` - 服务端 API 单元测试（整体移除）
- `tests/unit/config/constants.spec.ts` - 含 `PDF_EXPORT_CONFIG` 断言（L72-89）
- `tests/e2e/pdf-export.spec.ts` - E2E 测试
- `package.json` - 依赖 `puppeteer-core`、`@sparticuz/chromium`、`html2canvas`、`html2pdf.js`

### 依赖分析
- `html2pdf.js` - 客户端 PDF 导出核心库 ✅ 保留
- `html2canvas` - `html2pdf.js` 的依赖（package.json 显式声明）✅ 保留
- `puppeteer-core` - **被 `scripts/generate-template-snapshots.ts` 模板快照脚本使用** ✅ 保留
- `@sparticuz/chromium` - 仅服务端 PDF 导出使用 ❌ 移除

## 三、Proposed Changes 提议变更

### 变更 1：修改 `app/components/workbench/WorkbenchHeader.vue`
**目的**：点击"导出 PDF"按钮直接触发客户端导出，不再打开对话框。

**修改内容**：
- L49-52：保持按钮 UI 不变（文本仍为"导出 PDF"，图标 `FileDown`）
- L77：emit 事件名 `'export-pdf'` 保持不变（避免破坏父组件绑定）
- 脚本部分无需修改（emit 仍由按钮 click 触发）

**决策说明**：保留 emit 事件名不变，将"直接导出"逻辑放在父组件 `workbench/[id].vue` 中处理，这样 WorkbenchHeader 保持纯展示组件属性，职责清晰。

### 变更 2：修改 `app/pages/workbench/[id].vue`
**目的**：将"打开对话框"改为"直接调用客户端 PDF 导出"。

**修改内容**：
- 移除 L69：`<PdfExport v-model:visible="pdfExportVisible" />` 模板挂载
- 移除 L120：`const pdfExportVisible = ref(false)` 状态声明
- 修改 L125-128：`handleExportPdf` 函数改为直接调用 `usePdfExport().exportToPdf()`，并配合 `MessagePlugin` 反馈成功/失败，移除对话框逻辑
- 新增 import：`usePdfExport`、`MessagePlugin`（来自 tdesign-vue-next）

**新的 `handleExportPdf` 实现**：
```ts
const handleExportPdf = async () => {
  try {
    await exportToPdf()
    MessagePlugin.success('PDF 导出成功')
  } catch (e) {
    MessagePlugin.error(`导出失败: ${e instanceof Error ? e.message : '未知错误'}`)
  }
}
```
其中 `exportToPdf` 通过 `const { exportToPdf } = usePdfExport()` 获取。

### 变更 3：删除 `app/components/shared/PdfExport.vue`
**目的**：移除整个 4 选项对话框组件。

**操作**：使用 DeleteFile 工具删除整个文件。

### 变更 4：修改 `app/composables/usePdfExport.ts`
**目的**：移除 JSON、Markdown 导出及仅服务端使用的辅助函数，保留客户端 PDF 导出。

**修改内容**：
- 保留 L1-5：模块注释（更新为"仅提供客户端 PDF 导出"）、类型 import、store import
- 保留 L7-14：`getSafeFileName` 工具函数（`exportToPdf` 使用）
- 移除 L16-24：`downloadBlob` 工具函数（仅 JSON/Markdown 用）
- 保留 L26-74：`usePdfExport` 函数壳 + `exportToPdf` 实现（完整保留）
- 移除 L76-83：`exportAsJson`
- 移除 L85-92：`exportAsMarkdown`
- 移除 L94-145：`generateMarkdown`
- 修改 L147-152：return 语句仅返回 `{ isExporting, exportToPdf }`
- 顶部注释 L2 更新：移除"JSON 导出、Markdown 导出"字样

### 变更 5：删除 `server/api/export/pdf.post.ts`
**目的**：移除服务端 PDF 导出 API。

**操作**：使用 DeleteFile 工具删除整个文件。

### 变更 6：修改 `shared/config/constants.ts`
**目的**：移除仅服务端使用的 `PDF_EXPORT_CONFIG` 常量。

**修改内容**：
- 移除 L15-20：`PDF_EXPORT_CONFIG` 常量及其注释
- 保留其余常量（`DEFAULT_FIELD_ORDER`、`STORAGE_KEYS`）

### 变更 7：删除 `tests/unit/server/api/export/pdf.spec.ts`
**目的**：移除服务端 API 的单元测试。

**操作**：使用 DeleteFile 工具删除整个文件。

### 变更 8：删除 `tests/unit/components/shared/PdfExport.spec.ts`
**目的**：移除已删除的 PdfExport 组件的单元测试。

**操作**：使用 DeleteFile 工具删除整个文件。

**决策说明**：PdfExport 组件被完全移除，其单元测试失去测试目标；新的导出逻辑（`handleExportPdf` 直接调用）是页面级函数，更适合通过 E2E 测试覆盖。

### 变更 9：重写 `tests/e2e/pdf-export.spec.ts`
**目的**：更新 E2E 测试以匹配新的"点击按钮直接导出"流程。

**修改内容**：
- 保留 L1-34：注释（更新说明）、imports、`goToWorkbench` helper、`beforeEach`
- 保留 L36-43："工作台显示「导出 PDF」按钮"测试用例
- 重写 L45-98：移除"打开对话框""4 种导出方式""卡片可点击"等测试用例
- 新增测试用例：点击"导出 PDF"按钮后页面正常（无崩溃），不出现 `.export-card` 对话框元素
- 由于真实导出会触发浏览器下载，E2E 仍不验证真实 PDF 生成，仅验证按钮存在且点击后页面状态正常

### 变更 10：修改 `tests/unit/config/constants.spec.ts`
**目的**：移除对已删除的 `PDF_EXPORT_CONFIG` 的测试。

**修改内容**：
- 移除 L5-7 import 中的 `PDF_EXPORT_CONFIG`
- 移除 L72-89：整个 `describe('PDF_EXPORT_CONFIG', ...)` 块

### 变更 11：修改 `package.json`
**目的**：移除仅服务端 PDF 使用的 `@sparticuz/chromium` 依赖。

**修改内容**：
- 移除 L26：`"@sparticuz/chromium": "^149.0.0",`
- 保留 L46：`"puppeteer-core": "^25.2.1"`（模板快照脚本仍使用）
- 保留 L39-40：`html2canvas`、`html2pdf.js`（客户端导出使用）

**安装命令**：修改后执行 `pnpm install` 更新 lockfile。

## 四、Assumptions & Decisions 假设与决策

1. **保留 `puppeteer-core` 依赖**：经核查 `scripts/generate-template-snapshots.ts` 使用 `puppeteer-core`（不依赖 `@sparticuz/chromium`，使用本地 Chrome），故保留 `puppeteer-core`，仅移除 `@sparticuz/chromium`。

2. **保留 `html2canvas` 依赖**：作为 `html2pdf.js` 的 peer 依赖，且 `package.json` 显式声明，保留以确保客户端导出稳定。

3. **不修改 WorkbenchHeader emit 事件名**：保留 `'export-pdf'` 事件名，将"直接导出"逻辑放在父组件，保持 WorkbenchHeader 作为纯展示组件的职责单一性。

4. **删除整个 PdfExport 组件而非保留空壳**：组件被完全移除后无任何引用，删除文件避免代码冗余。

5. **删除 PdfExport 单元测试**：组件被删，测试失去目标；新的导出逻辑在页面级，通过 E2E 覆盖即可，不为 `handleExportPdf` 单独写单元测试（避免过度测试简单的 try/catch 包装）。

6. **保留客户端 PDF 导出配置不变**：`usePdfExport.ts` 中 `exportToPdf` 的 html2pdf 配置（margin、jpeg quality 0.98、scale 2、a4 portrait、pagebreak avoid-all+css+legacy）已验证可用，保持不变以确保"格式正确、内容完整、排版符合预期"。

7. **E2E 测试不验证真实 PDF 文件**：Playwright 真实触发浏览器下载并验证 PDF 内容较慢且不稳定，沿用原 E2E 策略（验证按钮存在 + 页面不崩溃），PDF 实际生成质量由现有 `exportToPdf` 配置保证。

## 五、Verification 验证步骤

1. **类型检查**：`pnpm exec nuxt typecheck` 或 `pnpm exec vue-tsc --noEmit`（若有配置），确认无 TS 错误。

2. **Lint 检查**：`pnpm lint`，确认代码风格通过。

3. **单元测试**：`pnpm test:unit`，确认 constants.spec.ts、usePdfExport 相关测试（如有）通过，无残留引用错误。

4. **E2E 测试**：`pnpm test:e2e`，确认 `pdf-export.spec.ts` 重写后通过。

5. **手动验证**（关键）：
   - 启动 dev server：`pnpm dev`
   - 进入工作台 `/workbench/[id]`
   - 点击顶部"导出 PDF"按钮
   - 验证：不弹出对话框，直接触发浏览器下载
   - 验证：下载的 PDF 文件名格式为 `<简历标题>.pdf`
   - 验证：PDF 内容完整（包含所有简历模块）、排版正确（A4 纵向、边距 32px、无内容截断）
   - 验证：导出过程中按钮无视觉卡顿，成功后出现 `MessagePlugin.success('PDF 导出成功')` 提示
   - 验证：若预览元素不存在时，出现错误提示且页面不崩溃

6. **依赖检查**：`pnpm install` 后确认 `node_modules` 中不再有 `@sparticuz/chromium`，`puppeteer-core` 仍存在。

7. **全局引用检查**：使用 Grep 搜索 `PdfExport`、`pdfExportVisible`、`exportAsJson`、`exportAsMarkdown`、`generateMarkdown`、`PDF_EXPORT_CONFIG`、`@sparticuz/chromium`、`/api/export/pdf`，确认无残留引用（`.nuxt`、`node_modules`、`.trae` 历史文档除外）。
