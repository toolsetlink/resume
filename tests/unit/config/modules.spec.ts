import { describe, it, expect } from 'vitest'
import { MODULE_CONFIGS } from '@/shared/config/modules'

describe('MODULE_CONFIGS', () => {
  it('contains 8 modules', () => {
    expect(MODULE_CONFIGS).toHaveLength(8)
  })

  it('basic module is first and enabled', () => {
    expect(MODULE_CONFIGS[0]!.id).toBe('basic')
    expect(MODULE_CONFIGS[0]!.enabled).toBe(true)
  })

  it('all modules have unique ids', () => {
    const ids = MODULE_CONFIGS.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all modules have Chinese titles and descriptions', () => {
    for (const module of MODULE_CONFIGS) {
      expect(module.title).toBeTypeOf('string')
      expect(module.title).not.toBe('')
      expect(module.description).toBeTypeOf('string')
      expect(module.description).not.toBe('')
    }
  })
})
