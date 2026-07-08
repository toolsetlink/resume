// 单元测试：模板注册表 app/components/templates/registry.ts
import { describe, it, expect } from 'vitest'
import {
  TEMPLATE_REGISTRY,
  DEFAULT_TEMPLATES,
  getTemplateComponent,
  getTemplateConfig,
} from '@/components/templates/registry'
import { professionalConfig } from '@/components/templates/professional/config'
import { modernConfig } from '@/components/templates/modern/config'
import { elegantConfig } from '@/components/templates/elegant/config'
import { creativeConfig } from '@/components/templates/creative/config'
import type { ResumeTemplate } from '#shared/types/template'

describe('TEMPLATE_REGISTRY', () => {
  it('是数组', () => {
    expect(Array.isArray(TEMPLATE_REGISTRY)).toBe(true)
  })

  it('长度为 4', () => {
    expect(TEMPLATE_REGISTRY).toHaveLength(4)
  })

  it('每项有 config 和 Component 字段', () => {
    for (const entry of TEMPLATE_REGISTRY) {
      expect(entry).toHaveProperty('config')
      expect(entry).toHaveProperty('Component')
      expect(entry.config).toBeTypeOf('object')
      expect(entry.Component).not.toBeNull()
      // Component 应该是一个可挂载的 Vue 组件对象
      expect(typeof entry.Component).toBe('object')
    }
  })

  it('4 个模板 id 唯一：professional/modern/elegant/creative', () => {
    const ids = TEMPLATE_REGISTRY.map((e) => e.config.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(
      expect.arrayContaining([
        'professional',
        'modern',
        'elegant',
        'creative',
      ])
    )
  })

  it('顺序为 professional → modern → elegant → creative', () => {
    const ids = TEMPLATE_REGISTRY.map((e) => e.config.id)
    expect(ids).toEqual([
      'professional',
      'modern',
      'elegant',
      'creative',
    ])
  })

  it('每项 config 对应各自的配置文件', () => {
    expect(TEMPLATE_REGISTRY[0].config).toBe(professionalConfig)
    expect(TEMPLATE_REGISTRY[1].config).toBe(modernConfig)
    expect(TEMPLATE_REGISTRY[2].config).toBe(elegantConfig)
    expect(TEMPLATE_REGISTRY[3].config).toBe(creativeConfig)
  })

  it('每个 config 字段完整：id/name/description/thumbnail/layout/colorScheme/spacing', () => {
    const configs: ResumeTemplate[] = [
      professionalConfig,
      modernConfig,
      elegantConfig,
      creativeConfig,
    ]
    for (const config of configs) {
      expect(config).toHaveProperty('id')
      expect(config.id).toBeTypeOf('string')
      expect(config).toHaveProperty('name')
      expect(config.name).toBeTypeOf('string')
      expect(config).toHaveProperty('description')
      expect(config.description).toBeTypeOf('string')
      expect(config).toHaveProperty('thumbnail')
      expect(config.thumbnail).toBeTypeOf('string')
      expect(config).toHaveProperty('layout')
      expect(config.layout).toBeTypeOf('string')
      expect(config).toHaveProperty('colorScheme')
      expect(config.colorScheme).toBeTypeOf('object')
      expect(config.colorScheme).toHaveProperty('primary')
      expect(config.colorScheme).toHaveProperty('secondary')
      expect(config.colorScheme).toHaveProperty('background')
      expect(config.colorScheme).toHaveProperty('text')
      expect(config).toHaveProperty('spacing')
      expect(config.spacing).toBeTypeOf('object')
      expect(config.spacing).toHaveProperty('sectionGap')
      expect(config.spacing).toHaveProperty('itemGap')
      expect(config.spacing).toHaveProperty('contentPadding')
      expect(config.spacing.sectionGap).toBeTypeOf('number')
      expect(config.spacing.itemGap).toBeTypeOf('number')
      expect(config.spacing.contentPadding).toBeTypeOf('number')
    }
  })

  it('每个 config 的 layout 字段与 id 相同', () => {
    for (const entry of TEMPLATE_REGISTRY) {
      expect(entry.config.layout).toBe(entry.config.id)
    }
  })
})

describe('DEFAULT_TEMPLATES', () => {
  it('长度为 4', () => {
    expect(DEFAULT_TEMPLATES).toHaveLength(4)
  })

  it('内容为 TEMPLATE_REGISTRY 中所有 config', () => {
    expect(DEFAULT_TEMPLATES).toEqual(
      TEMPLATE_REGISTRY.map((e) => e.config)
    )
  })

  it('每项都是 ResumeTemplate 对象', () => {
    for (const t of DEFAULT_TEMPLATES) {
      expect(t).toHaveProperty('id')
      expect(t).toHaveProperty('layout')
      expect(t).toHaveProperty('colorScheme')
      expect(t).toHaveProperty('spacing')
    }
  })
})

describe('getTemplateComponent', () => {
  it("传入 'professional' 返回非 null 组件", () => {
    const Component = getTemplateComponent('professional')
    expect(Component).not.toBeNull()
    expect(Component).toBeDefined()
    expect(typeof Component).toBe('object')
  })

  it("传入 'modern' 返回非 null 组件", () => {
    expect(getTemplateComponent('modern')).not.toBeNull()
  })

  it("传入 'elegant' 返回非 null 组件", () => {
    expect(getTemplateComponent('elegant')).not.toBeNull()
  })

  it("传入 'creative' 返回非 null 组件", () => {
    expect(getTemplateComponent('creative')).not.toBeNull()
  })

  it("传入 'unknown' 返回 null", () => {
    expect(getTemplateComponent('unknown')).toBeNull()
  })

  it("传入空字符串返回 null", () => {
    expect(getTemplateComponent('')).toBeNull()
  })
})

describe('getTemplateConfig', () => {
  it("传入 'professional' 返回配置对象", () => {
    const config = getTemplateConfig('professional')
    expect(config).not.toBeNull()
    expect(config?.id).toBe('professional')
    expect(config?.name).toBe('专业简约')
  })

  it("传入 'modern' 返回配置对象", () => {
    const config = getTemplateConfig('modern')
    expect(config).not.toBeNull()
    expect(config?.id).toBe('modern')
    expect(config?.name).toBe('现代极简')
  })

  it("传入 'elegant' 返回配置对象", () => {
    const config = getTemplateConfig('elegant')
    expect(config).not.toBeNull()
    expect(config?.id).toBe('elegant')
    expect(config?.name).toBe('优雅经典')
  })

  it("传入 'creative' 返回配置对象", () => {
    const config = getTemplateConfig('creative')
    expect(config).not.toBeNull()
    expect(config?.id).toBe('creative')
    expect(config?.name).toBe('创意活泼')
  })

  it("返回的配置与对应模板 config 一致", () => {
    expect(getTemplateConfig('professional')).toBe(professionalConfig)
    expect(getTemplateConfig('modern')).toBe(modernConfig)
    expect(getTemplateConfig('elegant')).toBe(elegantConfig)
    expect(getTemplateConfig('creative')).toBe(creativeConfig)
  })

  it("传入 'unknown' 返回 null", () => {
    expect(getTemplateConfig('unknown')).toBeNull()
  })

  it("传入空字符串返回 null", () => {
    expect(getTemplateConfig('')).toBeNull()
  })
})
