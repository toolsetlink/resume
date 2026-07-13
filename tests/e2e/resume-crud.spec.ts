// 简历 CRUD 完整流程 E2E 测试 - 自由简历项目
import { test, expect } from '@playwright/test'

// 获取 dashboard 中简历卡片的数量
// 每行简历有 1 个「删除」按钮（隐藏但 DOM 存在），用按钮数量计数
async function getResumeCount(page: import('@playwright/test').Page): Promise<number> {
  return await page.getByRole('button', { name: /删除|delete/i }).count()
}

// 等待 dashboard 列表稳定
async function waitForDashboardReady(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  // 等待 h1 标题出现，表示页面已渲染
  await page.waitForSelector('h1', { timeout: 15000 })
}

test.describe('简历 CRUD', () => {
  test.beforeEach(async ({ page, context }) => {
    // 锁中文 locale，避免 Chromium 默认 Accept-Language 跳 /en/dashboard
    await context.addCookies([{ name: 'NEXT_LOCALE', value: 'zh', domain: 'localhost', path: '/' }])
    // 先访问根路径（i18n 默认中文，不会带前缀），确保浏览器上下文已就绪
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // 清理 localStorage，避免之前测试的数据干扰
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  test('初始为空时点击创建简历按钮跳转工作台', async ({ page }) => {
    // 访问 dashboard（默认中文无前缀）
    await page.goto('/dashboard')
    await waitForDashboardReady(page)

    // 由于 localStorage 已清空且 initialize() 会创建一份示例简历，
    // 此时 dashboard 应有简历卡片存在；点击顶部「创建简历」按钮创建新简历
    const createBtn = page.getByRole('button', { name: /创建简历|create/i })
    await createBtn.first().click()

    // 验证跳转到工作台
    await page.waitForURL(/\/workbench\?id=/, { timeout: 15000 })
    expect(page.url()).toMatch(/\/workbench\?id=/)
  })

  test('创建简历后返回 dashboard 新简历出现在列表', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForDashboardReady(page)

    const initialCount = await getResumeCount(page)

    // 点击创建简历
    const createBtn = page.getByRole('button', { name: /创建简历|create/i })
    await createBtn.first().click()
    await page.waitForURL(/\/workbench\?id=/, { timeout: 15000 })

    // 等待工作台渲染
    await page.waitForSelector('#resume-preview', { timeout: 15000 })

    // 返回 dashboard
    await page.goto('/dashboard')
    await waitForDashboardReady(page)

    const newCount = await getResumeCount(page)
    expect(newCount).toBe(initialCount + 1)
  })

  test('点击复制按钮后简历数量+1', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForDashboardReady(page)

    const initialCount = await getResumeCount(page)
    expect(initialCount).toBeGreaterThan(0)

    // 点击第一个简历卡片的「复制」按钮
    const duplicateBtn = page.getByRole('button', { name: /复制|duplicate/i })
    await duplicateBtn.first().click()

    // 等待列表更新（pinia 持久化是异步的）
    await page.waitForTimeout(300)
    await expect.poll(async () => await getResumeCount(page), {
      timeout: 5000,
    }).toBe(initialCount + 1)
  })

  test('点击删除按钮后简历数量-1', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForDashboardReady(page)

    const initialCount = await getResumeCount(page)
    expect(initialCount).toBeGreaterThan(0)

    const deleteBtn = page.getByRole('button', { name: /删除|delete/i })
    await deleteBtn.first().click()

    await page.waitForTimeout(300)
    await expect.poll(async () => await getResumeCount(page), {
      timeout: 5000,
    }).toBe(initialCount - 1)
  })

  test('刷新页面后简历数据保留（localStorage persist）', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForDashboardReady(page)

    const beforeCount = await getResumeCount(page)
    expect(beforeCount).toBeGreaterThan(0)

    // 刷新页面
    await page.reload()
    await waitForDashboardReady(page)

    const afterCount = await getResumeCount(page)
    expect(afterCount).toBe(beforeCount)

    // 进一步验证 localStorage 中确实持久化了 resume-storage
    const resumes = await page.evaluate(() => {
      const data = localStorage.getItem('resume-storage')
      return data ? JSON.parse(data) : null
    })
    expect(resumes).toBeTruthy()
    // zustand/middleware persist 把 state 整体存为 {state: {...}, version}
    // 兼容两种格式（有无 state 包装层）
    const stateRoot = (resumes as { state?: unknown }).state ?? resumes
    const list = (stateRoot as { resumes?: unknown[] }).resumes
    expect(Array.isArray(list)).toBeTruthy()
    expect((list as unknown[]).length).toBe(afterCount)
  })

  test('完整 CRUD 流程：创建 → 复制 → 删除', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForDashboardReady(page)

    // 1. 创建一份新简历
    const createBtn = page.getByRole('button', { name: /创建简历|create/i })
    await createBtn.first().click()
    await page.waitForURL(/\/workbench\?id=/, { timeout: 15000 })
    await page.waitForSelector('#resume-preview', { timeout: 15000 })

    // 2. 返回 dashboard
    await page.goto('/dashboard')
    await waitForDashboardReady(page)
    const countAfterCreate = await getResumeCount(page)

    // 3. 复制第一份
    const dupBtn = page.getByRole('button', { name: /复制|duplicate/i })
    await dupBtn.first().click()
    await expect.poll(async () => await getResumeCount(page), {
      timeout: 5000,
    }).toBe(countAfterCreate + 1)

    // 4. 删除第一份
    const delBtn = page.getByRole('button', { name: /删除|delete/i })
    await delBtn.first().click()
    await expect.poll(async () => await getResumeCount(page), {
      timeout: 5000,
    }).toBe(countAfterCreate)
  })
})
