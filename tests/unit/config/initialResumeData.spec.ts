// 单元测试：shared/config/initialResumeData.ts
import { describe, it, expect } from 'vitest'
import {
  initialGlobalSettings,
  initialResumeState,
  initialResumeStateEn,
  blankResumeState,
  createNewResume,
} from '#shared/config/initialResumeData'

describe('initialGlobalSettings', () => {
  it('是对象且包含全部期望字段', () => {
    expect(initialGlobalSettings).toBeTypeOf('object')
    expect(initialGlobalSettings).not.toBeNull()
    expect(initialGlobalSettings).toHaveProperty('baseFontSize')
    expect(initialGlobalSettings).toHaveProperty('pagePadding')
    expect(initialGlobalSettings).toHaveProperty('paragraphSpacing')
    expect(initialGlobalSettings).toHaveProperty('lineHeight')
    expect(initialGlobalSettings).toHaveProperty('sectionSpacing')
    expect(initialGlobalSettings).toHaveProperty('headerSize')
    expect(initialGlobalSettings).toHaveProperty('subheaderSize')
    expect(initialGlobalSettings).toHaveProperty('useIconMode')
    expect(initialGlobalSettings).toHaveProperty('themeColor')
    expect(initialGlobalSettings).toHaveProperty('centerSubtitle')
  })

  it('themeColor 是有效的 hex 颜色', () => {
    expect(initialGlobalSettings.themeColor).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('所有数值字段都是正数', () => {
    expect(initialGlobalSettings.baseFontSize!).toBeGreaterThan(0)
    expect(initialGlobalSettings.pagePadding!).toBeGreaterThan(0)
    expect(initialGlobalSettings.paragraphSpacing!).toBeGreaterThan(0)
    expect(initialGlobalSettings.lineHeight!).toBeGreaterThan(0)
    expect(initialGlobalSettings.sectionSpacing!).toBeGreaterThan(0)
    expect(initialGlobalSettings.headerSize!).toBeGreaterThan(0)
    expect(initialGlobalSettings.subheaderSize!).toBeGreaterThan(0)
  })

  it('useIconMode 与 centerSubtitle 是 boolean', () => {
    expect(initialGlobalSettings.useIconMode).toBeTypeOf('boolean')
    expect(initialGlobalSettings.centerSubtitle).toBeTypeOf('boolean')
  })
})

describe('initialResumeState', () => {
  it('title 是非空字符串', () => {
    expect(initialResumeState.title).toBeTypeOf('string')
    expect(initialResumeState.title.length).toBeGreaterThan(0)
  })

  it('basic.name 非空', () => {
    expect(initialResumeState.basic.name).toBeTypeOf('string')
    expect(initialResumeState.basic.name.length).toBeGreaterThan(0)
  })

  it('basic.fieldOrder 是数组且长度 >= 5', () => {
    expect(Array.isArray(initialResumeState.basic.fieldOrder)).toBe(true)
    expect(initialResumeState.basic.fieldOrder!.length).toBeGreaterThanOrEqual(5)
  })

  it('basic.photoConfig 包含 width/height/aspectRatio/borderRadius/visible', () => {
    const pc = initialResumeState.basic.photoConfig
    expect(pc).toBeTypeOf('object')
    expect(pc).toHaveProperty('width')
    expect(pc).toHaveProperty('height')
    expect(pc).toHaveProperty('aspectRatio')
    expect(pc).toHaveProperty('borderRadius')
    expect(pc).toHaveProperty('visible')
  })

  it('education 是数组，第一项包含 school/major/degree/startDate/endDate', () => {
    expect(Array.isArray(initialResumeState.education)).toBe(true)
    expect(initialResumeState.education.length).toBeGreaterThan(0)
    const first = initialResumeState.education[0]
    expect(first).toHaveProperty('school')
    expect(first).toHaveProperty('major')
    expect(first).toHaveProperty('degree')
    expect(first).toHaveProperty('startDate')
    expect(first).toHaveProperty('endDate')
  })

  it('experience 与 projects 是数组', () => {
    expect(Array.isArray(initialResumeState.experience)).toBe(true)
    expect(Array.isArray(initialResumeState.projects)).toBe(true)
  })

  it('menuSections 是数组，每项有 id/title/icon/enabled/order', () => {
    expect(Array.isArray(initialResumeState.menuSections)).toBe(true)
    expect(initialResumeState.menuSections.length).toBeGreaterThan(0)
    for (const section of initialResumeState.menuSections) {
      expect(section).toHaveProperty('id')
      expect(section).toHaveProperty('title')
      expect(section).toHaveProperty('icon')
      expect(section).toHaveProperty('enabled')
      expect(section).toHaveProperty('order')
    }
  })

  it('globalSettings 字段完整', () => {
    const gs = initialResumeState.globalSettings
    expect(gs).toBeTypeOf('object')
    expect(gs).toHaveProperty('themeColor')
    expect(gs).toHaveProperty('baseFontSize')
    expect(gs).toHaveProperty('pagePadding')
    expect(gs).toHaveProperty('lineHeight')
  })
})

describe('initialResumeStateEn', () => {
  it('结构与中文版相同（同字段），name 为英文', () => {
    expect(initialResumeStateEn).toHaveProperty('title')
    expect(initialResumeStateEn).toHaveProperty('basic')
    expect(initialResumeStateEn).toHaveProperty('education')
    expect(initialResumeStateEn).toHaveProperty('experience')
    expect(initialResumeStateEn).toHaveProperty('projects')
    expect(initialResumeStateEn).toHaveProperty('menuSections')
    expect(initialResumeStateEn).toHaveProperty('globalSettings')
    expect(initialResumeStateEn.basic.name).toBe('John Smith')
  })

  it('education/experience/projects 都是数组', () => {
    expect(Array.isArray(initialResumeStateEn.education)).toBe(true)
    expect(Array.isArray(initialResumeStateEn.experience)).toBe(true)
    expect(Array.isArray(initialResumeStateEn.projects)).toBe(true)
  })

  it('menuSections 每项包含 id/title/icon/enabled/order', () => {
    for (const section of initialResumeStateEn.menuSections) {
      expect(section).toHaveProperty('id')
      expect(section).toHaveProperty('title')
      expect(section).toHaveProperty('icon')
      expect(section).toHaveProperty('enabled')
      expect(section).toHaveProperty('order')
    }
  })

  it('basic.fieldOrder 仍为数组', () => {
    expect(Array.isArray(initialResumeStateEn.basic.fieldOrder)).toBe(true)
  })
})

describe('blankResumeState', () => {
  it('结构与 initialResumeState 相同', () => {
    expect(blankResumeState).toHaveProperty('title')
    expect(blankResumeState).toHaveProperty('basic')
    expect(blankResumeState).toHaveProperty('education')
    expect(blankResumeState).toHaveProperty('experience')
    expect(blankResumeState).toHaveProperty('projects')
    expect(blankResumeState).toHaveProperty('menuSections')
    expect(blankResumeState).toHaveProperty('globalSettings')
  })

  it('basic.name 是空字符串', () => {
    expect(blankResumeState.basic.name).toBe('')
  })

  it('education/experience/projects 为空数组', () => {
    expect(blankResumeState.education).toEqual([])
    expect(blankResumeState.experience).toEqual([])
    expect(blankResumeState.projects).toEqual([])
  })

  it('menuSections 至少包含 basic 模块', () => {
    expect(Array.isArray(blankResumeState.menuSections)).toBe(true)
    expect(blankResumeState.menuSections.length).toBeGreaterThan(0)
    expect(blankResumeState.menuSections[0].id).toBe('basic')
  })
})

describe('createNewResume', () => {
  it('返回的对象有 id（uuid 格式）', () => {
    const r = createNewResume('测试简历')
    expect(r.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('返回的对象有 title', () => {
    const r = createNewResume('测试简历')
    expect(r.title).toBe('测试简历')
  })

  it('createdAt 与 updatedAt 是 ISO 格式', () => {
    const r = createNewResume()
    expect(r.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    expect(r.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('templateId 为 null', () => {
    const r = createNewResume()
    expect(r.templateId).toBeNull()
  })

  it('两次调用返回不同 id', () => {
    const a = createNewResume()
    const b = createNewResume()
    expect(a.id).not.toBe(b.id)
  })

  it('不传 title 时使用默认 "新建简历"', () => {
    const r = createNewResume()
    expect(r.title).toBe('新建简历')
  })
})
