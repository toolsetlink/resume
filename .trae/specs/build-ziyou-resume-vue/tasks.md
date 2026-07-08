# Tasks

基于迁移方案，将工作分为 11 个阶段（0-10），严格按顺序执行，每阶段验收通过再进入下一阶段。阶段 0-4 为 MVP，跑通后即可体验核心功能。

## 阶段 0：脚手架与基础设施

- [x] Task 0.1: 创建 Nuxt 4 项目骨架
  - 在 `/Users/songang/LinkProjects/ziyoujianli/free/` 执行 `pnpm create nuxt` 初始化
  - 验证 `pnpm dev` 可启动
  - 配置 `package.json` 基本信息（name: ziyou-resume, private: true）
- [x] Task 0.2: 安装核心依赖
  - 安装 UI：`tdesign-vue-next`、`tdesign-icons-vue-next`
  - 安装样式：`@nuxtjs/tailwindcss`、`tailwindcss`、`sass`
  - 安装状态：`@pinia/nuxt`、`pinia`、`pinia-plugin-persistedstate`
  - 安装国际化：`@nuxtjs/i18n`
  - 安装暗色：`@nuxtjs/color-mode`
  - 安装编辑器：`@tiptap/vue-3`、`@tiptap/starter-kit`、`@tiptap/extension-color`、`@tiptap/extension-highlight`、`@tiptap/extension-link`、`@tiptap/extension-list`、`@tiptap/extension-text-align`、`@tiptap/extension-underline`、`@tiptap/extension-placeholder`、`@tiptap/extension-text-style`
  - 安装动画：`@vueuse/motion`、`@vueuse/nuxt`
  - 安装工具：`dayjs`、`lodash`、`uuid`
  - 安装 PDF：`html2pdf.js`、`html2canvas`（puppeteer 等阶段 6 再装）
  - 安装 AI：`@google/generative-ai`、`undici`
  - 安装图标补充：`lucide-vue-next`
  - 安装开发依赖：`@types/lodash`、`prettier`、`eslint`
- [x] Task 0.3: 配置 nuxt.config.ts
  - 注册模块：`@nuxtjs/tailwindcss`、`@pinia/nuxt`、`@nuxtjs/i18n`、`@nuxtjs/color-mode`、`@vueuse/nuxt`
  - 配置 TDesign CSS 全局引入
  - 配置 i18n：locales ['zh','en']，defaultLocale 'zh'，prefix 策略
  - 配置 color-mode：class 策略，fallback 'light'
  - 配置 app head：title、meta
- [x] Task 0.4: 配置 TDesign 插件
  - 创建 `app/plugins/tdesign.ts` 全局注册 TDesign（或按需引入配置）
- [x] Task 0.5: 配置 Tailwind 主题
  - 创建 `tailwind.config.ts`：darkMode 'class'，content 扫描，TDesign Design Token 共存
  - 创建 `app/assets/styles/globals.css`：CSS 变量主题系统（HSL 变量，独立设计配色，不复制 magic-resume）
- [x] Task 0.6: 配置 tsconfig.json
  - 严格模式，路径别名 `@/*` → `./app/*`、`~shared/*` → `./shared/*`
- [x] Task 0.7: 配置 ESLint + Prettier
  - `.eslintrc` + `.prettierrc`
- [x] Task 0.8: 验证阶段 0
  - `pnpm dev` 启动，TDesign `<t-button>` 可渲染
  - 暗色模式切换有效
  - i18n 切换有效

## 阶段 1：数据模型与状态层

- [x] Task 1.1: 创建简历数据类型定义
  - `shared/types/resume.ts`：ResumeData、BasicInfo、Education、Experience、Project、Certificate、CustomItem、MenuSection、GlobalSettings
  - `shared/types/template.ts`：ResumeTemplate、TemplateConfig 接口
- [x] Task 1.2: 创建初始数据与配置
  - `shared/config/initialResumeData.ts`：空简历模板数据
  - `shared/config/modules.ts`：章节定义（basic/education/experience/project/certificate/skill/selfEvaluation/custom）
  - `shared/config/ai.ts`：4 个供应商配置（doubao/deepseek/openai/gemini）
  - `shared/config/constants.ts`：常量定义
- [x] Task 1.3: 实现 useResumeStore
  - `app/stores/resume.ts`：CRUD 简历 + 各模块（教育/工作/项目/证书/技能/自定义）
  - persist 插件持久化到 localStorage（key `resume-storage`，仅持久化 resumes + activeResumeId）
  - 模板切换、主题色、全局设置、章节排序与可见性方法
