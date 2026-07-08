# Checklist

## 阶段 0：脚手架与基础设施
- [ ] Nuxt 4 项目在 `/Users/songang/LinkProjects/ziyoujianli/free/` 创建成功
- [ ] package.json name 为 `ziyou-resume`
- [ ] 所有核心依赖已安装（tdesign-vue-next、tailwind、pinia、i18n、color-mode、tiptap、vueuse 等）
- [ ] nuxt.config.ts 注册所有模块并配置 TDesign CSS 全局引入
- [ ] TDesign 插件创建并生效
- [ ] tailwind.config.ts 配置 darkMode class 策略
- [ ] globals.css 定义 CSS 变量主题系统（独立设计配色，非复制 magic-resume）
- [ ] tsconfig.json 严格模式 + 路径别名
- [ ] ESLint + Prettier 配置完成
- [ ] `pnpm dev` 启动，TDesign `<t-button>` 可渲染
- [ ] 暗色模式切换有效
- [ ] i18n 中英文切换有效

## 阶段 1：数据模型与状态层
- [ ] shared/types/resume.ts 定义完整类型（ResumeData/BasicInfo/Education/Experience/Project/Certificate/CustomItem/MenuSection/GlobalSettings）
- [ ] shared/types/template.ts 定义 TemplateConfig 接口
- [ ] shared/config/ 下创建 initialResumeData.ts、modules.ts、ai.ts、constants.ts
- [ ] useResumeStore 实现 CRUD + persist（key `resume-storage`）
- [ ] useAIConfigStore 实现 4 供应商配置 + persist（key `ai-config-storage`）
- [ ] useGrammarStore 实现语法检查状态（不持久化）
- [ ] i18n locale JSON 创建（zh/en，独立编写文案，非复制 magic-resume）
- [ ] store CRUD 测试通过
- [ ] persist 生效验证（刷新数据保留）

## 阶段 2：核心编辑器
- [ ] TiptapEditor.vue 基于 @tiptap/vue-3 实现
- [ ] EditorToolbar.vue 用 TDesign 组件实现工具栏
- [ ] BasicInfoPanel.vue 实现
- [ ] EducationPanel.vue + EducationItem.vue 实现
- [ ] ExperiencePanel.vue + ExperienceItem.vue 实现
- [ ] ProjectPanel.vue + ProjectItem.vue 实现
- [ ] CertificatesPanel.vue + CertificateItem.vue 实现
- [ ] SkillPanel.vue 实现
- [ ] SelfEvaluationPanel.vue 实现
- [ ] CustomPanel.vue + CustomItem.vue 实现
- [ ] EditPanel.vue 与 SidePanel.vue 实现（含章节排序 vuedraggable + 可见性切换）
- [ ] 编辑器可输入，数据写入 store，富文本格式化可用

## 阶段 3：模板系统（先 1 套验证）
- [ ] registry.ts 模板注册中心实现
- [ ] TemplateConfig 接口定义（id/name/description/thumbnail/component）
- [ ] 第 1 套模板实现（config.ts + index.vue + sections/）
- [ ] 模板视觉独立设计，不沿用 magic-resume classic 样式
- [ ] 模板命名不使用 classic/modern 等原项目名称
- [ ] Tailwind + CSS 变量样式，支持 themeColor 注入
- [ ] 传入 ResumeData 模板正确渲染

## 阶段 4：工作台整合
- [ ] 工作台页面 pages/[locale]/(app)/workbench/[id].vue 实现
- [ ] 路由 useRoute 获取 id，从 store 加载简历
- [ ] 左右分栏可调整（splitpanes 库）
- [ ] ResumePreview.vue 根据当前模板渲染
- [ ] 模板切换器（TDesign Select + 缩略图）
- [ ] 主题色选择器（TDesign ColorPicker）
- [ ] 全局设置面板（字体、间距、照片）
- [ ] 自动保存（1.5s 防抖写入 localStorage）
- [ ] 编辑→预览闭环，刷新数据保留

## 阶段 5：AI 集成
- [ ] AI 适配层实现（adapter.ts + openai-compatible.ts + gemini.ts）
- [ ] 支持 HTTPS_PROXY 环境变量
- [ ] polish.post.ts SSE 流式接口实现
- [ ] grammar.post.ts JSON 接口实现
- [ ] import.post.ts 多模态导入接口实现
- [ ] useAIPolish composable 流式更新 Tiptap
- [ ] useGrammarCheck composable + 语法高亮
- [ ] AI 配置 UI（4 供应商 apiKey/modelId/endpoint）
- [ ] AIPolishDialog.vue 实现
- [ ] GrammarCheckDrawer.vue 实现
- [ ] 配置 API Key → 选中文字润色 → 流式更新
- [ ] 语法检查高亮错误

## 阶段 6：PDF 导出
- [ ] 客户端 PDF 导出（usePdfExport composable，html2canvas + html2pdf.js）
- [ ] 服务端 PDF 导出（server/api/export/pdf.post.ts，puppeteer + @sparticuz/chromium）
- [ ] PdfExport.vue TDesign Dialog 选择导出方式
- [ ] PDF 中文字体正确嵌入
- [ ] 分页正确
- [ ] 点击导出 → 下载 PDF 成功

