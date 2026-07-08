// 语法检查 Store - 自由简历项目
import { defineStore } from 'pinia'

// 语法错误类型
export interface GrammarError {
  context: string
  text: string
  suggestion: string
  reason: string
  type: 'spelling' | 'grammar'
}

interface GrammarState {
  isChecking: boolean
  errors: GrammarError[]
  selectedErrorIndex: number | null
  highlightKey: number
}

export const useGrammarStore = defineStore('grammar', {
  state: (): GrammarState => ({
    isChecking: false,
    errors: [],
    selectedErrorIndex: null,
    highlightKey: 0,
  }),

  actions: {
    setErrors(errors: GrammarError[]) {
      this.errors = errors
    },
    setIsChecking(checking: boolean) {
      this.isChecking = checking
    },
    setSelectedErrorIndex(index: number | null) {
      this.selectedErrorIndex = index
    },
    incrementHighlightKey() {
      this.highlightKey++
    },
    clearErrors() {
      this.errors = []
      this.selectedErrorIndex = null
    },
    selectError(index: number) {
      this.selectedErrorIndex = index
    },
    dismissError(index: number) {
      this.errors.splice(index, 1)
      this.selectedErrorIndex = null
    },
  },
})
