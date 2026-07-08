// Playwright 配置 - 自由简历项目 E2E 测试
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // E2E 测试目录
  testDir: './tests/e2e',
  // 并行执行
  fullyParallel: true,
  // CI 环境禁止 .only
  forbidOnly: !!process.env.CI,
  // CI 失败重试 2 次，本地不重试
  retries: process.env.CI ? 2 : 0,
  // CI 单 worker，本地使用默认
  workers: process.env.CI ? 1 : undefined,
  // 报告器：CI 用 github + html，本地用 html
  reporter: process.env.CI ? [['github'], ['html']] : 'html',
  // 全局配置
  use: {
    // 目标站点
    baseURL: 'http://localhost:3000',
    // 失败重试时记录 trace
    trace: 'on-first-retry',
  },
  // 浏览器项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Web Server 配置：自动启动 dev server
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    // 本地复用已存在的 server，CI 每次启动新的
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
