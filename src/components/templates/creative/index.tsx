'use client'

import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { templateContainerStyle } from '../professional/containerStyle'
import { getTemplateSections, sidebarSectionIds, takeSections } from '../templateSections'

export function CreativeTemplate({ data, template }: { data: ResumeData; template: ResumeTemplate }) {
  const sections = getTemplateSections(data, template)
  const header = takeSections(sections, ['basic'])
  const sidebarIds = sidebarSectionIds(data)
  const sidebar = sections.filter((section) => sidebarIds.has(section.id))
  const main = sections.filter((section) => section.id !== 'basic' && !sidebarIds.has(section.id))
  return (
    <div className="resume-template resume-template-creative" data-template={template.id} style={templateContainerStyle(template, data)}>
      <header className="resume-template-header">{header.map((section) => <div key={section.id}>{section.node}</div>)}</header>
      <div className="resume-template-columns">
        <aside className="resume-template-sidebar" data-pagination-flow="sidebar">{sidebar.map((section) => <div key={section.id} data-pagination-unit>{section.node}</div>)}</aside>
        <main className="resume-template-main resume-template-content" data-pagination-flow="main">{main.map((section) => <div key={section.id} data-pagination-unit>{section.node}</div>)}</main>
      </div>
    </div>
  )
}
