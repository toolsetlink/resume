export const locale = 'zh' as const

export const locales = [locale] as const

export type Locale = (typeof locales)[number]

export const htmlLang = 'zh-CN'