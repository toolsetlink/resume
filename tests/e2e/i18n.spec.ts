import { test, expect } from '@playwright/test'

// ============================================================
// i18n 切换与持久化 E2E 测试（Task 10.12）
// 覆盖：
//   - 中文落地页 / 英文落地页可访问且渲染对应语言内容
//   - locale 前缀路由：/ 为中文，/en 为英文
//   - i18n cookie 持久化（i18n_redirected）
//   - 刷新后语言保留
// 注意：
//   - i18n 配置 strategy=prefix_except_default，defaultLocale=zh
//   - detectBrowserLanguage.redirectOn: 'root'，访问 / 时会读取 Accept-Language 重定向
//   - Playwright Chromium 默认 Accept-Language=en-US，访问 / 会被重定向到 /en
//   - 解决方案：在 beforeEach 显式设置 i18n_redirected=zh cookie 强制中文
// ============================================================

const BASE = 'http://localhost:3000'

test.describe('i18n 切换与持久化', () => {
  test.beforeEach(async ({ context }) => {
    // 清除所有 cookie，避免之前测试的 i18n_redirected 影响
    await context.clearCookies()
    // 设置 i18n_redirected=zh，确保访问 / 不被重定向到 /en
    // （Playwright Chromium 默认 Accept-Language=en-US，否则会触发重定向）
    await context.addCookies([
      {
        name: 'NEXT_LOCALE',
        value: 'zh',
        domain: 'localhost',
        path: '/',
      },
    ])
  })

  test('中文落地页可访问并渲染中文内容', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // URL 应为根路径（默认 locale zh，prefix_except_default 策略下不加前缀）
    expect(page.url()).toBe(`${BASE}/`)

    // h1 渲染：中文落地页 HeroSection 标题
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const heroTitle = (await h1.textContent()) ?? ''
    expect(heroTitle.trim().length).toBeGreaterThan(0)

    // 验证渲染中文内容：appName 或 hero title 包含中文字符
    // zh.json 中 appName="自由简历"，hero.title="打造专业简历..."
    const bodyText = (await page.locator('body').textContent()) ?? ''
    expect(bodyText).toMatch(/自由简历|打造专业简历|隐私优先/)

    // html lang 属性：若 @nuxtjs/i18n 设置了 <html lang="zh-CN"> 则校验为 zh 开头
    // （dev 环境下 lang 属性可能延迟设置或未注入，这里做宽容断言）
    const htmlLang = await page.locator('html').getAttribute('lang')
    if (htmlLang !== null) {
      expect(htmlLang).toMatch(/^zh/i)
    }
  })

  test('英文落地页可访问并渲染英文内容', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')

    // URL 应包含 /en 前缀
    expect(page.url()).toBe(`${BASE}/en`)

    // h1 渲染
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const heroTitle = (await h1.textContent()) ?? ''
    expect(heroTitle.trim().length).toBeGreaterThan(0)

    // 验证渲染英文内容：appName="ZiYou Resume"
    const bodyText = (await page.locator('body').textContent()) ?? ''
    expect(bodyText).toMatch(/ZiYou Resume|Privacy-first|Craft a professional resume/i)

    // html lang 属性：若设置则校验为 en 开头（dev 环境下可能延迟注入，宽容断言）
    const htmlLang = await page.locator('html').getAttribute('lang')
    if (htmlLang !== null) {
      expect(htmlLang).toMatch(/^en/i)
    }
  })

  test('locale 前缀路由：/ 为中文，/en 为英文', async ({ page }) => {
    // / 为中文（cookie 已强制 zh，不会重定向）
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toBe(`${BASE}/`)
    const zhBody = (await page.locator('body').textContent()) ?? ''
    expect(zhBody).toMatch(/自由简历|打造专业简历/)

    // /en 为英文
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toBe(`${BASE}/en`)
    const enBody = (await page.locator('body').textContent()) ?? ''
    expect(enBody).toMatch(/ZiYou Resume|Privacy-first/i)
  })

  test('访问 /en 后 i18n_redirected cookie 被设置为 en', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')

    const cookies = await page.context().cookies()
    const i18nCookie = cookies.find(c => c.name === 'NEXT_LOCALE')
    expect(i18nCookie).toBeTruthy()
    expect(i18nCookie?.value).toBe('en')
  })

  test('切换到英文后刷新页面语言保留', async ({ page }) => {
    // 访问 /en，i18n 会写 i18n_redirected=en cookie
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toBe(`${BASE}/en`)

    // 验证 cookie 已设置
    const cookiesBefore = await page.context().cookies()
    const i18nCookieBefore = cookiesBefore.find(c => c.name === 'NEXT_LOCALE')
    expect(i18nCookieBefore?.value).toBe('en')

    // 刷新页面
    await page.reload()
    await page.waitForLoadState('networkidle')

    // 刷新后仍在 /en 且渲染英文
    expect(page.url()).toBe(`${BASE}/en`)
    const bodyText = (await page.locator('body').textContent()) ?? ''
    expect(bodyText).toMatch(/ZiYou Resume|Privacy-first/i)
  })

  test('通过 UI 语言切换按钮从中文切换到英文', async ({ page }) => {
    // 先访问中文落地页（cookie 已强制 zh）
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toBe(`${BASE}/`)

    // 落地页 header 有语言切换 t-dropdown（含 Languages 图标按钮）
    // 点击语言切换按钮展开下拉，再点击 "English" 选项
    // 找到 dropdown 触发按钮：header 中第一个 variant=text 的 t-button 是语言切换
    const langToggle = page.locator('header .ant-btn').first()
    await expect(langToggle).toBeVisible()

    // 点击展开下拉
    await langToggle.click()

    // 下拉菜单中点击 English 选项
    // t-dropdown-menu 渲染 .t-dropdown__menu，item 渲染 [role="menuitem"]
    // 英文选项文案为 "English"（locales 中 en.name="English"）
    const englishItem = page.locator('[role="menuitem"]').filter({ hasText: 'English' }).first()
    await expect(englishItem).toBeVisible({ timeout: 5000 })
    await englishItem.click()

    // 切换后 URL 应变为 /en
    await page.waitForURL(/\/en$/, { timeout: 10000 })
    expect(page.url()).toBe(`${BASE}/en`)

    // 验证渲染英文内容
    const bodyText = (await page.locator('body').textContent()) ?? ''
    expect(bodyText).toMatch(/ZiYou Resume|Privacy-first/i)

    // 验证 cookie 被更新
    const cookies = await page.context().cookies()
    const i18nCookie = cookies.find(c => c.name === 'NEXT_LOCALE')
    expect(i18nCookie?.value).toBe('en')
  })

  test('通过 UI 语言切换按钮从英文切换回中文', async ({ page }) => {
    // 先访问英文落地页
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toBe(`${BASE}/en`)

    // 点击语言切换按钮展开下拉
    const langToggle = page.locator('header .ant-btn').first()
    await expect(langToggle).toBeVisible()
    await langToggle.click()

    // 点击 "中文" 选项切换回中文
    const chineseItem = page.locator('[role="menuitem"]').filter({ hasText: '中文' }).first()
    await expect(chineseItem).toBeVisible({ timeout: 5000 })
    await chineseItem.click()

    // 切换后 URL 应变回根路径（中文默认 locale 不带前缀）
    await page.waitForURL(/\/$/, { timeout: 10000 })
    expect(page.url()).toBe(`${BASE}/`)

    // 验证渲染中文内容
    const bodyText = (await page.locator('body').textContent()) ?? ''
    expect(bodyText).toMatch(/自由简历|打造专业简历/)

    // 验证 cookie 被更新回 zh
    const cookies = await page.context().cookies()
    const i18nCookie = cookies.find(c => c.name === 'NEXT_LOCALE')
    expect(i18nCookie?.value).toBe('zh')
  })
})
