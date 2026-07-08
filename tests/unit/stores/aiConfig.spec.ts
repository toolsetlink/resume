// aiConfig store 单元测试 - 自由简历项目
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'

// 提供 piniaPluginPersistedstate 全局变量（与 resume.spec.ts 一致）
vi.hoisted(() => {
  const g = globalThis as unknown as {
    piniaPluginPersistedstate: {
      localStorage: () => {
        getItem: (key: string) => string | null
        setItem: (key: string, value: string) => void
      }
      sessionStorage: () => {
        getItem: (key: string) => string | null
        setItem: (key: string, value: string) => void
      }
      cookies: () => {
        getItem: (key: string) => string | null
        setItem: (key: string, value: string) => void
      }
    }
  }
  g.piniaPluginPersistedstate = {
    localStorage: () => ({
      getItem: (key: string) => globalThis.localStorage.getItem(key),
      setItem: (key: string, value: string) =>
        globalThis.localStorage.setItem(key, value),
    }),
    sessionStorage: () => ({
      getItem: (key: string) => globalThis.sessionStorage.getItem(key),
      setItem: (key: string, value: string) =>
        globalThis.sessionStorage.setItem(key, value),
    }),
    cookies: () => ({ getItem: () => null, setItem: () => {} }),
  }
})

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useAIConfigStore } from '@/stores/aiConfig'

beforeEach(() => {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  const app = createApp({})
  app.use(pinia)
  setActivePinia(pinia)
  localStorage.clear()
})

describe('aiConfig store - 初始状态', () => {
  it('默认 selectedModel 为 doubao', () => {
    const store = useAIConfigStore()

    expect(store.selectedModel).toBe('doubao')
  })

  it('默认所有 apiKey 为空字符串', () => {
    const store = useAIConfigStore()

    expect(store.doubaoApiKey).toBe('')
    expect(store.deepseekApiKey).toBe('')
    expect(store.openaiApiKey).toBe('')
    expect(store.geminiApiKey).toBe('')
  })

  it('默认所有 modelId 为空字符串（gemini 有默认值）', () => {
    const store = useAIConfigStore()

    expect(store.doubaoModelId).toBe('')
    expect(store.deepseekModelId).toBe('')
    expect(store.openaiModelId).toBe('')
    // gemini 有默认值
    expect(store.geminiModelId).toBe('gemini-flash-latest')
  })

  it('默认 openaiApiEndpoint 为空字符串', () => {
    const store = useAIConfigStore()

    expect(store.openaiApiEndpoint).toBe('')
  })
})

describe('aiConfig store - setter', () => {
  it('setSelectedModel 切换供应商', () => {
    const store = useAIConfigStore()

    store.setSelectedModel('deepseek')
    expect(store.selectedModel).toBe('deepseek')

    store.setSelectedModel('openai')
    expect(store.selectedModel).toBe('openai')

    store.setSelectedModel('gemini')
    expect(store.selectedModel).toBe('gemini')

    store.setSelectedModel('doubao')
    expect(store.selectedModel).toBe('doubao')
  })

  it('setDoubaoApiKey / setDoubaoModelId', () => {
    const store = useAIConfigStore()

    store.setDoubaoApiKey('doubao-key-123')
    store.setDoubaoModelId('doubao-v1')

    expect(store.doubaoApiKey).toBe('doubao-key-123')
    expect(store.doubaoModelId).toBe('doubao-v1')
  })

  it('setDeepseekApiKey / setDeepseekModelId', () => {
    const store = useAIConfigStore()

    store.setDeepseekApiKey('deepseek-key-456')
    store.setDeepseekModelId('deepseek-chat')

    expect(store.deepseekApiKey).toBe('deepseek-key-456')
    expect(store.deepseekModelId).toBe('deepseek-chat')
  })

  it('setOpenaiApiKey / setOpenaiModelId / setOpenaiApiEndpoint', () => {
    const store = useAIConfigStore()

    store.setOpenaiApiKey('openai-key-789')
    store.setOpenaiModelId('gpt-4')
    store.setOpenaiApiEndpoint('https://api.openai.com/v1')

    expect(store.openaiApiKey).toBe('openai-key-789')
    expect(store.openaiModelId).toBe('gpt-4')
    expect(store.openaiApiEndpoint).toBe('https://api.openai.com/v1')
  })

  it('setGeminiApiKey / setGeminiModelId', () => {
    const store = useAIConfigStore()

    store.setGeminiApiKey('gemini-key-abc')
    store.setGeminiModelId('gemini-pro')

    expect(store.geminiApiKey).toBe('gemini-key-abc')
    expect(store.geminiModelId).toBe('gemini-pro')
  })
})

