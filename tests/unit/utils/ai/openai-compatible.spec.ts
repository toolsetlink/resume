// OpenAI 兼容（doubao/deepseek/openai）请求构造逻辑单元测试
// 项目没有独立的 shared/utils/ai/openai-compatible.ts 文件，
// 相关逻辑在 server/api/ai/grammar.post.ts / polish.post.ts 中。
// 本文件测试的是配置层（AI_MODEL_CONFIGS）的请求构造辅助行为。
import { describe, it, expect } from 'vitest'
import {
  AI_MODEL_CONFIGS,
  type AIModelType,
  type AIValidationContext,
} from '#shared/config/ai'

// ============================================================
// 测试 helper：模拟 grammar.post.ts 中根据 modelType 选配置的流程
// ============================================================

/**
 * 根据供应商类型返回对应配置
 */
function getAdapter(modelType: AIModelType) {
  return AI_MODEL_CONFIGS[modelType]
}

/**
 * 构造 OpenAI 兼容请求 headers（参考 grammar.post.ts）
 */
function buildOpenAIHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
}

/**
 * 构造请求体（参考 grammar.post.ts 中的 body 结构）
 */
function buildGrammarRequestBody(
  model: string,
  systemPrompt: string,
  userContent: string
) {
  return JSON.stringify({
    model,
    stream: false,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  })
}

/**
 * 构造 SSE 流式润色请求体（参考 polish.post.ts）
 */
function buildPolishRequestBody(
  model: string,
  systemPrompt: string,
  userContent: string
) {
  return JSON.stringify({
    model,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  })
}

