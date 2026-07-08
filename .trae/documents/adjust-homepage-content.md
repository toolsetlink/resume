# 调整首页内容 - 实施计划

## Summary

对自由简历项目首页（landing page）进行三处内容调整：
1. 移除"开源"相关文案，将产品定位调整为"免费、隐私优先"（不再提"开源"），同时调整 FAQ 内容；并暂不展示"多台设备如何同步简历"的 FAQ 条目。
2. 在首页"为求职者打造的核心功能"模块上方新增一个模板预览区块，展示当前简历模板（默认 professional）的真实样式渲染，并支持在 4 套模板间切换预览。
3. 关闭顶部 Header 中的"开始使用"按钮，仅保留 Hero 区的"立即创建"按钮作为主入口。

## Current State Analysis

### 首页组成（`app/pages/index.vue`）
- `<LandingHeader />` — 顶部 sticky header（含"开始使用"按钮）
- `<HeroSection />` — Hero 区（"立即创建" + "查看模板" 按钮，右侧静态骨架预览）
- `<FeaturesSection />` — "为求职者打造的核心功能"卡片网格
- `<CTASection />` — 渐变 CTA banner
- `<FAQSection />` — 5 条 FAQ 折叠面板
- `<Footer />` — 页脚（含 GitHub 链接）

### "开源"文案分布（i18n 文件）
- `i18n/locales/zh.json:129` — `landing.hero.subtitle`：「...是一款**开源**、隐私优先的在线简历编辑器...」
- `i18n/locales/zh.json:174` — `landing.cta.subtitle`：「免费、**开源**、无需注册...」
- `i18n/locales/zh.json:182` — `landing.faq.items.free.a`：「...完全免费且**开源**...源代码托管在 GitHub...」
- `i18n/locales/en.json:129 / 174 / 182` — 对应英文版本

### "多台设备同步" FAQ 条目
- `i18n/locales/zh.json:196-199` — `landing.faq.items.templates`（q: "可以在多台设备间同步简历吗？"）
- 渲染入口：`app/components/home/FAQSection.vue:52` `const faqKeys = ['free', 'privacy', 'ai', 'export', 'templates']`

### 顶部"开始使用"按钮
- `app/components/home/LandingHeader.vue:55-57`（桌面端，`hidden sm:inline-flex`）
- `app/components/home/LandingHeader.vue:79-81`（移动端抽屉内）
- i18n key: `landing.nav.start`（zh.json:124 / en.json:124）

### "立即创建"按钮
- `app/components/home/HeroSection.vue:37-40`（i18n key: `landing.hero.cta.create`，跳转 `/dashboard`）

### 模板预览基础设施（可复用）
- `app/components/preview/ResumePreview.vue` — 接收 `resumeData: ResumeData` prop，根据 `templateId` 从 registry 取组件渲染
- `app/components/templates/registry.ts` — `TEMPLATE_REGISTRY`（4 套：professional / modern / elegant / creative），`getTemplateConfig(id)`、`getTemplateComponent(layout)`
- `app/components/templates/professional/config.ts` 等 — 各模板配置（colorScheme/spacing/availableSections）
- `shared/config/initialResumeData.ts` — `initialResumeState`（中文示例数据）/ `initialResumeStateEn`（英文示例数据），可作为预览的示例数据来源

## Proposed Changes

### 任务 1：移除"开源"文案 & 调整 FAQ

#### 1.1 修改 `i18n/locales/zh.json`

- **`landing.hero.subtitle`（line 129）**：移除"开源、"
  - 旧：「自由简历是一款开源、隐私优先的在线简历编辑器。多模板选择、AI 智能润色、语法检查、PDF 导出，一站式助力你的求职之路。」
  - 新：「自由简历是一款免费、隐私优先的在线简历编辑器。多模板选择、AI 智能润色、语法检查、PDF 导出，一站式助力你的求职之路。」

- **`landing.cta.subtitle`（line 174）**：移除"开源、"
  - 旧：「免费、开源、无需注册。几分钟内打造你的专业简历。」
  - 新：「免费、无需注册。几分钟内打造你的专业简历。」

