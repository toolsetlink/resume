// 单元测试：shared/types/template.ts
// 类型测试：通过实现一个对象断言类型正确性
import { describe, it, expect } from 'vitest'
import type { ResumeTemplate, TemplateConfig } from '#shared/types/template'

describe('ResumeTemplate 类型结构', () => {
  it('能够构造一个满足 ResumeTemplate 类型的对象', () => {
    const template: ResumeTemplate = {
      id: 'modern',
      name: '现代模板',
      description: '现代化布局',
      thumbnail: '/templates/thumbnails/modern.png',
      layout: 'modern',
      colorScheme: {
        primary: '#000000',
        secondary: '#666666',
        background: '#ffffff',
        text: '#333333',
      },
      spacing: {
        sectionGap: 16,
        itemGap: 8,
        contentPadding: 24,
      },
      basic: {
        layout: 'left',
      },
      availableSections: ['basic', 'skills', 'experience'],
    }

    // 运行时断言：对象字段完整
    expect(template).toHaveProperty('id')
    expect(template).toHaveProperty('name')
    expect(template).toHaveProperty('description')
    expect(template).toHaveProperty('thumbnail')
    expect(template).toHaveProperty('layout')
    expect(template).toHaveProperty('colorScheme')
    expect(template).toHaveProperty('spacing')
    expect(template).toHaveProperty('basic')
  })

  it('colorScheme 包含 primary/secondary/background/text', () => {
    const template: ResumeTemplate = {
      id: 'pro',
      name: 'Pro',
      description: '',
      thumbnail: '',
      layout: 'professional',
      colorScheme: {
        primary: '#000',
        secondary: '#666',
        background: '#fff',
        text: '#333',
      },
      spacing: {
        sectionGap: 10,
        itemGap: 5,
        contentPadding: 20,
      },
      basic: {},
    }

    expect(template.colorScheme).toHaveProperty('primary')
    expect(template.colorScheme).toHaveProperty('secondary')
    expect(template.colorScheme).toHaveProperty('background')
    expect(template.colorScheme).toHaveProperty('text')
  })

  it('spacing 包含 sectionGap/itemGap/contentPadding 且为数值', () => {
    const template: ResumeTemplate = {
      id: 'x',
      name: 'X',
      description: '',
      thumbnail: '',
      layout: 'x',
      colorScheme: {
        primary: '',
        secondary: '',
        background: '',
        text: '',
      },
      spacing: {
        sectionGap: 16,
        itemGap: 8,
        contentPadding: 32,
      },
      basic: {},
    }

    expect(template.spacing.sectionGap).toBeTypeOf('number')
    expect(template.spacing.itemGap).toBeTypeOf('number')
    expect(template.spacing.contentPadding).toBeTypeOf('number')
  })

  it('basic.layout 可选且取值在 left/center/right', () => {
    const template: ResumeTemplate = {
      id: 'x',
      name: 'X',
      description: '',
      thumbnail: '',
      layout: 'x',
      colorScheme: {
        primary: '',
        secondary: '',
        background: '',
        text: '',
      },
      spacing: {
        sectionGap: 0,
        itemGap: 0,
        contentPadding: 0,
      },
      basic: {
        layout: 'center',
      },
    }

    expect(['left', 'center', 'right']).toContain(template.basic.layout)
  })

  it('availableSections 为可选数组', () => {
    const template: ResumeTemplate = {
      id: 'x',
      name: 'X',
      description: '',
      thumbnail: '',
      layout: 'x',
      colorScheme: {
        primary: '',
        secondary: '',
        background: '',
        text: '',
      },
      spacing: {
        sectionGap: 0,
        itemGap: 0,
        contentPadding: 0,
      },
      basic: {},
      availableSections: ['basic', 'education'],
    }

    expect(Array.isArray(template.availableSections)).toBe(true)
  })
})

describe('TemplateConfig 类型结构', () => {
  it('能够构造一个满足 TemplateConfig 类型的对象', () => {
    const config: TemplateConfig = {
      sectionTitle: {
        className: 'text-primary',
        styles: {
          fontSize: '18px',
          fontWeight: '600',
        },
      },
    }

    expect(config).toHaveProperty('sectionTitle')
    expect(config.sectionTitle).toHaveProperty('styles')
  })

  it('sectionTitle.className 为可选', () => {
    const config: TemplateConfig = {
      sectionTitle: {
        styles: {
          color: 'red',
        },
      },
    }

    expect(config.sectionTitle.styles).toHaveProperty('color')
  })

  it('sectionTitle.styles 是 Record<string, string>', () => {
    const config: TemplateConfig = {
      sectionTitle: {
        styles: {
          margin: '0 0 8px',
          padding: '4px',
        },
      },
    }

    expect(config.sectionTitle.styles).toBeTypeOf('object')
    for (const v of Object.values(config.sectionTitle.styles)) {
      expect(v).toBeTypeOf('string')
    }
  })

  it('空 styles 对象也是合法的', () => {
    const config: TemplateConfig = {
      sectionTitle: {
        styles: {},
      },
    }

    expect(Object.keys(config.sectionTitle.styles)).toHaveLength(0)
  })
})
