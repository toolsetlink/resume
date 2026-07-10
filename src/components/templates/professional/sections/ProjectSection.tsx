'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { Project, GlobalSettings } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { SectionTitle } from './SectionTitle'

interface ProjectSectionProps {
  projects: Project[]
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}

export function ProjectSection({ projects, globalSettings, template }: ProjectSectionProps) {
  const t = useTranslations()
  const visibleProjects = useMemo(() => (projects || []).filter(p => p.visible !== false), [projects])
  const themeColor = globalSettings?.themeColor || template.colorScheme.primary
  const subheaderSize = globalSettings?.subheaderSize || 16
  const baseFontSize = globalSettings?.baseFontSize || 16
  const sectionSpacing = globalSettings?.sectionSpacing || 10

  const sectionStyle = useMemo(() => ({ marginBottom: `${sectionSpacing}px` }), [sectionSpacing])
  const itemStyle = useMemo(() => ({ marginBottom: `${template.spacing.itemGap}px` }), [template.spacing.itemGap])

  return (
    <section style={sectionStyle}>
      <SectionTitle title={t('resume.sections.projects')} globalSettings={globalSettings} />
      <div>
        {visibleProjects.map(proj => (
          <div key={proj.id} style={itemStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: subheaderSize, fontWeight: 700, color: themeColor }}>{proj.name}</span>
              {proj.date && <span style={{ fontSize: baseFontSize - 2, color: template.colorScheme.secondary }}>{proj.date}</span>}
            </div>
            {proj.role && (
              <div style={{ fontSize: baseFontSize, color: template.colorScheme.text, marginTop: 2 }}>{proj.role}</div>
            )}
            {proj.description && <div className="rich-content" dangerouslySetInnerHTML={{ __html: proj.description }} />}
            {proj.link && (
              <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ color: themeColor, fontSize: baseFontSize - 1 }}>
                {proj.linkLabel || proj.link}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