- **`landing.faq.items.free.a`（line 182）**：移除开源相关描述
  - 旧：「是的，自由简历完全免费且开源，没有任何付费功能或订阅。源代码托管在 GitHub，欢迎参与贡献。」
  - 新：「是的，自由简历完全免费，没有任何付费功能或订阅，所有功能均可直接使用。」

#### 1.2 修改 `i18n/locales/en.json`（对应英文）

- **`landing.hero.subtitle`（line 129）**：
  - 新："ZiYou Resume is a free, privacy-first online resume editor. Multiple templates, AI polishing, grammar check, and PDF export — everything you need for your job hunt."

- **`landing.cta.subtitle`（line 174）**：
  - 新："Free, no registration. Build your professional resume in minutes."

- **`landing.faq.items.free.a`（line 182）**：
  - 新："Yes. ZiYou Resume is completely free, with no paid features or subscriptions. All features are available directly."

#### 1.3 删除"多台设备同步" FAQ 条目

**`app/components/home/FAQSection.vue:52`**：从 `faqKeys` 数组中移除 `'templates'`
```ts
// 旧
const faqKeys = ['free', 'privacy', 'ai', 'export', 'templates']
// 新
const faqKeys = ['free', 'privacy', 'ai', 'export']
```

**`i18n/locales/zh.json`（line 196-199）** 与 **`i18n/locales/en.json`（line 196-199）**：删除 `landing.faq.items.templates` 整个对象（彻底删除，不留隐藏文本）。

### 任务 2：首页新增模板预览区块（Features 上方）

#### 2.1 新建组件 `app/components/home/TemplatePreviewSection.vue`

放在 `<HeroSection />` 和 `<FeaturesSection />` 之间（修改 `app/pages/index.vue:5-6`）。

**组件职责：**
- 展示一个标题 + 4 个模板切换 tab + 当前选中模板的真实样式预览（使用真实模板组件渲染示例数据）
- 默认选中 `professional` 模板
- 点击 tab 切换预览的模板（不跳转路由，仅在首页内切换预览）
- 提供一个"使用此模板"按钮（沿用 HeroSection 的 `goCreate` 行为，跳转 `/dashboard`）

**实现要点：**
- 使用 `TEMPLATE_REGISTRY` 遍历生成 tab 列表（展示每套模板的 `name`）
- 使用 `ResumePreview` 组件渲染预览（传入构造好的 `ResumeData` 对象，其 `templateId` 为当前选中模板 id）
- 示例数据：从 `shared/config/initialResumeData.ts` 取 `initialResumeState`（中文）/ `initialResumeStateEn`（英文），补全 `id`/`templateId`/`createdAt`/`updatedAt` 等必填字段，构造一个 `ResumeData` 对象
- 使用 `useI18n()` 的 `locale` 切换中英文示例数据
- 预览容器加视觉装饰（类似 Hero 右侧的渐变光晕 + 卡片阴影），并限制预览缩放（例如 `transform: scale(0.7)` + 居中，避免 A4 比例过大溢出）
- 使用 `id="templates"` 锚点，复用 LandingHeader 导航中已有的 `#templates` 链接（`LandingHeader.vue:101`）

**i18n 新增 key（zh.json + en.json 的 `landing` 下新增 `templatePreview`）：**
```json
"templatePreview": {
  "title": "精选简历模板",
  "subtitle": "4 套精心设计的专业模板，一键切换预览，挑一款最适合你的",
  "useThis": "使用此模板"
}
```
英文：
```json
"templatePreview": {
  "title": "Curated Resume Templates",
  "subtitle": "4 carefully designed professional templates, switch and preview in one click",
  "useThis": "Use This Template"
}
```

#### 2.2 修改 `app/pages/index.vue`

在 `<HeroSection />` 和 `<FeaturesSection />` 之间插入 `<TemplatePreviewSection />`：
```vue
<main>
  <HeroSection />
  <TemplatePreviewSection />
  <FeaturesSection />
  <CTASection />
  <FAQSection />
</main>
```

### 任务 3：关闭顶部"开始使用"按钮