describe('openai-compatible - 4 个供应商 headers 构造', () => {
  it.each<[AIModelType, string]>([
    ['doubao', 'doubao-key'],
    ['deepseek', 'ds-key'],
    ['openai', 'oai-key'],
  ])('%s.headers(apiKey) 返回 Content-Type + Authorization Bearer', (s, k) => {
    const headers = AI_MODEL_CONFIGS[s].headers(k)
    expect(headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${k}`,
    })
  })

  it('gemini.headers 包含 x-goog-api-key 而非 Authorization', () => {
    const headers = AI_MODEL_CONFIGS.gemini.headers('gem-key')
    expect(headers['x-goog-api-key']).toBe('gem-key')
    expect(headers.Authorization).toBeUndefined()
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('buildOpenAIHeaders helper 与 doubao/deepseek/openai 配置一致', () => {
    const key = 'shared-key'
    const expected = buildOpenAIHeaders(key)
    expect(AI_MODEL_CONFIGS.doubao.headers(key)).toEqual(expected)
    expect(AI_MODEL_CONFIGS.deepseek.headers(key)).toEqual(expected)
    expect(AI_MODEL_CONFIGS.openai.headers(key)).toEqual(expected)
  })
})

describe('openai-compatible - url() endpoint 拼接', () => {
  it('doubao.url() 固定 endpoint', () => {
    expect(AI_MODEL_CONFIGS.doubao.url()).toBe(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    )
    // doubao.url 不接受 endpoint，但调用应保持稳定
    expect(AI_MODEL_CONFIGS.doubao.url('ignored')).toBe(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    )
  })

  it('deepseek.url() 固定 endpoint', () => {
    expect(AI_MODEL_CONFIGS.deepseek.url()).toBe(
      'https://api.deepseek.com/v1/chat/completions'
    )
  })

  it('openai.url(endpoint) 拼接 chat/completions', () => {
    expect(AI_MODEL_CONFIGS.openai.url('https://api.example.com/v1')).toBe(
      'https://api.example.com/v1/chat/completions'
    )
  })

  it('openai.url() 处理尾部斜杠', () => {
    expect(AI_MODEL_CONFIGS.openai.url('https://api.example.com/v1/')).toBe(
      'https://api.example.com/v1/chat/completions'
    )
  })

  it('gemini.url() 固定 v1beta endpoint', () => {
    expect(AI_MODEL_CONFIGS.gemini.url()).toBe(
      'https://generativelanguage.googleapis.com/v1beta'
    )
  })

  it('每个供应商 url 互不相同', () => {
    const urls = new Set<string>(
      [
        AI_MODEL_CONFIGS.doubao.url(),
        AI_MODEL_CONFIGS.deepseek.url(),
        AI_MODEL_CONFIGS.openai.url('https://api.openai.com/v1'),
        AI_MODEL_CONFIGS.gemini.url(),
      ]
    )
    expect(urls.size).toBe(4)
  })
})

describe('openai-compatible - validate() 配置完整性判断', () => {
  const VALID_CTX: AIValidationContext = {
    doubaoApiKey: 'd-key',
    doubaoModelId: 'd-model',
    deepseekApiKey: 'ds-key',
    deepseekModelId: 'ds-model',
    openaiApiKey: 'oai-key',
    openaiModelId: 'oai-model',
    openaiApiEndpoint: 'https://api.example.com/v1',
    geminiApiKey: 'gem-key',
    geminiModelId: 'gem-model',
  }

  it('完整上下文下所有供应商 validate 均为 true', () => {
    expect(AI_MODEL_CONFIGS.doubao.validate(VALID_CTX)).toBe(true)
    expect(AI_MODEL_CONFIGS.deepseek.validate(VALID_CTX)).toBe(true)
    expect(AI_MODEL_CONFIGS.openai.validate(VALID_CTX)).toBe(true)
    expect(AI_MODEL_CONFIGS.gemini.validate(VALID_CTX)).toBe(true)
  })

  it('空上下文下所有供应商 validate 均为 false', () => {
    expect(AI_MODEL_CONFIGS.doubao.validate({})).toBe(false)
    expect(AI_MODEL_CONFIGS.deepseek.validate({})).toBe(false)
    expect(AI_MODEL_CONFIGS.openai.validate({})).toBe(false)
    expect(AI_MODEL_CONFIGS.gemini.validate({})).toBe(false)
  })

  it('deepseek 仅依赖 apiKey，modelId 缺失也通过', () => {
    expect(
      AI_MODEL_CONFIGS.deepseek.validate({ deepseekApiKey: 'k' })
    ).toBe(true)
  })

  it('openai 三者缺一不可', () => {
    const base = {
      openaiApiKey: 'k',
      openaiModelId: 'm',
      openaiApiEndpoint: 'https://api.example.com/v1',
    }
    expect(AI_MODEL_CONFIGS.openai.validate(base)).toBe(true)
    expect(
      AI_MODEL_CONFIGS.openai.validate({ ...base, openaiApiKey: undefined })
    ).toBe(false)
    expect(
      AI_MODEL_CONFIGS.openai.validate({ ...base, openaiModelId: undefined })
    ).toBe(false)
    expect(
      AI_MODEL_CONFIGS.openai.validate({
        ...base,
        openaiApiEndpoint: undefined,
      })
    ).toBe(false)
  })
})

describe('openai-compatible - 完整请求体构造', () => {
  it('buildGrammarRequestBody 生成正确的 JSON 结构', () => {
    const body = buildGrammarRequestBody(
      'test-model',
      'system prompt',
      'user content'
    )

    const parsed = JSON.parse(body)
    expect(parsed).toEqual({
      model: 'test-model',
      stream: false,
      messages: [
        { role: 'system', content: 'system prompt' },
        { role: 'user', content: 'user content' },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    })
  })

  it('buildGrammarRequestBody 包含 response_format', () => {
    const body = JSON.parse(
      buildGrammarRequestBody('m', 'sys', 'usr')
    )
    expect(body.response_format).toEqual({ type: 'json_object' })
  })

  it('buildGrammarRequestBody 的 temperature 为 0（确定性输出）', () => {
    const body = JSON.parse(
      buildGrammarRequestBody('m', 'sys', 'usr')
    )
    expect(body.temperature).toBe(0)
  })

  it('buildGrammarRequestBody stream=false（语法检查非流式）', () => {
    const body = JSON.parse(
      buildGrammarRequestBody('m', 'sys', 'usr')
    )
    expect(body.stream).toBe(false)
  })

  it('buildGrammarRequestBody messages 顺序为 system -> user', () => {
    const body = JSON.parse(
      buildGrammarRequestBody('m', 'sys', 'usr')
    )
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[1].role).toBe('user')
  })

  it('buildPolishRequestBody 生成 SSE 流式请求体', () => {
    const body = buildPolishRequestBody(
      'polish-model',
      'polish system prompt',
      'user content'
    )

    const parsed = JSON.parse(body)
    expect(parsed).toEqual({
      model: 'polish-model',
      stream: true,
      messages: [
        { role: 'system', content: 'polish system prompt' },
        { role: 'user', content: 'user content' },
      ],
    })
  })

  it('buildPolishRequestBody 不包含 response_format（流式文本输出）', () => {
    const body = JSON.parse(
      buildPolishRequestBody('m', 'sys', 'usr')
    )
    expect(body.response_format).toBeUndefined()
  })

  it('buildPolishRequestBody stream=true', () => {
    const body = JSON.parse(
      buildPolishRequestBody('m', 'sys', 'usr')
    )
    expect(body.stream).toBe(true)
  })

  it('buildPolishRequestBody 不包含 temperature（使用默认）', () => {
    const body = JSON.parse(
      buildPolishRequestBody('m', 'sys', 'usr')
    )
    expect(body.temperature).toBeUndefined()
  })
})

describe('openai-compatible - 端到端请求构造流程', () => {
  // 模拟 grammar.post.ts 中根据 modelType 构造完整请求
  it('doubao: 组合 url + headers + body 形成完整请求要素', () => {
    const ctx: AIValidationContext = {
      doubaoApiKey: 'doubao-key',
      doubaoModelId: 'doubao-model-id',
    }
    const cfg = getAdapter('doubao')

    expect(cfg.validate(ctx)).toBe(true)

    const url = cfg.url()
    const headers = cfg.headers(ctx.doubaoApiKey!)
    const body = buildGrammarRequestBody(
      ctx.doubaoModelId!,
      'system prompt',
      'user content'
    )

    expect(url).toBe(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    )
    expect(headers.Authorization).toBe('Bearer doubao-key')
    expect(JSON.parse(body).model).toBe('doubao-model-id')
  })

  it('deepseek: 无需 modelId，可用 defaultModel', () => {
    const ctx: AIValidationContext = { deepseekApiKey: 'ds-key' }
    const cfg = getAdapter('deepseek')

    expect(cfg.validate(ctx)).toBe(true)
    expect(cfg.requiresModelId).toBe(false)

    const model = cfg.defaultModel
    expect(model).toBe('deepseek-chat')

    const url = cfg.url()
    const headers = cfg.headers(ctx.deepseekApiKey!)
    const body = buildGrammarRequestBody(
      model!,
      'sys',
      'usr'
    )

    expect(url).toBe('https://api.deepseek.com/v1/chat/completions')
    expect(headers.Authorization).toBe('Bearer ds-key')
    expect(JSON.parse(body).model).toBe('deepseek-chat')
  })

  it('openai: 需 endpoint，url 通过参数拼接', () => {
    const ctx: AIValidationContext = {
      openaiApiKey: 'oai-key',
      openaiModelId: 'oai-model',
      openaiApiEndpoint: 'https://api.example.com/v1',
    }
    const cfg = getAdapter('openai')

    expect(cfg.validate(ctx)).toBe(true)

    const url = cfg.url(ctx.openaiApiEndpoint)
    expect(url).toBe('https://api.example.com/v1/chat/completions')

    const headers = cfg.headers(ctx.openaiApiKey!)
    expect(headers.Authorization).toBe('Bearer oai-key')
  })

  it('openai: 缺 endpoint 时 validate 返回 false', () => {
    const cfg = getAdapter('openai')
    expect(
      cfg.validate({
        openaiApiKey: 'k',
        openaiModelId: 'm',
      })
    ).toBe(false)
  })
})
