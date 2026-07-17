import type { ReactElement, ReactNode } from 'react'
import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { renderSections } from './professional/renderSections'

export type TemplateSection = { id: string; node: ReactNode }

export function getTemplateSections(data: ResumeData, template: ResumeTemplate): TemplateSection[] {
  return renderSections(data, template).map((node) => ({
    id: String((node as ReactElement).key || ''),
    node,
  }))
}

export function takeSections(sections: TemplateSection[], ids: string[]) {
  return sections.filter((section) => ids.includes(section.id))
}

export function sidebarSectionIds(data: ResumeData) {
  const hasRegions = data.menuSections.some((section) => section.region)
  return new Set(
    data.menuSections
      .filter((section) => hasRegions ? section.region === 'sidebar' : ['skills', 'education', 'certificates'].includes(section.id))
      .map((section) => section.id),
  )
}
