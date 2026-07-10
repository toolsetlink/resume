'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { Experience, GlobalSettings } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { SectionTitle } from './SectionTitle'

interface ExperienceSectionProps {
  experiences: Experience[]
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}

export function ExperienceSection({ experiences, globalSettings, template }: ExperienceSectionProps) {
  const t = useTranslations()
  const visibleExperiences = useMemo(() => (experiences || []).filter(e => e.visible !== false), [experiences])
  const themeColor = globalSettings?.themeColor || template.colorScheme.primary
  const subheaderSize = globalSettings?.subheaderSize || 16
  const baseFontSize = globalSettings?.baseFontSize || 16
  const paragraphSpacing = globalSettings?.paragraphSpacing || 12
  const sectionSpacing = globalSettings?.sectionSpacing || 10

  const sectionStyle = useMemo(() => ({ marginBottom: `${sectionSpacing}px` }), [sectionSpacing])
  const itemStyle = useMemo(() => ({ marginBottom: `${template.spacing.itemGap}px` }), [template.spacing.itemGap])

  return (
    <section style={sectionStyle}>
      <SectionTitle title={t('resume.sections.experience')} globalSettings={globalSettings} />
      <div>
        {visibleExperiences.map(exp => (
          <div key={exp.id} style={itemStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: subheaderSize, fontWeight: 700, color: themeColor }}>{exp.company}</span>
              <span style={{ fontSize: baseFontSize - 2, color: template.colorScheme.secondary }}>{exp.date}</span>
            </div>
            {exp.position && (
              <div style={{ fontSize: baseFontSize, fontWeight: 500, color: template.colorScheme.text, marginTop: 2, marginBottom: paragraphSpacing * 0.5 }}>
                {exp.position}
              </div>
            )}
            {exp.details && <div className="rich-content" dangerouslySetInnerHTML={{ __html: exp.details }} />}
          </div>
        ))}
      </div>
    </section>
  )
}
