# PDF 分页不可破坏约束清单（Invariants）

> **用途**：任何对 `src/hooks/usePdfExport.ts`、`src/styles/globals.css` 中 `@media print` 块、或 PDF 分页相关逻辑的修改前，必须先读完本文件；修改后必须按"验证方式"逐项确认未破坏。
>
> **原则**：每次修改只能解决一个新问题，**不允许以破坏下列任一约束为代价**。如果新需求与某约束冲突，先在本文件底部"变更记录"提出并显式更新约束，再改代码。

---

## 约束清单

### INV-1：PDF 顶部无时间戳/文件名

- **约束**：`@page { margin: 0 }` 必须保留在 `@media print` 块内
- **破坏后果**：Chrome 自动渲染页眉（日期、文件名）
- **验证方式**：导出 PDF，检查第一页顶部无任何自动添加的文字
- **相关代码**：`src/styles/globals.css` 的 `@media print` 块

### INV-2：PDF 底部无 URL/页码

- **约束**：`@page { margin: 0 }` 必须保留（同 INV-1）
- **破坏后果**：Chrome 自动渲染页脚（URL、页码）
- **验证方式**：导出 PDF，检查每页底部无 URL 和页码
- **相关代码**：`src/styles/globals.css` 的 `@media print` 块

### INV-3：PDF 侧边无垂直细线

- **约束**：`.workbench-page [class*='sash']` 和 `.workbench-page [class*='splitViewView']:not(:first-child)::before` 的 `display: none !important` 必须保留
- **破坏后果**：Allotment 分隔条出现在 PDF 侧边
- **验证方式**：导出 PDF，检查页面左侧/右侧无垂直细线
- **相关代码**：`src/styles/globals.css` 的 `@media print` 块

### INV-4：所有页面上下左右留白一致为 40px

- **约束**：`.a4-page { padding: 40px; box-sizing: border-box }` 必须保留；`createA4Page()` 内联样式必须与 CSS 规则一致
- **破坏后果**：多页边距不一致，第一页底部留白与第二页顶部留白不等
- **验证方式**：导出多页 PDF，对比每页内容区域到纸张边缘的距离
- **相关代码**：`src/styles/globals.css` 的 `.a4-page` 规则 + `src/hooks/usePdfExport.ts` 的 `createA4Page()`

### INV-5：`.a4-page` 必须带 `rich-content` class

- **约束**：`createA4Page()` 生成的 `.a4-page` 元素必须同时带 `rich-content` class
- **破坏后果**：`.rich-content ul li::before` 等列表样式选择器链断裂，圆点/序号消失，打印与预览不一致
- **验证方式**：触发分页后检查 `document.querySelector('.a4-page').className` 包含 `rich-content`；检查 `getComputedStyle(li, '::before').content` 不为 `none`
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `createA4Page()`

### INV-6：`<li>` 必须在 `<ul>/<ol>` 父节点内

- **约束**：`collectRichContent` 拆分 `<ul>/<ol>` 时，每个 `<li>` 必须包在一个 `<ul>` 或 `<ol>` wrapper 里作为流动单元，不能裸 `<li>` 直接 push
- **破坏后果**：`<li>` 被移到 `.a4-page` 后脱离 `<ul>` 父节点，CSS 选择器 `.rich-content ul li::before` 不匹配，圆点/序号消失
- **验证方式**：触发分页后检查 `document.querySelectorAll('.a4-page li').length === document.querySelectorAll('.a4-page ul > li, .a4-page ol > li').length`（所有 `<li>` 都有 `<ul>/<ol>` 父节点）
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `collectRichContent()` 中 UL/OL 分支

### INV-7：流动单元必须在 DOM 中可测量高度

- **约束**：所有 push 到 `units` 数组的元素必须已插入 DOM（不能是 `cloneNode` 产生的 detached 节点）
- **破坏后果**：`getBoundingClientRect().height` 返回 0，`packIntoPages` 装箱错误，页面留白异常
- **验证方式**：单元测试中 `collectFlowUnits` 返回的每个元素的 `isConnected` 必须为 `true`
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `collectRichContent()` / `collectEntry()` / `walkContainer()`

### INV-8：装箱高度必须包含 margin

