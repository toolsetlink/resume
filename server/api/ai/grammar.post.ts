// AI 语法检查 API - 返回 JSON
import { AI_MODEL_CONFIGS } from '#shared/config/ai'
import {
  getGeminiModelInstance,
  formatGeminiErrorMessage,
} from '../../utils/ai/gemini'

// 请求体类型
interface GrammarRequestBody {
  apiKey?: string
  model?: string
  content?: string
  modelType?: 'doubao' | 'deepseek' | 'openai' | 'gemini'
  apiEndpoint?: string
}

// 系统提示词：语法检查（只检查错别字与标点）
const GRAMMAR_SYSTEM_PROMPT = `你是中文简历的语法校对助手。仅检查以下文本中的错别字与标点错误，不要修改内容或润色措辞。

输出要求：
1. 严格输出 JSON 对象，不要输出多余文本、解释或代码块标记
2. JSON 结构必须为：
{
  "errors": [
    {
      "context": "错误所在的完整句子",
      "text": "出现错误的部分原文",
      "suggestion": "修正后的片段",
      "reason": "错误类型说明，例如：错别字 / 标点错误",
      "type": "spelling" 或 "grammar"
    }
  ]
}

字段说明：
- type 取值：spelling（错别字）、grammar（语法/标点）
- 若无错误，返回 { "errors": [] }
- text 必须是原文中实际出现的连续子串，便于高亮定位`

// 处理 Gemini 语法检查
const checkWithGemini = async (params: {
  apiKey: string
  model: string
  content: string
}): Promise<{ choices: { message: { content: string } }[] }> => {
  const { apiKey, model, content } = params

  const geminiModel = getGeminiModelInstance({
    apiKey,
    model,
    systemInstruction: GRAMMAR_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0,
    },
  })

  const result = await geminiModel.generateContent(content)
  const text = result.response.text() || ''

  return {
    choices: [{ message: { content: text } }],
  }
}

// 处理 OpenAI 兼容（doubao/deepseek/openai）语法检查
const checkWithOpenAICompatible = async (params: {
  url: string
  apiKey: string
  model: string
  content: string
}): Promise<{ choices: { message: { content: string } }[] }> => {
  const { url, apiKey, model, content } = params

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  const body = JSON.stringify({
    model,
    stream: false,
    messages: [
      { role: 'system', content: GRAMMAR_SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  })

  const upstream = await fetch(url, { method: 'POST', headers, body })

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '')
    throw new Error(errText || `上游请求失败 (${upstream.status})`)
  }

  const data = await upstream.json()
  return data
}

export default defineEventHandler(async (event) => {
  const body = await readBody<GrammarRequestBody>(event)

  const { apiKey, model, content, modelType, apiEndpoint } = body || {}

  // 参数校验
  if (!apiKey || !model || !content || !modelType) {
    setResponseStatus(event, 400)
    return {
      error: '缺少必要参数（apiKey/model/content/modelType）',
    }
  }

  if (!content.trim()) {
    return {
      choices: [{ message: { content: '{"errors":[]}' } }],
    }
  }

  try {
    if (modelType === 'gemini') {
      return await checkWithGemini({ apiKey, model, content })
    }

    const cfg = AI_MODEL_CONFIGS[modelType]
    const url = cfg.url(apiEndpoint)
    return await checkWithOpenAICompatible({
      url,
      apiKey,
      model,
      content,
    })
  } catch (error) {
    const message =
      modelType === 'gemini'
        ? formatGeminiErrorMessage(error)
        : error instanceof Error
          ? error.message
          : '语法检查失败'

    setResponseStatus(event, 500)
    return { error: message }
  }
})
