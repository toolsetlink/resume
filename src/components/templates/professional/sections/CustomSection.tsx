'use client'

import { useMemo } from 'react'
import messages from '@/messages/zh.json'
import type { CustomItem, GlobalSettings, MenuSection } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { SectionTitle } from './SectionTitle'

interface CustomSectionProps {
  customData: Record<string, CustomItem[]>
  globalSettings?: GlobalSettings
  template: ResumeTemplate
  menuSections: MenuSection[]
  customSectionTitles?: Record<string, string>
}

export function CustomSection({ customData, globalSettings, template, menuSections, customSectionTitles }: CustomSectionProps) {
  const t = messages
  const baseFontSize = globalSettings?.baseFontSize || 16
  const subheaderSize = globalSettings?.subheaderSize || 16
  const sectionSpacing = globalSettings?.sectionSpacing || 10

  const sectionStyle = useMemo(() => ({ marginBottom: `${sectionSpacing}px` }), [sectionSpacing])
  const itemStyle = useMemo(() => ({ marginBottom: `${template.spacing.itemGap}px` }), [template.spacing.itemGap])

  // customData 的 key 才是真值源（CustomPanel 用 uuidv4() 创建分区），
  // menuSections 仅作为标题/排序的参考，找不到时回退到 items[0].title。
  const customSectionEntries = useMemo(() => {
    const meta = new Map((menuSections || []).map(s => [s.id, s]))
    return Object.keys(customData || {})
      .map(id => ({ id, meta: meta.get(id) }))
      .filter(({ id, meta }) => {
        if (meta && !meta.enabled) return false
        const items = (customData[id] || []).filter(i => i.visible !== false)
        return items.length > 0
      })
  }, [customData, menuSections])

  if (customSectionEntries.length === 0) return null

  return (
    <>
      {customSectionEntries.map(({ id, meta }) => {
        const items = (customData[id] || []).filter(i => i.visible !== false)
        // 标题优先级：menuSection.title → items[0].title → 兜底「自定义」
        const title = customSectionTitles?.[id] || meta?.title || items[0]?.title || t.resume.sections.custom
        return (
          <div key={id} style={sectionStyle}>
            <SectionTitle title={title} globalSettings={globalSettings} />
            {items.map(item => (
              <div key={item.id} style={itemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontSize: subheaderSize, fontWeight: 700, color: globalSettings?.themeColor || template.colorScheme.primary }}>
                    {item.title}
                  </span>
                  {item.dateRange && (
                    <span style={{ fontSize: baseFontSize - 2, color: template.colorScheme.secondary }}>
                      {item.dateRange}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <div style={{ fontSize: baseFontSize, color: template.colorScheme.text, marginTop: 2 }}>
                    {item.subtitle}
                  </div>
                )}
                {item.description && (
                  <div className="rich-content" dangerouslySetInnerHTML={{ __html: item.description }} />
                )}
              </div>
            ))}
          </div>
        )
      })}
    </>
  )
}
