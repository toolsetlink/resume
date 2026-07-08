// 单元测试：shared/types/resume.ts
import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PHOTO_CONFIG,
  THEME_COLORS,
  getRatioMultiplier,
  getBorderRadiusValue,
} from '#shared/types/resume'

describe('DEFAULT_PHOTO_CONFIG', () => {
  it('包含 width=90', () => {
    expect(DEFAULT_PHOTO_CONFIG.width).toBe(90)
  })

  it('包含 height=120', () => {
    expect(DEFAULT_PHOTO_CONFIG.height).toBe(120)
  })

  it('aspectRatio="1:1"', () => {
    expect(DEFAULT_PHOTO_CONFIG.aspectRatio).toBe('1:1')
  })

  it('borderRadius="none"', () => {
    expect(DEFAULT_PHOTO_CONFIG.borderRadius).toBe('none')
  })

  it('customBorderRadius=0', () => {
    expect(DEFAULT_PHOTO_CONFIG.customBorderRadius).toBe(0)
  })

  it('visible=true', () => {
    expect(DEFAULT_PHOTO_CONFIG.visible).toBe(true)
  })

  it('包含全部期望字段', () => {
    expect(DEFAULT_PHOTO_CONFIG).toHaveProperty('width')
    expect(DEFAULT_PHOTO_CONFIG).toHaveProperty('height')
    expect(DEFAULT_PHOTO_CONFIG).toHaveProperty('aspectRatio')
    expect(DEFAULT_PHOTO_CONFIG).toHaveProperty('borderRadius')
    expect(DEFAULT_PHOTO_CONFIG).toHaveProperty('customBorderRadius')
    expect(DEFAULT_PHOTO_CONFIG).toHaveProperty('visible')
  })

  it('width 与 height 是正数', () => {
    expect(DEFAULT_PHOTO_CONFIG.width).toBeGreaterThan(0)
    expect(DEFAULT_PHOTO_CONFIG.height).toBeGreaterThan(0)
  })
})

describe('THEME_COLORS', () => {
  it('是数组且长度为 12', () => {
    expect(Array.isArray(THEME_COLORS)).toBe(true)
    expect(THEME_COLORS).toHaveLength(12)
  })

  it('每项是有效的 hex 颜色字符串（#开头，长度为 7）', () => {
    for (const c of THEME_COLORS) {
      expect(c).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(c.length).toBe(7)
    }
  })

  it('每项都以 # 开头', () => {
    for (const c of THEME_COLORS) {
      expect(c.startsWith('#')).toBe(true)
    }
  })

  it('每项类型为 string', () => {
    for (const c of THEME_COLORS) {
      expect(c).toBeTypeOf('string')
    }
  })

  it('包含 #000000 黑色作为首项', () => {
    expect(THEME_COLORS[0]).toBe('#000000')
  })
})

describe('getRatioMultiplier', () => {
  it('"1:1" → 1', () => {
    expect(getRatioMultiplier('1:1')).toBe(1)
  })

  it('"4:3" → 3/4', () => {
    expect(getRatioMultiplier('4:3')).toBe(3 / 4)
  })

  it('"3:4" → 4/3', () => {
    expect(getRatioMultiplier('3:4')).toBe(4 / 3)
  })

  it('"16:9" → 9/16', () => {
    expect(getRatioMultiplier('16:9')).toBe(9 / 16)
  })

  it('custom 也返回 1（默认分支）', () => {
    expect(getRatioMultiplier('custom')).toBe(1)
  })

  it('所有分支返回 number 类型', () => {
    expect(getRatioMultiplier('1:1')).toBeTypeOf('number')
    expect(getRatioMultiplier('4:3')).toBeTypeOf('number')
    expect(getRatioMultiplier('3:4')).toBeTypeOf('number')
    expect(getRatioMultiplier('16:9')).toBeTypeOf('number')
  })
})

describe('getBorderRadiusValue', () => {
  it('undefined → "0"', () => {
    expect(getBorderRadiusValue(undefined)).toBe('0')
  })

  it('borderRadius: "none" → "0"', () => {
    expect(getBorderRadiusValue({ borderRadius: 'none' } as any)).toBe('0')
  })

  it('borderRadius: "medium" → "0.5rem"', () => {
    expect(getBorderRadiusValue({ borderRadius: 'medium' } as any)).toBe('0.5rem')
  })

  it('borderRadius: "full" → "9999px"', () => {
    expect(getBorderRadiusValue({ borderRadius: 'full' } as any)).toBe('9999px')
  })

  it('borderRadius: "custom", customBorderRadius: 10 → "10px"', () => {
    expect(
      getBorderRadiusValue({ borderRadius: 'custom', customBorderRadius: 10 } as any),
    ).toBe('10px')
  })

  it('所有分支返回 string 类型', () => {
    expect(getBorderRadiusValue(undefined)).toBeTypeOf('string')
    expect(getBorderRadiusValue({ borderRadius: 'none' } as any)).toBeTypeOf('string')
    expect(getBorderRadiusValue({ borderRadius: 'medium' } as any)).toBeTypeOf('string')
    expect(getBorderRadiusValue({ borderRadius: 'full' } as any)).toBeTypeOf('string')
    expect(
      getBorderRadiusValue({ borderRadius: 'custom', customBorderRadius: 5 } as any),
    ).toBeTypeOf('string')
  })

  it('customBorderRadius=0 时返回 "0px"', () => {
    expect(
      getBorderRadiusValue({ borderRadius: 'custom', customBorderRadius: 0 } as any),
    ).toBe('0px')
  })
})
