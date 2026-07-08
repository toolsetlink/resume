// AI 供应商配置 - 自由简历项目

// AI 供应商类型
export type AIModelType = 'doubao' | 'deepseek' | 'openai' | 'gemini'

// AI 验证上下文
export interface AIValidationContext {
  doubaoApiKey?: string
  doubaoModelId?: string
  deepseekApiKey?: string
  deepseekModelId?: string
  openaiApiKey?: string
  openaiModelId?: string
  openaiApiEndpoint?: string
  geminiApiKey?: string
  geminiModelId?: string
}

// AI 模型配置接口
export interface AIModelConfig {
  url: (endpoint?: string) => string
  requiresModelId: boolean
  defaultModel?: string
  headers: (apiKey: string) => Record<string, string>
  validate: (context: AIValidationContext) => boolean
}

// 4 个供应商配置
export const AI_MODEL_CONFIGS: Record<AIModelType, AIModelConfig> = {
  doubao: {
    url: () => 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    requiresModelId: true,
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) => !!(ctx.doubaoApiKey && ctx.doubaoModelId),
  },
  deepseek: {
    url: () => 'https://api.deepseek.com/v1/chat/completions',
    requiresModelId: false,
    defaultModel: 'deepseek-chat',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) => !!ctx.deepseekApiKey,
  },
  openai: {
    url: (endpoint?: string) =>
      `${(endpoint || '').trim().replace(/\/+$/, '')}/chat/completions`,
    requiresModelId: true,
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) =>
      !!(ctx.openaiApiKey && ctx.openaiModelId && ctx.openaiApiEndpoint),
  },
  gemini: {
    url: () => 'https://generativelanguage.googleapis.com/v1beta',
    requiresModelId: true,
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    }),
    validate: (ctx) => !!(ctx.geminiApiKey && ctx.geminiModelId),
  },
}

// AI 供应商显示信息
export const AI_PROVIDER_INFO: Record<
  AIModelType,
  { name: string; nameEn: string; website: string }
> = {
  doubao: {
    name: '豆包',
    nameEn: 'Doubao',
    website: 'https://www.volcengine.com/product/doubao',
  },
  deepseek: {
    name: 'DeepSeek',
    nameEn: 'DeepSeek',
    website: 'https://www.deepseek.com',
  },
  openai: {
    name: 'OpenAI 兼容',
    nameEn: 'OpenAI Compatible',
    website: 'https://openai.com',
  },
  gemini: {
    name: 'Google Gemini',
    nameEn: 'Google Gemini',
    website: 'https://ai.google.dev',
  },
}
