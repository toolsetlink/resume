'use client'

import { useMemo } from 'react'
import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { renderSections } from './renderSections'

interface ProfessionalTemplateProps {
  data: ResumeData
  template: ResumeTemplate
}

export function ProfessionalTemplate({ data, template }: ProfessionalTemplateProps) {
  const sections = renderSections(data, template)

  const containerStyle = useMemo(() => ({
    backgroundColor: template.colorScheme.background,
    color: template.colorScheme.text,
    padding: `${template.spacing.contentPadding}px`,
    fontSize: `${data.globalSettings?.baseFontSize || 16}px`,
    lineHeight: String(data.globalSettings?.lineHeight || 1.6),
  }), [template, data.globalSettings])

  return (
    <div className="flex flex-col w-full min-h-full" style={{ ...containerStyle, fontFamily: "'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" }}>
      {sections}
    </div>
  )
}
