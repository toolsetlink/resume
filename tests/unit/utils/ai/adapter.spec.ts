// AI 适配层 provider 分发逻辑单元测试
// 项目没有独立的 shared/utils/ai/adapter.ts 文件，
// 本文件测试的是「根据 modelType 选择正确 AI_MODEL_CONFIGS」的分发逻辑。
import { describe, it, expect } from 'vitest'
import {
  AI_MODEL_CONFIGS,
  type AIModelType,
  type AIValidationContext,
} from '#shared/config/ai'

// ============================================================
// 测试 helper：模拟 adapter 的分发逻辑
// ============================================================

/**
 * 根据供应商类型返回对应配置（模拟 adapter 行为）
 */
function getAdapter(modelType: AIModelType) {
  return AI_MODEL_CONFIGS[modelType]
}

const ALL_TYPES: AIModelType[] = ['doubao', 'deepseek', 'openai', 'gemini']

describe('adapter - 基础分发', () => {
  it('4 个 modelType 都能正确返回配置', () => {
    for (const type of ALL_TYPES) {
      const adapter = getAdapter(type)
      expect(adapter).toBeDefined()
      expect(typeof adapter.url).toBe('function')
      expect(typeof adapter.headers).toBe('function')
      expect(typeof adapter.validate).toBe('function')
      expect(typeof adapter.requiresModelId).toBe('boolean')
    }
  })

  it('getAdapter 返回与 AI_MODEL_CONFIGS[key] 完全相同的对象引用', () => {
    for (const type of ALL_TYPES) {
      expect(getAdapter(type)).toBe(AI_MODEL_CONFIGS[type])
    }
  })
})

describe('adapter - 不同 modelType 的 url 不同', () => {
  it('doubao 与 deepseek url 不同', () => {
    expect(getAdapter('doubao').url()).not.toBe(getAdapter('deepseek').url())
  })

  it('doubao 与 gemini url 不同', () => {
    expect(getAdapter('doubao').url()).not.toBe(getAdapter('gemini').url())
  })

  it('openai（带 endpoint）与 doubao url 不同', () => {
    expect(getAdapter('openai').url('https://api.openai.com/v1')).not.toBe(
      getAdapter('doubao').url()
    )
  })

  it('gemini url 不以 /chat/completions 结尾（走原生 API）', () => {
    const geminiUrl = getAdapter('gemini').url()
    expect(geminiUrl.endsWith('/chat/completions')).toBe(false)
  })

  it('doubao/deepseek/openai url 均以 /chat/completions 结尾', () => {
    expect(getAdapter('doubao').url().endsWith('/chat/completions')).toBe(true)
    expect(getAdapter('deepseek').url().endsWith('/chat/completions')).toBe(
      true
    )
    expect(
      getAdapter('openai').url('https://api.example.com/v1').endsWith(
        '/chat/completions'
      )
    ).toBe(true)
  })
})

describe('adapter - gemini headers 与其它三个不同', () => {
  const BEARER_TYPES: AIModelType[] = ['doubao', 'deepseek', 'openai']

  it.each(BEARER_TYPES)('%s.headers 使用 Authorization Bearer', (type) => {
    const headers = getAdapter(type).headers('test-key')
    expect(headers.Authorization).toBe('Bearer test-key')
    expect(headers['x-goog-api-key']).toBeUndefined()
  })

  it('gemini.headers 使用 x-goog-api-key', () => {
    const headers = getAdapter('gemini').headers('test-key')
    expect(headers['x-goog-api-key']).toBe('test-key')
    expect(headers.Authorization).toBeUndefined()
  })

  it('所有供应商 headers 都包含 Content-Type: application/json', () => {
    for (const type of ALL_TYPES) {
      const headers = getAdapter(type).headers('k')
      expect(headers['Content-Type']).toBe('application/json')
    }
  })
})