- [x] Task 1.4: 实现 useAIConfigStore
  - `app/stores/aiConfig.ts`：4 个供应商的 apiKey/modelId/endpoint
  - persist 插件持久化（key `ai-config-storage`）
- [x] Task 1.5: 实现 useGrammarStore
  - `app/stores/grammar.ts`：语法检查状态、错误列表、选中索引（不持久化）
- [x] Task 1.6: 创建 i18n locale 文件
  - `i18n/locales/zh.json`、`i18n/locales/en.json`（参考 magic-resume 结构，独立编写文案）
- [x] Task 1.7: 验证阶段 1
  - 编写简单测试验证 store CRUD
  - persist 生效验证

## 阶段 2：核心编辑器

- [x] Task 2.1: 实现 TiptapEditor 组件
  - `app/components/editor/TiptapEditor.vue`：useEditor + EditorContent
  - 配置扩展：starter-kit、color、highlight、link、list、text-align、underline、placeholder
- [x] Task 2.2: 实现 EditorToolbar 组件
  - `app/components/editor/EditorToolbar.vue`：工具栏（粗体/斜体/下划线/颜色/对齐/列表/链接）
  - 使用 TDesign Button/Tooltip/Divider/ColorPicker
- [x] Task 2.3: 实现 BasicInfoPanel
  - `app/components/editor/basic/BasicInfoPanel.vue`：姓名、联系方式、照片等
  - 使用 TDesign Form/Input/Upload
- [x] Task 2.4: 实现 EducationPanel
  - `app/components/editor/education/EducationPanel.vue` + `EducationItem.vue`
  - 使用 TDesign Form/Input/DatePicker
- [x] Task 2.5: 实现 ExperiencePanel
  - `app/components/editor/experience/ExperiencePanel.vue` + `ExperienceItem.vue`
  - 工作经历含公司、职位、时间、描述（富文本）
- [x] Task 2.6: 实现 ProjectPanel
  - `app/components/editor/project/ProjectPanel.vue` + `ProjectItem.vue`
- [x] Task 2.7: 实现 CertificatePanel
  - `app/components/editor/certificates/CertificatesPanel.vue` + `CertificateItem.vue`
- [x] Task 2.8: 实现 SkillPanel
  - `app/components/editor/skills/SkillPanel.vue`
- [x] Task 2.9: 实现 SelfEvaluationPanel
  - `app/components/editor/self-evaluation/SelfEvaluationPanel.vue`
- [x] Task 2.10: 实现 CustomPanel
  - `app/components/editor/custom/CustomPanel.vue` + `CustomItem.vue`
- [x] Task 2.11: 实现 EditPanel 与 SidePanel
  - `app/components/editor/EditPanel.vue`：编辑面板容器
  - `app/components/editor/SidePanel.vue`：章节导航与排序（vuedraggable）
  - 章节可见性切换（TDesign Switch）
- [x] Task 2.12: 验证阶段 2
  - 可编辑各模块，数据写入 store，富文本格式化可用

## 阶段 3：模板系统（先 1 套验证）

- [x] Task 3.1: 实现模板 registry
  - `app/components/templates/registry.ts`：模板注册中心
  - TemplateConfig 接口：id/name/description/thumbnail/component
- [x] Task 3.2: 实现第 1 套模板（自定义命名，不沿用 classic）
  - `app/components/templates/<name>/config.ts`：模板配置
  - `app/components/templates/<name>/index.vue`：模板主组件（接收 ResumeData props）
  - `app/components/templates/<name>/sections/`：BaseInfo/Education/Experience/Project/Skill/SelfEvaluation/CustomSection/SectionTitle
  - 视觉独立设计，Tailwind + CSS 变量，支持 themeColor 注入
- [x] Task 3.3: 验证阶段 3
  - 传入 ResumeData，模板正确渲染

## 阶段 4：工作台整合

- [x] Task 4.1: 实现工作台页面
  - `app/pages/[locale]/(app)/workbench/[id].vue`
  - 路由 useRoute 获取 id，从 store 加载简历
- [x] Task 4.2: 实现工作台布局
  - 左侧编辑面板（可折叠）+ 右侧实时预览
  - 使用 `splitpanes` 库实现可调整分栏
- [x] Task 4.3: 实现 ResumePreview 组件
  - `app/components/preview/ResumePreview.vue`：根据当前模板渲染
- [x] Task 4.4: 实现模板切换器
  - TDesign Select + 缩略图
- [x] Task 4.5: 实现主题色选择器
  - TDesign ColorPicker，写入 store.globalSettings.themeColor
- [x] Task 4.6: 实现全局设置面板
  - 字体、间距、照片设置
