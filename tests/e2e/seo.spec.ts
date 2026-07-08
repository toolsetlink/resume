import { test, expect } from '@playwright/test'

// ============================================================
// SEO 配置 E2E 测试（Task 10.11）
// 覆盖：
//   - 落地页 og / twitter / canonical / hreflang meta
//   - 应用页面 noindex,nofollow
//   - sitemap.xml / sitemap_index.xml 可访问
//   - robots.txt 可访问且包含 Disallow
//   - manifest.json 可访问且包含 name 字段
// 注意：meta 断言使用正则匹配，避免依赖具体文案。
// 若某些 meta 不存在，简化为"页面可访问"测试。
// ============================================================

test.describe('落地页 SEO meta', () => {
  test('og / twitter / canonical / hreflang meta 完整', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // og:title
    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute('content', /.+/)

    // og:description
    const ogDesc = page.locator('meta[property="og:description"]')
    await expect(ogDesc).toHaveAttribute('content', /.+/)

    // og:url（若存在则校验非空，不存在则跳过）
    const ogUrl = page.locator('meta[property="og:url"]')
    const ogUrlCount = await ogUrl.count()
    if (ogUrlCount > 0) {
      await expect(ogUrl.first()).toHaveAttribute('content', /.+/)
    }

    // twitter:card
    const twitterCard = page.locator('meta[name="twitter:card"]')
    await expect(twitterCard).toHaveAttribute('content', /.+/)

    // twitter:title
    const twitterTitle = page.locator('meta[name="twitter:title"]')
    await expect(twitterTitle).toHaveAttribute('content', /.+/)

    // canonical link
    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href', /.+/)

    // hreflang: zh-CN
    const hreflangZh = page.locator('link[rel="alternate"][hreflang="zh-CN"]')
    await expect(hreflangZh).toHaveAttribute('href', /.+/)

    // hreflang: en-US
    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en-US"]')
    await expect(hreflangEn).toHaveAttribute('href', /.+/)

    // hreflang: x-default
    const hreflangDefault = page.locator('link[rel="alternate"][hreflang="x-default"]')
    await expect(hreflangDefault).toHaveAttribute('href', /.+/)
  })
})

test.describe('应用页面 noindex,nofollow', () => {
  test('/dashboard 设置 noindex,nofollow', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const robots = page.locator('meta[name="robots"]')
    await expect(robots).toHaveAttribute('content', /noindex/i)
    await expect(robots).toHaveAttribute('content', /nofollow/i)
  })
})

test.describe('sitemap 可访问', () => {
  test('sitemap.xml 返回 200 且包含 <urlset>', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)

    const body = await response.text()
    // sitemap.xml 主文件以 <urlset 开头；若是 sitemap_index 则会以 <sitemapindex 开头
    // 兼容两种情况：至少包含 <url 或 <sitemap 标签之一
    const hasUrlset = body.includes('<urlset') || body.includes('<sitemapindex') || body.includes('<url')
    expect(hasUrlset).toBeTruthy()
  })

  test('sitemap_index.xml 返回 200 且包含 <sitemapindex>', async ({ request }) => {
    const response = await request.get('/sitemap_index.xml')
    expect(response.status()).toBe(200)

    const body = await response.text()
    expect(body).toContain('sitemapindex')
  })
})

test.describe('robots.txt 可访问', () => {
  test('robots.txt 返回 200 且包含 Disallow', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)

    const body = await response.text()
    expect(body).toContain('Disallow')
  })
})

test.describe('manifest.json 可访问', () => {
  test('manifest.json 返回 200 且包含 name 字段', async ({ request }) => {
    const response = await request.get('/manifest.json')
    expect(response.status()).toBe(200)

    const json = await response.json()
    expect(json).toHaveProperty('name')
    expect(typeof json.name).toBe('string')
    expect((json.name as string).length).toBeGreaterThan(0)
  })
})
