# 调整 Dashboard 页面名称与首页导航入口

## 概述

本次改动包含三项调整：
1. 将 dashboard 页面名称从「控制台」修改为「我的简历列表」，并同步英文文案。
2. 在首页顶部导航栏（LandingHeader）新增「我的简历」入口按钮，点击跳转到 dashboard 页面。
3. 给「我的简历列表」页面新增顶部头部（含与首页一致的左上角跳转按钮，可返回首页）。

---

## 当前状态分析

### 1. 文案来源（i18n 集中管理）
- `i18n/locales/zh.json` 第 26 行：`"dashboard": "控制台"`
- `i18n/locales/en.json` 第 26 行：`"dashboard": "Dashboard"`
- 页面 H1 标题、`useHead({ title })` 均通过 `t('nav.dashboard')` 读取，**无硬编码「控制台」文案**。

### 2. dashboard 页面结构
- 文件：`app/pages/dashboard/index.vue`
- 使用 `layout: 'app'`（`app/layouts/app.vue`），该布局**只有背景容器 + slot，没有 header/sidebar/面包屑**。
- 页面顶部仅有一个 `<h1>` + 「创建简历」按钮，**没有返回按钮，也没有头部导航栏**。

### 3. 首页顶部导航栏
- 文件：`app/components/home/LandingHeader.vue`
- 结构（三段式）：
  - 左：Logo + 应用名（`NuxtLink` 跳转 `/`）
  - 中：桌面端锚点导航（功能/模板/FAQ）
  - 右：语言切换 / 暗色切换 / 移动端菜单按钮
- 中间导航项使用 `<a :href="#features">` 锚点跳转，样式：`rounded-md px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]`
- 移动端在抽屉中复用 `navLinks`。

### 4. 路由跳转约定
- 内部路由跳转统一使用 `useLocalePath()` 包裹：`router.push(localePath('/dashboard'))`
- Logo 区域使用 `<NuxtLink :to="localePath('/')">`

### 5. 面包屑
- 项目**无面包屑组件**，无需处理。

---

## 计划改动

### 改动 1：修改 i18n 文案（控制台 → 我的简历列表）

**文件**：
- `i18n/locales/zh.json`（第 26 行）
- `i18n/locales/en.json`（第 26 行）

**修改内容**：
```diff
- "dashboard": "控制台"
+ "dashboard": "我的简历列表"
```
```diff
- "dashboard": "Dashboard"
+ "dashboard": "My Resumes"
```

**影响范围**（自动生效，无需改动）：
- `app/pages/dashboard/index.vue:4` — 页面 H1 标题
- `app/pages/dashboard/index.vue:101` — `useHead({ title })` 浏览器标签标题

---

### 改动 2：首页顶部导航栏新增「我的简历」入口

**文件**：`app/components/home/LandingHeader.vue`

**方案**：在桌面端 `<nav>` 中追加一个跳转到 `/dashboard` 的链接，与现有锚点导航项视觉风格一致；同时在移动端抽屉中显示。

**桌面端实现**（在 `<nav class="hidden items-center gap-1 md:flex">` 内追加）：
```vue
<NuxtLink
  :to="localePath('/dashboard')"
  class="rounded-md px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
>
  {{ t('nav.dashboard') }}
</NuxtLink>
```

**移动端实现**（在移动端抽屉 `<nav>` 内追加）：
```vue
<NuxtLink
  :to="localePath('/dashboard')"
  class="rounded-md px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
  @click="mobileOpen = false"
>
  {{ t('nav.dashboard') }}
</NuxtLink>
```

**原因**：
- 复用 `t('nav.dashboard')` 自动显示「我的简历列表」文案。
- 复用现有 `navLinks` 项的 className，保持视觉与交互一致。
- 使用 `NuxtLink + localePath` 而非 `<a href>`，因为是路由跳转而非锚点。

**实现方式**：将「我的简历」从 `navLinks` computed 中分离出来单独写，或直接在 `navLinks` 数组里加一项 `{ href: 'route:/dashboard', label: t('nav.dashboard') }`。**推荐单独写**（保持锚点与路由的分离，避免破坏现有 `<a>` 渲染逻辑）。

---

### 改动 3：为「我的简历列表」页面新增头部（含返回首页按钮）

**文件**：`app/pages/dashboard/index.vue`

**方案**：在页面最外层包裹一个 `LandingHeader` 风格的 sticky header，左上角为「Logo + 应用名」按钮，点击返回首页（与首页左上角跳转按钮行为一致）。

**头部实现**（在 `<div class="dashboard-page ...">` 之前插入）：
```vue
<header class="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-md">
  <div class="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
    <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        <FileText class="h-5 w-5" />
      </span>
      <span class="text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">
        {{ t('common.appName') }}
      </span>
    </NuxtLink>
  </div>
</header>
```

**说明**：
- 完全复用 `LandingHeader.vue` 第 2-16 行的样式与 Logo 结构，确保「跟首页一样的左上角跳转按钮」。
- 点击跳转到 `/`（首页）。
- 不引入语言切换/暗色切换按钮（避免与首页重复，保持简洁；用户需求仅要求「左上角跳转按钮」）。

**外层结构调整**：
原结构：
```vue
<template>
  <div class="dashboard-page p-8 max-w-5xl mx-auto">
    ...
  </div>
</template>
```
改为：
```vue
<template>
  <div class="min-h-screen bg-[hsl(var(--background))]">
    <header>...</header>
    <div class="dashboard-page p-8 max-w-5xl mx-auto">
      ...
    </div>
  </div>
</template>
```

**import 补充**：在 `<script setup>` 中 import `FileText`（来自 `lucide-vue-next`，当前已 import，无需新增）。

---

## 假设与决策

1. **不抽取共享 Header 组件**：当前只在 dashboard 和首页两处使用，且 dashboard 版本是简化版（仅 Logo），直接内联实现，避免过度工程化。
2. **不在 dashboard 头部加语言/暗色切换**：用户只要求「左上角跳转按钮」，保持简洁。
3. **i18n key 保持 `nav.dashboard` 不变**：仅修改其 value，避免大规模重命名 key。
4. **「我的简历」按钮文案使用 `nav.dashboard`**：与 dashboard 页面标题一致，自动随 i18n 切换。
5. **不新增 i18n key**：`nav.dashboard` 已足够表达「我的简历列表」语义。

---

## 验证步骤

1. 启动开发服务器（已运行，端口默认 3000）。
2. 访问首页 `/`：
   - 顶部导航栏出现「我的简历列表」入口（桌面端 + 移动端抽屉）。
   - 点击该入口跳转到 `/dashboard`。
3. 访问 `/dashboard`：
   - 页面顶部出现 header，左上角 Logo + 应用名，点击返回首页。
   - H1 标题显示「我的简历列表」。
   - 浏览器标签显示「我的简历列表 - 自由简历」。
4. 切换语言为 English：
   - 导航入口显示「My Resumes」。
   - dashboard 页面 H1 显示「My Resumes」。
5. 响应式检查：
   - 移动端视口下，首页导航抽屉包含「我的简历列表」入口。
   - dashboard 头部在移动端正常显示 Logo + 应用名。
6. 功能回归：
   - dashboard 页面「创建简历」「编辑」「复制」「删除」按钮功能正常。
   - 首页 HeroSection / CTASection / TemplatePreviewSection 跳转 dashboard 功能不受影响。
