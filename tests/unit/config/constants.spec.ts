// 单元测试：shared/config/constants.ts
import { describe, it, expect } from 'vitest'
import {
  DEFAULT_FIELD_ORDER,
  STORAGE_KEYS,
} from '#shared/config/constants'

const VALID_TYPES = ['date', 'textarea', 'text', 'editor']

describe('DEFAULT_FIELD_ORDER', () => {
  it('是数组且长度为 7', () => {
    expect(Array.isArray(DEFAULT_FIELD_ORDER)).toBe(true)
    expect(DEFAULT_FIELD_ORDER).toHaveLength(7)
  })

  it('每项有 id/key/label/type/visible', () => {
    for (const f of DEFAULT_FIELD_ORDER) {
      expect(f).toHaveProperty('id')
      expect(f).toHaveProperty('key')
      expect(f).toHaveProperty('label')
      expect(f).toHaveProperty('type')
      expect(f).toHaveProperty('visible')
    }
  })

  it('无重复 id', () => {
    const ids = DEFAULT_FIELD_ORDER.map((f) => f.id)
    const set = new Set(ids)
    expect(set.size).toBe(ids.length)
  })

  it('无重复 key', () => {
    const keys = DEFAULT_FIELD_ORDER.map((f) => f.key)
    const set = new Set(keys)
    expect(set.size).toBe(keys.length)
  })

  it('type 取值在 date/textarea/text/editor 中', () => {
    for (const f of DEFAULT_FIELD_ORDER) {
      expect(VALID_TYPES).toContain(f.type)
    }
  })

  it('visible 是 boolean', () => {
    for (const f of DEFAULT_FIELD_ORDER) {
      expect(f.visible).toBeTypeOf('boolean')
    }
  })

  it('所有字段默认 visible=true', () => {
    for (const f of DEFAULT_FIELD_ORDER) {
      expect(f.visible).toBe(true)
    }
  })

  it('id 为字符串且非空', () => {
    for (const f of DEFAULT_FIELD_ORDER) {
      expect(f.id).toBeTypeOf('string')
      expect(f.id.length).toBeGreaterThan(0)
    }
  })

  it('label 为非空字符串', () => {
    for (const f of DEFAULT_FIELD_ORDER) {
      expect(f.label).toBeTypeOf('string')
      expect(f.label.length).toBeGreaterThan(0)
    }
  })
})

describe('STORAGE_KEYS', () => {
  it('RESUME === "resume-storage"', () => {
    expect(STORAGE_KEYS.RESUME).toBe('resume-storage')
  })

  it('AI_CONFIG === "ai-config-storage"', () => {
    expect(STORAGE_KEYS.AI_CONFIG).toBe('ai-config-storage')
  })

  it('所有值均为非空字符串', () => {
    expect(STORAGE_KEYS.RESUME.length).toBeGreaterThan(0)
    expect(STORAGE_KEYS.AI_CONFIG.length).toBeGreaterThan(0)
  })

  it('两个 key 值不重复', () => {
    expect(STORAGE_KEYS.RESUME).not.toBe(STORAGE_KEYS.AI_CONFIG)
  })
})
