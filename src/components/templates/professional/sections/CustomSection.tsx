'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { CustomItem, GlobalSettings, MenuSection } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { SectionTitle } from './SectionTitle'

interface CustomSectionProps {
  customData: Record<string, CustomItem[]>
  globalSettings?: GlobalSettings
  template: ResumeTemplate
  menuSections: MenuSection[]
}

export function CustomSection({ customData, globalSettings, template, menuSections }: CustomSectionProps) {
  const t = useTranslations()
  const baseFontSize = globalSettings?.baseFontSize || 16
  const subheaderSize = globalSettings?.subheaderSize || 16
  const sectionSpacing = globalSettings?.sectionSpacing || 10

  const sectionStyle = useMemo(() => ({ marginBottom: `${sectionSpacing}px` }), [sectionSpacing])
  const itemStyle = useMemo(() => ({ marginBottom: `${template.spacing.itemGap}px` }), [template.spacing.itemGap])

  const customSections = useMemo(() =>
    (menuSections || []).filter(s => s.enabled && s.id.startsWith('custom_')),
  [menuSections])

  if (customSections.length === 0) return null

  return (
    <>
      {customSections.map(section => {
        const items = (customData[section.id] || []).filter(i => i.visible !== false)
        if (items.length === 0) return null
        return (
          <div key={section.id} style={sectionStyle}>
            <SectionTitle title={t('resume.sections.custom')} globalSettings={globalSettings} />
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
