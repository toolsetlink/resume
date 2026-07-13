// 模板视觉回归测试 - 自由简历项目
// 所有模板都通过 /workbench/[id] 渲染（<PaginatedResumePreview> 集成）。
//
// 本套件覆盖：
//   - 4 套模板的「关键 DOM 元素」存在（test.toMatch — 永远不需要 snapshot 重生成）
//   - 4 套模板 + 落地页「视觉一致」snapshot 测试 mark 为 skip，等下次决定 baseline 策略时启用
import { test, expect, type Page } from '@playwright/test'

// TEMPLATE_IDS 只用做类型（typeof TEMPLATE_IDS[number]），不作为值使用。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEMPLATE_IDS = ['professional', 'modern', 'elegant', 'creative'] as const

// 模板根节点 selector：基于 data-template 属性
const TEMPLATE_ROOT_SELECTOR: Record<string, string> = {
  professional: '[data-template="professional"]',
  modern: '[data-template="modern"]',
  elegant: '[data-template="elegant"]',
  creative: '[data-template="creative"]',
}

async function waitForWorkbenchReady(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('#resume-preview', { timeout: 20000 })
  await page.waitForSelector('#resume-preview .professional-base-info', { timeout: 15000 })
}

async function switchTemplate(page: Page, templateId: typeof TEMPLATE_IDS[number]) {
  // 打开 TemplateSwitcher（WorkbenchHeader 第 3 个 button）
  await page.locator('header button').nth(2).click()
  const drawer = page.locator('.ant-drawer-section').first()
  await expect(drawer).toBeVisible({ timeout: 5000 })
  // 点击对应模板卡片（用 template 名定位）
  const card = drawer.locator(':text("' + templateDisplayName(templateId) + '")').first()
  await expect(card).toBeVisible({ timeout: 5000 })
  await card.click()
  // 等待 root data-template 切换完成
  const newRoot = page.locator('#resume-preview ' + TEMPLATE_ROOT_SELECTOR[templateId]).first()
  await expect(newRoot).toBeVisible({ timeout: 8000 })
}

// 模板显示名（zh），与 messages/zh.json 的 templates.X.name 对齐
function templateDisplayName(id: typeof TEMPLATE_IDS[number]): string {
  const names: Record<typeof TEMPLATE_IDS[number], string> = {
    professional: '专业简约',
    modern: '现代极简',
    elegant: '优雅经典',
    creative: '创意活泼',
  }
  return names[id]
}

test.describe('模板视觉回归', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => localStorage.clear())
  })

  test('professional 模板包含关键 DOM 元素', async ({ page }) => {
    await enterWorkbench(page)
    await expect(page.locator('#resume-preview ' + TEMPLATE_ROOT_SELECTOR.professional).first()).toBeVisible()
    const text = (await page.locator('#resume-preview').textContent()) ?? ''
    expect(text.trim().length).toBeGreaterThan(0)
  })

  test('modern 模板包含关键 DOM 元素', async ({ page }) => {
    await enterWorkbench(page)
    await switchTemplate(page, 'modern')
    await expect(page.locator('#resume-preview ' + TEMPLATE_ROOT_SELECTOR.modern).first()).toBeVisible()
  })

  test('elegant 模板包含关键 DOM 元素', async ({ page }) => {
    await enterWorkbench(page)
    await switchTemplate(page, 'elegant')
    await expect(page.locator('#resume-preview ' + TEMPLATE_ROOT_SELECTOR.elegant).first()).toBeVisible()
  })

  test('creative 模板包含关键 DOM 元素', async ({ page }) => {
    await enterWorkbench(page)
    await switchTemplate(page, 'creative')
    await expect(page.locator('#resume-preview ' + TEMPLATE_ROOT_SELECTOR.creative).first()).toBeVisible()
  })

  // 视觉 snapshot 暂时跳过：等下次决定 baseline 策略时启用。
  // 重新生成 baseline 的步骤：
  //   1. 跑 `pnpm exec playwright test --update-snapshots tests/e2e/visual/templates.spec.ts`
  //   2. 人工 review 生成的 baseline 后 commit
  test.skip('professional 模板 snapshot 视觉一致', () => {})
  test.skip('modern 模板 snapshot 视觉一致', () => {})
  test.skip('elegant 模板 snapshot 视觉一致', () => {})
  test.skip('creative 模板 snapshot 视觉一致', () => {})
})

async function enterWorkbench(page: Page) {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('h1', { timeout: 15000 })
  await page.getByRole('button', { name: /创建简历/ }).first().click()
  await page.waitForURL(/\/workbench\?id=/, { timeout: 15000 })
  await waitForWorkbenchReady(page)
}

test.describe('落地页视觉回归', () => {
  test('中文落地页视觉一致', async () => {
    test.skip(true, '见文件顶部注释：等下次决定 baseline 策略时手动启用')
  })

  test('落地页关键元素存在', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('h1', { state: 'visible', timeout: 15000 })

    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()

    const features = page.locator('#features').first()
    await expect(features).toBeVisible()

    const footer = page.locator('footer').first()
    await expect(footer).toBeVisible()
  })
})