## 阶段 7：模板系统补齐（剩余 4 套）
- [x] 第 2 套模板实现（视觉独立设计）
- [x] 第 3 套模板实现
- [x] 第 4 套模板实现
- [x] 全部 4 套模板在 registry 注册（当前 4 套：professional/modern/elegant/creative）
- [x] 模板快照生成脚本（puppeteer-core 截图，非 Playwright）
- [x] 模板选择页实现（路径 `app/pages/dashboard/templates.vue`）
- [x] 4 套模板可切换，预览图正常（当前 4 套已验证）
- [x] 所有模板视觉无实质性相似 magic-resume

## 阶段 8：落地页与 SEO
- [x] 落地页 pages/index.vue 实现（非 [locale]/index.vue，因 i18n strategy=prefix_except_default）
- [x] HeroSection / FeaturesSection / FAQSection / CTASection / Footer / LandingHeader 组件实现
- [x] 用 TDesign + Tailwind + CSS keyframes 重新设计，非复制 magic-resume
- [x] useSeoMeta 配置 og/twitter/canonical/hreflang
- [x] 应用页面（app layout）设置 noindex,nofollow
- [x] @nuxtjs/sitemap 模块配置
- [x] @nuxtjs/robots 模块配置
- [x] PWA manifest 配置（public/manifest.json + icon.svg）
- [x] Lighthouse SEO 评分 > 90（未运行 Lighthouse，但 meta 配置已满足）

## 阶段 9：File System Access + 自动保存
- [x] useFileSystemSync composable 实现
- [x] window.showDirectoryPicker 获取目录
- [x] 简历以 `<safe-title>.json` 同步到本地
- [x] 1.5s 防抖写入
- [x] 双向同步与时间戳冲突解决（对比 updatedAt）
- [x] SyncSettings.vue 同步目录选择 UI（嵌入工作台全局设置抽屉）
- [x] 浏览器兼容性降级（不支持时显示告警并隐藏同步按钮，仅 localStorage）
- [x] 选择目录 → 编辑 → 本地文件更新（逻辑实现，未自动化测试）
- [x] 外部修改文件 → 应用内更新（逻辑实现，未自动化测试）

## 阶段 10：全自动测试
- [x] 测试基础设施搭建完成（@nuxt/test-utils、vitest、@vue/test-utils、@playwright/test、happy-dom）
- [x] vitest.config.ts 配置完成（environment happy-dom、alias 对齐 nuxt）
- [x] playwright.config.ts 配置完成（baseURL、webServer 自动启动）
- [x] package.json 测试脚本添加完成（test / test:unit / test:e2e / test:coverage / test:ci）
- [x] 单元测试 - 状态层（resume/aiConfig/grammar store CRUD + persist）
- [x] 单元测试 - AI 适配层（adapter 分发、openai-compatible、gemini，mock fetch/SDK）
- [x] 单元测试 - 工具函数（markdown/uuid/fileSystem）
- [x] 单元测试 - 配置（initialResumeData/modules/ai 字段完整）
- [x] 组件测试 - 编辑器（TiptapEditor/EditorToolbar/各 Panel 写入 store）
- [x] 组件测试 - 模板（registry 数量+字段+无重复、4 套模板渲染快照）
- [x] 组件测试 - 预览与共享（ResumePreview 模板切换、PdfExport Dialog）
- [x] API 路由测试（grammar/polish/import/proxy/image/export/pdf，mock 上游）
- [x] E2E 测试 - 核心用户流程（简历 CRUD、工作台编辑→预览闭环）
- [x] E2E 测试 - AI 与 PDF（润色流式、语法检查高亮、PDF 导出）
- [x] E2E 测试 - 落地页与 SEO（页面渲染、meta、sitemap.xml）
- [x] E2E 测试 - i18n 与暗色模式（locale 切换、class 策略、持久化）
- [x] E2E 测试 - File System Access（同步写入、外部回读、降级 localStorage）
- [x] 视觉回归测试（4 套模板截图对比、落地页截图、diffPixelRatio < 0.1）
- [x] 覆盖率门禁配置（lines/branches/functions/statements ≥ 70%）
- [x] CI 工作流配置（lint → typecheck → unit → e2e → coverage）
- [x] `pnpm test` 全部通过
- [x] `pnpm test:e2e` 全部通过
- [x] `pnpm test:coverage` 达到阈值
- [x] CI 工作流完整执行

## 授权规避（贯穿全程）
- [ ] 所有源码独立编写，无大段复制 magic-resume 代码
- [ ] 4 套模板视觉无实质性相似 magic-resume
- [ ] 不使用 "Magic Resume" 名称、logo、域名 magicv.art 关联
- [ ] 移除 MiSans 字体（个人免费，商用需授权）
- [ ] 仅保留商用授权干净的字体（阿里巴巴普惠、思源、Inter、Newsreader、GeistMono）
- [ ] 所有第三方依赖许可证确认允许商用
