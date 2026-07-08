// Gemini 适配层 - 服务端封装
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

// 代理初始化标记，避免重复设置
let proxyDispatcherInitialized = false

// 初始化 HTTPS 代理（如环境变量配置）
export const ensureGeminiProxyDispatcher = () => {
  if (proxyDispatcherInitialized) return

  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy

  if (!proxyUrl) {
    proxyDispatcherInitialized = true
    return
  }

  try {
    setGlobalDispatcher(new ProxyAgent(proxyUrl))
  } catch (error) {
    console.warn('Gemini 代理初始化失败:', error)
  } finally {
    proxyDispatcherInitialized = true
  }
}

// Gemini 模型实例参数
interface GeminiModelParams {
  apiKey: string
  model: string
  systemInstruction?: string
  generationConfig?: Record<string, unknown>
}

// 获取 Gemini 模型实例
export const getGeminiModelInstance = (params: GeminiModelParams) => {
  ensureGeminiProxyDispatcher()
  const genAI = new GoogleGenerativeAI(params.apiKey)

  return genAI.getGenerativeModel({
    model: params.model,
    systemInstruction: params.systemInstruction,
    generationConfig: params.generationConfig,
  })
}

// 格式化 Gemini 错误消息
export const formatGeminiErrorMessage = (error: unknown): string => {
  const anyError = error as { message?: string; errorDetails?: unknown }
  const baseMessage =
    typeof anyError?.message === 'string' && anyError.message
      ? anyError.message
      : 'Gemini 请求失败'

  const details = anyError?.errorDetails
  if (!details) return baseMessage

  try {
    const detailText = Array.isArray(details)
      ? JSON.stringify(details)
      : String(details)
    return `${baseMessage} | 详情: ${detailText}`
  } catch {
    return baseMessage
  }
}
