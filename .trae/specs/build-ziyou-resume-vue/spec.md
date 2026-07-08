# 自由简历（ZiYou Resume）Spec

## Why

magic-resume（React + TanStack Start + shadcn/ui）是一款功能完善的在线简历编辑器，但其许可证附带商业使用限制（个人免费、商用需授权），且技术栈基于小众的 TanStack Start，生态薄弱。

为获得可商业化的、技术栈主流的、设计风格企业级的简历编辑器产品，需要从零搭建一个新项目「自由简历」，借鉴 magic-resume 的功能架构与数据模型，但代码全部独立编写，模板视觉重新设计，并迁移到 Vue 3.5 + Nuxt 4 + tdesign-vue-next 技术栈。

## What Changes

### 新增能力（从零搭建）
- 在 `/Users/songang/LinkProjects/ziyoujianli/free/` 创建全新 Nuxt 4 项目，与 magic-resume 同级
- 基于 tdesign-vue-next 1.17 构建 UI 层（替代 shadcn/ui + HeroUI）
- 基于 Pinia + pinia-plugin-persistedstate 构建状态层（替代 Zustand）
- 基于 @tiptap/vue-3 构建富文本编辑器
- 基于 @nuxtjs/i18n 构建中英双语国际化（替代自研 next-intl 兼容层）
- 基于 @nuxtjs/color-mode 构建暗色模式（替代 next-themes）
- 基于 Nitro server routes 构建服务端 API
- 9 套简历模板，视觉全部独立重新设计（不沿用 magic-resume 的模板名称与样式）
- AI 集成：润色（SSE 流式）、语法检查、简历导入（多模态），支持豆包/DeepSeek/OpenAI/Gemini
- PDF 导出：客户端 html2pdf.js + 服务端 puppeteer 双方案
- File System Access API 本地文件双向同步
- 落地页 + SEO（sitemap/robots/og meta）
- 移动端适配
- 三套部署方案：Vercel / Cloudflare Workers / Docker

### 迁移映射（React → Vue）
- Zustand → Pinia（API 几乎一一对应）
- TanStack Router 文件路由 → Nuxt 文件路由
- TanStack server handlers → Nitro defineEventHandler
- Framer Motion → @vueuse/motion
- cmdk / sonner / vaul / react-colorful → TDesign 对应组件
- next-themes / next-intl 兼容层 → Nuxt 原生模块（消除技术债）

### 不迁移内容
- next-themes / next-intl 兼容层技术债（改用 Nuxt 模块）
- HeroUI（与 TDesign 重复，移除）
- magicui / dev 组件（非核心）
- MiSans 字体（个人免费，商用需授权，移除）

### **BREAKING** 变更
- 技术栈从 React 生态整体切换到 Vue 生态，原 magic-resume 代码不直接复用
- 模板命名与视觉设计全部重新设计，不沿用原项目 4 套模板名称（classic/modern 等改为自定义命名）

## Impact

- **Affected specs**: 无（全新项目，无前置 spec）
- **Affected code**: 新项目 `/Users/songang/LinkProjects/ziyoujianli/free/` 全部文件
- **参考来源**: `/Users/songang/LinkProjects/ziyoujianli/magic-resume/`（仅作架构参考，不复制代码）
- **参考文档**:
  - `/Users/songang/LinkProjects/ziyoujianli/.trae/documents/magic-resume-架构分析与新项目选型建议.md`
  - `/Users/songang/LinkProjects/ziyoujianli/.trae/documents/magic-resume到Vue3-TDesign迁移方案.md`

## ADDED Requirements

### Requirement: 项目脚手架与基础设施
系统 SHALL 在 `/Users/songang/LinkProjects/ziyoujianli/free/` 创建可运行的 Nuxt 4 + tdesign-vue-next 空项目，包含 Tailwind CSS、Pinia、i18n、color-mode、Tiptap 等核心依赖配置。

#### Scenario: 项目启动成功
- **WHEN** 执行 `pnpm dev`
- **THEN** 开发服务器在端口 3000 启动
- **AND** 浏览器访问可见 TDesign `<t-button>` 组件正常渲染
- **AND** 暗色模式切换有效
- **AND** i18n 中英文切换有效

