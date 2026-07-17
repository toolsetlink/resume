// 工作台编辑→预览闭环 E2E 测试 - 自由简历项目
import { test, expect } from '@playwright/test'

/**
 * 等待工作台就绪：分页输出已经生成至少一张可见 A4 页面。
 * `.resume-pagination-source` 只负责测量且不可见，断言必须落在 output。
 */
async function waitForWorkbenchReady(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('#resume-preview', { timeout: 20000 })
  await page.waitForSelector('#resume-preview .resume-pagination-output > .a4-page', {
    state: 'visible',
    timeout: 15000,
  })
}

// 通过 dashboard 创建简历并进入工作台
async function createResumeAndEnterWorkbench(page: import('@playwright/test').Page) {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('h1', { timeout: 15000 })
  // Ant Button "创建简历" 文本（messages/zh.json: resume.create = "创建简历"）
  const createBtn = page.getByRole('button', { name: /创建简历/ })
  await createBtn.first().click()
  await page.waitForURL(/\/workbench\?id=/, { timeout: 15000 })
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
  test.beforeEach(async ({ page }) => {
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

    // 左侧编辑面板：BasicInfoPanel 中包含「基本信息」标题（中文）
    const basicTitle = page.locator('h3', { hasText: '基本信息' })
    await expect(basicTitle.first()).toBeVisible()
  })

  test('编辑内容在四套模板预览和打印态中完整保留', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    const editedValues = ['测试用户张三', '全栈工程师', 'resume-e2e@example.com', '13800001111', '上海']
    await fillFieldAndCommit(page, '姓名', editedValues[0])
    await fillFieldAndCommit(page, '职位', editedValues[1])
    await fillFieldAndCommit(page, '邮箱', editedValues[2])
    await fillFieldAndCommit(page, '电话', editedValues[3])
    await fillFieldAndCommit(page, '所在地', editedValues[4])

    const output = page.locator('#resume-preview .resume-pagination-output')
    const assertEditedValues = async () => {
      await expect.poll(async () => output.textContent(), { timeout: 8000 }).toContain(editedValues[0])
      const text = (await output.textContent()) || ''
      editedValues.forEach((value) => expect(text).toContain(value))
    }

    await assertEditedValues()

    const templates = [
      ['现代极简', 'modern'],
      ['优雅经典', 'elegant'],
      ['创意活泼', 'creative'],
      ['专业简约', 'professional'],
    ] as const

    for (const [displayName, templateId] of templates) {
      await page.getByRole('button', { name: '模板', exact: true }).click()
      const drawer = page.getByRole('dialog', { name: '选择模板' })
      await expect(drawer).toBeVisible({ timeout: 5000 })
      await drawer.getByText(displayName, { exact: true }).click()
      await expect(output.locator(`[data-template="${templateId}"]`).first()).toBeVisible({ timeout: 8000 })
      await assertEditedValues()
    }

    const pageCount = await output.locator(':scope > .a4-page').count()
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('#resume-preview .resume-pagination-source')).toBeHidden()
    expect(await output.locator(':scope > .a4-page').count()).toBe(pageCount)
    await assertEditedValues()

    await page.emulateMedia({ media: 'screen' })
    await page.evaluate(() => {
      window.print = () => {
        document.documentElement.dataset.pdfExportCalled = 'true'
        window.dispatchEvent(new Event('afterprint'))
      }
    })
    await page.getByRole('button', { name: '导出 PDF' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-pdf-export-called', 'true')
    expect(await output.locator(':scope > .a4-page').count()).toBe(pageCount)
    await assertEditedValues()
  })

  test('切换主题色后预览生效', async ({ page }) => {
    await createResumeAndEnterWorkbench(page)

    await fillFieldAndCommit(page, '姓名', '测试用户张三')
    await expect(page.locator('#resume-preview .resume-pagination-output .name').first()).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: '主题色', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: '主题色' })
    await expect(drawer).toBeVisible({ timeout: 5000 })

    // 读取当前 .name 的 inline color（baseline），再选一个不同色
    const nameEl = page.locator('#resume-preview .resume-pagination-output .name').first()
    const beforeColor = await nameEl.evaluate((el) => (el as HTMLElement).style.color || '')

    // 选第 8 个 swatch（THEME_COLORS[7] = '#ca8a04'，与默认 #1f2937 不同）
    await drawer.getByRole('button', { name: '#ca8a04' }).click()

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

    await page.getByRole('button', { name: '模板', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: '选择模板' })
    await expect(drawer).toBeVisible({ timeout: 5000 })

    const modernCard = drawer.getByText('现代极简', { exact: true })
    await expect(modernCard).toBeVisible({ timeout: 5000 })
    await modernCard.click()

    // 模板切换后预览根节点 data-template 变为 modern
    const modernRoot = page.locator('#resume-preview .resume-pagination-output [data-template="modern"]')
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

    // SectionAccordion 顶部 h2 使用 messages.editor.modules = "模块"
    const heading = page.locator('h2', { hasText: '模块' })
    await expect(heading.first()).toBeVisible()
  })

})
