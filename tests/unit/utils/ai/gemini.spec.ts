// Gemini 服务端封装单元测试 - server/utils/ai/gemini.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'

// ============================================================
// mock 第三方依赖（必须在 import 源码之前）
// vitest 4 要求用作 constructor 的 mock 实现必须使用 function/class
// ============================================================

// 使用 vi.hoisted 确保 mock 引用在 mock 工厂中可用
const hoisted = vi.hoisted(() => ({
  // Gemini getGenerativeModel 的稳定 mock 引用
  mockGetGenerativeModel: vi.fn().mockReturnValue({
    generateContent: vi.fn(),
    generateContentStream: vi.fn(),
  }),
}))

vi.mock('@google/generative-ai', () => ({
  // 必须使用 function 而非箭头函数，否则 new 会抛 "is not a constructor"
  GoogleGenerativeAI: vi.fn().mockImplementation(function (apiKey: string) {
    return {
      getGenerativeModel: hoisted.mockGetGenerativeModel,
    }
  }),
}))

vi.mock('undici', () => ({
  ProxyAgent: vi.fn().mockImplementation(function (url: string) {
    return { __isProxyAgent: true, proxyUrl: url }
  }),
  setGlobalDispatcher: vi.fn(),
}))

// ============================================================
// 动态导入源码（确保 mock 先生效，并支持 resetModules 后重导）
// ============================================================
async function loadGeminiModule() {
  return await import('../../../../server/utils/ai/gemini')
}

async function loadUndiciMock() {
  const undici = await import('undici')
  return undici as {
    ProxyAgent: ReturnType<typeof vi.fn>
    setGlobalDispatcher: ReturnType<typeof vi.fn>
  }
}

async function loadGenerativeAIMock() {
  const gen = await import('@google/generative-ai')
  return gen as {
    GoogleGenerativeAI: ReturnType<typeof vi.fn>
  }
}

// ============================================================
// 清理 hoisted mock 调用记录的工具
// ============================================================
function clearMocks() {
  hoisted.mockGetGenerativeModel.mockClear()
}

describe('gemini.ts - getGeminiModelInstance', () => {
  beforeEach(async () => {
    vi.resetModules()
    delete process.env.HTTPS_PROXY
    delete process.env.https_proxy
    delete process.env.HTTP_PROXY
    delete process.env.http_proxy
    clearMocks()
  })

  it('使用 apiKey 构造 GoogleGenerativeAI', async () => {
    const { getGeminiModelInstance } = await loadGeminiModule()
    const { GoogleGenerativeAI } = await loadGenerativeAIMock()
    GoogleGenerativeAI.mockClear()

    const result = getGeminiModelInstance({
      apiKey: 'my-api-key',
      model: 'gemini-1.5-pro',
    })

    // 构造函数被调用一次，且传入 apiKey
    expect(GoogleGenerativeAI).toHaveBeenCalledTimes(1)
    expect(GoogleGenerativeAI).toHaveBeenCalledWith('my-api-key')

    // 返回了 getGenerativeModel 的结果
    expect(result).toBeDefined()
  })

  it('getGenerativeModel 接收 model 参数', async () => {
    const { getGeminiModelInstance } = await loadGeminiModule()
    await loadGenerativeAIMock()
    clearMocks()

    getGeminiModelInstance({
      apiKey: 'k',
      model: 'gemini-1.5-flash',
    })

    expect(hoisted.mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-1.5-flash' })
    )
  })

  it('getGenerativeModel 接收 systemInstruction 参数', async () => {
    const { getGeminiModelInstance } = await loadGeminiModule()
    await loadGenerativeAIMock()
    clearMocks()

    getGeminiModelInstance({
      apiKey: 'k',
      model: 'm',
      systemInstruction: '你是简历助手',
    })

    expect(hoisted.mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        systemInstruction: '你是简历助手',
      })
    )
  })

  it('getGenerativeModel 接收 generationConfig 参数', async () => {
    const { getGeminiModelInstance } = await loadGeminiModule()
    await loadGenerativeAIMock()
    clearMocks()

    const generationConfig = {
      responseMimeType: 'application/json',
      temperature: 0,
    }
    getGeminiModelInstance({
      apiKey: 'k',
      model: 'm',
      generationConfig,
    })

    expect(hoisted.mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ generationConfig })
    )
  })

  it('未传入 systemInstruction/generationConfig 时为 undefined', async () => {
    const { getGeminiModelInstance } = await loadGeminiModule()
    await loadGenerativeAIMock()
    clearMocks()

    getGeminiModelInstance({ apiKey: 'k', model: 'm' })

    expect(hoisted.mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        systemInstruction: undefined,
        generationConfig: undefined,
      })
    )
  })

  it('返回的模型实例包含 generateContent 方法', async () => {
    const { getGeminiModelInstance } = await loadGeminiModule()
    await loadGenerativeAIMock()
    clearMocks()

    const model = getGeminiModelInstance({ apiKey: 'k', model: 'm' })
    expect(typeof model.generateContent).toBe('function')
    expect(typeof model.generateContentStream).toBe('function')
  })
})