describe('aiConfig store - isConfigured getter', () => {
  it('doubao 需要 apiKey + modelId', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('doubao')

    // 空 -> false
    expect(store.isConfigured).toBe(false)

    // 仅 apiKey -> false
    store.setDoubaoApiKey('key')
    expect(store.isConfigured).toBe(false)

    // 加上 modelId -> true
    store.setDoubaoModelId('doubao-v1')
    expect(store.isConfigured).toBe(true)
  })

  it('deepseek 仅需要 apiKey', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('deepseek')

    expect(store.isConfigured).toBe(false)

    store.setDeepseekApiKey('deepseek-key')
    expect(store.isConfigured).toBe(true)
  })

  it('openai 需要 apiKey + modelId + endpoint', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('openai')

    expect(store.isConfigured).toBe(false)

    store.setOpenaiApiKey('key')
    expect(store.isConfigured).toBe(false)

    store.setOpenaiModelId('gpt-4')
    expect(store.isConfigured).toBe(false)

    store.setOpenaiApiEndpoint('https://api.openai.com/v1')
    expect(store.isConfigured).toBe(true)
  })

  it('gemini 需要 apiKey + modelId', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('gemini')

    // gemini 默认 modelId 已有值，但 apiKey 为空
    expect(store.isConfigured).toBe(false)

    store.setGeminiApiKey('gemini-key')
    // 默认 modelId 存在，应该为 true
    expect(store.isConfigured).toBe(true)
  })

  it('gemini modelId 为空时 isConfigured 为 false', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('gemini')
    store.setGeminiApiKey('gemini-key')
    store.setGeminiModelId('')

    expect(store.isConfigured).toBe(false)
  })
})

describe('aiConfig store - currentApiKey getter', () => {
  it('doubao 供应商返回 doubaoApiKey', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('doubao')
    store.setDoubaoApiKey('doubao-current-key')

    expect(store.currentApiKey).toBe('doubao-current-key')
  })

  it('deepseek 供应商返回 deepseekApiKey', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('deepseek')
    store.setDeepseekApiKey('deepseek-current-key')

    expect(store.currentApiKey).toBe('deepseek-current-key')
  })

  it('openai 供应商返回 openaiApiKey', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('openai')
    store.setOpenaiApiKey('openai-current-key')

    expect(store.currentApiKey).toBe('openai-current-key')
  })

  it('gemini 供应商返回 geminiApiKey', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('gemini')
    store.setGeminiApiKey('gemini-current-key')

    expect(store.currentApiKey).toBe('gemini-current-key')
  })
})

describe('aiConfig store - currentModelId getter', () => {
  it('doubao 供应商返回 doubaoModelId', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('doubao')
    store.setDoubaoModelId('doubao-v1')

    expect(store.currentModelId).toBe('doubao-v1')
  })

  it('deepseek 供应商返回 deepseekModelId，为空时回退到默认值', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('deepseek')

    // 为空时回退到 AI_MODEL_CONFIGS.deepseek.defaultModel
    expect(store.currentModelId).toBe('deepseek-chat')

    store.setDeepseekModelId('deepseek-coder')
    expect(store.currentModelId).toBe('deepseek-coder')
  })

  it('openai 供应商返回 openaiModelId', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('openai')
    store.setOpenaiModelId('gpt-4-turbo')

    expect(store.currentModelId).toBe('gpt-4-turbo')
  })

  it('gemini 供应商返回 geminiModelId', () => {
    const store = useAIConfigStore()
    store.setSelectedModel('gemini')
    store.setGeminiModelId('gemini-1.5-pro')

    expect(store.currentModelId).toBe('gemini-1.5-pro')
  })
})

describe('aiConfig store - 持久化', () => {
  it('setter 调用后 localStorage 包含 ai-config-storage key', async () => {
    const store = useAIConfigStore()
    store.setDoubaoApiKey('persist-key')

    await nextTick()

    const stored = localStorage.getItem('ai-config-storage')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.doubaoApiKey).toBe('persist-key')
  })

  it('persist key 为 ai-config-storage', async () => {
    const store = useAIConfigStore()
    store.setSelectedModel('gemini')

    await nextTick()

    expect(localStorage.getItem('ai-config-storage')).not.toBeNull()
    // 不应存在其他 store 的 key
    expect(localStorage.getItem('resume-storage')).toBeNull()
  })

  it('所有状态都被持久化', async () => {
    const store = useAIConfigStore()
    store.setDoubaoApiKey('dk')
    store.setDoubaoModelId('dm')
    store.setDeepseekApiKey('sk')
    store.setDeepseekModelId('sm')
    store.setOpenaiApiKey('ok')
    store.setOpenaiModelId('om')
    store.setOpenaiApiEndpoint('https://api.example.com')
    store.setGeminiApiKey('gk')
    store.setGeminiModelId('gm')
    store.setSelectedModel('openai')

    await nextTick()

    const stored = localStorage.getItem('ai-config-storage')
    const parsed = JSON.parse(stored!)

    expect(parsed.selectedModel).toBe('openai')
    expect(parsed.doubaoApiKey).toBe('dk')
    expect(parsed.doubaoModelId).toBe('dm')
    expect(parsed.deepseekApiKey).toBe('sk')
    expect(parsed.deepseekModelId).toBe('sm')
    expect(parsed.openaiApiKey).toBe('ok')
    expect(parsed.openaiModelId).toBe('om')
    expect(parsed.openaiApiEndpoint).toBe('https://api.example.com')
    expect(parsed.geminiApiKey).toBe('gk')
    expect(parsed.geminiModelId).toBe('gm')
  })

  it('$persist 手动调用可以写入 storage', () => {
    const store = useAIConfigStore()
    store.setDoubaoApiKey('manual-key')

    store.$persist()

    const stored = localStorage.getItem('ai-config-storage')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.doubaoApiKey).toBe('manual-key')
  })
})
