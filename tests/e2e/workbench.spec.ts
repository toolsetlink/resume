// 工作台编辑→预览闭环 E2E 测试 - 自由简历项目
import { test, expect } from '@playwright/test'

// 等待工作台就绪：预览容器出现
async function waitForWorkbenchReady(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('#resume-preview', { timeout: 20000 })
  // 等待预览中渲染模板内容（professional 模板的 BaseInfo 含 .professional-base-info）
  await page.waitForSelector('.professional-base-info, .modern-base-info, .elegant-base-info, .creative-base-info', {
    timeout: 15000,
  })
}

// 通过 dashboard 创建简历并进入工作台
async function createResumeAndEnterWorkbench(page: import('@playwright/test').Page) {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('h1', { timeout: 15000 })
  const createBtn = page.getByRole('button', { name: /创建简历|create/i })
  await createBtn.first().click()
  await page.waitForURL(/\/workbench\/.+/, { timeout: 15000 })
  await waitForWorkbenchReady(page)
}

// 通过标签文本定位 BasicInfoPanel 中的字段 input
// TDesign 渲染结构：<div class="t-form__item">
//                     <div class="t-form__label"><label>姓名</label></div>
//                     <div class="t-form__controls">...<input class="t-input__inner"/></div>
//                   </div>
function getFieldInput(page: import('@playwright/test').Page, labelText: string) {
  return page
    .locator('.t-form__item:has(label:has-text("' + labelText + '"))')
    .first()
    .locator('input')
    .first()
}

// 在工作台输入某字段并触发 @blur 提交
async function fillFieldAndCommit(
  page: import('@playwright/test').Page,
  labelText: string,
  value: string
) {
  const input = getFieldInput(page, labelText)
  await input.waitFor({ state: 'visible', timeout: 10000 })
  await input.fill('')
  await input.fill(value)
  // BasicInfoPanel 用 @blur 提交，blur 后 commitBasicInfo 触发 store 更新
  await input.blur()
}

test.describe('工作台编辑→预览闭环', () => {
  test.beforeEach(async ({ page }) => {
    // 先访问根路径，确保浏览器上下文已就绪
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // 清理 localStorage，避免之前测试的数据干扰
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
    // 由于 activeSection 默认为 basic，EditPanel 会渲染 BasicInfoPanel
    const layoutTitle = page.locator('h3', { hasText: '布局' })
    await expect(layoutTitle.first()).toBeVisible()
  })

  test('编辑姓名后预览同步更新', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    // 输入姓名（新建简历 basic.name 初始为空，预览中 .name 元素 v-if 不渲染）
    await fillFieldAndCommit(page, '姓名', '测试用户张三')

    // 等待预览中出现新姓名（professional 模板 BaseInfo 中 .name 渲染姓名）
    const preview = page.locator('#resume-preview')
    await expect(preview.locator('.name', { hasText: '测试用户张三' })).toBeVisible({
      timeout: 5000,
    })
  })

  test('切换主题色后预览生效', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    // 先输入姓名，否则 .name 元素 v-if 不渲染，无法校验颜色
    await fillFieldAndCommit(page, '姓名', '测试用户张三')
    await expect(page.locator('#resume-preview .name')).toBeVisible({ timeout: 5000 })

    // WorkbenchHeader 按钮顺序：0 返回 / 1 toggle-sidebar / 2 template-switcher / 3 theme-color / 4 settings / 5 导出
    // tooltip 内容由 TDesign 通过 portal 渲染到 body，无法用 :has-text 选中按钮
    const headerButtons = page.locator('.workbench-header button')
    const themeBtn = headerButtons.nth(3)
    await themeBtn.click()

    // 等待主题色对话框打开（ThemeColorPopover 使用 t-dialog，header 含「主题色」）
    const dialog = page.locator('.t-dialog').filter({ hasText: '主题色' })
    await dialog.waitFor({ state: 'visible', timeout: 5000 })

    // 选取一个不同于默认黑色 (#000000) 的预设色
    // THEME_COLORS 中第 8 个为 '#0047AB'（蓝色）
    const targetColor = '#0047AB'
    const colorBtn = dialog.locator('button[title="' + targetColor + '"]').first()
    await colorBtn.waitFor({ state: 'visible', timeout: 5000 })
    await colorBtn.click()

    // 等待预览中姓名颜色变为该主题色（BaseInfo 的 .name 用 inline style: color = themeColor）
    const nameEl = page.locator('#resume-preview .name').first()
    // 校验 inline color 匹配（rgb 形式）
    await expect.poll(
      async () => {
        return await nameEl.evaluate((el) => {
          const style = window.getComputedStyle(el)
          // 优先读 inline style.color（来自 :style="nameStyle"），否则读 computed
          return (el as HTMLElement).style.color || style.color
        })
      },
      { timeout: 8000 }
    ).toMatch(/rgb\s*\(\s*0\s*,\s*71\s*,\s*171\s*\)|#0047ab/i)
  })

  test('切换模板后预览仍可见', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    // WorkbenchHeader 按钮顺序：0 返回 / 1 toggle-sidebar / 2 template-switcher / 3 theme-color / 4 settings / 5 导出
    const headerButtons = page.locator('.workbench-header button')
    const tplBtn = headerButtons.nth(2)
    await tplBtn.click()

    // 等待 TemplateSwitcher 对话框（t-dialog），header 为「模板选择」
    const dialog = page.locator('.t-dialog').filter({ hasText: '模板选择' })
    await dialog.waitFor({ state: 'visible', timeout: 5000 })

    // 选择「现代极简」模板（modernConfig.id === 'modern'）
    // 模板卡片中包含模板名称文本
    const modernCard = dialog.locator('.template-card:has-text("现代极简")').first()
    await modernCard.waitFor({ state: 'visible', timeout: 5000 })
    await modernCard.click()

    // 模板切换会触发 store 更新与预览重渲染，等待预览中 modern 模板根节点出现
    const modernRoot = page.locator('#resume-preview .modern-template')
    await expect(modernRoot.first()).toBeVisible({ timeout: 8000 })
  })

  test('工作台返回按钮回到 dashboard', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    // WorkbenchHeader 左侧返回按钮（第一个 button，含 ArrowLeft 图标）
    const header = page.locator('.workbench-header').first()
    const backBtn = header.locator('button').first()
    await backBtn.click()

    // 验证回到 dashboard
    await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 10000 })
    expect(page.url()).toMatch(/\/dashboard/)
  })

  test('左侧模块导航标题显示为"模块"', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    // SectionAccordion 顶部标题应显示"模块"（术语规范化）
    const heading = page.locator('h2', { hasText: '模块' })
    await expect(heading.first()).toBeVisible()
  })
})