describe('adapter - 各供应商 validate 行为', () => {
  const VALID_FULL_CTX: AIValidationContext = {
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

  it('完整上下文：4 个供应商均通过', () => {
    for (const type of ALL_TYPES) {
      expect(getAdapter(type).validate(VALID_FULL_CTX)).toBe(true)
    }
  })

  it('doubao 仅检查 doubaoApiKey + doubaoModelId（其它字段无关）', () => {
    expect(
      getAdapter('doubao').validate({
        doubaoApiKey: 'k',
        doubaoModelId: 'm',
      })
    ).toBe(true)
    // 缺任意一个
    expect(getAdapter('doubao').validate({ doubaoApiKey: 'k' })).toBe(false)
    expect(getAdapter('doubao').validate({ doubaoModelId: 'm' })).toBe(false)
  })

  it('deepseek 仅检查 deepseekApiKey（modelId 可选）', () => {
    expect(getAdapter('deepseek').validate({ deepseekApiKey: 'k' })).toBe(true)
    expect(
      getAdapter('deepseek').validate({
        deepseekApiKey: 'k',
        deepseekModelId: 'm',
      })
    ).toBe(true)
    expect(getAdapter('deepseek').validate({})).toBe(false)
  })

  it('openai 检查 apiKey + modelId + endpoint 三者', () => {
    expect(
      getAdapter('openai').validate({
        openaiApiKey: 'k',
        openaiModelId: 'm',
        openaiApiEndpoint: 'https://api.example.com/v1',
      })
    ).toBe(true)
    expect(
      getAdapter('openai').validate({
        openaiApiKey: 'k',
        openaiModelId: 'm',
      })
    ).toBe(false)
    expect(
      getAdapter('openai').validate({
        openaiApiKey: 'k',
        openaiApiEndpoint: 'https://api.example.com/v1',
      })
    ).toBe(false)
    expect(
      getAdapter('openai').validate({
        openaiModelId: 'm',
        openaiApiEndpoint: 'https://api.example.com/v1',
      })
    ).toBe(false)
  })

  it('gemini 检查 geminiApiKey + geminiModelId', () => {
    expect(
      getAdapter('gemini').validate({
        geminiApiKey: 'k',
        geminiModelId: 'm',
      })
    ).toBe(true)
    expect(getAdapter('gemini').validate({ geminiApiKey: 'k' })).toBe(false)
    expect(getAdapter('gemini').validate({ geminiModelId: 'm' })).toBe(false)
  })
})

describe('adapter - requiresModelId 标志', () => {
  it('doubao.requiresModelId=true', () => {
    expect(getAdapter('doubao').requiresModelId).toBe(true)
  })

  it('deepseek.requiresModelId=false', () => {
    expect(getAdapter('deepseek').requiresModelId).toBe(false)
  })

  it('openai.requiresModelId=true', () => {
    expect(getAdapter('openai').requiresModelId).toBe(true)
  })

  it('gemini.requiresModelId=true', () => {
    expect(getAdapter('gemini').requiresModelId).toBe(true)
  })

  it('只有 deepseek 不强制要求 modelId', () => {
    const noRequire = ALL_TYPES.filter(
      (t) => !getAdapter(t).requiresModelId
    )
    expect(noRequire).toEqual(['deepseek'])
  })
})

describe('adapter - defaultModel 兜底', () => {
  it('只有 deepseek 提供 defaultModel', () => {
    const withDefault = ALL_TYPES.filter(
      (t) => getAdapter(t).defaultModel !== undefined
    )
    expect(withDefault).toEqual(['deepseek'])
  })

  it('deepseek.defaultModel = deepseek-chat', () => {
    expect(getAdapter('deepseek').defaultModel).toBe('deepseek-chat')
  })

  it('doubao/openai/gemini 均无 defaultModel', () => {
    expect(getAdapter('doubao').defaultModel).toBeUndefined()
    expect(getAdapter('openai').defaultModel).toBeUndefined()
    expect(getAdapter('gemini').defaultModel).toBeUndefined()
  })
})

describe('adapter - 端到端分发场景', () => {
  // 模拟从请求上下文中根据 modelType 选配置并构造请求要素的完整流程
  it('modelType=doubao 时使用 doubao 配置', () => {
    const modelType: AIModelType = 'doubao'
    const adapter = getAdapter(modelType)

    const ctx: AIValidationContext = {
      doubaoApiKey: 'dk',
      doubaoModelId: 'dm',
    }
    expect(adapter.validate(ctx)).toBe(true)

    const url = adapter.url()
    const headers = adapter.headers(ctx.doubaoApiKey!)
    expect(url).toContain('volces.com')
    expect(headers.Authorization).toBe('Bearer dk')
  })

  it('modelType=gemini 时使用 gemini 配置（headers 与其它不同）', () => {
    const modelType: AIModelType = 'gemini'
    const adapter = getAdapter(modelType)

    const ctx: AIValidationContext = {
      geminiApiKey: 'gk',
      geminiModelId: 'gm',
    }
    expect(adapter.validate(ctx)).toBe(true)

    const url = adapter.url()
    const headers = adapter.headers(ctx.geminiApiKey!)
    expect(url).toContain('googleapis.com')
    expect(headers['x-goog-api-key']).toBe('gk')
    expect(headers.Authorization).toBeUndefined()
  })

  it('modelType=deepseek 时无需 modelId 即可校验通过', () => {
    const adapter = getAdapter('deepseek')
    const ctx: AIValidationContext = { deepseekApiKey: 'dsk' }
    expect(adapter.validate(ctx)).toBe(true)
    expect(adapter.requiresModelId).toBe(false)
    expect(adapter.defaultModel).toBe('deepseek-chat')
  })

  it('modelType=openai 时需要 endpoint 参数构造 url', () => {
    const adapter = getAdapter('openai')
    const ctx: AIValidationContext = {
      openaiApiKey: 'ok',
      openaiModelId: 'om',
      openaiApiEndpoint: 'https://api.example.com/v1',
    }
    expect(adapter.validate(ctx)).toBe(true)

    const url = adapter.url(ctx.openaiApiEndpoint)
    expect(url).toBe('https://api.example.com/v1/chat/completions')
  })
})
