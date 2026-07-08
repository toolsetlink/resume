// grammar store 单元测试 - 自由简历项目
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'

// 提供 piniaPluginPersistedstate 全局变量，与其它 store 测试保持一致
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
import { useGrammarStore, type GrammarError } from '@/stores/grammar'

beforeEach(() => {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  const app = createApp({})
  app.use(pinia)
  setActivePinia(pinia)
  localStorage.clear()
})

// 构造测试用错误数据
const makeError = (text: string, suggestion: string): GrammarError => ({
  context: `上下文-${text}`,
  text,
  suggestion,
  reason: '拼写错误',
  type: 'spelling',
})

const makeGrammarError = (text: string): GrammarError => ({
  context: `上下文-${text}`,
  text,
  suggestion: `${text}-修正`,
  reason: '语法错误',
  type: 'grammar',
})

describe('grammar store - 初始状态', () => {
  it('默认 isChecking 为 false', () => {
    const store = useGrammarStore()

    expect(store.isChecking).toBe(false)
  })

  it('默认 errors 为空数组', () => {
    const store = useGrammarStore()

    expect(store.errors).toEqual([])
    expect(store.errors.length).toBe(0)
  })

  it('默认 selectedErrorIndex 为 null', () => {
    const store = useGrammarStore()

    expect(store.selectedErrorIndex).toBeNull()
  })

  it('默认 highlightKey 为 0', () => {
    const store = useGrammarStore()

    expect(store.highlightKey).toBe(0)
  })
})

describe('grammar store - setErrors / clearErrors', () => {
  it('setErrors 设置错误列表', () => {
    const store = useGrammarStore()
    const errors = [makeError('teh', 'the'), makeError('recieve', 'receive')]

    store.setErrors(errors)

    expect(store.errors.length).toBe(2)
    expect(store.errors[0].text).toBe('teh')
    expect(store.errors[1].text).toBe('recieve')
  })

  it('setErrors 覆盖原有错误列表', () => {
    const store = useGrammarStore()
    store.setErrors([makeError('old', 'new')])
    expect(store.errors.length).toBe(1)

    store.setErrors([
      makeError('a', 'A'),
      makeError('b', 'B'),
      makeError('c', 'C'),
    ])

    expect(store.errors.length).toBe(3)
    expect(store.errors[0].text).toBe('a')
  })

  it('setErrors 传入空数组清空错误', () => {
    const store = useGrammarStore()
    store.setErrors([makeError('teh', 'the')])

    store.setErrors([])

    expect(store.errors.length).toBe(0)
  })

  it('clearErrors 清空错误列表', () => {
    const store = useGrammarStore()
    store.setErrors([makeError('teh', 'the'), makeError('recieve', 'receive')])
    store.setSelectedErrorIndex(0)

    store.clearErrors()

    expect(store.errors.length).toBe(0)
  })

  it('clearErrors 同时清空 selectedErrorIndex', () => {
    const store = useGrammarStore()
    store.setErrors([makeError('teh', 'the')])
    store.selectError(0)
    expect(store.selectedErrorIndex).toBe(0)

    store.clearErrors()

    expect(store.selectedErrorIndex).toBeNull()
  })
})

describe('grammar store - setIsChecking', () => {
  it('setIsChecking 设置为 true', () => {
    const store = useGrammarStore()

    store.setIsChecking(true)

    expect(store.isChecking).toBe(true)
  })

  it('setIsChecking 设置为 false', () => {
    const store = useGrammarStore()
    store.setIsChecking(true)

    store.setIsChecking(false)

    expect(store.isChecking).toBe(false)
  })
})

describe('grammar store - selectError / setSelectedErrorIndex', () => {
  it('selectError 设置 selectedErrorIndex', () => {
    const store = useGrammarStore()
    store.setErrors([
      makeError('a', 'A'),
      makeError('b', 'B'),
      makeError('c', 'C'),
    ])

    store.selectError(1)

    expect(store.selectedErrorIndex).toBe(1)
  })

  it('setSelectedErrorIndex 设置 selectedErrorIndex', () => {
    const store = useGrammarStore()

    store.setSelectedErrorIndex(5)

    expect(store.selectedErrorIndex).toBe(5)
  })

  it('setSelectedErrorIndex 可设置为 null', () => {
    const store = useGrammarStore()
    store.setSelectedErrorIndex(3)

    store.setSelectedErrorIndex(null)

    expect(store.selectedErrorIndex).toBeNull()
  })
})

