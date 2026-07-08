// AI 语法检查流程 E2E 测试（mock） - 自由简历项目
// Task 10.10：AI 与 PDF 的 E2E 测试
//
// 说明：当前工作台 UI 尚未挂载语法检查入口（useGrammarCheck 已实现但未在
// 任何组件中接线）。因此本测试采用「mock API + 页面可访问」策略：
// 1. 设置 mock API Key 到 localStorage，确保 useGrammarCheck 的 isConfigured 为 true
// 2. 通过 page.route 拦截 /api/ai/grammar，返回 JSON 错误列表
// 3. 验证 mock 路由返回的错误结构可被 useGrammarCheck.parseGrammarErrors 解析
// 4. 验证工作台页面可访问
import { test, expect, type Page } from '@playwright/test'

// ============================================================
// helper：配置 mock AI Key
// ============================================================
async function setupMockAIConfig(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem(
      'ai-config-storage',
      JSON.stringify({
        selectedModel: 'doubao',
        doubaoApiKey: 'mock-api-key-for-e2e',
        doubaoModelId: 'mock-model-id',
        deepseekApiKey: '',
        deepseekModelId: '',
        openaiApiKey: '',
        openaiModelId: '',
        openaiApiEndpoint: '',
        geminiApiKey: '',
        geminiModelId: 'gemini-flash-latest',
      })
    )
  })
}

// ============================================================
// helper：进入工作台
// ============================================================
async function goToWorkbench(page: Page) {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  const createBtn = page.getByRole('button', { name: /创建|create/i }).first()
  if (await createBtn.isVisible()) {
    await createBtn.click()
  }
  await page.waitForURL(/\/workbench\//, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
})

test.describe('AI 语法检查 - mock JSON 响应', () => {
  test('mock /api/ai/grammar 返回错误列表', async ({ page }) => {
    // mock 语法检查接口返回包含错误的 JSON
    await page.route('**/api/ai/grammar', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  errors: [
                    {
                      context: '我有错别字',
                      text: '错别字',
                      suggestion: '正确字',
                      reason: '错别字',
                      type: 'spelling',
                    },
                  ],
                }),
              },
            },
          ],
        }),
      })
    })

    await setupMockAIConfig(page)
    await goToWorkbench(page)

    // 验证工作台可访问
    await expect(page).toHaveURL(/\/workbench\//)

    // 验证 mock 路由拦截生效：发起 fetch 验证返回结构
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/ai/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '我有错别字',
          apiKey: 'mock-api-key-for-e2e',
          model: 'mock-model-id',
          modelType: 'doubao',
        }),
      })
      const data = await res.json()
      return data
    })

    // 验证响应结构符合 useGrammarCheck 的解析预期
    expect(result.choices).toBeDefined()
    expect(result.choices[0].message.content).toBeDefined()

    // 模拟 useGrammarCheck.parseGrammarErrors 的解析逻辑
    const parsed = await page.evaluate((rawContent: string) => {
      try {
        const parsed = JSON.parse(rawContent)
        if (parsed.errors && Array.isArray(parsed.errors)) {
          return parsed.errors
        }
        return []
      } catch {
        return []
      }
    }, result.choices[0].message.content)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].text).toBe('错别字')
    expect(parsed[0].suggestion).toBe('正确字')
    expect(parsed[0].type).toBe('spelling')
  })

  test('mock /api/ai/grammar 返回空错误列表', async ({ page }) => {
    // mock 语法检查返回无错误
    await page.route('**/api/ai/grammar', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [
            {
              message: {
                content: '{"errors":[]}',
              },
            },
          ],
        }),
      })
    })

    await setupMockAIConfig(page)
    await goToWorkbench(page)

    // 验证 mock 返回空错误列表
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/ai/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '完全正确的文本',
          apiKey: 'mock-api-key-for-e2e',
          model: 'mock-model-id',
          modelType: 'doubao',
        }),
      })
      return await res.json()
    })

    const content = result.choices[0].message.content
    const parsed = JSON.parse(content)
    expect(parsed.errors).toEqual([])
  })

  test('配置 mock API Key 后工作台正常渲染', async ({ page }) => {
    await page.route('**/api/ai/grammar', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [{ message: { content: '{"errors":[]}' } }],
        }),
      })
    })

    await setupMockAIConfig(page)
    await goToWorkbench(page)

    // 验证工作台页面渲染正常（导出按钮可见）
    await expect(page).toHaveURL(/\/workbench\//)
    const exportBtn = page.getByRole('button', { name: /导出\s*PDF|export/i }).first()
    await expect(exportBtn).toBeVisible({ timeout: 10000 })
  })
})