describe('gemini.ts - formatGeminiErrorMessage', () => {
  beforeEach(async () => {
    vi.resetModules()
  })

  it('error 为 { message: "foo" } 时返回 "foo"', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    expect(formatGeminiErrorMessage({ message: 'foo' })).toBe('foo')
  })

  it('error 为 { message, errorDetails(数组) } 时追加 JSON 序列化详情', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    const result = formatGeminiErrorMessage({
      message: 'foo',
      errorDetails: ['x'],
    })
    expect(result).toBe('foo | 详情: ["x"]')
  })

  it('error 为 { errorDetails: ["x"] }（无 message）时使用兜底文案', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    const result = formatGeminiErrorMessage({ errorDetails: ['x'] })
    expect(result).toBe('Gemini 请求失败 | 详情: ["x"]')
  })

  it('error 为 null/undefined 时返回 "Gemini 请求失败"', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    expect(formatGeminiErrorMessage(null)).toBe('Gemini 请求失败')
    expect(formatGeminiErrorMessage(undefined)).toBe('Gemini 请求失败')
  })

  it('error 为空字符串 message 时使用兜底文案', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    expect(formatGeminiErrorMessage({ message: '' })).toBe(
      'Gemini 请求失败'
    )
  })

  it('error 为非字符串 message 时使用兜底文案', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    // message 为数字 0、对象等非字符串类型
    expect(formatGeminiErrorMessage({ message: 123 })).toBe(
      'Gemini 请求失败'
    )
  })

  it('error 为非对象类型（如字符串）时使用兜底文案', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    expect(formatGeminiErrorMessage('just a string')).toBe('Gemini 请求失败')
  })

  it('errorDetails 为非数组对象时走 String() 转换（源码行为）', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    // 源码：Array.isArray(details) ? JSON.stringify(details) : String(details)
    // 非数组对象 String() 会得到 [object Object]
    const result = formatGeminiErrorMessage({
      errorDetails: { code: 500, reason: 'oops' },
    })
    expect(result).toBe('Gemini 请求失败 | 详情: [object Object]')
  })

  it('errorDetails 为数组时使用 JSON.stringify', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    const result = formatGeminiErrorMessage({
      message: 'err',
      errorDetails: [
        { reason: 'RATE_LIMIT_EXCEEDED' },
        { reason: 'INVALID_KEY' },
      ],
    })
    expect(result).toBe(
      'err | 详情: [{"reason":"RATE_LIMIT_EXCEEDED"},{"reason":"INVALID_KEY"}]'
    )
  })

  it('无 errorDetails 时仅返回 baseMessage', async () => {
    const { formatGeminiErrorMessage } = await loadGeminiModule()
    expect(formatGeminiErrorMessage({ message: 'only msg' })).toBe('only msg')
    expect(formatGeminiErrorMessage({})).toBe('Gemini 请求失败')
  })
})

