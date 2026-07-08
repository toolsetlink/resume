// AI 润色 composable - 流式接收润色结果
import { useAIConfigStore } from '~/stores/aiConfig'

export function useAIPolish() {
  const aiConfig = useAIConfigStore()

  // 是否正在润色
  const isPolishing = ref(false)
  // 已润色内容（流式累加）
  const polishedContent = ref('')
  // 错误信息
  const error = ref<string | null>(null)
  // 中止控制器
  let abortController: AbortController | null = null

  // 执行润色
  const polish = async (content: string, customInstructions?: string) => {
    if (!aiConfig.isConfigured) {
      error.value = '请先配置 AI 供应商'
      return
    }

    isPolishing.value = true
    polishedContent.value = ''
    error.value = null

    abortController = new AbortController()

    try {
      const response = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          apiKey: aiConfig.currentApiKey,
          apiEndpoint:
            aiConfig.selectedModel === 'openai'
              ? aiConfig.openaiApiEndpoint
              : undefined,
          model: aiConfig.currentModelId,
          modelType: aiConfig.selectedModel,
          customInstructions: customInstructions?.trim() || undefined,
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || `请求失败 (${response.status})`)
      }

      if (!response.body) throw new Error('无响应内容')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        polishedContent.value += chunk
      }
    } catch (e) {
      // 用户主动中止时不当作错误
      if (e instanceof Error && e.name === 'AbortError') return
      error.value = e instanceof Error ? e.message : '润色失败'
    } finally {
      isPolishing.value = false
    }
  }

  // 中止当前润色
  const abort = () => {
    abortController?.abort()
    abortController = null
    isPolishing.value = false
  }

  // 重置状态
  const reset = () => {
    polishedContent.value = ''
    error.value = null
  }

  return {
    isPolishing,
    polishedContent,
    error,
    polish,
    abort,
    reset,
  }
}
