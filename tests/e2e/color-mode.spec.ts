import { test, expect } from '@playwright/test'

const STORAGE_KEY = 'ziyou-resume-theme'

test('主题固定为亮色且不显示切换入口', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((key) => {
    localStorage.setItem(key, 'dark')
  }, STORAGE_KEY)

  await page.reload()

  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect(page.getByRole('button', { name: /切换到.*色模式/ })).toHaveCount(0)
})
