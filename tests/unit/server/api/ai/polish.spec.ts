// AI 润色 API 单元测试 - server/api/ai/polish.post.ts
// Task 10.8：Nitro API 路由单元测试
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'

// ============================================================
// mock h3 全局 API
// ============================================================
const mockSetResponseStatus = vi.fn()
const mockSetHeader = vi.fn()
const mockReadBody = vi.fn()
const mockCreateError = vi.fn((opts: any) => {
  const err = new Error(opts.statusMessage || 'Error') as any
  err.statusCode = opts.statusCode
  return err
})

vi.mock('h3', () => ({
  defineEventHandler: (handler: any) => handler,
  readBody: (...args: any[]) => mockReadBody(...args),
  setHeader: (...args: any[]) => mockSetHeader(...args),
  setResponseStatus: (...args: any[]) => mockSetResponseStatus(...args),
  createError: mockCreateError,
  isError: (err: any) => err && typeof err.statusCode === 'number',
}))

// 源码（polish.post.ts 等）依赖 Nitro 自动注入的全局变量（无显式 import），
// vitest 单独运行时需手动挂到 globalThis，确保源码模块求值时能解析到这些标识符。
;(globalThis as any).defineEventHandler = (handler: any) => handler
;(globalThis as any).readBody = (...args: any[]) => mockReadBody(...args)
;(globalThis as any).setHeader = (...args: any[]) => mockSetHeader(...args)
;(globalThis as any).setResponseStatus = (...args: any[]) =>
  mockSetResponseStatus(...args)
;(globalThis as any).createError = mockCreateError
;(globalThis as any).isError = (err: any) =>
  err && typeof err.statusCode === 'number'

// ============================================================
// mock Gemini 模块
// ============================================================
const mockGenerateContentStream = vi.fn()
const mockGetGeminiModelInstance = vi.fn().mockReturnValue({
  generateContentStream: mockGenerateContentStream,
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
// 导入 handler
// 注意：源码使用 Nitro 自动注入的全局变量（defineEventHandler 等），
// vitest 单独运行时不会注入。上面已将全局变量挂到 globalThis，
// 但 ES 模块的静态 import 会在赋值之前就被求值（hoisting），
// 因此这里使用动态 import 在 beforeAll 中加载，确保 globalThis 已就绪。
// ============================================================
let handler: any

beforeAll(async () => {
  const mod = await import('~server/api/ai/polish.post')
  handler = mod.default
})

// ============================================================
// 测试辅助
// ============================================================
const event = {} as any

function setBody(body: any) {
  mockReadBody.mockResolvedValue(body)
}

// 读取 ReadableStream 全部 chunk 并拼成字符串
async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let done = false
  while (!done) {
    const { done: d, value } = await reader.read()
    if (d) {
      done = true
      break
    }
    if (value) chunks.push(value)
  }
  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const merged = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    merged.set(c, offset)
    offset += c.length
  }
  return new TextDecoder().decode(merged)
}

// 构造一个返回 SSE chunks 的 mock Response
function buildSSEResponse(chunks: string[], opts: { ok?: boolean } = {}) {
  const encoder = new TextEncoder()
  const reader = {
    read: vi.fn(),
  }
  let idx = 0
  for (const chunk of chunks) {
    reader.read.mockResolvedValueOnce({
      done: false,
      value: encoder.encode(chunk),
    })
    idx++
  }
  reader.read.mockResolvedValueOnce({ done: true })

  return {
    ok: opts.ok ?? true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    body: {
      getReader: () => reader,
    },
  }
}

describe('polish.post - 参数校验', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContentStream.mockReset()
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

  it('content 为空字符串触发参数校验返回 400 + "缺少必要参数"', async () => {
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

  it('content 为纯空白返回 400 + "内容不能为空"', async () => {
    // 纯空白字符串非空，能通过第一道 !content 校验，
    // 随后 !content.trim() 为 true，返回 "内容不能为空"。
    setBody({
      apiKey: 'k',
      model: 'm',
      content: '   \n\t ',
      modelType: 'doubao',
    })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: '内容不能为空' })
  })
})

describe('polish.post - SSE 响应头', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContentStream.mockReset()
  })

  it('成功路径设置 SSE 响应头', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'doubao',
    })
    mockFetchResponse({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: vi.fn().mockResolvedValueOnce({ done: true }),
        }),
      },
    })

    await handler(event)

    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'Content-Type',
      'text/event-stream'
    )
    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'Cache-Control',
      'no-cache, no-transform'
    )
    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'Connection',
      'keep-alive'
    )
    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'X-Accel-Buffering',
      'no'
    )
  })
})

