# Tasks

## 阶段 1：Store 层新增 action

- [ ] Task 1.1: 在 `useResumeStore` 新增 `createResumeFromTemplate` action
  - 文件：`app/stores/resume.ts`
  - 实现：接收 `templateId: string` 与 `locale: 'zh' | 'en'` 参数
  - 逻辑：
    1. 调用 `createNewResume()` 生成新简历骨架（含 id/createdAt/updatedAt）
    2. 根据 locale 选择 `initialResumeState`（zh）或 `initialResumeStateEn`（en）
    3. 用示例数据覆盖业务字段，但保留新 id、createdAt、updatedAt
    4. 设置 `templateId` 为传入参数
    5. push 到 `this.resumes`，设置 `this.activeResumeId`
    6. 返回新 `ResumeData`
  - 导入依赖：从 `#shared/config/initialResumeData` 导入 `createNewResume`、`initialResumeState`、`initialResumeStateEn`（前两者已导入，需补 `initialResumeStateEn`）

## 阶段 2：首页按钮行为调整

- [ ] Task 2.1: 修改 `TemplatePreviewSection.vue` 的 `goCreate` 方法
  - 文件：`app/components/home/TemplatePreviewSection.vue`
  - 修改 `goCreate`：
    1. 引入 `useResumeStore`
    2. 调用 `resumeStore.createResumeFromTemplate(activeId.value, locale.value === 'zh' ? 'zh' : 'en')`
    3. 取得返回的 resume.id
    4. `router.push(localePath(`/workbench/${resume.id}`))`
  - 保留现有 `activeId` 默认值与模板 tab 切换逻辑不变
  - 保留预览区 `previewResumeData` 计算逻辑不变

## 阶段 3：验证

- [x] Task 3.1: 手动验证（dev server 已在 3000 端口运行）
  - 访问 `/`（中文），切换到 `modern` 模板 tab，点击"使用此模板"
  - 验证：跳转到 `/workbench/{id}`，预览显示 modern 模板，内容为中文示例数据
  - 验证：刷新页面数据保留（localStorage 持久化生效）
  - 访问 `/en`，切换到 `elegant` 模板 tab，点击"Use This Template"
  - 验证：跳转到 `/en/workbench/{id}`，内容为英文示例数据
- [x] Task 3.2: 运行已有测试确保无回归
  - 执行 `pnpm test:unit -- resume`（或相关 store 测试）
  - 确认 `tests/unit/stores/resume.spec.ts` 现有测试仍通过

# Task Dependencies

- Task 2.1 依赖 Task 1.1（需要 store 的新 action）
- Task 3.1 依赖 Task 1.1 + Task 2.1
- Task 3.2 依赖 Task 1.1（store 改动可能影响现有测试）
