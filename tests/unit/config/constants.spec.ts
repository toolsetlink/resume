import { describe, it, expect } from 'vitest'
import { DEFAULT_FIELD_ORDER, STORAGE_KEYS } from '@/shared/config/constants'

describe('DEFAULT_FIELD_ORDER', () => {
  it('contains 7 default fields', () => {
    expect(DEFAULT_FIELD_ORDER).toHaveLength(7)
  })

  it('each field has required properties', () => {
    for (const field of DEFAULT_FIELD_ORDER) {
      expect(field.id).toBeTruthy()
      expect(field.key).toBeTruthy()
      expect(field.type).toMatch(/^(text|date|textarea|editor)$/)
      expect(typeof field.visible).toBe('boolean')
    }
  })
})

describe('STORAGE_KEYS', () => {
  it('has RESUME key', () => {
    expect(STORAGE_KEYS.RESUME).toBe('resume-storage')
  })
})