describe('polish.post - 返回 ReadableStream', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContentStream.mockReset()
  })

  it('返回 ReadableStream 实例', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'doubao',
    })
    mockFetchResponse({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: vi.fn().mockResolvedValueOnce({ done: true }),
        }),
      },
    })

    const result = await handler(event)
    expect(result).toBeInstanceOf(ReadableStream)
  })
})

describe('polish.post - OpenAI 兼容流式路径', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContentStream.mockReset()
  })

  it('解析 SSE delta 并写入下游流', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: '优化我的简历',
      modelType: 'doubao',
    })

    const sseChunks = [
      'data: {"choices":[{"delta":{"content":"hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      'data: [DONE]\n\n',
    ]
    mockFetchResponse(buildSSEResponse(sseChunks))

    const stream = (await handler(event)) as ReadableStream<Uint8Array>
    const text = await readStream(stream)

    expect(text).toBe('hello world')
  })

  it('忽略空行与非 data: 行', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'doubao',
    })

    const sseChunks = [
      ': heartbeat\n\n',
      '\n',
      'data: {"choices":[{"delta":{"content":"only"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":""}}]}\n\n',
      'data: [DONE]\n\n',
    ]
    mockFetchResponse(buildSSEResponse(sseChunks))

    const stream = (await handler(event)) as ReadableStream<Uint8Array>
    const text = await readStream(stream)
    expect(text).toBe('only')
  })

  it('上游 !ok 时将错误信息写入流', async () => {
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
      body: null,
    })

    const stream = (await handler(event)) as ReadableStream<Uint8Array>
    const text = await readStream(stream)
    expect(text).toBe('rate limit exceeded')
  })

  it('上游无 body 时写入错误信息', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'doubao',
    })
    mockFetchResponse({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
      body: null,
    })

    const stream = (await handler(event)) as ReadableStream<Uint8Array>
    const text = await readStream(stream)
    expect(text).toBe('上游请求失败 (200)')
  })
})

describe('polish.post - Gemini 流式路径', () => {
  beforeEach(() => {
    mockReadBody.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
    mockGetGeminiModelInstance.mockClear()
    mockGenerateContentStream.mockReset()
  })

  it('gemini 路径调用 getGeminiModelInstance 并流式写入', async () => {
    setBody({
      apiKey: 'gem-key',
      model: 'gemini-1.5-pro',
      content: '优化这段',
      modelType: 'gemini',
      customInstructions: '更简洁',
    })

    // 模拟 generateContentStream 返回的 stream 迭代器
    const streamIter = {
      async *[Symbol.asyncIterator]() {
        yield { text: () => '优化后' }
        yield { text: () => '的内容' }
      },
    }
    mockGenerateContentStream.mockResolvedValue({ stream: streamIter })

    const stream = (await handler(event)) as ReadableStream<Uint8Array>
    const text = await readStream(stream)

    expect(mockGetGeminiModelInstance).toHaveBeenCalledTimes(1)
    expect(mockGetGeminiModelInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'gem-key',
        model: 'gemini-1.5-pro',
      })
    )
    expect(mockGenerateContentStream).toHaveBeenCalledWith('优化这段')
    expect(text).toBe('优化后的内容')
  })

  it('Gemini 抛错时将错误信息写入流', async () => {
    setBody({
      apiKey: 'k',
      model: 'm',
      content: 'c',
      modelType: 'gemini',
    })
    mockGenerateContentStream.mockRejectedValue(
      new Error('gemini invalid key')
    )

    const stream = (await handler(event)) as ReadableStream<Uint8Array>
    const text = await readStream(stream)
    expect(text).toBe('gemini invalid key')
  })

  it('customInstructions 为空字符串时不附加补充要求', async () => {
    setBody({
      apiKey: 'gem-key',
      model: 'm',
      content: 'c',
      modelType: 'gemini',
      customInstructions: '   ',
    })
    const streamIter = {
      async *[Symbol.asyncIterator]() {
        yield { text: () => 'result' }
      },
    }
    mockGenerateContentStream.mockResolvedValue({ stream: streamIter })

    await handler(event)

    expect(mockGetGeminiModelInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        systemInstruction: expect.not.stringContaining('补充要求：'),
      })
    )
  })
})

// ============================================================
// mock fetch helper
// ============================================================
function mockFetchResponse(resp: any) {
  globalThis.fetch = vi.fn().mockResolvedValue(resp) as any
}