修改 `app/components/home/LandingHeader.vue`：

- **删除桌面端按钮（line 54-57）**：移除 `<t-button theme="primary" class="hidden sm:inline-flex" @click="goDashboard">...</t-button>` 整块
- **删除移动端抽屉内按钮（line 79-81）**：移除 `<t-button theme="primary" class="mt-2" @click="goDashboard">...</t-button>` 整块
- **清理未使用代码**：删除 `goDashboard` 函数（line 113-116），因为不再有调用方

**保留项：**
- 保留 `landing.nav.start` i18n key（不删除，避免破坏其他可能的引用；如确认无其他引用可一并删除）
- 保留语言切换、暗色切换、移动端菜单按钮、Logo、导航链接

## Assumptions & Decisions

1. **"免费、隐私优先"作为新定位**：用户明确要求删除"开源"提示并强调"免费、隐私优先"。FAQ 的 `free` 条目改为强调"完全免费，无付费/订阅"，不再提及 GitHub 源码托管。
2. **FAQ 同步条目彻底删除**：根据用户选择"直接删除该条目"，同时删除 `faqKeys` 数组项与 i18n 文本（zh + en）。
3. **模板预览位置**：按用户答复，放在"为求职者打造的核心功能"（FeaturesSection）上方，作为独立 section。
4. **模板预览不跳转**：点击 tab 仅切换首页内预览，不路由跳转；"使用此模板"按钮才跳转 `/dashboard`。
5. **示例数据来源**：复用 `shared/config/initialResumeData.ts` 的 `initialResumeState` / `initialResumeStateEn`，补全 `ResumeData` 必填字段（id/templateId/createdAt/updatedAt）构造预览数据，不引入新的 mock 数据文件。
6. **顶部按钮处理方式**：直接从模板中删除按钮 DOM 与对应 `goDashboard` 函数，不注释、不留隐藏代码。保留 Hero 区"立即创建"作为唯一主 CTA。
7. **Hero 区"查看模板"按钮保留**：用户未要求删除该按钮。该按钮目前跳转 `/dashboard/templates`，可保留；或改为滚动到新增的 `#templates` 锚点（更符合"在首页展示模板"的语义）。**决定**：将 `goTemplates` 改为滚动到 `#templates` 锚点，提升首页内聚度。
8. **i18n key `landing.nav.start` 保留**：避免误删导致其他潜在引用报错；如需清理可后续单独处理。
9. **Footer 的 GitHub 链接保留**：用户仅要求删除"开源相关提示"文案，未要求删除 GitHub 入口；Footer 的 GitHub 链接属于通用社交链接，保留。

## Verification Steps

1. **启动开发服务器**：`pnpm dev`（已在 terminal_id=5 运行）
2. **访问首页 `http://localhost:3000/`**：
   - 确认 Hero 副标题不再含"开源"
   - 确认 CTA 副标题不再含"开源"
   - 确认 FAQ 列表只有 4 条（free / privacy / ai / export），无"多台设备同步"条目
   - 确认 FAQ `free` 答案不再提"开源/GitHub"
   - 确认顶部 Header 右侧无"开始使用"按钮（桌面 + 移动端抽屉均无）
   - 确认 Hero 区"立即创建"按钮仍存在并可跳转 `/dashboard`
   - 确认 Hero 区"查看模板"按钮点击后滚动到模板预览 section
   - 确认 FeaturesSection 上方出现"精选简历模板"区块，默认显示 professional 模板预览
   - 点击 4 个模板 tab，确认预览样式切换正常
   - 点击"使用此模板"按钮，确认跳转 `/dashboard`
3. **切换英文 `/en`**：
   - 确认所有对应英文文案也已更新
   - 确认模板预览示例数据切换为英文版本
4. **响应式检查**：在移动端视口下确认模板预览 section 布局正常，不溢出
5. **运行 lint/typecheck**（如项目配置了相关命令）：
   - `pnpm lint`（如有）
   - `pnpm typecheck`（如有）
6. **检查 i18n 完整性**：确认删除 `templates` FAQ key 后无残留引用（grep `landing.faq.items.templates` 应无结果）
