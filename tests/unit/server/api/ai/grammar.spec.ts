// AI 语法检查 API 单元测试 - server/api/ai/grammar.post.ts
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

// 源码（grammar.post.ts 等）依赖 Nitro 自动注入的全局变量（无显式 import），
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
// 导入被测 handler（在所有 mock 之后）
// 注意：源码使用 Nitro 自动注入的全局变量（defineEventHandler 等），
// vitest 单独运行时不会注入。上面已将全局变量挂到 globalThis，
// 但 ES 模块的静态 import 会在赋值之前就被求值（hoisting），
// 因此这里使用动态 import 在 beforeAll 中加载，确保 globalThis 已就绪。
// ============================================================
let handler: any

beforeAll(async () => {
  const mod = await import('~server/api/ai/grammar.post')
  handler = mod.default
})

// ============================================================
// 测试辅助
// ============================================================
const event = {} as any

function setBody(body: any) {
  mockReadBody.mockResolvedValue(body)
}

function mockFetchResponse(resp: any) {
  globalThis.fetch = vi.fn().mockResolvedValue(resp) as any
}

function mockFetchError(err: Error) {
  globalThis.fetch = vi.fn().mockRejectedValue(err) as any
}

describe('grammar.post - 参数校验', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContent.mockReset()
  })

  it('缺 apiKey 返回 400', async () => {
    setBody({ model: 'm', content: 'c', modelType: 'doubao' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({
      error: '缺少必要参数（apiKey/model/content/modelType）',
    })
  })

  it('缺 model 返回 400', async () => {
    setBody({ apiKey: 'k', content: 'c', modelType: 'doubao' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({
      error: '缺少必要参数（apiKey/model/content/modelType）',
    })
  })

  it('缺 content 返回 400', async () => {
    setBody({ apiKey: 'k', model: 'm', modelType: 'doubao' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({
      error: '缺少必要参数（apiKey/model/content/modelType）',
    })
  })

  it('缺 modelType 返回 400', async () => {
    setBody({ apiKey: 'k', model: 'm', content: 'c' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({
      error: '缺少必要参数（apiKey/model/content/modelType）',
    })
  })
})

describe('grammar.post - 空内容处理', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
  })

  it('content 为空字符串触发参数校验返回 400', async () => {
    // 源码先检查 !content 再检查 !content.trim()，
    // 空字符串会被第一道校验拦截为 "缺少必要参数"。
    setBody({
      apiKey: 'k',
      model: 'm',
      content: '',
      modelType: 'doubao',
    })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({
      error: '缺少必要参数（apiKey/model/content/modelType）',
    })
  })

  it('content 为纯空白返回空 errors', async () => {
    // 纯空白字符串非空，能通过第一道 !content 校验，
    // 随后 !content.trim() 为 true，返回空 errors。
    setBody({
      apiKey: 'k',
      model: 'm',
      content: '   \n\t  ',
      modelType: 'doubao',
    })
    const result = await handler(event)
    expect(result).toEqual({
      choices: [{ message: { content: '{"errors":[]}' } }],
    })
    expect(mockSetResponseStatus).not.toHaveBeenCalled()
  })
})

describe('grammar.post - Gemini 路径', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContent.mockReset()
  })

  it('modelType=gemini 调用 getGeminiModelInstance 并返回正确结构', async () => {
    setBody({
      apiKey: 'gem-key',
      model: 'gemini-1.5-pro',
      content: '一段测试文本',
      modelType: 'gemini',
    })
    mockGenerateContent.mockResolvedValue({
      response: { text: () => '{"errors":[{"type":"spelling","text":"测"}]}' },
    })

    const result = await handler(event)

    expect(mockGetGeminiModelInstance).toHaveBeenCalledTimes(1)
    expect(mockGetGeminiModelInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'gem-key',
        model: 'gemini-1.5-pro',
      })
    )
    expect(mockGenerateContent).toHaveBeenCalledWith('一段测试文本')
    expect(result).toEqual({
      choices: [
        {
          message: {
            content: '{"errors":[{"type":"spelling","text":"测"}]}',
          },
        },
      ],
    })
  })
})

describe('grammar.post - OpenAI 兼容路径', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContent.mockReset()
  })

  it('doubao 路径调用 fetch 并返回正确结构', async () => {
    setBody({
      apiKey: 'db-key',
      model: 'doubao-model',
      content: '一段测试文本',
      modelType: 'doubao',
    })
    const upstreamData = {
      choices: [{ message: { content: '{"errors":[]}' } }],
    }
    mockFetchResponse({
      ok: true,
      json: async () => upstreamData,
      text: async () => JSON.stringify(upstreamData),
    })

    const result = await handler(event)

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(result).toEqual(upstreamData)
  })

  it('deepseek 路径调用 fetch', async () => {
    setBody({
      apiKey: 'ds-key',
      model: 'deepseek-chat',
      content: '一段测试',
      modelType: 'deepseek',
    })
    const upstreamData = {
      choices: [{ message: { content: '{"errors":[]}' } }],
    }
    mockFetchResponse({
      ok: true,
      json: async () => upstreamData,
      text: async () => '',
    })

    const result = await handler(event)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(result).toEqual(upstreamData)
  })

  it('上游 !ok 时返回 500 + error 消息', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'doubao',
    })
    mockFetchResponse({
      ok: false,
      status: 429,
      json: async () => ({}),
      text: async () => 'rate limit exceeded',
    })

    const result = await handler(event)

    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({ error: 'rate limit exceeded' })
  })

  it('上游 !ok 且无错误文本时使用状态码兜底', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'doubao',
    })
    mockFetchResponse({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => '',
    })

    const result = await handler(event)

    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({ error: '上游请求失败 (500)' })
  })
})

describe('grammar.post - 错误处理', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContent.mockReset()
  })

  it('Gemini 抛错时返回 500 + 错误消息', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'gemini',
    })
    mockGenerateContent.mockRejectedValue(new Error('Invalid API key'))

    const result = await handler(event)

    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({ error: 'Invalid API key' })
  })

  it('OpenAI 兼容 fetch 抛错时返回 500 + 错误消息', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'doubao',
    })
    mockFetchError(new Error('network error'))

    const result = await handler(event)

    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({ error: 'network error' })
  })

  it('非 Error 类型异常时使用兜底文案', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'doubao',
    })
    mockFetchError('string error' as any)

    const result = await handler(event)

    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({ error: '语法检查失败' })
  })
})
