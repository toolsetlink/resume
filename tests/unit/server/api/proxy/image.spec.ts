// 图片代理 API 单元测试 - server/api/proxy/image.get.ts
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

// 源码（image.get.ts 等）依赖 Nitro 自动注入的全局变量（无显式 import），
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
// 导入被测 handler
// 注意：源码使用 Nitro 自动注入的全局变量（defineEventHandler 等），
// vitest 单独运行时不会注入。上面已将全局变量挂到 globalThis，
// 但 ES 模块的静态 import 会在赋值之前就被求值（hoisting），
// 因此这里使用动态 import 在 beforeAll 中加载，确保 globalThis 已就绪。
// ============================================================
let handler: any

beforeAll(async () => {
  const mod = await import('~server/api/proxy/image.get')
  handler = mod.default
})

// ============================================================
// 测试辅助
// ============================================================
const event = {} as any

function setQuery(q: Record<string, any>) {
  mockGetQuery.mockReturnValue(q)
}

function mockFetchResponse(resp: any) {
  globalThis.fetch = vi.fn().mockResolvedValue(resp) as any
}

function mockFetchError(err: Error) {
  globalThis.fetch = vi.fn().mockRejectedValue(err) as any
}

describe('image.get - 参数校验', () => {
  beforeEach(() => {
    mockGetQuery.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
  })

  it('缺 url 返回 400 + "缺少 url 参数"', async () => {
    setQuery({})
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: '缺少 url 参数' })
  })

  it('url 为空字符串返回 400 + "缺少 url 参数"', async () => {
    setQuery({ url: '' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: '缺少 url 参数' })
  })

  it('url 为纯空白返回 400 + "缺少 url 参数"', async () => {
    setQuery({ url: '   ' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: '缺少 url 参数' })
  })

  it('url 非 URL 格式返回 400 + "url 参数格式不正确"', async () => {
    setQuery({ url: 'not-a-url' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: 'url 参数格式不正确' })
  })

  it('url 非 http/https 协议返回 400 + "仅支持 http/https 协议"', async () => {
    setQuery({ url: 'ftp://example.com/image.png' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: '仅支持 http/https 协议' })
  })

  it('url 为 file 协议返回 400 + "仅支持 http/https 协议"', async () => {
    setQuery({ url: 'file:///etc/passwd' })
    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 400)
    expect(result).toEqual({ error: '仅支持 http/https 协议' })
  })
})

describe('image.get - 成功路径', () => {
  beforeEach(() => {
    mockGetQuery.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
  })

  it('成功返回图片 buffer', async () => {
    setQuery({ url: 'https://example.com/photo.png' })
    const buf = new ArrayBuffer(10)
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) =>
          name === 'Content-Type' ? 'image/png' : null,
      },
      arrayBuffer: async () => buf,
    })

    const result = await handler(event)
    expect(result).toBe(buf)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    // 调用 fetch 时传入的 url 应是规范化后的字符串
    expect((globalThis.fetch as any).mock.calls[0][0]).toBe(
      'https://example.com/photo.png'
    )
  })

  it('设置 Content-Type（来自上游）', async () => {
    setQuery({ url: 'https://example.com/photo.jpg' })
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) =>
          name === 'Content-Type' ? 'image/jpeg' : null,
      },
      arrayBuffer: async () => new ArrayBuffer(4),
    })

    await handler(event)
    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'Content-Type',
      'image/jpeg'
    )
  })

  it('上游未返回 Content-Type 时兜底为 image/*', async () => {
    setQuery({ url: 'https://example.com/photo' })
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: {
        get: () => null,
      },
      arrayBuffer: async () => new ArrayBuffer(4),
    })

    await handler(event)
    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'Content-Type',
      'image/*'
    )
  })

  it('设置 CORS 头与 Cache-Control', async () => {
    setQuery({ url: 'https://example.com/photo.png' })
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: {
        get: () => 'image/png',
      },
      arrayBuffer: async () => new ArrayBuffer(4),
    })

    await handler(event)
    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'Cache-Control',
      'public, max-age=86400'
    )
    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'Access-Control-Allow-Origin',
      '*'
    )
    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'Access-Control-Allow-Methods',
      'GET, OPTIONS'
    )
    expect(mockSetHeader).toHaveBeenCalledWith(
      event,
      'Access-Control-Allow-Headers',
      '*'
    )
  })

  it('请求头携带 User-Agent / Accept / Referer', async () => {
    const url = 'https://example.com/photo.png'
    setQuery({ url })
    mockFetchResponse({
      ok: true,
      status: 200,
      headers: { get: () => 'image/png' },
      arrayBuffer: async () => new ArrayBuffer(4),
    })

    await handler(event)
    const fetchOpts = (globalThis.fetch as any).mock.calls[0][1]
    expect(fetchOpts.method).toBeUndefined() // 源码未显式设置 method，默认 GET
    expect(fetchOpts.headers['User-Agent']).toMatch(/Mozilla/)
    expect(fetchOpts.headers['Accept']).toBe('image/*,*/*;q=0.8')
    expect(fetchOpts.headers['Referer']).toBe('https://example.com/')
  })
})

describe('image.get - 上游错误处理', () => {
  beforeEach(() => {
    mockGetQuery.mockReset()
    mockSetResponseStatus.mockReset()
    mockSetHeader.mockReset()
  })

  it('上游 !ok 时返回上游状态码 + 错误信息', async () => {
    setQuery({ url: 'https://example.com/missing.png' })
    mockFetchResponse({
      ok: false,
      status: 404,
      headers: { get: () => null },
      arrayBuffer: async () => new ArrayBuffer(0),
    })

    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 404)
    expect(result).toEqual({ error: '上游图片请求失败 (404)' })
  })

  it('fetch 抛错时返回 500 + 错误消息', async () => {
    setQuery({ url: 'https://example.com/photo.png' })
    mockFetchError(new Error('network timeout'))

    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({ error: 'network timeout' })
  })

  it('非 Error 类型异常时返回 500 + "图片代理请求失败"', async () => {
    setQuery({ url: 'https://example.com/photo.png' })
    mockFetchError('string error' as any)

    const result = await handler(event)
    expect(mockSetResponseStatus).toHaveBeenCalledWith(event, 500)
    expect(result).toEqual({ error: '图片代理请求失败' })
  })
})
