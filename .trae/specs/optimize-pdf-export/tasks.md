# Tasks

- [x] Task 1: 修改 `@media print` 规则，消除浏览器自动页眉页脚
  - [x] SubTask 1.1: 在 `src/styles/globals.css` 的 `@media print` 块中将 `@page` 的 `margin` 从 `40px` 改为 `0`（同时移除 `@page :first` 与 `@page resume` 中的 margin）
  - [x] SubTask 1.2: 在 `.resume-pages` 的打印态规则中显式加回 `padding: 40px !important;`，保持视觉边距不变
  - [x] SubTask 1.3: 验证 `@page :first` 与 `@page resume` 两个空规则块若不再需要可一并清理

- [x] Task 2: 移除 `.resume-section` 整 section 不可分割约束
  - [x] SubTask 2.1: 在 `src/styles/globals.css` `@media print` 中把 `.resume-section { break-inside: avoid; page-break-inside: avoid; }` 改为 `break-inside: auto; page-break-inside: auto;`
  - [x] SubTask 2.2: 在 `src/components/preview/PaginatedResumePreview.tsx` 中将 section 外层 div 的 `item-no-break` 类移除（保留 `resume-section` 类用于打印样式选择器）

- [x] Task 3: 将不可分割单元下沉到单条 entry 与 rich-content 行级块
  - [x] SubTask 3.1: 在 `ExperienceSection.tsx` 的单条 experience 外层 div 上加 `item-no-break` 类
  - [x] SubTask 3.2: 在 `EducationSection.tsx` 的单条 education 外层 div 上加 `item-no-break` 类
  - [x] SubTask 3.3: 在 `ProjectSection.tsx` 的单条 project 外层 div 上加 `item-no-break` 类
  - [x] SubTask 3.4: 在 `CertificateSection.tsx` 中对每个证书条目外层加 `item-no-break`（若结构为列表）
  - [x] SubTask 3.5: 在 `CustomSection.tsx` 中对每个自定义条目外层加 `item-no-break`
  - [x] SubTask 3.6: 在 `SelfEvaluationSection.tsx` / `SkillSection.tsx` 中若是富文本内容，整体保留 `item-no-break`（这两个 section 通常较短，整体不分割合理）
  - [x] SubTask 3.7: 在 `src/styles/globals.css` 中新增规则：`.rich-content > ul > li, .rich-content > ol > li, .rich-content > p { break-inside: avoid; page-break-inside: avoid; }`（限定在 `@media print` 内，避免影响屏幕态）

- [x] Task 4: 验证屏幕预览效果不变
  - [x] SubTask 4.1: 确认屏幕态 `.resume-pages` 的 padding / width / box-shadow / min-height 等属性未变
  - [x] SubTask 4.2: 启动 dev server，浏览器查看 workbench 预览，肉眼对比与优化前一致

- [x] Task 5: 验证 PDF 导出效果
  - [x] SubTask 5.1: 在 dev 环境点击"导出 PDF"，在 Chrome 打印对话框中选择"另存为 PDF"
  - [x] SubSub 5.2: 确认 PDF 顶部无时间戳/文件标识、底部无 URL
  - [x] SubTask 5.3: 确认多页简历分页合理，单条 entry 不被切断，section 可跨页
  - [x] SubTask 5.4: 确认 E2E 测试 `tests/e2e/pdf-export.spec.ts` 仍可通过（按钮可见、点击无对话框）

# Task Dependencies

- Task 2 依赖 Task 1（先调整 @page，再调整 section 分页策略，便于一次性验证）
- Task 3 依赖 Task 2（先解除 section 级约束，再加 entry 级约束）
- Task 4 / Task 5 依赖 Task 1 + Task 2 + Task 3 完成
