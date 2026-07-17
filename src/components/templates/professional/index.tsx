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
      className="resume-template resume-template-professional flex flex-col w-full min-h-full"
      data-template={template.id}
      style={templateContainerStyle(template, data)}
    >
      <div className="resume-template-content" data-pagination-flow="main">
        {sections.map((section, index) => <div key={index} data-pagination-unit>{section}</div>)}
      </div>
    </div>
  )
}
