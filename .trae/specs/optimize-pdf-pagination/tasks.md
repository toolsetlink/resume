# Tasks

- [ ] Task 1: 重构 `paginateForPrint` 为段落级流式装箱算法
  - [ ] SubTask 1.1: 在 `src/hooks/usePdfExport.ts` 中实现"叶子块级节点收集器"
    - 输入：一个 `.resume-section` 元素
    - 输出：有序的流动单元数组（每个单元是一个 DOM 元素）
    - 收集规则：递归遍历 section 子树，遇到以下节点即作为流动单元（不再向下递归）：
      - section 标题：SectionTitle 渲染的 `<h2>`
      - entry 的结构性子元素：flex 布局的"公司名+日期行"div、职位行 div、GPA 行 div 等（即 entry 内部非 rich-content 的直接子 div）
      - 富文本内的块级子元素：`.rich-content` 下的 `<p>` / `<li>` / `<ul>` / `<ol>` / `<blockquote>` / `<h1>` / `<h2>` / `<h3>`
    - 不向下递归的场景：已识别为流动单元的节点不再拆分其子节点（如 entry 的公司名行作为一个整体，不拆成"公司名 span"+"日期 span"）
  - [ ] SubTask 1.2: 实现段落级装箱主循环
    - 维护 currentPage / currentHeight 状态
    - 逐 section 遍历：收集该 section 的所有流动单元 → 逐个装入当前 `.a4-page`
    - 装不下当前页时新建 `.a4-page`，把当前段落推到新页
    - 测量用 `getBoundingClientRect().height`
  - [ ] SubTask 1.3: 实现标题孤儿控制（widow control）
    - section 标题装入当前页后，预判下一个流动单元（首个段落）是否装得下当前页剩余空间
    - 若装不下，把标题也一起推到下一页（从当前页移除已装入的标题，新建页后重新装入标题+首个段落）
  - [x] SubTask 1.4: 保留 DOM 恢复逻辑（afterprint 后恢复原始子节点和内联样式，幂等可恢复）

- [x] Task 2: 抽取 `paginateForPrint` 为可独立测试的纯函数
  - [x] SubTask 2.1: 将核心装箱逻辑抽取为纯函数 `collectFlowUnits(section: HTMLElement): HTMLElement[]` 和 `packIntoPages(units: HTMLElement[], pageHeightPx: number): HTMLElement[]`
  - [x] SubTask 2.2: `paginateForPrint` 调用这两个纯函数组合完成分页，便于单元测试单独验证收集器和装箱器

- [x] Task 3: 调整 `@media print` CSS 作为 JS 装箱的兜底
  - [x] SubTask 3.1: 确认 `.resume-section { break-inside: auto }` 保留（允许 section 跨页，配合 JS 装箱）
  - [x] SubTask 3.2: 确认 `.rich-content > ul > li, .rich-content > ol > li, .rich-content > p { break-inside: avoid }` 保留（单段落不被切断的兜底）
  - [x] SubTask 3.3: 扩充兜底规则：`.rich-content > * { break-inside: avoid }` 覆盖所有块级子元素（`<blockquote>` / `<h1-3>` 等），不限于 `<li>` / `<p>`
  - [x] SubTask 3.4: 给 section 标题（`h2`）在打印态加 `break-after: avoid`，作为标题不孤立的 CSS 兜底

- [x] Task 4: 验证已完成的优化继续生效
  - [x] SubTask 4.1: 确认 `@page { margin: 0 }` 保留（无页眉页脚/URL/页码）
  - [x] SubTask 4.2: 确认 `.a4-page { padding: 40px }` 保留（多页边距一致）
  - [x] SubTask 4.3: 确认 Allotment splitter 隐藏规则保留（无侧边竖线）

- [x] Task 5: 添加单元测试
  - [x] SubTask 5.1: 为 `collectFlowUnits` 添加单元测试（用 jsdom 模拟 DOM）
    - 测试用例 1：列表型 section（experience）收集到 [h2标题, 公司名行, 职位行, p段落1, p段落2, ...]
    - 测试用例 2：富文本型 section（selfEvaluation）收集到 [h2标题, p段落1, p段落2, li条目1, ...]
    - 测试用例 3：空 section 不产生流动单元
  - [x] SubTask 5.2: 为 `packIntoPages` 添加单元测试
    - 测试用例 1：所有单元装得下单页，不产生多余分页
    - 测试用例 2：单元总高超过一页，按段落分页，第二页从新段落开始
    - 测试用例 3：单段落高度超过页剩余空间时整体推到下一页
    - 测试用例 4：标题孤儿控制——标题后首个段落装不下时，标题一起推到下一页
    - 测试用例 5：多 section 混合，验证 section 边界与段落级单元都正确处理

- [x] Task 6: 类型检查与现有测试验证
  - [x] SubTask 6.1: 运行 `pnpm exec tsc --noEmit` 确认无类型错误
  - [x] SubTask 6.2: 运行 `pnpm vitest run` 确认现有单元测试 + 新增测试均通过
  - [ ] SubTask 6.3: 运行 `pnpm exec playwright test`（需在非沙箱环境）确认 E2E pdf-export.spec.ts 通过

# Task Dependencies
- Task 2 与 Task 1 并行（抽取纯函数是 Task 1 的实现方式）
- Task 3 依赖 Task 1（CSS 兜底规则配合 JS 装箱逻辑）
- Task 4 与 Task 1/3 并行（验证已有优化未被破坏）
- Task 5 依赖 Task 1/2（测试针对 Task 1/2 的算法）
- Task 6 依赖 Task 1/2/3/5 全部完成
