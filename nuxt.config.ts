// 自由简历 - Nuxt 配置
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  // 模块注册
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  // 组件自动注册：
  // - editor / workbench / shared / preview / home 等目录：按文件名注册（不带路径前缀），便于 <BasicInfoPanel /> 直接引用
  // - templates 目录：按路径前缀注册（避免多套模板下同名 section 组件冲突）
  components: [
    { path: '~/components/editor', pathPrefix: false },
    { path: '~/components/workbench', pathPrefix: false },
    { path: '~/components/shared', pathPrefix: false },
    { path: '~/components/preview', pathPrefix: false },
    { path: '~/components/home', pathPrefix: false },
    { path: '~/components/templates', pathPrefix: true },
  ],

  // 站点地址常量（SEO、sitemap、robots 共用）
  site: {
    url: 'https://ziyou-resume.example.com',
    name: '自由简历',
  },

  // sitemap 配置：排除应用内页面，落地页与模板预览页可索引
  sitemap: {
    exclude: ['/dashboard/**', '/workbench/**'],
  },

  // 路由级渲染规则：工作台与仪表盘是纯客户端应用（依赖 localStorage、Splitpanes 等），
  // 禁用 SSR 渲染以避免 hydration 不匹配（definePageMeta 的 ssr:false 在 Nuxt 4 未生效）
  routeRules: {
    '/workbench/**': { ssr: false },
    '/dashboard/**': { ssr: false },
  },

  // robots 配置：禁止抓取应用内页面，允许落地页
  robots: {
    disallow: ['/workbench', '/dashboard'],
    allow: '/',
  },

  // Tailwind CSS v4 通过 Vite 插件引入
  vite: {
    plugins: [
      tailwindcss(),
    ],
    // 让 Vite 处理 TDesign 的 .css 资源，避免 Node ESM 在 SSR 直接加载 .css 报错
    ssr: {
      noExternal: [
        'tdesign-vue-next',
        'tdesign-icons-vue-next',
      ],
    },
  },

  // CSS 全局引入（~ 在 Nuxt 4 中指向 app/ 目录，故省略 app 前缀）
  css: [
    'tdesign-vue-next/es/style/index.css',
    '~/assets/css/main.css',
  ],

  // Pinia 配置
  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  // i18n 配置
  i18n: {
    locales: [
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    langDir: '../i18n/locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  // 暗色模式
  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'ziyou-resume-theme',
  },

  // app head
  app: {
    head: {
      title: '自由简历 - 在线简历编辑器',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '自由简历 - 隐私优先的在线简历编辑器，支持多模板、AI 辅助、PDF 导出' },
        { name: 'theme-color', content: '#1f2937' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: '自由简历' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/icon.svg' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
      ],
    },
  },

  // TypeScript 严格模式
  typescript: {
    strict: true,
  },
})
