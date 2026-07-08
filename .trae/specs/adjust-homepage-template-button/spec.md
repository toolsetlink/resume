# 首页"使用此模板"按钮行为调整 Spec

## Why

当前首页 `TemplatePreviewSection` 中的"使用此模板"按钮仅跳转到 `/dashboard` 列表页，用户还需要手动创建简历再进入工作台，体验割裂。用户期望点击按钮即"开箱即用"：自动创建一份简历，内容默认填充模板预览展示的示例内容，并直接进入编辑页面。

## What Changes

- **调整** `TemplatePreviewSection.vue` 中 `goCreate` 行为：从"跳转 dashboard"改为"创建简历并跳转工作台"
- **新增** `useResumeStore` action `createResumeFromTemplate(templateId, locale)`：创建新简历，内容填充对应 locale 的 `initialResumeState` / `initialResumeStateEn`，设置 `templateId`，返回新简历 id
- **保留** 当前选中模板（`activeId`）作为新简历的 `templateId`
- **保留** locale 自动判断：中文填充 `initialResumeState`，英文填充 `initialResumeStateEn`
- **保留** 现有 `createResume()` 行为不变（dashboard 页"新建简历"按钮仍创建空白简历）

### 非 BREAKING 变更
- 不修改 `createResume()` 现有签名与行为
- 不修改 `dashboard/index.vue`、`dashboard/templates.vue` 的逻辑
- 不修改 `HeroSection.vue` 的 `goCreate`（仍跳 dashboard，属于另一种入口意图）

## Impact

- **Affected specs**: `build-ziyou-resume-vue`（落地页与工作台衔接流程）
- **Affected code**:
  - `app/components/home/TemplatePreviewSection.vue`（修改 `goCreate`）
  - `app/stores/resume.ts`（新增 `createResumeFromTemplate` action）
- **参考文档**: `.trae/documents/adjust-homepage-content.md`（首页内容调整历史文档）

## ADDED Requirements

### Requirement: 首页"使用此模板"按钮一键创建并跳转工作台
系统 SHALL 在用户点击首页 `TemplatePreviewSection` 的"使用此模板"按钮时，自动创建一份新简历，简历内容默认填充当前 locale 对应的示例数据（`initialResumeState` / `initialResumeStateEn`），简历的 `templateId` 设置为当前用户选中的模板 id，然后直接跳转到 `/workbench/{id}` 编辑页面。

#### Scenario: 中文环境下点击"使用此模板"
- **WHEN** 用户在中文 locale 下，选中模板 `modern`，点击"使用此模板"按钮
- **THEN** 调用 `useResumeStore().createResumeFromTemplate('modern', 'zh')`
- **AND** 新简历被创建，`basic.name` 等字段填充 `initialResumeState` 的内容
- **AND** 新简历的 `templateId` 为 `modern`
- **AND** 新简历被持久化到 localStorage（key `resume-storage`）
- **AND** 浏览器跳转到 `/workbench/{新简历id}`

#### Scenario: 英文环境下点击"使用此模板"
- **WHEN** 用户在英文 locale 下（`/en`），选中模板 `elegant`，点击"使用此模板"按钮
- **THEN** 调用 `useResumeStore().createResumeFromTemplate('elegant', 'en')`
- **AND** 新简历被创建，`basic.name` 等字段填充 `initialResumeStateEn` 的内容
- **AND** 新简历的 `templateId` 为 `elegant`
- **AND** 浏览器跳转到 `/en/workbench/{新简历id}`

#### Scenario: 默认选中模板
- **WHEN** 用户首次进入首页 `TemplatePreviewSection`，未切换模板 tab
- **THEN** 默认选中 `TEMPLATE_REGISTRY[0].config.id`（即 `professional`）
- **AND** 点击"使用此模板"创建的简历 `templateId` 为 `professional`

## MODIFIED Requirements

### Requirement: useResumeStore 简历创建能力
在原有 `createResume(title?)` 创建空白简历的基础上，新增 `createResumeFromTemplate(templateId, locale)` action：
- 接收参数：`templateId: string`、`locale: 'zh' | 'en'`
- 行为：基于 `blankResumeState` 创建新简历（生成 id、createdAt、updatedAt），然后用对应 locale 的 `initialResumeState` / `initialResumeStateEn` 覆盖业务字段（保留新 id 与时间戳），设置 `templateId`
- 返回：新创建的 `ResumeData`
- 副作用：将新简历 push 到 `resumes`，设置 `activeResumeId` 为新 id

## 决策记录

### Decision: 不复用 `initialize()` 的示例数据填充
**理由**：`initialize()` 仅在 store 为空时填充一次示例数据，且不接收 templateId 参数。新增独立的 `createResumeFromTemplate` action 语义更清晰，避免污染 `initialize` 的逻辑。

### Decision: 保留 `createResume()` 空白简历行为
**理由**：dashboard 页"新建简历"按钮调用 `createResume()`，期望创建空白简历让用户从零填写。两种入口对应不同用户意图，不应合并。

### Decision: 不修改 `HeroSection.vue` 的 `goCreate`
**理由**：HeroSection 的"立即创建"按钮跳转 dashboard 是合理的引导路径（用户在 Hero 区还没看到模板，不应直接创建）。仅在用户已经看到模板预览并选中具体模板后，"使用此模板"才执行一键创建。

## 待确认事项（实现阶段开始前确认）

1. **跳转后是否需要 toast 提示**：创建并跳转后是否需要 `MessagePlugin.success` 提示"简历已创建"？（建议：否，避免打断编辑流）
2. **预览区默认模板**：当前 `activeId` 默认 `templates[0]?.config.id ?? 'professional'`，若 registry 顺序变化是否影响？（建议：保持现状，依赖 registry 顺序）
