// 工作台编辑→预览闭环 E2E 测试 - 自由简历项目
import { test, expect } from '@playwright/test'

/**
 * 等待工作台就绪：可见预览容器出现且模板已渲染（BaseInfo 含 `${template.id}-base-info`）。
 *
 * 注意：PaginatedResumePreview 同时挂了一个 `visibility: hidden` 的测量 div（用于分页计算），
 * 里面也包含 `${template.id}-base-info`。所以等待必须 scope 到 `#resume-preview` 内，
 * 不然 `.first()` 命中的是隐藏的测量 div，`state: 'visible'` 永远不达标。
 */
async function waitForWorkbenchReady(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('#resume-preview', { timeout: 20000 })
  await page.waitForSelector(
    '#resume-preview .professional-base-info,' +
      ' #resume-preview .modern-base-info,' +
      ' #resume-preview .elegant-base-info,' +
      ' #resume-preview .creative-base-info',
    { timeout: 15000 }
  )
}

// 通过 dashboard 创建简历并进入工作台
async function createResumeAndEnterWorkbench(page: import('@playwright/test').Page) {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('h1', { timeout: 15000 })
  // Ant Button "创建简历" 文本（messages/zh.json: resume.create = "创建简历"）
  const createBtn = page.getByRole('button', { name: /创建简历/ })
  await createBtn.first().click()
  await page.waitForURL(/\/workbench\/.+/, { timeout: 15000 })
  await waitForWorkbenchReady(page)
}

/**
 * 定位 BasicInfoPanel 中指定 label 文本对应的 input。
 *
 * Ant Form 结构（6.x）：<div class="ant-form-item"><label>姓名</label>
 *   <div class="ant-form-item-control"><input class="ant-input"/></div></div>
 *
 * 退化策略：兼容 Form 用 FormItem 包裹但无 .ant-form-item 的情况（直接找 label 内的 input）。
 */
function getFieldInput(page: import('@playwright/test').Page, labelText: string) {
  // 优先用 ant-form-item：精确匹配
  const antItem = page
    .locator('.ant-form-item')
    .filter({ has: page.locator(`label:has-text("${labelText}")`) })
  // 退化：直接找 label 的最近 input
  return antItem
    .first()
    .locator('input')
    .first()
}

// 在工作台输入某字段并触发 onBlur 提交
async function fillFieldAndCommit(
  page: import('@playwright/test').Page,
  labelText: string,
  value: string
) {
  const input = getFieldInput(page, labelText)
  await input.waitFor({ state: 'visible', timeout: 10000 })
  await input.fill('')
  await input.fill(value)
  // BasicInfoPanel 用 onBlur 提交：blur 后 store 更新
  await input.blur()
}

test.describe('工作台编辑→预览闭环', () => {
  test.beforeEach(async ({ page, context }) => {
    // 锁定中文 locale：next-intl 默认按 Accept-Language 探测，Chromium 是 en-US 会跳 /en/dashboard
    await context.addCookies([{
      name: 'NEXT_LOCALE',
      value: 'zh',
      domain: 'localhost',
      path: '/',
    }])
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  test('左侧编辑面板与右侧预览面板同时可见', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    // 右侧预览容器
    const preview = page.locator('#resume-preview')
    await expect(preview).toBeVisible()

    // 左侧编辑面板：BasicInfoPanel 中包含「布局」标题（中文）
    const layoutTitle = page.locator('h3', { hasText: '布局' })
    await expect(layoutTitle.first()).toBeVisible()
  })

  test('编辑姓名后预览同步更新', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    await fillFieldAndCommit(page, '姓名', '测试用户张三')

    // 预览中 .name 渲染姓名（BaseInfo 的 h1 带 className="name"）
    const preview = page.locator('#resume-preview')
    await expect(
      preview.locator('.name', { hasText: '测试用户张三' }).first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('切换主题色后预览生效', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    await fillFieldAndCommit(page, '姓名', '测试用户张三')
    await expect(page.locator('#resume-preview .name').first()).toBeVisible({ timeout: 5000 })

    // WorkbenchHeader 按钮顺序：
    //   0=back, 1=toggle-sidebar, 2=template-switcher, 3=theme-color, 4=settings, 5=export
    const headerButtons = page.locator('header button')
    const themeBtn = headerButtons.nth(3)
    await themeBtn.click()

    // ThemeColorPopover 是 Ant Popover，无 title 文本；用 .ant-popover-content 直接定
    const popover = page.locator('.ant-popover-content').first()
    await expect(popover).toBeVisible({ timeout: 5000 })

    // 读取当前 .name 的 inline color（baseline），再选一个不同色
    const nameEl = page.locator('#resume-preview .name').first()
    const beforeColor = await nameEl.evaluate((el) => (el as HTMLElement).style.color || '')

    // 选第 8 个 swatch（THEME_COLORS[7] = '#ca8a04'，与默认 #1f2937 不同）
    const swatches = popover.locator('button.rounded-full')
    const swatchCount = await swatches.count()
    expect(swatchCount).toBeGreaterThanOrEqual(8)
    await swatches.nth(7).click()

    // 等待预览中姓名颜色变化
    await expect
      .poll(
        async () => {
          return await nameEl.evaluate((el) => (el as HTMLElement).style.color || '')
        },
        { timeout: 8000 }
      )
      .not.toBe(beforeColor)
  })

  test('切换模板后预览仍可见', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    const headerButtons = page.locator('header button')
    const tplBtn = headerButtons.nth(2)
    await tplBtn.click()

    // TemplateSwitcher 是 Ant Drawer（title="选择模板"）
    const drawer = page.locator('.ant-drawer-section').first()
    await expect(drawer).toBeVisible({ timeout: 5000 })

    // 选「现代极简」（messages/zh.json: templates.modern = "现代极简"）
    const modernCard = drawer.locator(':text("现代极简")').first()
    await expect(modernCard).toBeVisible({ timeout: 5000 })
    await modernCard.click()

    // 模板切换后预览根节点 data-template 变为 modern
    const modernRoot = page.locator('#resume-preview [data-template="modern"]')
    await expect(modernRoot.first()).toBeVisible({ timeout: 8000 })
  })

  test('工作台返回按钮回到 dashboard', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    // WorkbenchHeader 第 1 个 button 是返回（带 ArrowLeft 图标 + aria-label="返回简历列表"）
    const backBtn = page.getByRole('button', { name: '返回简历列表' })
    await backBtn.click()

    // 验证回到 dashboard
    await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 10000 })
    expect(page.url()).toMatch(/\/dashboard/)
  })

  test('左侧模块导航标题显示为"模块"', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    // SectionAccordion 顶部 h2 用 t('editor.modules') = "模块"
    const heading = page.locator('h2', { hasText: '模块' })
    await expect(heading.first()).toBeVisible()
  })
})
