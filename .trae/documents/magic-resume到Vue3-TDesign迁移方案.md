# Magic Resume → Vue3 + TDesign + Nuxt 4 迁移方案

> 本方案将 magic-resume（React + TanStack Start + shadcn/ui）迁移为全新项目（Vue 3.5 + Nuxt 4 + tdesign-vue-next），并规避原项目的商业授权限制。采用"从零搭建 + 借鉴架构"策略，代码独立编写，不复制原项目源文件。

---

## 一、迁移目标与原则

### 1.1 目标
- **产品形态对齐**：保留 magic-resume 的核心功能（编辑器、模板、AI、PDF、i18n、本地优先存储）
- **技术栈切换**：React 生态 → Vue 生态
- **设计风格切换**：shadcn/new-york → TDesign 企业级风格
- **元框架切换**：TanStack Start → Nuxt 4（获得混合渲染、Nitro、模块生态）
- **授权干净**：新项目代码独立编写，模板视觉重新设计

### 1.2 原则
1. **不复制源码**：仅参考架构思路与数据结构，代码独立编写
2. **框架无关资产优先复用**：i18n JSON、数据类型定义、AI 调用逻辑、PDF 导出逻辑可借鉴重写
3. **渐进式迁移**：分 10 个阶段，每阶段可独立验证，避免大爆炸式重写
4. **先核心后外围**：先跑通"编辑器 + 1 套模板 + 预览"，再补齐 AI/PDF/落地页
5. **模板重新设计**：9 套模板视觉与实现独立设计，规避授权

### 1.3 不迁移的内容
- 原项目 next-themes / next-intl 兼容层技术债（改用 Nuxt 模块）
- HeroUI（与 TDesign 重复，移除）
- @sparticuz/chromium（评估后决定是否保留，Vercel 部署时考虑改用 Browserless）
- magicui / dev 组件（非核心）

---

## 二、目标技术栈确认

| 层 | 选型 | 版本 |
|---|---|---|
| 语言 | TypeScript | ^5.6 |
| 框架 | Vue | ^3.5 |
| 元框架 | Nuxt | ^4 |
| UI 库 | tdesign-vue-next | ^1.17 |
| 样式 | Tailwind CSS | ^3.4（与 TDesign 共存） |
| 状态管理 | Pinia + pinia-plugin-persistedstate | latest |
| 富文本 | @tiptap/vue-3 + 扩展 | ^3 |
| 动画 | @vueuse/motion | latest |
| 图标 | tdesign-icons-vue-next + lucide-vue-next | latest |
| i18n | @nuxtjs/i18n | ^9 |
| 暗色模式 | @nuxtjs/color-mode | latest |
| 日期 | dayjs | latest |
| PDF（客户端） | html2pdf.js + html2canvas | 保留 |
| PDF（服务端） | puppeteer + @sparticuz/chromium | 保留（或 Browserless） |
| AI SDK | @google/generative-ai + undici | 保留 |
| 包管理 | pnpm | ^10 |
| 部署 | Vercel / Cloudflare Workers / Docker | 三选一 |

---

## 三、目录结构设计

