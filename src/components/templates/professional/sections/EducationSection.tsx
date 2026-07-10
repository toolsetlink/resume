'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { Education, GlobalSettings } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { SectionTitle } from './SectionTitle'

interface EducationSectionProps {
  education: Education[]
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}

export function EducationSection({ education, globalSettings, template }: EducationSectionProps) {
  const t = useTranslations()
  const visibleEducations = useMemo(() => (education || []).filter(e => e.visible !== false), [education])
  const themeColor = globalSettings?.themeColor || template.colorScheme.primary
  const subheaderSize = globalSettings?.subheaderSize || 16
  const baseFontSize = globalSettings?.baseFontSize || 16
  const sectionSpacing = globalSettings?.sectionSpacing || 10

  const sectionStyle = useMemo(() => ({ marginBottom: `${sectionSpacing}px` }), [sectionSpacing])
  const itemStyle = useMemo(() => ({ marginBottom: `${template.spacing.itemGap}px` }), [template.spacing.itemGap])

  const formatDateRange = (edu: Education): string => {
    const parts: string[] = []
    if (edu.startDate) parts.push(edu.startDate)
    if (edu.endDate) parts.push(edu.endDate)
    return parts.join(' - ')
  }

  const majorDegree = (edu: Education): string => {
    const parts: string[] = []
    if (edu.major) parts.push(edu.major)
    if (edu.degree) parts.push(edu.degree)
    return parts.join(' · ')
  }

  return (
    <section style={sectionStyle}>
      <SectionTitle title={t('resume.sections.education')} globalSettings={globalSettings} />
      <div>
        {visibleEducations.map(edu => (
          <div key={edu.id} style={itemStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: subheaderSize, fontWeight: 700, color: themeColor }}>{edu.school}</span>
              {formatDateRange(edu) && (
                <span style={{ fontSize: baseFontSize - 2, color: template.colorScheme.secondary }}>{formatDateRange(edu)}</span>
              )}
            </div>
            {majorDegree(edu) && (
              <div style={{ fontSize: baseFontSize, color: template.colorScheme.text, marginTop: 2 }}>{majorDegree(edu)}</div>
            )}
            {edu.gpa && (
              <div style={{ fontSize: baseFontSize - 1, color: template.colorScheme.secondary, marginTop: 2 }}>GPA: {edu.gpa}</div>
            )}
            {edu.description && <div className="rich-content" dangerouslySetInnerHTML={{ __html: edu.description }} />}
          </div>
        ))}
      </div>
    </section>
  )
}
