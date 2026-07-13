import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('renders Chinese landing page with SEO metadata', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/自由简历/)
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').count()
    expect(jsonLdScripts).toBeGreaterThanOrEqual(4)

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toContain('自由简历')

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBeTruthy()
  })

  test('header controls expose accessible names and menu state', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await expect(page.getByRole('button', { name: '切换到深色模式' })).toBeVisible()

    const openMenuButton = page.getByRole('button', { name: '打开菜单' })
    await expect(openMenuButton).toHaveAttribute('aria-expanded', 'false')
    await openMenuButton.click()

    await expect(page.getByRole('button', { name: '关闭菜单' })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('#mobile-navigation')).toBeVisible()
  })

  test('locale-prefixed routes are not available', async ({ request }) => {
    expect((await request.get('/zh')).status()).toBe(404)
    expect((await request.get('/en')).status()).toBe(404)
  })
})
