// AI 润色 API - SSE 流式响应
import { AI_MODEL_CONFIGS } from '#shared/config/ai'
import {
  getGeminiModelInstance,
  formatGeminiErrorMessage,
} from '../../utils/ai/gemini'

// 请求体类型
interface PolishRequestBody {
  apiKey?: string
  model?: string
  content?: string
  modelType?: 'doubao' | 'deepseek' | 'openai' | 'gemini'
  apiEndpoint?: string
  customInstructions?: string
}

// 系统提示词：简历润色
const buildPolishSystemPrompt = (customInstructions?: string) => {
  const base = `你是专业的简历优化助手。请优化以下文本，使其更专业、有吸引力。

优化原则：
1. 使用更专业的词汇
2. 突出关键成就
3. 保持简洁清晰
4. 使用主动语气
5. 保留原有信息
6. 保持原有 Markdown 格式

输出约束：
1. 只输出润色后的内容本身
2. 不输出前言、总结、建议
3. 不使用代码块包裹`

  if (customInstructions && customInstructions.trim()) {
    return `${base}\n\n补充要求：\n${customInstructions.trim()}`
  }
  return base
}

// 写入流式 chunk 的回调类型
type StreamWriter = (chunk: Uint8Array) => Promise<void>

// 处理 Gemini 流式响应
const streamGemini = async (
  params: {
    apiKey: string
    model: string
    content: string
    customInstructions?: string
  },
  write: StreamWriter,
  encoder: TextEncoder
) => {
  const { apiKey, model, content, customInstructions } = params
  const systemPrompt = buildPolishSystemPrompt(customInstructions)

  const geminiModel = getGeminiModelInstance({
    apiKey,
    model,
    systemInstruction: systemPrompt,
  })

  const result = await geminiModel.generateContentStream(content)

  for await (const chunk of result.stream) {
    const text = chunk.text() || ''
    if (text) {
      await write(encoder.encode(text))
    }
  }
}

// 处理 OpenAI 兼容（doubao/deepseek/openai）流式响应
const streamOpenAICompatible = async (
  params: {
    url: string
    apiKey: string
    model: string
    content: string
    customInstructions?: string
  },
  write: StreamWriter,
  encoder: TextEncoder
) => {
  const { url, apiKey, model, content, customInstructions } = params
  const systemPrompt = buildPolishSystemPrompt(customInstructions)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  const body = JSON.stringify({
    model,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content },
    ],
  })

  const upstream = await fetch(url, {
    method: 'POST',
    headers,
    body,
  })

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => '')
    throw new Error(errText || `上游请求失败 (${upstream.status})`)
  }

  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    // 最后一段未完整行留待下次
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data:')) continue

      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') continue

      try {
        const json = JSON.parse(data)
        const delta = json?.choices?.[0]?.delta?.content || ''
        if (delta) {
          await write(encoder.encode(delta))
        }
      } catch {
        // 忽略 JSON 解析失败（可能是心跳/注释）
      }
    }
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PolishRequestBody>(event)

  const {
    apiKey,
    model,
    content,
    modelType,
    apiEndpoint,
    customInstructions,
  } = body || {}

  // 参数校验
  if (!apiKey || !model || !content || !modelType) {
    setResponseStatus(event, 400)
    return {
      error: '缺少必要参数（apiKey/model/content/modelType）',
    }
  }

  if (!content.trim()) {
    setResponseStatus(event, 400)
    return { error: '内容不能为空' }
  }

  // 设置 SSE 响应头
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      // 将 chunk 写入下游流
      const write: StreamWriter = async (chunk: Uint8Array) => {
        controller.enqueue(chunk)
      }

      try {
        if (modelType === 'gemini') {
          await streamGemini(
            { apiKey, model, content, customInstructions },
            write,
            encoder
          )
        } else {
          const cfg = AI_MODEL_CONFIGS[modelType]
          const url = cfg.url(apiEndpoint)
          await streamOpenAICompatible(
            { url, apiKey, model, content, customInstructions },
            write,
            encoder
          )
        }
      } catch (error) {
        // 将错误信息作为文本流返回，前端可在响应文本中看到错误
        const message =
          modelType === 'gemini'
            ? formatGeminiErrorMessage(error)
            : error instanceof Error
              ? error.message
              : '润色请求失败'
        await write(encoder.encode(message))
      } finally {
        controller.close()
      }
    },
    cancel() {
      // 客户端断开连接
    },
  })
})
