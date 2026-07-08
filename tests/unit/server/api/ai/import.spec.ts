// AI 简历导入 API 单元测试 - server/api/ai/import.post.ts
// Task 10.8：Nitro API 路由单元测试
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'

// ============================================================
// mock h3 全局 API（Nitro 在运行时自动注入，vitest 单独运行时需要手动 mock）
// ============================================================
const mockSetResponseStatus = vi.fn()
const mockSetHeader = vi.fn()
const mockReadBody = vi.fn()
const mockGetQuery = vi.fn()
const mockCreateError = vi.fn((opts: any) => {
  const err = new Error(opts.statusMessage || 'Error') as any
  err.statusCode = opts.statusCode
  return err
})

vi.mock('h3', () => ({
  defineEventHandler: (handler: any) => handler,
  readBody: (...args: any[]) => mockReadBody(...args),
  getQuery: (...args: any[]) => mockGetQuery(...args),
  setHeader: (...args: any[]) => mockSetHeader(...args),
  setResponseStatus: (...args: any[]) => mockSetResponseStatus(...args),
  createError: mockCreateError,
  isError: (err: any) => err && typeof err.statusCode === 'number',
}))

// 源码（import.post.ts 等）依赖 Nitro 自动注入的全局变量（无显式 import），
// vitest 单独运行时需手动挂到 globalThis，确保源码模块求值时能解析到这些标识符。
;(globalThis as any).defineEventHandler = (handler: any) => handler
;(globalThis as any).readBody = (...args: any[]) => mockReadBody(...args)
;(globalThis as any).getQuery = (...args: any[]) => mockGetQuery(...args)
;(globalThis as any).setHeader = (...args: any[]) => mockSetHeader(...args)
;(globalThis as any).setResponseStatus = (...args: any[]) =>
  mockSetResponseStatus(...args)
;(globalThis as any).createError = mockCreateError
;(globalThis as any).isError = (err: any) =>
  err && typeof err.statusCode === 'number'

// ============================================================
// mock Gemini 模块（避免真实调用 Google API）
// ============================================================
const mockGenerateContent = vi.fn()
const mockGetGeminiModelInstance = vi.fn().mockReturnValue({
  generateContent: mockGenerateContent,
})

vi.mock('~server/utils/ai/gemini', () => ({
  getGeminiModelInstance: (...args: any[]) =>
    mockGetGeminiModelInstance(...args),
  formatGeminiErrorMessage: (error: unknown) => {
    const e = error as { message?: string }
    return e?.message || 'Gemini 请求失败'
  },
}))

// ============================================================
// 导入被测 handler
// 注意：源码使用 Nitro 自动注入的全局变量（defineEventHandler 等），
// vitest 单独运行时不会注入。上面已将全局变量挂到 globalThis，
// 但 ES 模块的静态 import 会在赋值之前就被求值（hoisting），
// 因此这里使用动态 import 在 beforeAll 中加载，确保 globalThis 已就绪。
// ============================================================
let handler: any

beforeAll(async () => {
  const mod = await import('~server/api/ai/import.post')
  handler = mod.default
})

// ============================================================
// 测试辅助
// ============================================================
const event = {} as any

function setBody(body: any) {
  mockReadBody.mockResolvedValue(body)
}

describe('import.post - 参数校验', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContent.mockReset()
  })

  it('缺 apiKey 返回 400', async () => {
    setBody({ model: 'gemini-1.5-pro', content: '简历文本' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: '缺少 API Key' })
  })

  it('缺 model 返回 400', async () => {
    setBody({ apiKey: 'k', content: '简历文本' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: '缺少模型 ID' })
  })

  it('缺 content 且无 images 返回 400', async () => {
    setBody({ apiKey: 'k', model: 'm' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: '必须提供 content 或 images' })
  })

  it('有 content 但 images 为空数组仍走文本路径调用 Gemini', async () => {
    setBody({ apiKey: 'k', model: 'm', content: '文本', images: [] })
    mockGenerateContent.mockResolvedValue({
      response: { text: () => '{"title":"简历"}' },
    })
    await handler(event)
    expect(mockGetGeminiModelInstance).toHaveBeenCalledTimes(1)
    expect(mockGenerateContent).toHaveBeenCalledTimes(1)
  })
})