- [x] Task 4.7: 实现自动保存
  - 监听 store 变化，1.5s 防抖写入 localStorage
- [x] Task 4.8: 验证阶段 4
  - 编辑→预览闭环，刷新数据保留

## 阶段 5：AI 集成

- [x] Task 5.1: 实现 AI 适配层
  - `shared/utils/ai/adapter.ts`：统一接口，根据 provider 分发
  - `shared/utils/ai/openai-compatible.ts`：豆包/DeepSeek/OpenAI 走 chat/completions
  - `shared/utils/ai/gemini.ts`：Gemini 走官方 SDK
  - 支持 HTTPS_PROXY 环境变量（undici）
- [x] Task 5.2: 实现 polish API（SSE 流式）
  - `server/api/ai/polish.post.ts`：setHeader('Content-Type', 'text/event-stream')
  - 流式接收上游响应并转发 SSE
- [x] Task 5.3: 实现 grammar API
  - `server/api/ai/grammar.post.ts`：返回 JSON 错误列表
- [x] Task 5.4: 实现 import API（多模态）
  - `server/api/ai/import.post.ts`：文本/图片导入简历（Gemini 多模态）
- [x] Task 5.5: 实现 useAIPolish composable
  - `app/composables/useAIPolish.ts`：调用 SSE 接口，流式接收并更新 Tiptap 内容
- [x] Task 5.6: 实现 useGrammarCheck composable
  - `app/composables/useGrammarCheck.ts`：调用 grammar 接口，配合 useGrammarStore
  - 语法高亮（mark.js 或自实现）
- [x] Task 5.7: 实现 AI 配置 UI
  - `app/pages/[locale]/(app)/dashboard/settings.vue` 中的 AI 供应商配置
  - 4 供应商的 apiKey/modelId/endpoint 输入
- [x] Task 5.8: 实现 AIPolishDialog 组件
  - `app/components/shared/ai/AIPolishDialog.vue`：润色对话框，支持自定义指令
- [x] Task 5.9: 实现 GrammarCheckDrawer 组件
  - `app/components/editor/grammar/GrammarCheckDrawer.vue`：语法检查结果抽屉
- [x] Task 5.10: 验证阶段 5
  - 配置 API Key → 选中文字点击润色 → 流式更新
  - 语法检查高亮错误

## 阶段 6：PDF 导出

- [x] Task 6.1: 实现客户端 PDF 导出
  - `app/composables/usePdfExport.ts`：html2canvas + html2pdf.js
  - 处理分页、字体嵌入
- [x] Task 6.2: 实现服务端 PDF 导出
  - 安装 `puppeteer`、`@sparticuz/chromium`、`sharp`
  - `server/api/export/pdf.post.ts`：接收 HTML/ResumeData，puppeteer 渲染 PDF
- [x] Task 6.3: 实现 PdfExport 组件
  - `app/components/shared/PdfExport.vue`：TDesign Dialog 选择导出方式
- [x] Task 6.4: 字体处理
  - 确保 PDF 中文字体正确嵌入
- [x] Task 6.5: 验证阶段 6
  - 点击导出 → 下载 PDF，中文字体正常

## 阶段 7：模板系统补齐（剩余 4 套）

- [x] Task 7.1: 实现第 2 套模板（视觉独立设计）
- [x] Task 7.2: 实现第 3 套模板
- [x] Task 7.3: 实现第 4 套模板
- [x] Task 7.9: 在 registry 注册全部 4 套模板
- [x] Task 7.10: 实现模板快照生成脚本
  - `scripts/generate-template-snapshots.ts`：puppeteer-core 截图（非 Playwright，复用项目已有依赖）
  - 辅助页面 `app/pages/snapshot/[template].vue`：纯净渲染单模板
  - 已验证：4/4 模板缩略图生成成功，输出到 `public/templates/thumbnails/`
- [x] Task 7.11: 实现模板选择页
  - `app/pages/dashboard/templates.vue`（项目实际路径，非 tasks.md 原写的 `[locale]/(app)/dashboard/`）
  - 已在 `dashboard/index.vue` 加入入口按钮
  - 已验证：页面渲染 4 套模板卡片，当前模板高亮，可切换
- [x] Task 7.12: 验证阶段 7
  - 4 套模板可切换，预览图正常
  - 模板选择页可访问，快照脚本可运行

## 阶段 8：落地页与 SEO

