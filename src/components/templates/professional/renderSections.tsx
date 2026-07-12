import type { ReactNode } from 'react'
import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { BaseInfo } from './sections/BaseInfo'
import { ExperienceSection } from './sections/ExperienceSection'
import { EducationSection } from './sections/EducationSection'
import { ProjectSection } from './sections/ProjectSection'
import { SkillSection } from './sections/SkillSection'
import { SelfEvaluationSection } from './sections/SelfEvaluationSection'
import { CertificateSection } from './sections/CertificateSection'
import { CustomSection } from './sections/CustomSection'

const sectionComponents: Record<string, React.ComponentType<any>> = {
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectSection,
  skills: SkillSection,
  selfEvaluation: SelfEvaluationSection,
  certificates: CertificateSection,
  custom: CustomSection,
}

function hasSectionData(sectionId: string, data: ResumeData): boolean {
  switch (sectionId) {
    case 'experience': return (data.experience || []).some(e => e.visible !== false)
    case 'education': return (data.education || []).some(e => e.visible !== false)
    case 'projects': return (data.projects || []).some(p => p.visible !== false)
    case 'skills': return !!data.skillContent
    case 'selfEvaluation': return !!data.selfEvaluationContent
    case 'certificates': return !!data.certificatesContent
    case 'custom': {
      const customData = data.customData || {}
      return Object.values(customData).flat().some(i => i.visible !== false)
    }
    default: return false
  }
}

function getSectionProps(sectionId: string, data: ResumeData, template: ResumeTemplate): Record<string, unknown> {
  const gs = data.globalSettings
  switch (sectionId) {
    case 'experience': return { experiences: data.experience, globalSettings: gs, template }
    case 'education': return { education: data.education, globalSettings: gs, template }
    case 'projects': return { projects: data.projects, globalSettings: gs, template }
    case 'skills': return { content: data.skillContent, globalSettings: gs, template }
    case 'selfEvaluation': return { content: data.selfEvaluationContent, globalSettings: gs, template }
    case 'certificates': return { content: data.certificatesContent, globalSettings: gs, template }
    case 'custom': return { customData: data.customData, globalSettings: gs, template, menuSections: data.menuSections }
    default: return {}
  }
}

export function renderSections(data: ResumeData, template: ResumeTemplate): ReactNode[] {
  const enabledSections = [...(data.menuSections || [])]
    .filter(s => s.enabled && s.id !== 'basic')
    .sort((a, b) => a.order - b.order)

  const sections: ReactNode[] = [
    <BaseInfo key="basic" basic={data.basic} globalSettings={data.globalSettings} template={template} />,
  ]

  enabledSections.forEach(section => {
    const Component = sectionComponents[section.id]
    if (!Component) return
    if (!hasSectionData(section.id, data)) return
    const props = getSectionProps(section.id, data, template)
    sections.push(<Component key={section.id} {...props} />)
  })

  return sections
}
