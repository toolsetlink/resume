// 单元测试：shared/config/modules.ts
import { describe, it, expect } from 'vitest'
import { MODULE_CONFIGS } from '#shared/config/modules'

const EXPECTED_IDS = [
  'basic',
  'skills',
  'experience',
  'projects',
  'education',
  'certificates',
  'selfEvaluation',
  'custom',
] as const

describe('MODULE_CONFIGS', () => {
  it('是数组且长度为 8', () => {
    expect(Array.isArray(MODULE_CONFIGS)).toBe(true)
    expect(MODULE_CONFIGS).toHaveLength(8)
  })

  it('包含所有预期 id', () => {
    const ids = MODULE_CONFIGS.map((m) => m.id)
    for (const id of EXPECTED_IDS) {
      expect(ids).toContain(id)
    }
  })

  it('无重复 id', () => {
    const ids = MODULE_CONFIGS.map((m) => m.id)
    const set = new Set(ids)
    expect(set.size).toBe(ids.length)
  })

  it('每项字段完整：id/title(zh,en)/icon/enabled/order/description(zh,en)', () => {
    for (const m of MODULE_CONFIGS) {
      expect(m).toHaveProperty('id')
      expect(m).toHaveProperty('title')
      expect(m.title).toHaveProperty('zh')
      expect(m.title).toHaveProperty('en')
      expect(m).toHaveProperty('icon')
      expect(m).toHaveProperty('enabled')
      expect(m).toHaveProperty('order')
      expect(m).toHaveProperty('description')
      expect(m.description).toHaveProperty('zh')
      expect(m.description).toHaveProperty('en')
    }
  })

  it('title.zh 与 title.en 都是非空字符串', () => {
    for (const m of MODULE_CONFIGS) {
      expect(m.title.zh).toBeTypeOf('string')
      expect(m.title.zh.length).toBeGreaterThan(0)
      expect(m.title.en).toBeTypeOf('string')
      expect(m.title.en.length).toBeGreaterThan(0)
    }
  })

  it('description.zh 与 description.en 都是非空字符串', () => {
    for (const m of MODULE_CONFIGS) {
      expect(m.description.zh).toBeTypeOf('string')
      expect(m.description.zh.length).toBeGreaterThan(0)
      expect(m.description.en).toBeTypeOf('string')
      expect(m.description.en.length).toBeGreaterThan(0)
    }
  })

  it('icon 是非空字符串', () => {
    for (const m of MODULE_CONFIGS) {
      expect(m.icon).toBeTypeOf('string')
      expect(m.icon.length).toBeGreaterThan(0)
    }
  })

  it('order 唯一且从 0 开始递增', () => {
    const orders = MODULE_CONFIGS.map((m) => m.order)
    expect(orders).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    const set = new Set(orders)
    expect(set.size).toBe(orders.length)
  })

  it('enabled 字段是 boolean', () => {
    for (const m of MODULE_CONFIGS) {
      expect(m.enabled).toBeTypeOf('boolean')
    }
  })

  it('basic/skills/experience/projects/education 的 enabled=true', () => {
    const enabledIds = ['basic', 'skills', 'experience', 'projects', 'education']
    for (const id of enabledIds) {
      const m = MODULE_CONFIGS.find((x) => x.id === id)
      expect(m).toBeDefined()
      expect(m!.enabled).toBe(true)
    }
  })

  it('certificates/selfEvaluation/custom 的 enabled=false', () => {
    const disabledIds = ['certificates', 'selfEvaluation', 'custom']
    for (const id of disabledIds) {
      const m = MODULE_CONFIGS.find((x) => x.id === id)
      expect(m).toBeDefined()
      expect(m!.enabled).toBe(false)
    }
  })
})
