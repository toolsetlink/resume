// AI 配置 Store - 自由简历项目
import { defineStore } from 'pinia'
import type { AIModelType } from '#shared/config/ai'
import { AI_MODEL_CONFIGS } from '#shared/config/ai'
import { STORAGE_KEYS } from '#shared/config/constants'

interface AIConfigState {
  selectedModel: AIModelType
  doubaoApiKey: string
  doubaoModelId: string
  deepseekApiKey: string
  deepseekModelId: string
  openaiApiKey: string
  openaiModelId: string
  openaiApiEndpoint: string
  geminiApiKey: string
  geminiModelId: string
}

export const useAIConfigStore = defineStore('aiConfig', {
  state: (): AIConfigState => ({
    selectedModel: 'doubao',
    doubaoApiKey: '',
    doubaoModelId: '',
    deepseekApiKey: '',
    deepseekModelId: '',
    openaiApiKey: '',
    openaiModelId: '',
    openaiApiEndpoint: '',
    geminiApiKey: '',
    geminiModelId: 'gemini-flash-latest',
  }),

  getters: {
    // 当前供应商是否已配置
    isConfigured(state): boolean {
      return AI_MODEL_CONFIGS[state.selectedModel].validate(state)
    },
    // 当前 API Key
    currentApiKey(state): string {
      const m = state.selectedModel
      if (m === 'doubao') return state.doubaoApiKey
      if (m === 'openai') return state.openaiApiKey
      if (m === 'gemini') return state.geminiApiKey
      return state.deepseekApiKey
    },
    // 当前 Model Id
    currentModelId(state): string {
      const m = state.selectedModel
      const cfg = AI_MODEL_CONFIGS[m]
      if (m === 'doubao') return state.doubaoModelId
      if (m === 'openai') return state.openaiModelId
      if (m === 'gemini') return state.geminiModelId
      return state.deepseekModelId || cfg.defaultModel || ''
    },
  },

  actions: {
    setSelectedModel(model: AIModelType) {
      this.selectedModel = model
    },
    setDoubaoApiKey(key: string) {
      this.doubaoApiKey = key
    },
    setDoubaoModelId(id: string) {
      this.doubaoModelId = id
    },
    setDeepseekApiKey(key: string) {
      this.deepseekApiKey = key
    },
    setDeepseekModelId(id: string) {
      this.deepseekModelId = id
    },
    setOpenaiApiKey(key: string) {
      this.openaiApiKey = key
    },
    setOpenaiModelId(id: string) {
      this.openaiModelId = id
    },
    setOpenaiApiEndpoint(endpoint: string) {
      this.openaiApiEndpoint = endpoint
    },
    setGeminiApiKey(key: string) {
      this.geminiApiKey = key
    },
    setGeminiModelId(id: string) {
      this.geminiModelId = id
    },
  },

  // 持久化到 localStorage
  persist: {
    key: STORAGE_KEYS.AI_CONFIG,
    storage: piniaPluginPersistedstate.localStorage(),
  },
})