```
resume-vue/
├── app/                              # Nuxt 4 默认 app 目录
│   ├── pages/
│   │   ├── index.vue                 # → 重定向到 /$locale
│   │   ├── [locale]/
│   │   │   ├── index.vue             # 落地页
│   │   │   └── (app)/                # 应用路由组（需登录/本地）
│   │   │       ├── dashboard/
│   │   │       │   ├── index.vue
│   │   │       │   ├── resumes.vue
│   │   │       │   ├── ai.vue
│   │   │       │   ├── settings.vue
│   │   │       │   └── templates.vue
│   │   │       └── workbench/
│   │   │           └── [id].vue      # 编辑工作台
│   ├── layouts/
│   │   ├── default.vue               # 落地页布局
│   │   └── app.vue                   # 应用布局（含侧边栏）
│   ├── components/
│   │   ├── ui/                       # TDesign 二次封装的通用组件
│   │   ├── editor/                   # 编辑器各模块面板
│   │   ├── templates/                # 简历模板（registry + 各模板）
│   │   ├── preview/                  # 预览组件
│   │   ├── shared/                   # PdfExport/PhotoSelector/ThemeModal
│   │   ├── mobile/                   # 移动端工作台
│   │   └── home/                     # 首页 Hero/Features/FAQ/CTA
│   ├── composables/                  # Vue composables（替代 hooks）
│   ├── stores/                      # Pinia stores
│   │   ├── resume.ts
│   │   ├── aiConfig.ts
│   │   └── grammar.ts
│   ├── assets/
│   │   └── styles/
│   │       ├── globals.css           # Tailwind + CSS 变量
│   │       └── tiptap.scss
│   ├── app.vue                       # 根组件
│   └── error.vue
├── server/                           # Nitro 服务端
│   ├── api/
│   │   ├── ai/
│   │   │   ├── polish.post.ts        # SSE 流式润色
│   │   │   ├── grammar.post.ts       # 语法检查
│   │   │   └── import.post.ts        # 简历导入（多模态）
│   │   ├── export/
│   │   │   └── pdf.post.ts           # 服务端 PDF 生成
│   │   └── proxy/
│   │       └── image.get.ts          # 图片代理
│   └── utils/
│       └── gemini.ts                 # Gemini 服务端封装
├── shared/                           # Nuxt 4 新增 shared 目录（前后端共享）
│   ├── types/
│   │   ├── resume.ts                 # 简历数据类型
│   │   └── template.ts               # 模板类型
│   └── config/
│       ├── ai.ts                     # AI 供应商配置
│       ├── constants.ts
│       ├── initialResumeData.ts
│       └── modules.ts
├── i18n/
│   └── locales/
│       ├── zh.json                   # 从 magic-resume 复用（结构参考）
│       └── en.json
├── public/
│   ├── fonts/                        # 重新评估字体授权
│   └── template-snapshots/           # 新模板预览图
├── scripts/
│   └── generate-template-snapshots.ts # Playwright 截图脚本
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 四、迁移阶段划分

### 阶段总览

| 阶段 | 名称 | 依赖 | 验证产出 |
|---|---|---|---|
| 0 | 脚手架与基础设施 | — | 空项目可启动 |
| 1 | 数据模型与状态层 | 0 | store 可独立测试 |
| 2 | 核心编辑器 | 1 | 富文本编辑可用 |
| 3 | 模板系统（先 1 套） | 2 | 1 套模板可渲染预览 |
| 4 | 工作台整合 | 2,3 | 编辑→预览闭环 |
| 5 | AI 集成 | 1,4 | 润色/语法/导入可用 |
| 6 | PDF 导出 | 4 | 客户端+服务端导出 |
| 7 | 模板系统补齐（剩余 8 套） | 3 | 9 套模板齐全 |
| 8 | 落地页与 SEO | 0 | 公开页可访问 |
| 9 | File System Access + 自动保存 | 1,4 | 本地文件双向同步 |
| 10 | 移动端适配 + 部署 | 全部 | 可上线 |

---

### 阶段 0：脚手架与基础设施

**目标**：搭建可运行的 Nuxt 4 + TDesign 空项目。

**任务清单**：
1. `pnpm create nuxt resume-vue` 初始化 Nuxt 4 项目
2. 安装核心依赖：
   ```bash
   pnpm add tdesign-vue-next tdesign-icons-vue-next
   pnpm add @nuxtjs/tailwindcss tailwindcss
   pnpm add @pinia/nuxt pinia pinia-plugin-persistedstate
   pnpm add @nuxtjs/i18n @nuxtjs/color-mode
   pnpm add @tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-*
   pnpm add @vueuse/motion @vueuse/nuxt
   pnpm add dayjs lodash uuid
   pnpm add -D sass @types/lodash
   ```
3. 配置 `nuxt.config.ts`：模块注册、TDesign 按需引入、CSS 全局引入
4. 创建 `plugins/tdesign.client.ts`：全局注册或按需
5. 配置 `tailwind.config.ts`：TDesign Design Token 与 Tailwind 主题变量共存
6. 配置 `app/assets/styles/globals.css`：CSS 变量主题系统（参考 magic-resume 的 HSL 变量但重新设计配色）
7. 配置 `@nuxtjs/color-mode`：暗色模式切换
8. 配置 `@nuxtjs/i18n`：zh/en 双语，prefix 策略
9. 配置 `tsconfig.json` 严格模式 + 路径别名
10. 配置 ESLint + Prettier
11. 验证：`pnpm dev` 启动，TDesign `<t-button>` 可渲染

**验收**：项目可启动，TDesign 组件可见，暗色模式可切换，i18n 切换有效。

---

### 阶段 1：数据模型与状态层

**目标**：建立简历数据类型与 Pinia store。这部分框架无关，迁移成本最低，先做。

**任务清单**：
1. **类型定义**（参考 magic-resume `src/types/resume.ts` 结构，独立编写）：
   - `shared/types/resume.ts`：ResumeData / BasicInfo / Education / Experience / Project / Certificate / CustomItem / MenuSection / GlobalSettings
   - `shared/types/template.ts`：ResumeTemplate 接口
2. **初始数据**：`shared/config/initialResumeData.ts`（参考结构，独立实现）
3. **模块配置**：`shared/config/modules.ts`（章节定义）
4. **AI 配置**：`shared/config/ai.ts`（4 个供应商：豆包/DeepSeek/OpenAI/Gemini）
5. **常量**：`shared/config/constants.ts`
6. **Pinia stores**：
   - `stores/resume.ts`：对应 `useResumeStore`，CRUD 简历 + 各模块，`persist` 插件持久化到 localStorage（key `resume-storage`）
   - `stores/aiConfig.ts`：对应 `useAIConfigStore`，4 供应商配置（key `ai-config-storage`）
   - `stores/grammar.ts`：对应 `useGrammarStore`，语法检查状态（不持久化）
7. **i18n locale JSON**：参考 magic-resume 的 `zh.json`/`en.json` 结构，重新组织翻译文案（避免直接复制）

**验收**：单元测试 store 的 CRUD，persist 生效。

---

### 阶段 2：核心编辑器

**目标**：基于 `@tiptap/vue-3` 搭建富文本编辑器与各模块编辑面板。

**任务清单**：
1. `components/editor/TiptapEditor.vue`：编辑器容器，使用 `useEditor` + `EditorContent`
2. 安装 Tiptap 扩展：starter-kit / color / highlight / link / list / text-align / underline / placeholder
3. `components/editor/EditorToolbar.vue`：工具栏（用 TDesign Button/Tooltip/Divider 重新设计）
4. 各模块编辑面板（参考 magic-resume `components/editor/` 结构，独立编写）：
   - `BasicInfoPanel.vue` / `EducationPanel.vue` / `ExperiencePanel.vue` / `ProjectPanel.vue` / `CertificatePanel.vue` / `SkillPanel.vue` / `SelfEvaluationPanel.vue` / `CustomSectionPanel.vue`
5. 使用 TDesign Form / Input / DatePicker / Dialog / Cascader 等组件
6. 章节排序：TDesign Sortable 或 `vuedraggable`
7. 章节可见性切换：TDesign Switch

**验收**：可编辑简历各模块，数据写入 Pinia store。

---

### 阶段 3：模板系统（先迁移 1 套验证）

**目标**：建立模板 registry 机制，并实现 1 套模板（推荐 classic 风格，但视觉重新设计）。

**任务清单**：
1. `components/templates/registry.ts`：模板注册中心（参考 magic-resume 的 registry 模式，独立实现）
2. 定义 `TemplateConfig` 接口：id / name / description / thumbnail / component
3. 实现 1 套模板 `components/templates/classic/`：
   - `config.ts`：模板配置（字体、间距、颜色策略）
   - `index.vue`：模板主组件（接收 ResumeData props，渲染完整简历）
   - `sections/`：BaseInfo / Education / Experience / Project / Skill / SelfEvaluation / CustomSection / SectionTitle
4. **视觉重新设计**：不复制 magic-resume 的 classic 模板样式，独立设计排版
5. 样式：Tailwind + CSS 变量，支持 `themeColor` 注入

**验收**：传入 ResumeData，模板正确渲染。

---

### 阶段 4：工作台整合

**目标**：编辑器 + 模板 + 预览闭环。

**任务清单**：
1. `pages/[locale]/(app)/workbench/[id].vue`：工作台页面
2. 布局：左侧编辑面板（可折叠）+ 右侧实时预览（`react-resizable-panels` → 用 TDesign SplitPanel 或 `splitpanes` 库）
3. `components/preview/ResumePreview.vue`：预览容器，根据当前模板渲染
4. 模板切换器：TDesign Select + 缩略图
5. 主题色选择器：TDesign ColorPicker
6. 全局设置面板：字体、间距、照片
7. 自动保存：监听 store 变化，1.5s 防抖写入 localStorage
8. 路由：`useRoute` 获取简历 id，从 store 加载

**验收**：进入工作台 → 编辑 → 实时预览更新 → 刷新数据保留。

---

### 阶段 5：AI 集成

**目标**：润色（SSE）、语法检查、简历导入。

**任务清单**：
1. **AI 适配层**（`shared/utils/ai/`，框架无关，参考 magic-resume 重写）：
   - `adapter.ts`：统一接口，根据 provider 分发
   - `openai-compatible.ts`：豆包/DeepSeek/OpenAI 走 `chat/completions`
   - `gemini.ts`：Gemini 走官方 SDK
   - 支持 `HTTPS_PROXY` 环境变量（undici）
2. **Nitro API 路由**：
   - `server/api/ai/polish.post.ts`：SSE 流式润色（`setHeader('Content-Type', 'text/event-stream')`）
   - `server/api/ai/grammar.post.ts`：语法检查，返回 JSON
   - `server/api/ai/import.post.ts`：文本/图片导入（Gemini 多模态）
3. **前端 composable**：
   - `composables/useAIPolish.ts`：调用 SSE 接口，流式接收并更新 Tiptap 内容
   - `composables/useGrammarCheck.ts`：调用 grammar 接口，配合 `stores/grammar.ts`
4. **语法高亮**：用 `mark.js`（框架无关）或自实现 highlight overlay
5. AI 配置 UI：`pages/[locale]/(app)/dashboard/settings.vue` 中的 AI 供应商配置

**验收**：配置 API Key → 选中文字点击润色 → 流式更新；语法检查高亮错误。

---

### 阶段 6：PDF 导出

**目标**：客户端 + 服务端双方案。

**任务清单**：
1. **客户端导出**（`composables/usePdfExport.ts`）：
   - `html2canvas` 截取预览 DOM
   - `html2pdf.js` 生成 PDF
   - 处理分页、字体嵌入
2. **服务端导出**（`server/api/export/pdf.post.ts`）：
   - 接收 HTML 或 ResumeData
   - `puppeteer` + `@sparticuz/chromium` 渲染为 PDF
   - 返回 PDF buffer
   - ⚠️ 部署到 Vercel 时考虑改用 Browserless 云服务（puppeteer 体积大）
3. **UI**：`components/shared/PdfExport.vue`，TDesign Dialog 选择导出方式
4. **字体处理**：确保 PDF 中文字体正确嵌入（参考 magic-resume 的字体加载逻辑）

**验收**：点击导出 → 下载 PDF，中文字体正常。

---

### 阶段 7：模板系统补齐（剩余 8 套）

**目标**：补齐 8 套模板，全部独立设计。

**任务清单**：
1. 依次实现：modern / left-right / timeline / minimalist / elegant / creative / editorial / swiss
2. 每套模板结构一致：`config.ts` + `index.vue` + `sections/`
3. **全部重新设计视觉**，避免与 magic-resume 实质性相似
4. 在 registry 注册
5. `scripts/generate-template-snapshots.ts`：Playwright 生成模板预览图
6. `pages/[locale]/(app)/dashboard/templates.vue`：模板选择页

**验收**：9 套模板可切换，预览图正常。

---

### 阶段 8：落地页与 SEO

**目标**：公开落地页 + 完整 SEO。

**任务清单**：
1. `pages/[locale]/index.vue`：落地页
2. `components/home/`：Hero / Features / FAQ / CTA / Footer（用 TDesign + Tailwind 重新设计）
3. `useSeoMeta`：og / twitter / canonical / hreflang
4. `@nuxtjs/sitemap` 模块：自动生成 sitemap.xml
5. `@nuxtjs/robots` 模块：robots.txt
6. `app/manifest.ts`（或 `nuxt-webmanifest` 模块）：PWA manifest
7. 应用页面设置 `noindex,nofollow`
8. i18n hreflang 配置

**验收**：落地页可访问，Lighthouse SEO 评分 > 90。

---

### 阶段 9：File System Access API + 自动保存

**目标**：本地文件双向同步。

**任务清单**：
1. `composables/useFileSystemSync.ts`（参考 magic-resume 逻辑，独立实现）：
   - `getFileHandle("syncDirectory")` 获取目录
   - 简历以 `<title>.json` 同步到本地
   - 1.5s 防抖写入
   - 双向同步与时间戳冲突解决（`shouldImportResumeFromFile` / `normalizeImportedResume` 逻辑）
2. `components/shared/SyncSettings.vue`：同步目录选择 UI
3. 兼容性降级：不支持 File System Access API 的浏览器仅用 localStorage

**验收**：选择本地目录 → 编辑 → 本地文件更新；外部修改文件 → 应用内更新。

---

### 阶段 10：移动端适配 + 部署

**目标**：移动端可用 + 可上线。

**任务清单**：
1. **移动端**：
   - `components/mobile/MobileWorkbench.vue`：移动端工作台
   - 响应式断点适配（Tailwind md/lg）
   - 触摸交互优化
2. **部署配置**（三选一）：
   - **Vercel**：`vercel.json` 或零配置
   - **Cloudflare Workers**：`wrangler.toml` + `nodejs_compat`
   - **Docker**：多阶段构建 `Dockerfile` + `docker-compose.yml`
3. **CI/CD**：GitHub Actions（lint + build + deploy）
4. **环境变量**：`.env` 配置（HTTPS_PROXY 等）
5. **性能优化**：Lighthouse 审计，首屏优化
6. **错误监控**：Sentry 接入（可选）

**验收**：部署到目标平台，移动端可访问，核心功能正常。

---

## 五、代码映射关系（React → Vue）

### 5.1 状态管理

| magic-resume (Zustand) | 新项目 (Pinia) |
|---|---|
| `create<State>(persist)` | `defineStore('resume', () => {...}, { persist: true })` |
| `useResumeStore((s) => s.resumes)` | `storeToRefs(store).resumes` |
| `set({ resumes: ... })` | `store.resumes = ...`（直接赋值） |
| `getState()` | `store.$state` |
| `subscribe(listener)` | `store.$subscribe(...)` |

### 5.2 组件

| React 模式 | Vue 模式 |
|---|---|
| `useState` | `ref` / `reactive` |
| `useEffect(fn, [deps])` | `watch(deps, fn)` / `onMounted` |
| `useMemo` | `computed` |
| `useCallback` | 普通函数（Vue 不需要） |
| `forwardRef` | `defineExpose` |
| `children` props | `<slot>` |
| `Context.Provider` | `provide` / `inject` |
| `{condition && <Comp/>}` | `v-if` |
| `{list.map(item => <Comp/>)}` | `v-for` |
| `className="..."` | `class="..."` |
| `style={{color: 'red'}}` | `:style="{color: 'red'}"` |

### 5.3 UI 组件映射

| magic-resume (shadcn/Radix) | 新项目 (TDesign) |
|---|---|
| `<Button variant="default">` | `<t-button theme="primary">` |
| `<Input />` | `<t-input />` |
| `<Dialog>` | `<t-dialog>` |
| `<DropdownMenu>` | `<t-dropdown>` |
| `<Select>` | `<t-select>` |
| `<Tabs>` | `<t-tabs>` |
| `<Accordion>` | `<t-collapse>` |
| `<Popover>` | `<t-popup>` |
| `<Tooltip>` | `<t-tooltip>` |
| `<Toast> (sonner)` | `MessagePlugin` / `<t-notification>` |
| `<Drawer> (vaul)` | `<t-drawer>` |
| `<Command> (cmdk)` | 自实现或 `vue-command-palette` |
| `<ColorPicker> (react-colorful)` | `<t-color-picker>` |
| `<ResizablePanel>` | `splitpanes` 库 |

### 5.4 路由映射

| magic-resume (TanStack Router) | 新项目 (Nuxt) |
|---|---|
| `src/routes/__root.tsx` | `app/app.vue` + `layouts/` |
| `src/routes/$locale.tsx` | `pages/[locale]/index.vue` |
| `src/routes/app/dashboard/resumes.tsx` | `pages/[locale]/(app)/dashboard/resumes.vue` |
| `createFileRoute` | 文件即路由（约定式） |
| `Link to="/app"` | `<NuxtLink to="/app">` |
| `useParams()` | `useRoute().params` |
| `useNavigate()` | `useRouter().push` |
| `ssr: false` 标记 | `defineRouteRules({ renderMode: 'spa' })` |

### 5.5 API 路由映射

| magic-resume | 新项目 (Nitro) |
|---|---|
| `src/routes/api/grammar.ts` | `server/api/ai/grammar.post.ts` |
| `src/routes/api/polish.ts` | `server/api/ai/polish.post.ts` |
| `src/routes/api/resume-import.ts` | `server/api/ai/import.post.ts` |
| `src/routes/api/proxy/image.ts` | `server/api/proxy/image.get.ts` |
| `createServerFileRoute` + `server.handlers` | `defineEventHandler` |

---

## 六、授权规避策略

### 6.1 代码层面
- **所有源码独立编写**，不复制 magic-resume 任何 `.ts/.tsx` 文件
- 工具函数（`utils/`）逻辑可参考，但代码独立实现
- 类型定义可参考结构，但字段命名与注释独立

### 6.2 模板层面
- 9 套模板的**视觉设计全部重新设计**
- 不使用 magic-resume 的模板名称（classic/modern 等改为自定义命名）
- 排版、配色、字体策略独立

### 6.3 第三方依赖
| 依赖 | 许可证 | 商用 |
|---|---|---|
| tdesign-vue-next | MIT | ✅ |
| Vue / Nuxt | MIT | ✅ |
| Tiptap | MIT | ✅ |
| Tailwind CSS | MIT | ✅ |
| Pinia | MIT | ✅ |
| puppeteer | Apache 2.0 | ✅ |
| @sparticuz/chromium | MIT | ✅ |
| @google/generative-ai | Apache 2.0 | ✅ |
| html2pdf.js | MIT | ✅ |

### 6.4 字体授权（重点确认）
| 字体 | 授权 | 商用 |
|---|---|---|
| 阿里巴巴普惠体 | 免费商用 | ✅ |
| 思源黑体/宋体 (Noto) | SIL OFL | ✅ |
| MiSans | 个人免费，商用需授权 | ⚠️ 移除或替换 |
| Inter | SIL OFL | ✅ |
| Newsreader | SIL OFL | ✅ |
| GeistMono | SIL OFL | ✅ |

**策略**：新项目仅保留阿里巴巴普惠体 + 思源系列 + Inter/Newsreader，移除 MiSans。

### 6.5 品牌与命名
- 不使用 "Magic Resume" 名称
- 不使用 magicv.art 域名关联
- 不使用原项目 logo / 二维码 / 截图

---

## 七、风险与应对

| 风险 | 等级 | 应对 |
|---|---|---|
| Tiptap Vue 版与 React 版 API 差异 | 中 | 官方支持 Vue 3，API 基本一致，注意事件命名 |
| Framer Motion 动画降级 | 中 | @vueuse/motion 覆盖基础，复杂动画用 CSS/GSAP |
| TDesign 定制深度不如 shadcn | 中 | 复杂定制用 CSS 变量覆盖，必要时 fork 组件 |
| File System Access API 浏览器兼容 | 低 | 降级到纯 localStorage |
| puppeteer 部署体积 | 中 | Vercel 改用 Browserless；Docker 保留 |
| cmdk 在 Vue 无对等 | 低 | 自实现命令面板或用 vue-command-palette |
| 9 套模板重新设计工作量 | 高 | 分阶段，先 1 套验证再补齐 |
| i18n 翻译工作量 | 低 | 参考 magic-resume 结构，独立编写文案 |

---

## 八、验证与测试

### 8.1 阶段验证（每阶段必须通过）
- 阶段 0：`pnpm dev` 启动，TDesign 组件渲染
- 阶段 1：store 单元测试通过
- 阶段 2：编辑器可输入，数据写入 store
- 阶段 3：1 套模板渲染 ResumeData
- 阶段 4：编辑→预览闭环
- 阶段 5：AI 润色流式输出
- 阶段 6：PDF 下载成功
- 阶段 7：9 套模板切换
- 阶段 8：Lighthouse SEO > 90
- 阶段 9：本地文件同步
- 阶段 10：移动端 + 部署

### 8.2 整体测试
- **功能测试**：Playwright E2E 覆盖核心流程
- **视觉回归**：模板截图对比
- **性能**：Lighthouse 审计（性能/可访问性/SEO）
- **兼容性**：Chrome / Firefox / Safari / Edge
- **移动端**：iOS Safari / Android Chrome

### 8.3 Lint 与类型检查
每阶段完成后运行：
```bash
pnpm lint
pnpm typecheck
```

---

## 九、待确认事项

在开始执行前，以下决策影响具体实现，建议确认：

1. **部署目标**：Vercel / Cloudflare Workers / Docker 三选一？（影响 puppeteer 方案）
2. **新项目命名**：项目目录名与品牌名？
3. **是否保留服务端 PDF**：还是仅用客户端 html2pdf？（简化部署）
4. **是否需要用户认证**：纯本地优先 还是 SaaS？（影响是否引入 Prisma + NextAuth 等价的 Vue 侧方案）
5. **AI 供应商优先级**：默认启用哪个？（magic-resume 默认豆包）
6. **模板命名**：9 套模板的新命名方案？

---

## 十、执行建议

1. 本方案分 10 阶段，建议**严格按顺序执行**，每阶段验收通过再进入下一阶段
2. 阶段 0-4 是 MVP（最小可用产品），跑通后即可体验核心功能
3. 阶段 5-9 是功能补齐
4. 阶段 10 是上线准备
5. 每阶段使用 TodoWrite 跟踪任务进度
6. 遇到阻塞及时回退到方案确认，避免偏离

**待用户确认第九节事项后，即可开始执行阶段 0。**
