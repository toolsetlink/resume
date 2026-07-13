'use client'

import { useMemo } from 'react'
import messages from '@/messages/zh.json'
import type { GlobalSettings } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { SectionTitle } from './SectionTitle'

interface SelfEvaluationSectionProps {
  content: string
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}

export function SelfEvaluationSection({ content, globalSettings }: SelfEvaluationSectionProps) {
  const t = messages
  const sectionSpacing = globalSettings?.sectionSpacing || 10
  const sectionStyle = useMemo(() => ({ marginBottom: `${sectionSpacing}px` }), [sectionSpacing])

  if (!content) return null

  return (
    <section style={sectionStyle}>
      <SectionTitle title={t.resume.sections.selfEvaluation} globalSettings={globalSettings} />
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: content }} />
    </section>
  )
}
