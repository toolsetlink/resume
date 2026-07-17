'use client'

import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { templateContainerStyle } from '../professional/containerStyle'
import { getTemplateSections, takeSections } from '../templateSections'

export function ElegantTemplate({ data, template }: { data: ResumeData; template: ResumeTemplate }) {
  const sections = getTemplateSections(data, template)
  const header = takeSections(sections, ['basic'])
  const body = sections.filter((section) => section.id !== 'basic')
  return (
    <div className="resume-template resume-template-elegant" data-template={template.id} style={templateContainerStyle(template, data)}>
      <header className="resume-template-header">{header.map((section) => <div key={section.id}>{section.node}</div>)}</header>
      <div className="resume-template-content" data-pagination-flow="main">{body.map((section) => <div key={section.id} data-pagination-unit>{section.node}</div>)}</div>
    </div>
  )
}
