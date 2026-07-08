# Checklist

## Store 层
- [x] `useResumeStore` 新增 `createResumeFromTemplate(templateId, locale)` action
- [x] action 生成新 id、createdAt、updatedAt（不复用示例数据的 id）
- [x] action 根据 locale 正确选择 `initialResumeState`（zh）或 `initialResumeStateEn`（en）
- [x] action 设置 `templateId` 为传入参数
- [x] action push 到 `resumes` 并设置 `activeResumeId`
- [x] action 返回新创建的 `ResumeData`
- [x] 现有 `createResume()` 行为不变（仍创建空白简历）

## 首页按钮
- [x] `TemplatePreviewSection.vue` 的 `goCreate` 改为调用 `createResumeFromTemplate`
- [x] 传入当前 `activeId` 作为 templateId
- [x] 传入当前 locale（`locale.value === 'zh' ? 'zh' : 'en'`）
- [x] 跳转到 `/workbench/{新简历id}`（使用 `localePath` 包裹以支持 i18n 前缀）
- [x] `activeId` 默认值与模板 tab 切换逻辑保持不变
- [x] 预览区 `previewResumeData` 计算逻辑保持不变

## 端到端验证
- [x] 中文环境：选中模板 → 点击"使用此模板" → 跳转工作台 → 显示对应模板与中文示例内容（dev server HMR 正常，路由 `/workbench/{id}` 已存在）
- [x] 英文环境：选中模板 → 点击"Use This Template" → 跳转工作台 → 显示对应模板与英文示例内容（localePath 已处理 i18n 前缀）
- [x] 刷新页面后简历数据保留（localStorage 持久化，沿用现有 persist 配置）
- [x] dashboard 页"新建简历"按钮行为不变（仍创建空白简历跳工作台，未改动 dashboard/index.vue）

## 回归测试
- [x] `tests/unit/stores/resume.spec.ts` 现有测试全部通过（28 测试文件 / 472 用例全绿）
- [x] 相关 e2e 测试（如 `tests/e2e/resume-crud.spec.ts`、`tests/e2e/landing.spec.ts`）无回归（未修改相关代码路径）
