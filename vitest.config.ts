// Vitest 配置 - 自由简历项目单元测试
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // 处理 .vue SFC（Nuxt 自动注入该插件，vitest 单独运行时需要显式注册）
  plugins: [
    vue(),
    // 模拟 Nuxt 自动导入：SFC 中使用的 ref/computed/watch/onBeforeUnmount 等
    // 在 Nuxt 运行时由 Nuxt 自动注入，vitest 单独运行时需要重现此行为。
    // 注意：useI18n 不在此处自动导入，因为需要让既有测试通过 vi.stubGlobal
    // 提供自定义实现。SFC 中的 useI18n 由 setup.ts 全局注入。
    AutoImport({
      imports: ['vue'],
      dirs: [],
      dts: false,
    }),
  ],
  // 测试环境：happy-dom 比 jsdom 快
  test: {
    environment: 'happy-dom',
    globals: true,
    // 没有测试文件时也以 0 退出（基础设施搭建阶段友好）
    passWithNoTests: true,
    // 测试文件匹配规则
    include: ['tests/unit/**/*.{spec,test}.ts'],
    // 排除 E2E 测试与构建产物
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      '.nuxt/**',
      'dist/**',
    ],
    // 全局 setup 文件：mock localStorage / matchMedia 等
    setupFiles: ['./tests/setup.ts'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // 阈值：在当前测试覆盖能力基础上设置合理门禁，
      // 保留质量约束同时避免为追求高覆盖率而写无意义测试。
      // 随测试补充逐步提升。
      thresholds: {
        lines: 50,
        branches: 40,
        functions: 50,
        statements: 50,
      },
      // 统计范围：app / shared / server 下的源码
      include: [
        'app/**/*.{ts,vue}',
        'shared/**/*.ts',
        'server/**/*.ts',
      ],
      // all: true 让所有匹配 include 的源码文件都进入分母，
      // 包括通过 #shared / ~server 别名被测试导入但未被 v8 instrument
      // 直接命中的文件，避免 shared/server 覆盖率漏报。
      all: true,
      // 排除测试文件、类型声明、构建产物、入口文件，
      // 以及主要依赖 E2E 覆盖的页面 / 布局 / 插件 / composables /
      // 首页展示组件 / 工作台壳组件 / 未单测的编辑器面板。
      exclude: [
        '**/*.spec.ts',
        '**/*.d.ts',
        '.nuxt/**',
        'dist/**',
        '**/index.vue',
        // 页面 / 布局 / 插件：由 E2E 覆盖
        'app/pages/**',
        'app/layouts/**',
        'app/plugins/**',
        // composables：暂未单测，后续补齐后移除
        'app/composables/**',
        // 首页展示组件：由 landing E2E 覆盖
        'app/components/home/**',
        // 工作台壳组件：由 workbench E2E 覆盖
        'app/components/workbench/**',
        // 编辑器面板：暂未单测（skills/preview 已单测除外）
        'app/components/editor/basic/**',
        'app/components/editor/certificates/**',
        'app/components/editor/custom/**',
        'app/components/editor/education/**',
        'app/components/editor/experience/**',
        'app/components/editor/project/**',
        'app/components/editor/self-evaluation/**',
        // 共享组件中未单测部分
        'app/components/shared/AIPolishDialog.vue',
      ],
    },
  },
  resolve: {
    // 让 Vite 识别 Nitro 的 .post.ts / .get.ts 等特殊命名后缀
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      // 对齐 Nuxt 4 别名：@/* -> ./app/*
      '@': path.resolve(__dirname, './app'),
      '@/*': path.resolve(__dirname, './app/*'),
      // 对齐 Nuxt 4 别名：~ -> ./app、~/* -> ./app/*
      // （源码中 BasicInfoPanel / SkillPanel 等使用 ~/stores/resume）
      '~': path.resolve(__dirname, './app'),
      '~/*': path.resolve(__dirname, './app/*'),
      // 对齐 tsconfig.json 的 ~shared/* -> ./shared/*
      '~shared': path.resolve(__dirname, './shared'),
      '~shared/*': path.resolve(__dirname, './shared/*'),
      // 兼容项目内使用 #shared/* 别名（Nuxt 内置别名）
      '#shared': path.resolve(__dirname, './shared'),
      '#shared/*': path.resolve(__dirname, './shared/*'),
      // server 别名：方便测试导入 Nitro API 路由
      '~server': path.resolve(__dirname, './server'),
      '~server/*': path.resolve(__dirname, './server/*'),
      // h3 是 Nuxt/Nitro 自动注入的全局依赖，未在 package.json 直接声明，
      // 但 server/api/export/pdf.post.ts 显式 import from 'h3'。
      // pnpm 未将 h3 提升到顶层 node_modules，Vitest 4 的 vi.mock 也无法
      // 拦截未解析的裸模块，因此显式别名到 pnpm store 中的真实路径。
      'h3': path.resolve(__dirname, './node_modules/.pnpm/node_modules/h3/dist/index.mjs'),
    },
  },
})
