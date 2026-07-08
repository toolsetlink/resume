// AI 多模态简历导入 API - 仅支持 Gemini
import type { Part } from '@google/generative-ai'
import {
  getGeminiModelInstance,
  formatGeminiErrorMessage,
} from '../../utils/ai/gemini'

// 请求体类型
interface ImportRequestBody {
  apiKey?: string
  model?: string
  content?: string
  images?: { data: string; mimeType: string }[]
  locale?: string
}

// 解析后的简历结构
interface ParsedResume {
  title?: string
  basic?: Record<string, unknown>
  education?: unknown[]
  experience?: unknown[]
  projects?: unknown[]
  skills?: unknown[]
}

// 系统提示词：从简历内容/图片提取结构化 JSON
const buildImportSystemPrompt = (locale?: string) => {
  const lang = locale === 'en' ? 'English' : '中文'
  return `你是一个简历解析助手。请根据用户提供的简历文本或图片，提取结构化信息。

输出要求：
1. 严格输出 JSON 对象，不要输出多余文本、解释或代码块标记
2. JSON 结构：
{
  "title": "简历标题（如姓名+职位）",
  "basic": {
    "name": "姓名",
    "title": "职位",
    "email": "邮箱",
    "phone": "电话",
    "location": "所在地",
    "employementStatus": "求职状态（如有）",
    "birthDate": "出生日期（如有，格式 YYYY-MM-DD）"
  },
  "education": [
    { "school": "学校", "major": "专业", "degree": "学位", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "description": "描述" }
  ],
  "experience": [
    { "company": "公司", "position": "职位", "date": "起止时间", "details": "工作内容描述（支持 HTML 列表）" }
  ],
  "projects": [
    { "name": "项目名", "role": "角色", "date": "起止时间", "description": "项目描述", "link": "链接（如有）" }
  ],
  "skills": [
    { "name": "技能名", "level": 70 }
  ]
}

注意事项：
1. 字段值请使用 ${lang} 表达
2. 若信息不存在，对应字段返回空字符串或空数组
3. 不要捏造未出现的信息
4. education/experience/projects/skills 数组中，若无相关内容则返回空数组`
}

// 容错解析 JSON：支持 ```json 代码块、对象提取
const parseJsonPayload = (text: string): ParsedResume | null => {
  if (!text || typeof text !== 'string') return null

  // 1. 直接尝试 JSON.parse
  try {
    const obj = JSON.parse(text)
    if (obj && typeof obj === 'object') return obj as ParsedResume
  } catch {
    // 继续尝试其它方式
  }

  // 2. 提取 ```json ... ``` 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (codeBlockMatch?.[1]) {
    try {
      const obj = JSON.parse(codeBlockMatch[1].trim())
      if (obj && typeof obj === 'object') return obj as ParsedResume
    } catch {
      // 继续尝试
    }
  }

  // 3. 提取第一个 { ... } 对象
  const objMatch = text.match(/\{[\s\S]*\}/)
  if (objMatch) {
    try {
      const obj = JSON.parse(objMatch[0])
      if (obj && typeof obj === 'object') return obj as ParsedResume
    } catch {
      return null
    }
  }

  return null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ImportRequestBody>(event)

  const { apiKey, model, content, images, locale } = body || {}

  // 参数校验
  if (!apiKey) {
    setResponseStatus(event, 400)
    return { error: '缺少 API Key' }
  }

  if (!model) {
    setResponseStatus(event, 400)
    return { error: '缺少模型 ID' }
  }

  if (!content && (!images || images.length === 0)) {
    setResponseStatus(event, 400)
    return { error: '必须提供 content 或 images' }
  }

  const systemPrompt = buildImportSystemPrompt(locale)

  const geminiModel = getGeminiModelInstance({
    apiKey,
    model,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0,
    },
  })

  try {
    // 构建多模态请求内容
    const parts: Part[] = []

    if (content) {
      parts.push({ text: `请解析以下简历文本：\n\n${content}` })
    }

    if (images && images.length > 0) {
      // 首张图片附加提示
      if (!content) {
        parts.push({ text: '请解析以下简历图片：' })
      }
      for (const img of images) {
        if (img.data && img.mimeType) {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data,
            },
          })
        }
      }
    }

    const result = await geminiModel.generateContent(parts)
    const text = result.response.text() || ''

    const parsed = parseJsonPayload(text)

    if (!parsed) {
      setResponseStatus(event, 500)
      return { error: 'AI 返回内容无法解析为 JSON', raw: text }
    }

    return { resume: parsed }
  } catch (error) {
    const message = formatGeminiErrorMessage(error)
    setResponseStatus(event, 500)
    return { error: message }
  }
})