describe('grammar store - dismissError', () => {
  it('dismissError 移除指定索引的错误', () => {
    const store = useGrammarStore()
    store.setErrors([
      makeError('a', 'A'),
      makeError('b', 'B'),
      makeError('c', 'C'),
    ])

    store.dismissError(1)

    expect(store.errors.length).toBe(2)
    expect(store.errors[0].text).toBe('a')
    expect(store.errors[1].text).toBe('c')
  })

  it('dismissError 移除后清空 selectedErrorIndex', () => {
    const store = useGrammarStore()
    store.setErrors([makeError('a', 'A'), makeError('b', 'B')])
    store.selectError(0)

    store.dismissError(0)

    expect(store.selectedErrorIndex).toBeNull()
  })

  it('dismissError 移除第一个错误', () => {
    const store = useGrammarStore()
    store.setErrors([
      makeError('a', 'A'),
      makeError('b', 'B'),
      makeError('c', 'C'),
    ])

    store.dismissError(0)

    expect(store.errors.length).toBe(2)
    expect(store.errors[0].text).toBe('b')
  })

  it('dismissError 移除最后一个错误', () => {
    const store = useGrammarStore()
    store.setErrors([makeError('a', 'A'), makeError('b', 'B')])

    store.dismissError(1)

    expect(store.errors.length).toBe(1)
    expect(store.errors[0].text).toBe('a')
  })
})

describe('grammar store - incrementHighlightKey', () => {
  it('incrementHighlightKey 递增 highlightKey', () => {
    const store = useGrammarStore()
    expect(store.highlightKey).toBe(0)

    store.incrementHighlightKey()
    expect(store.highlightKey).toBe(1)

    store.incrementHighlightKey()
    expect(store.highlightKey).toBe(2)

    store.incrementHighlightKey()
    expect(store.highlightKey).toBe(3)
  })

  it('incrementHighlightKey 连续递增多次', () => {
    const store = useGrammarStore()

    for (let i = 0; i < 10; i++) {
      store.incrementHighlightKey()
    }

    expect(store.highlightKey).toBe(10)
  })
})

describe('grammar store - 不持久化', () => {
  it('状态变更后 localStorage 不包含 grammar 相关 key', () => {
    const store = useGrammarStore()
    store.setErrors([makeError('teh', 'the')])
    store.setIsChecking(true)
    store.selectError(0)
    store.incrementHighlightKey()

    // grammar store 没有配置 persist，不应有对应 key
    expect(localStorage.getItem('grammar')).toBeNull()
    expect(localStorage.getItem('grammar-storage')).toBeNull()
  })

  it('不写入 resume-storage / ai-config-storage key', () => {
    const store = useGrammarStore()
    store.setIsChecking(true)

    expect(localStorage.getItem('resume-storage')).toBeNull()
    expect(localStorage.getItem('ai-config-storage')).toBeNull()
  })
})

describe('grammar store - 错误类型与字段', () => {
  it('GrammarError 包含所有必需字段', () => {
    const store = useGrammarStore()
    const error: GrammarError = {
      context: '这是上下文',
      text: 'teh',
      suggestion: 'the',
      reason: '拼写错误',
      type: 'spelling',
    }

    store.setErrors([error])

    expect(store.errors[0].context).toBe('这是上下文')
    expect(store.errors[0].text).toBe('teh')
    expect(store.errors[0].suggestion).toBe('the')
    expect(store.errors[0].reason).toBe('拼写错误')
    expect(store.errors[0].type).toBe('spelling')
  })

  it('支持 grammar 类型错误', () => {
    const store = useGrammarStore()
    const error = makeGrammarError('is are')

    store.setErrors([error])

    expect(store.errors[0].type).toBe('grammar')
  })
})
