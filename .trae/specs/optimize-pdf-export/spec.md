# PDF 导出优化 Spec

## Why

当前简历编辑页面的 PDF 导出存在三个体验问题，导致生成结果不符合专业简历格式要求：
1. PDF 顶部出现浏览器自动渲染的页眉（如 "2026/7/15 15:53 新建简历 1-2026-07-15"）
2. PDF 底部出现浏览器自动渲染的页脚 URL（如 "localhost:3000/workbench?id=..."）
3. 分页逻辑粗糙——整个 section 作为一个不可分割单元（`break-inside: avoid`），section 较大时被整体推到下一页，造成上一页大面积留白；用户要求按"行"（单个条目/段落级别）进行分页控制，最大化页面空间利用率。

## What Changes

- 在 `@media print` 规则中将 `@page` 的 margin 改为 `0`，从根上消除浏览器渲染页眉页脚所需的空间（Chrome / Edge 默认页眉页脚只在 page margin 区域绘制）。
- 在 `.resume-pages` 打印态下显式加回内边距（如 `padding: 40px`），保持视觉边距不变；屏幕态 padding 不变。
- 移除 `.resume-section { break-inside: avoid }` 的整 section 不可分割约束，改为 `break-inside: auto`，允许 section 自由跨页。
- 将"不可分割"单元从整个 section 下沉到更细粒度——单个条目 div（experience / education / project entry 等）以及 rich-content 内部的块级元素（`<li>` / `<p>`）。具体做法：
  - 在 `PaginatedResumePreview.tsx` 中给每个 section 外层 div 加上 `resume-section` 类，移除整 section 的 `item-no-break`。
  - 在各 section 组件（`ExperienceSection` / `EducationSection` / `ProjectSection` / `CertificateSection` / `CustomSection` 等）的"单条记录"外层 div 上加 `item-no-break` 类（或等效内联样式），确保单条 entry 不被切断。
  - 在 `globals.css` 中新增 `.rich-content > ul > li, .rich-content > ol > li, .rich-content > p { break-inside: avoid; }` 规则，让富文本内部的"行级块"也不会跨页断裂。
- 保持屏幕预览效果完全不变（屏幕态 CSS 不动）。

## Impact

- Affected code:
  - `src/styles/globals.css` — `@media print` 中的 `@page` 与 `.resume-section` 规则
  - `src/components/preview/PaginatedResumePreview.tsx` — section 外层 className 调整
  - `src/components/templates/professional/sections/ExperienceSection.tsx`
  - `src/components/templates/professional/sections/EducationSection.tsx`
  - `src/components/templates/professional/sections/ProjectSection.tsx`
  - `src/components/templates/professional/sections/CertificateSection.tsx`
  - `src/components/templates/professional/sections/CustomSection.tsx`
  - `src/components/templates/professional/sections/SelfEvaluationSection.tsx`
  - `src/components/templates/professional/sections/SkillSection.tsx`

## ADDED Requirements

### Requirement: PDF 无页眉页脚系统信息

导出生成的 PDF 顶部和底部不得包含任何浏览器自动生成的内容，包括但不限于：日期时间戳、文件标识、URL 地址、页码。

#### Scenario: 导出 PDF 无顶部时间戳与文件标识
- **WHEN** 用户点击"导出 PDF"按钮完成导出
- **THEN** 生成的 PDF 第一页顶部不出现 "2026/7/15 15:53 新建简历 1-2026-07-15" 之类的时间戳和文件名信息
- **AND** 所有后续页面顶部同样不出现任何自动生成的页眉内容

#### Scenario: 导出 PDF 无底部 URL
- **WHEN** 用户点击"导出 PDF"按钮完成导出
- **THEN** 生成的 PDF 所有页面底部不出现 "localhost:3000/workbench?id=..." 或任何网页地址
- **AND** 所有页面底部不出现任何自动生成的页脚内容

### Requirement: PDF 按行级单元智能分页

PDF 分页以"单个条目 / 富文本行级块"为最小不可分割单元，而非整个 section。只有当当前页剩余空间确实无法容纳下一个不可分割单元时才进行分页。

#### Scenario: 单个条目不被跨页切断
- **WHEN** 一段工作经历条目（含公司名、职位、描述）渲染时当前页底部空间不足以容纳完整条目
- **THEN** 该条目整体被推到下一页
- **AND** 上一页底部留白不超过该条目的高度

#### Scenario: 富文本内单行不被跨页切断
- **WHEN** rich-content 中某个 `<li>` 或 `<p>` 在页面底部边界处
- **THEN** 该 `<li>` / `<p>` 整体保持同一页内
- **AND** 该 `<li>` / `<p>` 不会被切断成上半部分在上一页、下半部分在下一页

#### Scenario: section 可自由跨页
- **WHEN** 一个 section 内有多个条目且整体高度超过一页剩余空间
- **THEN** section 的标题与首个条目可保留在当前页
- **AND** 后续条目按行级分页规则自然流动到下一页
- **AND** 不再因为整个 section 不可分割而把整个 section 推到下一页造成大面积留白

#### Scenario: 屏幕预览不受影响
- **WHEN** 用户在 workbench 预览简历（未导出）
- **THEN** 预览效果与优化前完全一致
- **AND** 屏幕态不出现分页相关样式变化

## MODIFIED Requirements

### Requirement: PDF 打印样式（@page 与 .resume-pages）

打印态下 `@page` margin 设为 `0`，由 `.resume-pages` 自身 `padding` 提供视觉边距；`.resume-section` 不再使用 `break-inside: avoid`，改为允许跨页；不可分割单元下沉至单条 entry 与 rich-content 行级块。