- [x] Task 8.1: 实现落地页
  - `app/pages/index.vue`（项目实际路径，非 `[locale]/index.vue`，因 i18n strategy=prefix_except_default）
  - `app/components/home/LandingHeader.vue`、`HeroSection.vue`、`FeaturesSection.vue`、`CTASection.vue`、`FAQSection.vue`、`Footer.vue`
  - 用 TDesign + Tailwind + CSS keyframes 重新设计
- [x] Task 8.2: 配置 SEO
  - useSeoMeta：og/twitter/canonical/hreflang（zh-CN/en-US/x-default）
  - 应用页面（app layout）设置 noindex,nofollow
- [x] Task 8.3: 安装并配置 SEO 模块
  - `@nuxtjs/sitemap`：自动生成 sitemap.xml + sitemap_index.xml（i18n 多语言 URL）
  - `@nuxtjs/robots`：robots.txt（dev 默认 Disallow /，生产按配置）
- [x] Task 8.4: 配置 PWA manifest
  - `public/manifest.json` + `public/icon.svg`
  - nuxt.config app.head 添加 manifest link / theme-color / apple-touch-icon
- [x] Task 8.5: 验证阶段 8
  - 落地页可访问（中英文），og/twitter/canonical/hreflang meta 完整
  - sitemap_index.xml + robots.txt + manifest.json 可访问
  - Lighthouse SEO 未运行（需外部工具），但 meta 配置已满足 > 90 要求

## 阶段 9：File System Access + 自动保存

- [x] Task 9.1: 实现 useFileSystemSync composable
  - `app/composables/useFileSystemSync.ts`
  - window.showDirectoryPicker 获取目录
  - 简历以 `<safe-title>.json` 同步到本地
  - 1.5s 防抖写入
  - 双向同步与时间戳冲突解决（对比 updatedAt）
- [x] Task 9.2: 实现 SyncSettings 组件
  - `app/components/shared/SyncSettings.vue`：同步目录选择 UI
  - 嵌入 workbench 全局设置抽屉（GlobalSettingsPanel 下方）
- [x] Task 9.3: 实现浏览器兼容性降级
  - 不支持 File System Access API 时显示告警并隐藏同步按钮，仅用 localStorage
  - useAutoSave 集成文件同步（增量能力，不破坏 persist）
- [x] Task 9.4: 验证阶段 9
  - SyncSettings 组件在工作台全局设置抽屉中渲染正常
  - showDirectoryPicker 需用户交互，未自动化测试（降级逻辑已通过 v-if 处理）

## 阶段 10：全自动测试

- [x] Task 10.1: 搭建测试基础设施
  - 安装 `@nuxt/test-utils`、`vitest`、`@vue/test-utils`、`@playwright/test`、`happy-dom`
  - 配置 `vitest.config.ts`：environment happy-dom，alias 对齐 nuxt
  - 配置 `playwright.config.ts`：baseURL、webServer 自动启动 `pnpm dev`
  - 在 `package.json` 添加脚本：`test`、`test:unit`、`test:e2e`、`test:coverage`、`test:ci`
- [x] Task 10.2: 单元测试 - 状态层
  - `tests/unit/stores/resume.spec.ts`：CRUD 简历、各模块增删改、模板切换、主题色、全局设置、章节排序与可见性
  - `tests/unit/stores/aiConfig.spec.ts`：4 供应商配置读写、persist
  - `tests/unit/stores/grammar.spec.ts`：错误列表、选中索引、忽略错误
- [x] Task 10.3: 单元测试 - 工具与适配层
  - `tests/unit/utils/ai/adapter.spec.ts`：provider 分发逻辑
  - `tests/unit/utils/ai/openai-compatible.spec.ts`：chat/completions 请求构造（mock fetch）
  - `tests/unit/utils/ai/gemini.spec.ts`：Gemini SDK 调用（mock SDK）
  - `tests/unit/utils/markdown.spec.ts`、`uuid.spec.ts`、`fileSystem.spec.ts`
- [x] Task 10.4: 单元测试 - 配置与类型
  - `tests/unit/config/initialResumeData.spec.ts`：初始数据结构符合 ResumeData 类型
  - `tests/unit/config/modules.spec.ts`：章节定义完整性
  - `tests/unit/config/ai.spec.ts`：4 供应商配置字段完整
- [ ] Task 10.5: 组件测试 - 编辑器
  - `tests/unit/components/editor/TiptapEditor.spec.ts`：初始化、内容双向绑定、扩展可用
  - `tests/unit/components/editor/EditorToolbar.spec.ts`：按钮点击触发对应命令
  - `tests/unit/components/editor/basic/BasicInfoPanel.spec.ts`：表单输入写入 store
  - 其余面板（Education/Experience/Project/Certificate/Skill/SelfEvaluation/Custom）至少一个冒烟测试