describe('gemini.ts - ensureGeminiProxyDispatcher', () => {
  beforeEach(async () => {
    vi.resetModules()
    delete process.env.HTTPS_PROXY
    delete process.env.https_proxy
    delete process.env.HTTP_PROXY
    delete process.env.http_proxy
  })

  it('无 HTTPS_PROXY 环境变量时不调用 setGlobalDispatcher', async () => {
    const { ensureGeminiProxyDispatcher } = await loadGeminiModule()
    const { setGlobalDispatcher, ProxyAgent } = await loadUndiciMock()
    setGlobalDispatcher.mockClear()
    ProxyAgent.mockClear()

    ensureGeminiProxyDispatcher()

    expect(setGlobalDispatcher).not.toHaveBeenCalled()
    expect(ProxyAgent).not.toHaveBeenCalled()
  })

  it('有 HTTPS_PROXY 时调用 setGlobalDispatcher 一次', async () => {
    process.env.HTTPS_PROXY = 'http://127.0.0.1:7890'
    const { ensureGeminiProxyDispatcher } = await loadGeminiModule()
    const { setGlobalDispatcher, ProxyAgent } = await loadUndiciMock()
    setGlobalDispatcher.mockClear()
    ProxyAgent.mockClear()

    ensureGeminiProxyDispatcher()

    expect(setGlobalDispatcher).toHaveBeenCalledTimes(1)
    expect(ProxyAgent).toHaveBeenCalledTimes(1)
    expect(ProxyAgent).toHaveBeenCalledWith('http://127.0.0.1:7890')
  })

  it('支持小写 https_proxy 环境变量', async () => {
    process.env.https_proxy = 'http://127.0.0.1:1080'
    const { ensureGeminiProxyDispatcher } = await loadGeminiModule()
    const { setGlobalDispatcher, ProxyAgent } = await loadUndiciMock()
    setGlobalDispatcher.mockClear()
    ProxyAgent.mockClear()

    ensureGeminiProxyDispatcher()

    expect(setGlobalDispatcher).toHaveBeenCalledTimes(1)
    expect(ProxyAgent).toHaveBeenCalledWith('http://127.0.0.1:1080')
  })

  it('支持 HTTP_PROXY / http_proxy 环境变量作为回退', async () => {
    process.env.HTTP_PROXY = 'http://10.0.0.1:8080'
    const { ensureGeminiProxyDispatcher } = await loadGeminiModule()
    const { setGlobalDispatcher, ProxyAgent } = await loadUndiciMock()
    setGlobalDispatcher.mockClear()
    ProxyAgent.mockClear()

    ensureGeminiProxyDispatcher()

    expect(setGlobalDispatcher).toHaveBeenCalledTimes(1)
    expect(ProxyAgent).toHaveBeenCalledWith('http://10.0.0.1:8080')
  })

  it('HTTPS_PROXY 优先级高于 HTTP_PROXY', async () => {
    process.env.HTTPS_PROXY = 'http://https.proxy:1'
    process.env.HTTP_PROXY = 'http://http.proxy:2'
    const { ensureGeminiProxyDispatcher } = await loadGeminiModule()
    const { ProxyAgent } = await loadUndiciMock()
    ProxyAgent.mockClear()

    ensureGeminiProxyDispatcher()

    expect(ProxyAgent).toHaveBeenCalledWith('http://https.proxy:1')
  })

  it('重复调用只初始化一次（缓存生效）', async () => {
    process.env.HTTPS_PROXY = 'http://127.0.0.1:7890'
    const { ensureGeminiProxyDispatcher } = await loadGeminiModule()
    const { setGlobalDispatcher, ProxyAgent } = await loadUndiciMock()
    setGlobalDispatcher.mockClear()
    ProxyAgent.mockClear()

    ensureGeminiProxyDispatcher()
    ensureGeminiProxyDispatcher()
    ensureGeminiProxyDispatcher()

    expect(setGlobalDispatcher).toHaveBeenCalledTimes(1)
    expect(ProxyAgent).toHaveBeenCalledTimes(1)
  })

  it('即使首次无代理设置，后续重复调用也不会重复执行检查逻辑', async () => {
    const { ensureGeminiProxyDispatcher } = await loadGeminiModule()
    const { setGlobalDispatcher } = await loadUndiciMock()
    setGlobalDispatcher.mockClear()

    ensureGeminiProxyDispatcher()
    ensureGeminiProxyDispatcher()
    expect(setGlobalDispatcher).not.toHaveBeenCalled()
  })

  it('vi.resetModules 后再次调用会重新初始化', async () => {
    process.env.HTTPS_PROXY = 'http://127.0.0.1:7890'
    const mod1 = await loadGeminiModule()
    const undici1 = await loadUndiciMock()
    undici1.setGlobalDispatcher.mockClear()
    undici1.ProxyAgent.mockClear()

    mod1.ensureGeminiProxyDispatcher()
    expect(undici1.setGlobalDispatcher).toHaveBeenCalledTimes(1)

    // 重置模块后重新加载
    // 注意：vi.mock() 的 mock 实例会跨 resetModules 复用，
    // 因此必须在 reload 后、调用前重新 clear 调用记录
    vi.resetModules()
    const mod2 = await loadGeminiModule()
    const undici2 = await loadUndiciMock()
    undici2.setGlobalDispatcher.mockClear()
    undici2.ProxyAgent.mockClear()

    mod2.ensureGeminiProxyDispatcher()
    expect(undici2.setGlobalDispatcher).toHaveBeenCalledTimes(1)
  })

  it('ProxyAgent 构造抛错时被捕获且不再重复尝试', async () => {
    process.env.HTTPS_PROXY = 'http://127.0.0.1:7890'
    const { ensureGeminiProxyDispatcher } = await loadGeminiModule()
    const { setGlobalDispatcher, ProxyAgent } = await loadUndiciMock()
    // 让 ProxyAgent 构造抛错
    ProxyAgent.mockImplementationOnce(function () {
      throw new Error('proxy init failed')
    })
    setGlobalDispatcher.mockClear()

    // 不应抛出
    expect(() => ensureGeminiProxyDispatcher()).not.toThrow()
    expect(setGlobalDispatcher).not.toHaveBeenCalled()

    // 第二次调用：由于缓存已标记，不应再次尝试
    ensureGeminiProxyDispatcher()
    expect(setGlobalDispatcher).not.toHaveBeenCalled()
  })
})