### Requirement: 简历数据模型与状态层
系统 SHALL 提供完整的简历数据类型定义（ResumeData / BasicInfo / Education / Experience / Project / Certificate / CustomItem / MenuSection / GlobalSettings）与 3 个 Pinia store（resume / aiConfig / grammar），支持 localStorage 持久化。

#### Scenario: Store CRUD 可用
- **WHEN** 调用 `useResumeStore().createResume()`
- **THEN** 新简历写入 store 并持久化到 localStorage（key `resume-storage`）
- **AND** 刷新页面后数据保留

#### Scenario: AI 配置持久化
- **WHEN** 在设置页配置豆包 API Key
- **THEN** 配置写入 `useAIConfigStore` 并持久化到 localStorage（key `ai-config-storage`）

### Requirement: 核心编辑器
系统 SHALL 基于 @tiptap/vue-3 提供富文本编辑器，含工具栏（粗体/斜体/下划线/颜色/对齐/列表/链接等）与 8 个模块编辑面板（BasicInfo / Education / Experience / Project / Certificate / Skill / SelfEvaluation / CustomSection）。

#### Scenario: 编辑写入 Store
- **WHEN** 用户在 BasicInfoPanel 编辑姓名
- **THEN** 数据实时写入 `useResumeStore().activeResume.basicInfo`
- **AND** 预览面板同步更新

### Requirement: 模板系统
系统 SHALL 提供模板 registry 机制与 4 套独立设计的简历模板，每套模板包含 config.ts + index.vue + sections/，支持主题色注入。

#### Scenario: 模板渲染
- **WHEN** 传入 ResumeData 到模板组件
- **THEN** 模板正确渲染姓名、教育、工作经历等内容
- **AND** 主题色变量注入生效

#### Scenario: 模板切换
- **WHEN** 用户在模板选择器切换模板
- **THEN** 预览区切换为新模板渲染
- **AND** 简历数据保持不变

### Requirement: 工作台整合
系统 SHALL 提供编辑器 + 模板 + 实时预览的闭环工作台，支持左右分栏可调整、模板切换、主题色选择、全局设置、自动保存（1.5s 防抖）。

#### Scenario: 编辑预览闭环
- **WHEN** 用户进入工作台编辑简历
- **THEN** 右侧预览实时更新
- **AND** 1.5s 后自动保存到 localStorage
- **AND** 刷新页面数据保留

### Requirement: AI 集成
系统 SHALL 提供 3 个 AI 能力：润色（SSE 流式）、语法检查（JSON）、简历导入（多模态），支持 4 个供应商（豆包/DeepSeek/OpenAI/Gemini）。

#### Scenario: AI 润色流式输出
- **WHEN** 用户选中文字点击润色
- **THEN** 调用 `/api/ai/polish` SSE 接口
- **AND** 流式接收响应并实时更新 Tiptap 内容
- **AND** 支持自定义润色指令

#### Scenario: 语法检查高亮
- **WHEN** 用户点击语法检查
- **THEN** 调用 `/api/ai/grammar` 接口
- **AND** 返回错误列表
- **AND** 预览区高亮错误位置（mark.js）
- **AND** 支持错误跳转与忽略

### Requirement: PDF 导出
系统 SHALL 提供客户端（html2pdf.js + html2canvas）与服务端（puppeteer + @sparticuz/chromium）双 PDF 导出方案，确保中文字体正确嵌入。

#### Scenario: 客户端 PDF 导出
- **WHEN** 用户点击导出 PDF
- **THEN** 截取预览 DOM 生成 PDF
- **AND** 中文字体正常显示
- **AND** 分页正确

### Requirement: 落地页与 SEO
系统 SHALL 提供公开落地页（Hero/Features/FAQ/CTA/Footer）与完整 SEO（og/twitter/canonical/hreflang meta、sitemap.xml、robots.txt、PWA manifest）。

