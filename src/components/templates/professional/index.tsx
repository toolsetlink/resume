'use client'

import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { renderSections } from './renderSections'
import { templateContainerStyle } from './containerStyle'

interface ProfessionalTemplateProps {
  data: ResumeData
  template: ResumeTemplate
}

export function ProfessionalTemplate({ data, template }: ProfessionalTemplateProps) {
  const sections = renderSections(data, template)
  return (
    <div
      className="flex flex-col w-full min-h-full"
      data-template={template.id}
      style={templateContainerStyle(template, data)}
    >
      {sections}
    </div>
  )
}