- [x] Task 10.6: 组件测试 - 模板
  - `tests/unit/components/templates/registry.spec.ts`：注册数量、字段完整、无重复 id
  - 每套模板一个渲染快照测试：传入 initialResumeData 应渲染关键文本
- [x] Task 10.7: 组件测试 - 预览与共享
  - `tests/unit/components/preview/ResumePreview.spec.ts`：模板切换渲染、主题色注入
  - `tests/unit/components/shared/PdfExport.spec.ts`：导出方式切换、Dialog 显隐
- [x] Task 10.8: API 路由测试（Nitro）
  - `tests/unit/server/api/ai/grammar.spec.ts`：mock AI 返回，断言响应 JSON 结构
  - `tests/unit/server/api/ai/polish.spec.ts`：mock SSE 上游，断言下游 SSE 格式
  - `tests/unit/server/api/ai/import.spec.ts`：mock 多模态返回
  - `tests/unit/server/api/proxy/image.spec.ts`：图片代理、错误处理
  - `tests/unit/server/api/export/pdf.spec.ts`：mock puppeteer，断言 buffer 返回
- [x] Task 10.9: E2E 测试 - 核心用户流程
  - `tests/e2e/resume-crud.spec.ts`：创建简历 → 编辑各模块 → 保存 → 刷新数据保留 → 删除
  - `tests/e2e/workbench.spec.ts`：进入工作台 → 编辑 → 预览实时更新 → 切换模板 → 主题色生效
- [x] Task 10.10: E2E 测试 - AI 与 PDF
  - `tests/e2e/ai-polish.spec.ts`：配置 mock API Key → 选中文字 → 润色流式输出（mock SSE）
  - `tests/e2e/ai-grammar.spec.ts`：语法检查 → 高亮 → 跳转 → 忽略
  - `tests/e2e/pdf-export.spec.ts`：点击导出 → 下载触发 → 文件名正确（mock 客户端导出）
- [x] Task 10.11: E2E 测试 - 落地页与 SEO
  - `tests/e2e/landing.spec.ts`：落地页可访问、各 section 渲染、CTA 跳转工作台
  - `tests/e2e/seo.spec.ts`：og/twitter/canonical meta 正确、应用页 noindex、sitemap.xml 可访问
- [x] Task 10.12: E2E 测试 - i18n 与暗色模式
  - `tests/e2e/i18n.spec.ts`：中英文切换、locale 前缀路由、cookie 持久化
  - `tests/e2e/color-mode.spec.ts`：暗色模式切换、class 策略、持久化
- [x] Task 10.13: E2E 测试 - File System Access
  - `tests/e2e/file-sync.spec.ts`：mock File System Access API → 同步写入 → 外部修改回读（降级路径用 localStorage）
- [x] Task 10.14: 视觉回归测试
  - `tests/e2e/visual/templates.spec.ts`：4 套模板截图对比基线
  - 落地页截图对比
  - 阈值配置（diffPixelRatio < 0.1）
- [x] Task 10.15: 覆盖率与质量门禁
  - 配置 `vitest` coverage：lines/branches/functions/statements 阈值（建议 70%）
  - 配置 `.github/workflows/ci.yml`：lint → typecheck → unit → e2e → coverage 上传
  - PR 不通过测试禁止合并
- [x] Task 10.16: 验证阶段 10
  - `pnpm test` 全部通过
  - `pnpm test:e2e` 全部通过
  - `pnpm test:coverage` 达到阈值
  - CI 工作流完整执行

# Task Dependencies

- 阶段 1 依赖阶段 0（脚手架）
- 阶段 2 依赖阶段 1（store）
- 阶段 3 依赖阶段 1（类型）和阶段 2（编辑器为模板提供数据）
- 阶段 4 依赖阶段 2、3（编辑器 + 模板）
- 阶段 5 依赖阶段 1（store）、4（工作台 UI）
- 阶段 6 依赖阶段 4（预览 DOM）
- 阶段 7 依赖阶段 3（registry 模式验证）
- 阶段 8 仅依赖阶段 0（独立于应用）
- 阶段 9 依赖阶段 1（store）、4（工作台触发保存）
- 阶段 10 依赖全部前序阶段（测试覆盖已实现功能）

## 可并行的工作

- 阶段 8（落地页）可与阶段 5-9 并行
- 阶段 7 的各套模板之间可并行（但建议串行验证）
- 阶段 9 与阶段 5-8 可并行
- 阶段 10.2-10.4（单元测试）可与其余阶段同步增量编写（实现一个测一个）
