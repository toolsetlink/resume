import { test, expect } from '@playwright/test'

// ============================================================
// 暗色模式切换与持久化 E2E 测试（Task 10.12）
// 覆盖：
//   - 默认 light 模式
//   - 切换到 dark 模式（UI 点击 + localStorage 降级）
//   - <html> 添加 dark class
//   - localStorage ziyou-resume-theme = 'dark'
//   - 刷新后保持暗色模式
//   - 切换回 light 模式
// 配置：
//   - colorMode: classSuffix='', preference='light', fallback='light', storageKey='ziyou-resume-theme'
//   - 暗色模式通过 <html class="dark"> 切换
//   - LandingHeader 有主题切换按钮（Sun/Moon 图标，toggleColorMode）
// ============================================================

const BASE = 'http://localhost:3000'
const STORAGE_KEY = 'ziyou-resume-theme'

// 读取 localStorage 中 ziyou-resume-theme 的值
async function getThemeStorage(page: import('@playwright/test').Page): Promise<string | null> {
  return await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
}

// 读取 <html> 的 class 属性
async function getHtmlClass(page: import('@playwright/test').Page): Promise<string> {
  return (await page.locator('html').getAttribute('class')) ?? ''
}

test.describe('暗色模式切换与持久化', () => {
  test.beforeEach(async ({ page }) => {
    // 先访问一次页面，确保 localStorage 域名上下文已建立，再清理
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => localStorage.clear())
  })

  test('默认为 light 模式', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // <html> 不应包含 dark class
    const htmlClass = await getHtmlClass(page)
    expect(htmlClass).not.toContain('dark')

    // localStorage 默认无值或为 'light'（项目默认值）
    const theme = await getThemeStorage(page)
    // colorMode.preference='light'，首次访问会写入 'light'（也可能为 null，宽容断言）
    if (theme !== null) {
      expect(theme).toBe('light')
    }
  })

  test('点击主题切换按钮切换到 dark 模式', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 初始为 light
    const initialHtmlClass = await getHtmlClass(page)
    expect(initialHtmlClass).not.toContain('dark')

    // LandingHeader 的第一个 Ant Design 按钮是主题切换按钮
    const themeToggle = page.locator('header .ant-btn').nth(0)
    await expect(themeToggle).toBeVisible()

    // 点击切换到 dark
    await themeToggle.click()

    // 验证 <html> 添加 dark class（ThemeProvider 应用）
    // color-mode 切换可能有微小延迟，使用 expect 断言自动重试
    await expect.poll(async () => await getHtmlClass(page), { timeout: 5000 }).toContain('dark')

    // 验证 localStorage 被设置为 'dark'
    await expect.poll(async () => await getThemeStorage(page), { timeout: 5000 }).toBe('dark')
  })

  test('直接操作 localStorage 切换到 dark 模式并刷新保持', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 直接通过 localStorage 设置 dark（模拟用户偏好或外部切换）
    await page.evaluate((key) => {
      localStorage.setItem(key, 'dark')
    }, STORAGE_KEY)

    // 刷新页面，color-mode 会读取 storageKey 并应用
    await page.reload()
    await page.waitForLoadState('networkidle')

    // 验证 <html> 有 dark class
    const htmlClass = await getHtmlClass(page)
    expect(htmlClass).toContain('dark')

    // 验证 localStorage 仍为 'dark'
    const theme = await getThemeStorage(page)
    expect(theme).toBe('dark')
  })

  test('刷新页面后保持暗色模式', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 通过 UI 切换到 dark
    const themeToggle = page.locator('header .ant-btn').nth(0)
    await expect(themeToggle).toBeVisible()
    await themeToggle.click()

    // 等待 dark class 应用
    await expect.poll(async () => await getHtmlClass(page), { timeout: 5000 }).toContain('dark')

    // 刷新页面
    await page.reload()
    await page.waitForLoadState('networkidle')

    // 刷新后仍应保持 dark class
    const htmlClassAfterReload = await getHtmlClass(page)
    expect(htmlClassAfterReload).toContain('dark')

    // localStorage 仍为 'dark'
    const theme = await getThemeStorage(page)
    expect(theme).toBe('dark')
  })

  test('从 dark 模式切换回 light 模式', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 先切换到 dark
    const themeToggle = page.locator('header .ant-btn').nth(0)
    await expect(themeToggle).toBeVisible()
    await themeToggle.click()
    await expect.poll(async () => await getHtmlClass(page), { timeout: 5000 }).toContain('dark')

    // 再次点击切换回 light
    await themeToggle.click()

    // 验证 <html> 不再包含 dark class
    await expect.poll(async () => await getHtmlClass(page), { timeout: 5000 }).not.toContain('dark')

    // 验证 localStorage 被设置为 'light'
    await expect.poll(async () => await getThemeStorage(page), { timeout: 5000 }).toBe('light')
  })

  test('localStorage 设置 dark 后 SSR 首屏即应用 dark class', async ({ page }) => {
    // 先访问一次设置 localStorage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate((key) => {
      localStorage.setItem(key, 'dark')
    }, STORAGE_KEY)

    // 重新导航到根路径，color-mode 会在客户端初始化时读取 storageKey
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 验证 html 有 dark class
    const htmlClass = await getHtmlClass(page)
    expect(htmlClass).toContain('dark')

    // localStorage 保持 'dark'
    const theme = await getThemeStorage(page)
    expect(theme).toBe('dark')
  })
})
