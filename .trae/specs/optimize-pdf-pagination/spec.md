# PDF 智能行级分页 Spec

## Why

当前 PDF 导出的 JS 分页算法（`usePdfExport.ts` 中的 `paginateForPrint`）以整个 `.resume-section` 为不可分割装箱单元：一旦某个 section 装不下当前页剩余空间，就把整个 section（含标题+所有条目+所有富文本）推到下一页，造成当前页底部大面积留白。

用户明确要求：**分页最小颗粒度是每个独立 DOM 段落**（TipTap 编辑器里每个 `<p>` / `<li>` 节点），而非整个 section 或单条 entry div。即：
- 一段工作经历描述有 5 个 `<p>` 段落，前 3 个装得下当前页 → 前 3 个留当前页，后 2 个流到下一页
- entry 的结构性子元素（公司名行、职位行、日期行）也各自作为独立流动单元
- section 标题与其后首个段落保持同页（标题孤儿控制）
- TipTap 编辑器已原生支持多段落（回车产生独立 `<p>` 节点），编辑器无需代码改造

此 Spec 汇总并继承当前对话中已完成的优化（无页眉页脚、无 URL、无页码、无侧边竖线、多页边距一致），聚焦新增的**段落级智能分页**需求。

## What Changes

- **重构 `paginateForPrint` 算法**：从"按 section 整块装箱"改为"按 DOM 段落流式装箱"
  - 识别 section 内部的**段落级流动单元**：遍历 section 子树，收集所有"叶子块级节点"作为流动单元
    - entry 的结构性子元素：公司名+日期行（flex div）、职位行（div）、GPA 行（div）等
    - 富文本内的块级子元素：`.rich-content` 下的每个 `<p>` / `<li>` / `<ul>` / `<ol>` / `<blockquote>` / `<h1-3>`
  - 逐段落装入当前页，装不下就推到下一页
  - section 标题（SectionTitle 的 `<h2>`）作为特殊单元，与其后首个段落保持同页（孤儿控制）
- **保留已有优化**（不变）：
  - `@page margin: 0`（消除页眉页脚渲染空间）
  - `.a4-page` 容器 padding:40px（保证多页边距一致）
  - Allotment splitter 隐藏（消除侧边竖线）
  - CSS `break-inside: avoid` 作为兜底（单段落不被跨页切断）

## Impact

- Affected code:
  - `src/hooks/usePdfExport.ts` — 重构 `paginateForPrint` 算法为段落级流式装箱；抽取为可独立测试的纯函数
  - `src/styles/globals.css` — 微调 `@media print` 中段落级 `break-inside` 规则（配合 JS 装箱，CSS 作为兜底）
- 不涉及编辑器改造：TipTap 已原生支持多段落，用户按回车自然产生独立 `<p>` 节点
- Affected specs:
  - `optimize-pdf-export` — 继承其所有已完成成果

## ADDED Requirements

### Requirement: PDF 按 DOM 段落级智能分页

PDF 导出时的分页算法以"DOM 段落"为最小流动单位，而非整个 section 或单条 entry div。段落级流动单元定义：
- entry 的结构性子元素：公司名+日期行、职位行、GPA 行等（每个独立块级 div）
- 富文本内的块级子元素：`.rich-content` 下的每个 `<p>` / `<li>` / `<ul>` / `<ol>` / `<blockquote>` / `<h1-3>`
- section 标题（SectionTitle 的 `<h2>`）：作为特殊单元，与其后首个段落保持同页

#### Scenario: 富文本内多段落按段流动填满页面
- **WHEN** 一段工作经历描述有 5 个 `<p>` 段落，当前页剩余空间可容纳前 3 个但装不下第 4 个
- **THEN** 前 3 个 `<p>` 保留在当前页
- **AND** 第 4、5 个 `<p>` 推到下一页
- **AND** 当前页底部不会因整个 entry 或 section 被推走而出现大面积留白

#### Scenario: entry 结构性子元素按行流动
- **WHEN** 一条工作经历的"公司名+日期行"和"职位行"装得下当前页，但其后的描述段落装不下
- **THEN** "公司名+日期行"和"职位行"保留在当前页
- **AND** 描述段落推到下一页
- **AND** 不会因整条 entry 不可分割而把公司名行也推到下一页

#### Scenario: 单个 DOM 段落不被跨页切断
- **WHEN** 某个 `<p>` 或 `<li>` 的整体高度超过当前页剩余空间
- **THEN** 该段落整体被推到下一页
- **AND** 不会被切成上半部分在上一页、下半部分在下一页

#### Scenario: section 标题不孤立在页底
- **WHEN** section 标题装入当前页后，当前页剩余空间不足以容纳该 section 的首个段落
- **THEN** section 标题与首个段落一起被推到下一页
- **AND** 不会出现"标题在上一页页底、内容在下一页"的孤立标题

#### Scenario: 屏幕预览不受影响
- **WHEN** 用户在 workbench 预览简历（未导出）
- **THEN** 预览效果与优化前完全一致
- **AND** 屏幕态不出现分页相关 DOM 或样式变化（JS 分页仅在 exportToPdf 执行时临时修改 DOM，afterprint 后恢复）

#### Scenario: 已完成的优化继续生效
- **WHEN** 导出 PDF
- **THEN** PDF 顶部无时间戳/文件标识（`@page margin:0` 生效）
- **AND** PDF 底部无 URL / 页码（`@page margin:0` 生效）
- **AND** PDF 侧边无垂直细线（Allotment splitter 隐藏生效）
- **AND** 所有页面上下左右留白一致为 40px（`.a4-page` padding 生效）

## MODIFIED Requirements

### Requirement: PDF 分页装箱算法（paginateForPrint）

`paginateForPrint` 从"按 section 整块装箱"改为"按 DOM 段落流式装箱"。算法遍历 `.resume-pages` 下每个 `.resume-section`，递归收集其内部所有"叶子块级节点"作为流动单元，逐个装入当前 `.a4-page`。section 标题作为特殊单元与首个段落绑定。CSS `break-inside: avoid` 规则作为兜底，确保即使 JS 测量有微小偏差，单段落也不会被 Chrome 自然分页切断。
