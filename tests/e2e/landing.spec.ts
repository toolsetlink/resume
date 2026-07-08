import { test, expect } from '@playwright/test'

// ============================================================
// 落地页渲染与 CTA 跳转 E2E 测试（Task 10.11）
// 覆盖：
//   - 中文落地页 / 各 section 渲染 / CTA 跳转
//   - 英文落地页可访问
// 不依赖具体文案，使用正则匹配或元素结构断言。
// ============================================================

test.describe('落地页渲染与 CTA 跳转', () => {
  // i18n detectBrowserLanguage 在 redirectOn: 'root' 下会读取浏览器 Accept-Language
  // 并在 root 路径 / 上做重定向。Playwright Chromium 默认 Accept-Language 为 en-US，
  // 导致访问 / 被重定向到 /en。
  // 解决方案：在每个测试前显式设置 i18n_redirected cookie 为 zh，并清除历史 cookie，
  // 这样 root 路径 / 不再触发重定向，直接渲染中文落地页。
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
    await context.addCookies([
      {
        name: 'i18n_redirected',
        value: 'zh',
        domain: 'localhost',
        path: '/',
      },
    ])
  })

  test('中文落地页渲染各 section 与可点击 CTA', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 页面 URL 应为根路径（默认 locale zh，prefix_except_default 策略下不加前缀）
    expect(page.url()).toMatch(/\/$/)

    // ----------------------------------------------------------
    // HeroSection：标题（h1）+ 副标题（p）+ CTA 按钮
    // ----------------------------------------------------------
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const heroTitle = (await h1.textContent()) ?? ''
    expect(heroTitle.trim().length).toBeGreaterThan(0)

    // 副标题：HeroSection 中紧跟 h1 的 p
    const heroSubtitle = page.locator('h1 + p, h1 ~ p').first()
    await expect(heroSubtitle).toBeVisible()
    const subtitleText = (await heroSubtitle.textContent()) ?? ''
    expect(subtitleText.trim().length).toBeGreaterThan(0)

    // ----------------------------------------------------------
    // FeaturesSection：#features 锚点 + 至少一张卡片
    // ----------------------------------------------------------
    const featuresSection = page.locator('#features').first()
    await expect(featuresSection).toBeVisible()
    // FeaturesSection 渲染 6 张卡片
    const featureCards = featuresSection.locator('.landing-card')
    expect(await featureCards.count()).toBeGreaterThanOrEqual(1)

    // ----------------------------------------------------------
    // FAQSection：#faq 锚点 + 至少一项可展开/收起
    // ----------------------------------------------------------
    const faqSection = page.locator('#faq').first()
    await expect(faqSection).toBeVisible()
    const faqButtons = faqSection.locator('button[aria-expanded]')
    expect(await faqButtons.count()).toBeGreaterThanOrEqual(1)

    // ----------------------------------------------------------
    // Footer：footer 标签
    // ----------------------------------------------------------
    const footer = page.locator('footer').first()
    await expect(footer).toBeVisible()

    // ----------------------------------------------------------
    // CTASection：点击 CTA 按钮跳转到 /dashboard
    // ----------------------------------------------------------
    // 至少有一个可点击链接或按钮（用于 CTA）
    const links = page.locator('a')
    expect(await links.count()).toBeGreaterThan(0)

    // CTASection 内的按钮：点击后应跳转到工作台或注册页
    // CTASection 按钮文案为 i18n key，使用结构断言而非文案
    const ctaButton = page.locator('section button.t-button, section .t-button').last()
    await expect(ctaButton).toBeVisible()
    await ctaButton.click()

    // 点击后等待 URL 变为 /dashboard（使用 waitForURL 避免 networkidle 提前返回的竞态）
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    expect(page.url()).toMatch(/\/dashboard/)
  })

  test('英文落地页可访问并渲染英文内容', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')

    // URL 应为 /en 结尾
    expect(page.url()).toMatch(/\/en$/)

    // 页面应至少渲染一个 h1
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const heroTitle = (await h1.textContent()) ?? ''
    expect(heroTitle.trim().length).toBeGreaterThan(0)

    // body 至少有一定长度的文字内容
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
    expect(bodyText!.trim().length).toBeGreaterThan(100)

    // 英文页面应包含 "ZiYou Resume" 或英文常见词（非强制，宽容断言）
    // 由于内容来自 i18n，这里只做长度校验，避免文案变动导致 flaky。
  })

  test('中英文落地页都可访问', async ({ page }) => {
    // beforeEach 已设置 i18n_redirected=zh，访问 / 不应被重定向
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toBe('http://localhost:3000/')

    // 英文页面是显式 /en 前缀路径，不受 cookie 影响
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toBe('http://localhost:3000/en')
  })
})
