// 模板视觉回归测试 - 自由简历项目（Task 10.14）
// 覆盖 4 套模板 snapshot 页面 + 落地页的视觉一致性
// 首次运行自动生成基线截图，第二次运行开始对比
import { test, expect } from '@playwright/test'

// 所有已注册模板 id（与 registry.ts 中 TEMPLATE_REGISTRY 顺序一致）
const TEMPLATE_IDS = ['professional', 'modern', 'elegant', 'creative'] as const

// 各模板根容器 class（用于等待渲染完成）
const TEMPLATE_ROOT_SELECTOR: Record<string, string> = {
  professional: '.professional-template',
  modern: '.modern-template',
  elegant: '.elegant-template',
  creative: '.creative-template',
}

// 视觉对比阈值：允许 10% 像素差异（应对字体/抗锯齿等环境差异）
const VISUAL_THRESHOLD = { maxDiffPixelRatio: 0.1 }

// 等待模板渲染完成：根容器可见 + 字体加载 + 网络空闲
async function waitForTemplateReady(page: import('@playwright/test').Page, templateId: string) {
  await page.waitForLoadState('networkidle')
  const rootSelector = TEMPLATE_ROOT_SELECTOR[templateId]
  await page.waitForSelector(rootSelector, { state: 'visible', timeout: 15000 })
  // 等待中文字体加载完成，避免截图时字体未就绪
  await page.evaluate(() => document.fonts.ready)
  // 给 Vue 一帧时间完成所有 DOM 更新
  await page.waitForTimeout(300)
}

test.describe('模板视觉回归', () => {
  for (const templateId of TEMPLATE_IDS) {
    test(`${templateId} 模板 snapshot 视觉一致`, async ({ page }) => {
      const response = await page.goto(`/snapshot/${templateId}`)
      expect(response?.status()).toBeLessThan(400)

      await waitForTemplateReady(page, templateId)

      // 截图并与基线对比（首次运行自动生成基线）
      await expect(page).toHaveScreenshot(
        `${templateId}-template.png`,
        {
          ...VISUAL_THRESHOLD,
          fullPage: true,
        }
      )
    })

    test(`${templateId} 模板包含关键 DOM 元素`, async ({ page }) => {
      // 降级保护：即使视觉对比因环境差异不稳定，也保证关键元素存在
      await page.goto(`/snapshot/${templateId}`)
      await waitForTemplateReady(page, templateId)

      const root = page.locator(TEMPLATE_ROOT_SELECTOR[templateId]).first()
      await expect(root).toBeVisible()

      // 模板根容器内应渲染基本内容（snapshot 用 initialResumeState，含姓名「李明」）
      const rootText = (await root.textContent()) ?? ''
      expect(rootText.trim().length).toBeGreaterThan(0)
    })
  }
})

test.describe('落地页视觉回归', () => {
  test.beforeEach(async ({ context }) => {
    // i18n detectBrowserLanguage 在 redirectOn: 'root' 下会读取 Accept-Language，
    // Playwright Chromium 默认 en-US 会被重定向到 /en。
    // 显式设置 i18n_redirected=zh，确保 / 渲染中文落地页，保证截图稳定。
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

  test('中文落地页视觉一致', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 等待 Hero 标题可见，确保首屏渲染完成
    await page.waitForSelector('h1', { state: 'visible', timeout: 15000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot(
      'landing.png',
      {
        ...VISUAL_THRESHOLD,
        fullPage: true,
      }
    )
  })

  test('落地页关键元素存在', async ({ page }) => {
    // 降级保护：视觉对比不稳定时仍保证关键元素存在
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('h1', { state: 'visible', timeout: 15000 })

    // Hero 标题
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()

    // Features 锚点
    const features = page.locator('#features').first()
    await expect(features).toBeVisible()

    // Footer
    const footer = page.locator('footer').first()
    await expect(footer).toBeVisible()
  })
})
