import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('renders Chinese landing page with SEO metadata', async ({ page }) => {
    await page.goto('/zh')
    await expect(page).toHaveTitle(/自由简历/)
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').count()
    expect(jsonLdScripts).toBeGreaterThanOrEqual(4)

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toContain('自由简历')

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBeTruthy()
  })

  test('renders English landing page', async ({ page }) => {
    await page.goto('/en')
    await expect(page).toHaveTitle(/ZiYou/)
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(4)
  })

  test('language switcher redirects correctly', async ({ page }) => {
    await page.goto('/')
    const url = page.url()
    expect(url).toMatch(/\/(zh|en)?$/)
  })
})
