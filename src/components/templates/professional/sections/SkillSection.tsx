'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { GlobalSettings } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { SectionTitle } from './SectionTitle'

interface SkillSectionProps {
  content: string
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}

export function SkillSection({ content, globalSettings }: SkillSectionProps) {
  const t = useTranslations()
  const sectionSpacing = globalSettings?.sectionSpacing || 10
  const sectionStyle = useMemo(() => ({ marginBottom: `${sectionSpacing}px` }), [sectionSpacing])

  if (!content) return null

  return (
    <section style={sectionStyle}>
      <SectionTitle title={t('resume.sections.skills')} globalSettings={globalSettings} />
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: content }} />
    </section>
  )
}
