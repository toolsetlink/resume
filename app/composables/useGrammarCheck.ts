// 语法检查 composable
import { useGrammarStore } from '~/stores/grammar'
import { useAIConfigStore } from '~/stores/aiConfig'
import type { GrammarError } from '~/stores/grammar'

export function useGrammarCheck() {
  const grammarStore = useGrammarStore()
  const aiConfig = useAIConfigStore()

  // 执行语法检查
  const checkGrammar = async (content: string) => {
    if (!aiConfig.isConfigured) {
      return
    }

    grammarStore.setIsChecking(true)
    grammarStore.clearErrors()

    try {
      const response = await fetch('/api/ai/grammar', {
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
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || `请求失败 (${response.status})`)
      }

      const data = await response.json()
      const aiContent = data?.choices?.[0]?.message?.content || ''
      const parsed = parseGrammarErrors(aiContent)
      grammarStore.setErrors(parsed)
    } catch (e) {
      console.error('语法检查失败:', e)
    } finally {
      grammarStore.setIsChecking(false)
    }
  }

  // 解析语法错误：兼容纯 JSON 与 ```json 包裹
  const parseGrammarErrors = (content: string): GrammarError[] => {
    try {
      const parsed = JSON.parse(content)
      if (parsed.errors && Array.isArray(parsed.errors)) {
        return parsed.errors as GrammarError[]
      }
      return []
    } catch {
      // 尝试提取 JSON 块
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          const parsed = JSON.parse(match[0])
          return (parsed.errors || []) as GrammarError[]
        } catch {
          return []
        }
      }
      return []
    }
  }

  return {
    errors: computed(() => grammarStore.errors),
    isChecking: computed(() => grammarStore.isChecking),
    selectedErrorIndex: computed(() => grammarStore.selectedErrorIndex),
    checkGrammar,
    clearErrors: () => grammarStore.clearErrors(),
    selectError: (index: number) => grammarStore.selectError(index),
    dismissError: (index: number) => grammarStore.dismissError(index),
  }
}