describe('import.post - 解析路径', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContent.mockReset()
  })

  it('有 content 时调用 Gemini 并返回 { resume } 结构', async () => {
    setBody({ apiKey: 'k', model: 'm', content: '我的简历' })
    const parsed = { title: '张三-前端工程师', basic: { name: '张三' } }
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(parsed) },
    })

    const result = await handler(event)
    expect(mockGetGeminiModelInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'k',
        model: 'm',
      })
    )
    expect(mockGenerateContent).toHaveBeenCalledTimes(1)
    // parts 中应包含 content 文本
    const parts = mockGenerateContent.mock.calls[0][0]
    expect(Array.isArray(parts)).toBe(true)
    expect(parts.some((p: any) => p.text && p.text.includes('我的简历'))).toBe(
      true
    )
    expect(result).toEqual({ resume: parsed })
  })

  it('解析直接 JSON 返回 { resume: ... }', async () => {
    setBody({ apiKey: 'k', model: 'm', content: 'c' })
    const direct = { title: 'Direct JSON', skills: [] }
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(direct) },
    })

    const result = await handler(event)
    expect(result).toEqual({ resume: direct })
  })

  it('解析 ```json 代码块', async () => {
    setBody({ apiKey: 'k', model: 'm', content: 'c' })
    const block = { title: 'CodeBlock', education: [] }
    const wrapped = 'Some preamble\n```json\n' + JSON.stringify(block) + '\n```\nTrailer'
    mockGenerateContent.mockResolvedValue({
      response: { text: () => wrapped },
    })

    const result = await handler(event)
    expect(result).toEqual({ resume: block })
  })

  it('解析对象提取（{ ... }）', async () => {
    setBody({ apiKey: 'k', model: 'm', content: 'c' })
    const obj = { title: 'Object Extract', projects: [{ name: 'P1' }] }
    const wrapped = '解析结果如下：\n' + JSON.stringify(obj) + '\n以上为结果。'
    mockGenerateContent.mockResolvedValue({
      response: { text: () => wrapped },
    })

    const result = await handler(event)
    expect(result).toEqual({ resume: obj })
  })

  it('AI 返回无法解析时返回 500 + { error, raw }', async () => {
    setBody({ apiKey: 'k', model: 'm', content: 'c' })
    const raw = '这不是一段 JSON，也无法提取对象'
    mockGenerateContent.mockResolvedValue({
      response: { text: () => raw },
    })

    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({
      error: 'AI 返回内容无法解析为 JSON',
      raw,
    })
  })

  it('AI 返回空字符串时返回 500 + { error, raw }', async () => {
    setBody({ apiKey: 'k', model: 'm', content: 'c' })
    mockGenerateContent.mockResolvedValue({
      response: { text: () => '' },
    })

    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({
      error: 'AI 返回内容无法解析为 JSON',
      raw: '',
    })
  })
})

describe('import.post - 图片路径', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContent.mockReset()
  })

  it('仅 images 时构建 inlineData parts 并调用 Gemini', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      images: [
        { data: 'base64data', mimeType: 'image/png' },
        { data: 'b2', mimeType: 'image/jpeg' },
      ],
    })
    const parsed = { title: 'Img Resume' }
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(parsed) },
    })

    const result = await handler(event)
    const parts = mockGenerateContent.mock.calls[0][0]
    expect(Array.isArray(parts)).toBe(true)
    // 第一部分应是 "请解析以下简历图片：" 文本（仅无 content 时附加）
    expect(parts[0].text).toBe('请解析以下简历图片：')
    // 之后应是两个 inlineData part
    expect(parts[1].inlineData.mimeType).toBe('image/png')
    expect(parts[1].inlineData.data).toBe('base64data')
    expect(parts[2].inlineData.mimeType).toBe('image/jpeg')
    expect(result).toEqual({ resume: parsed })
  })
})

describe('import.post - 错误处理', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContent.mockReset()
  })

  it('Gemini 抛错时返回 500 + 错误消息', async () => {
    setBody({ apiKey: 'k', model: 'm', content: 'c' })
    mockGenerateContent.mockRejectedValue(new Error('Invalid API key'))

    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({ error: 'Invalid API key' })
  })
})