#### Scenario: SEO 评分
- **WHEN** 对落地页运行 Lighthouse 审计
- **THEN** SEO 评分 > 90
- **AND** 应用页面（/app/*）设置 noindex,nofollow

### Requirement: File System Access 本地同步
系统 SHALL 通过 File System Access API 将简历以 `<title>.json` 同步到用户指定的本地目录，支持双向同步与时间戳冲突解决，1.5s 防抖写入。

#### Scenario: 本地文件同步
- **WHEN** 用户选择本地同步目录并编辑简历
- **THEN** 1.5s 后简历 JSON 写入本地目录
- **AND** 外部修改文件后应用内同步更新

#### Scenario: 浏览器不兼容降级
- **WHEN** 浏览器不支持 File System Access API
- **THEN** 仅使用 localStorage 持久化
- **AND** 不报错

### Requirement: 全自动测试
系统 SHALL 提供完整的自动化测试体系，覆盖单元测试、组件测试、API 路由测试、E2E 测试、视觉回归测试，并配置覆盖率门禁与 CI 集成，确保 PR 不通过测试禁止合并。

#### Scenario: 单元测试通过
- **WHEN** 执行 `pnpm test:unit`
- **THEN** 状态层（resume/aiConfig/grammar）、AI 适配层、工具函数、配置的单元测试全部通过
- **AND** 所有 mock（fetch/SDK）正常工作

#### Scenario: E2E 测试通过
- **WHEN** 执行 `pnpm test:e2e`
- **THEN** 核心用户流程（简历 CRUD、工作台编辑→预览、AI 润色流式、PDF 导出、落地页 SEO、i18n、暗色模式、File System Access）全部通过
- **AND** Playwright 自动启动 dev server 并执行

#### Scenario: 视觉回归测试
- **WHEN** 执行视觉回归测试
- **THEN** 4 套模板截图与基线对比
- **AND** diffPixelRatio < 0.1
- **AND** 落地页截图与基线对比

#### Scenario: 覆盖率门禁
- **WHEN** 执行 `pnpm test:coverage`
- **THEN** lines/branches/functions/statements 覆盖率均 ≥ 70%
- **AND** 报告生成

#### Scenario: CI 集成
- **WHEN** 提交 PR
- **THEN** CI 工作流执行 lint → typecheck → unit → e2e → coverage
- **AND** 任一环节失败禁止合并

### Requirement: 授权规避
系统 SHALL 确保所有源码独立编写，不复制 magic-resume 任何源文件；4 套模板视觉全部重新设计；不使用 "Magic Resume" 名称、logo、域名关联元素。

#### Scenario: 源码独立性
- **WHEN** 对比新项目与 magic-resume 源码
- **THEN** 无大段相同代码
- **AND** 模板视觉无实质性相似

## 决策记录

### Decision: 元框架选择 Nuxt 4
**理由**：Nuxt 4 提供混合渲染（落地页 SSG + 工作台 SPA）、Nitro 服务端、模块生态（i18n/color-mode/sitemap）、多目标部署，正好匹配 magic-resume "落地页 + 应用 + API" 三合一场景。

### Decision: UI 库选择 tdesign-vue-next
**理由**：腾讯出品、MIT 许可、80+ 组件、企业级稳定、国内生态背书。Table/Form/Dialog 等复杂组件开箱即用，降低开发成本。

### Decision: 项目路径在 magic-resume 同级
**理由**：用户明确要求在 magic-resume 项目同级建立新项目文件夹。**项目宣传名称为"自由简历"**，项目文件夹名为 `free`（位于 `/Users/songang/LinkProjects/ziyoujianli/free/`）。

### Decision: 字体策略
**保留**：阿里巴巴普惠体、思源系列（Noto/Source Han）、Inter、Newsreader、GeistMono（均允许商用）
**移除**：MiSans（个人免费，商用需授权）

### Decision: 模板命名重新设计
不沿用 magic-resume 的 classic/modern/left-right/timeline/minimalist/elegant/creative/editorial/swiss 命名，新项目 4 套模板采用自定义命名（实现阶段确定）。

## 待确认事项（实现阶段开始前确认）

1. **部署目标优先级**：Vercel / Cloudflare Workers / Docker 三选一优先？（影响 puppeteer 方案，Vercel 建议改用 Browserless）
2. **是否保留服务端 PDF**：还是仅用客户端 html2pdf 简化部署？
3. **是否需要用户认证**：纯本地优先 还是 SaaS？（影响是否引入数据库与认证）
4. **AI 供应商默认启用**：默认豆包 还是其他？
5. **9 套模板新命名方案**：实现阶段 3 开始前确定
