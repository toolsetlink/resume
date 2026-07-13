// PDF 导出流程 E2E 测试 - 自由简历项目
//
// 说明：客户端 PDF 导出使用 window.print() 方案，E2E 中验证按钮存在 + 点击后页面正常：
// 1. 进入工作台
// 2. 验证「导出 PDF」按钮存在
// 3. 点击「导出 PDF」按钮（直接触发客户端导出，无对话框）
// 4. 验证页面正常（无崩溃），不出现旧的对话框元素
// 5. 不实际验证浏览器下载行为
import { test, expect, type Page } from '@playwright/test'

// ============================================================
// helper：进入工作台
// ============================================================
async function goToWorkbench(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())

  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  const createBtn = page.getByRole('button', { name: /创建|create/i }).first()
  if (await createBtn.isVisible()) {
    await createBtn.click()
  }
  await page.waitForURL(/\/workbench(?:\?id=[^&]*)?/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
})

test.describe('PDF 导出', () => {
  test('工作台显示「导出 PDF」按钮', async ({ page }) => {
    await goToWorkbench(page)

    // WorkbenchHeader 中有「导出 PDF」按钮
    const exportBtn = page.getByRole('button', { name: /导出|export/i }).first()
    await expect(exportBtn).toBeVisible({ timeout: 10000 })
  })

  test('点击「导出 PDF」按钮直接触发导出（无对话框）', async ({ page }) => {
    await goToWorkbench(page)

    const exportBtn = page.getByRole('button', { name: /导出|export/i }).first()
    await expect(exportBtn).toBeVisible({ timeout: 10000 })
    await exportBtn.click()

    // 验证不出现旧的 PdfExport 对话框元素（.export-card）
    const exportCards = page.locator('.export-card')
    await expect(exportCards).toHaveCount(0)

    // 页面仍应正常（无崩溃）
    await expect(page).toHaveURL(/\/workbench(?:\?id=[^&]*)?/)
  })
})
