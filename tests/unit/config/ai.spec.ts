// 单元测试：shared/config/ai.ts
import { describe, it, expect } from 'vitest'
import {
  AI_MODEL_CONFIGS,
  AI_PROVIDER_INFO,
  type AIModelType,
} from '#shared/config/ai'

const EXPECTED_KEYS: AIModelType[] = ['doubao', 'deepseek', 'openai', 'gemini']

describe('AI_MODEL_CONFIGS', () => {
  it('包含 4 个 key：doubao/deepseek/openai/gemini', () => {
    for (const k of EXPECTED_KEYS) {
      expect(AI_MODEL_CONFIGS).toHaveProperty(k)
    }
    expect(Object.keys(AI_MODEL_CONFIGS)).toHaveLength(4)
  })

  it('每个配置都有 url/requiresModelId/headers/validate 函数', () => {
    for (const k of EXPECTED_KEYS) {
      const cfg = AI_MODEL_CONFIGS[k]
      expect(cfg).toHaveProperty('url')
      expect(typeof cfg.url).toBe('function')
      expect(cfg).toHaveProperty('requiresModelId')
      expect(typeof cfg.requiresModelId).toBe('boolean')
      expect(cfg).toHaveProperty('headers')
      expect(typeof cfg.headers).toBe('function')
      expect(cfg).toHaveProperty('validate')
      expect(typeof cfg.validate).toBe('function')
    }
  })

  it('doubao.requiresModelId === true', () => {
    expect(AI_MODEL_CONFIGS.doubao.requiresModelId).toBe(true)
  })

  it('deepseek.requiresModelId === false', () => {
    expect(AI_MODEL_CONFIGS.deepseek.requiresModelId).toBe(false)
  })

  it('deepseek.defaultModel === "deepseek-chat"', () => {
    expect(AI_MODEL_CONFIGS.deepseek.defaultModel).toBe('deepseek-chat')
  })

  it('其余 defaultModel 为 undefined', () => {
    expect(AI_MODEL_CONFIGS.doubao.defaultModel).toBeUndefined()
    expect(AI_MODEL_CONFIGS.openai.defaultModel).toBeUndefined()
    expect(AI_MODEL_CONFIGS.gemini.defaultModel).toBeUndefined()
  })

  it('url 函数返回非空字符串', () => {
    for (const k of EXPECTED_KEYS) {
      const url = AI_MODEL_CONFIGS[k].url()
      expect(typeof url).toBe('string')
      expect(url.length).toBeGreaterThan(0)
    }
  })

  it('headers 返回对象且至少有一个 key', () => {
    const headers = AI_MODEL_CONFIGS.doubao.headers('test-key')
    expect(headers).toBeTypeOf('object')
    expect(Object.keys(headers).length).toBeGreaterThan(0)
  })

  it('doubao.validate 在 apiKey 与 modelId 同时存在时返回 true', () => {
    expect(
      AI_MODEL_CONFIGS.doubao.validate({
        doubaoApiKey: 'k',
        doubaoModelId: 'm',
      }),
    ).toBe(true)
  })

  it('doubao.validate 在缺少 modelId 时返回 false', () => {
    expect(
      AI_MODEL_CONFIGS.doubao.validate({
        doubaoApiKey: 'k',
      }),
    ).toBe(false)
  })

  it('deepseek.validate 在有 apiKey 时返回 true', () => {
    expect(
      AI_MODEL_CONFIGS.deepseek.validate({ deepseekApiKey: 'k' }),
    ).toBe(true)
  })
})

describe('AI_PROVIDER_INFO', () => {
  it('包含 4 个 key', () => {
    for (const k of EXPECTED_KEYS) {
      expect(AI_PROVIDER_INFO).toHaveProperty(k)
    }
    expect(Object.keys(AI_PROVIDER_INFO)).toHaveLength(4)
  })

  it('每项有 name/nameEn/website', () => {
    for (const k of EXPECTED_KEYS) {
      const info = AI_PROVIDER_INFO[k]
      expect(info).toHaveProperty('name')
      expect(info).toHaveProperty('nameEn')
      expect(info).toHaveProperty('website')
    }
  })

  it('name 与 nameEn 是非空字符串', () => {
    for (const k of EXPECTED_KEYS) {
      const info = AI_PROVIDER_INFO[k]
      expect(info.name).toBeTypeOf('string')
      expect(info.name.length).toBeGreaterThan(0)
      expect(info.nameEn).toBeTypeOf('string')
      expect(info.nameEn.length).toBeGreaterThan(0)
    }
  })

  it('website 以 http:// 或 https:// 开头', () => {
    for (const k of EXPECTED_KEYS) {
      const url = AI_PROVIDER_INFO[k].website
      expect(url.startsWith('http://') || url.startsWith('https://')).toBe(true)
    }
  })
})