- **约束**：`packIntoPages` 测量单元高度时必须用 `rect.height + marginTop + marginBottom`，不能只用 `getBoundingClientRect().height`
- **破坏后果**：忽略 margin 导致装箱时认为能装下，实际渲染时 margin 累加溢出页面，第一页被撑高超过 A4 高度
- **验证方式**：触发分页后检查 `document.querySelector('.a4-page').getBoundingClientRect().height <= 1124`（A4 高 1123px，允许 1px 误差）
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `packIntoPages()` 中的 `measureHeight()`

### INV-9：afterprint 必须能完整恢复原始 DOM

- **约束**：`paginateForPrint` 必须在修改 DOM 前深克隆 `sourceEl.cloneNode(true)`，cleanup 时从克隆恢复
- **破坏后果**：打印后预览页 DOM 被破坏，列表/section 结构丢失
- **验证方式**：触发分页 → 模拟 afterprint → 检查 `document.querySelectorAll('.resume-section').length` 与分页前一致
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `paginateForPrint()` 中 `originalClone` 和 cleanup 闭包

### INV-10：屏幕预览不受分页逻辑影响

- **约束**：`paginateForPrint` 只在 `exportToPdf` 执行时临时修改 DOM，`afterprint` 后恢复；屏幕态不出现 `.a4-page` 元素
- **破坏后果**：预览页出现分页容器，视觉错乱
- **验证方式**：未点导出时检查 `document.querySelectorAll('.a4-page').length === 0`
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `exportToPdf()` 调用链

### INV-11：section 标题不孤立在页底

- **约束**：`packIntoPages` 中 h2 孤儿控制逻辑必须保留（h2 装入后预判下一单元是否装得下，装不下则把 h2 推到下一页）
- **破坏后果**：标题在上一页页底、内容在下一页
- **验证方式**：构造"h2 + 高段落"场景，检查 h2 与段落同页
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `packIntoPages()` 中 h2 分支

### INV-12：单段落不被跨页切断（CSS 兜底）

- **约束**：`@media print` 中 `.rich-content > * { break-inside: avoid; page-break-inside: avoid }` 必须保留
- **破坏后果**：即使 JS 分页有微小偏差，单段落可能被 Chrome 自然分页切成两半
- **验证方式**：导出 PDF，检查无段落跨页显示
- **相关代码**：`src/styles/globals.css` 的 `@media print` 块

### INV-13：`<blockquote>` 含多 `<p>` 时拆分为独立 `<p>` 流动

- **约束**：`collectRichContent` 遇到 `<blockquote>` 时，若内部有 `<p>` 子元素则拆分为单个 `<p>` 单元，否则整体作为单元
- **破坏后果**：长引用块整块被推到下一页
- **验证方式**：单元测试覆盖 blockquote 含 `<p>` 和裸文本两种场景
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `collectRichContent()` 中 BLOCKQUOTE 分支

### INV-14：未知块级元素不丢失

- **约束**：`collectRichContent` 遇到非 BLOCK_TAGS 且非 inline 元素（SPAN/BR/MARK/CODE）时，作为整体单元保留
- **破坏后果**：用户粘贴的 `<pre>`/`<table>`/`<hr>`/`<div>` 等内容在 PDF 中完全丢失
- **验证方式**：单元测试覆盖 `<pre>`/`<table>`/`<hr>`/`<div>` 场景
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `collectRichContent()` 中 else 分支

### INV-15：嵌套列表作为整体单元保留（不扁平化）

- **约束**：`<li>` 含嵌套 `<ul>/<ol>` 时，该 `<li>` 作为整体单元保留，不递归扁平化
- **破坏后果**：递归扁平化会破坏嵌套视觉层级，且 cloneNode 产生 detached 节点违反 INV-7
- **验证方式**：单元测试覆盖嵌套列表场景，检查含嵌套 `<ul>` 的 `<li>` 整体保留
- **相关代码**：`src/hooks/usePdfExport.ts` 的 `collectRichContent()` 中 UL/OL 分支

---

## 修改前检查流程

1. **读完本文件**：确认你要改的代码涉及哪些约束
2. **确认不破坏**：你的修改是否会让任何约束的"验证方式"失败？
3. **如果必须破坏某约束**：在底部"变更记录"记录原因，并更新约束描述
4. **修改后验证**：按涉及约束的"验证方式"逐项检查（浏览器实测 + 单元测试）

## 变更记录

| 日期 | 约束 | 变更 | 原因 |
|------|------|------|------|
| - | - | 初始版本 | - |
