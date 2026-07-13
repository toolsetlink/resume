import type { ReactNode, ComponentType } from 'react'
import type {
  ResumeData,
  Experience,
  Education,
  Project,
  CustomItem,
  GlobalSettings,
  MenuSection,
} from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { BaseInfo } from './sections/BaseInfo'
import { ExperienceSection } from './sections/ExperienceSection'
import { EducationSection } from './sections/EducationSection'
import { ProjectSection } from './sections/ProjectSection'
import { SkillSection } from './sections/SkillSection'
import { SelfEvaluationSection } from './sections/SelfEvaluationSection'
import { CertificateSection } from './sections/CertificateSection'
import { CustomSection } from './sections/CustomSection'

// 各 section 组件的 props 形状不统一，但都共享 globalSettings/template。
// 用一个所有字段都可选的统一类型，避免之前 `ComponentType<any>` 丢类型。
// 字段在 `getSectionProps` 里按 section id 注入，所以可选是安全的。
type SectionComponentProps = {
  experiences?: Experience[]
  education?: Education[]
  projects?: Project[]
  content?: string
  customData?: Record<string, CustomItem[]>
  menuSections?: MenuSection[]
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}

// 异构 props 在 map 里 TS 不接受严格 assignability，用 unknown 中转一次保类型。
const sectionComponents: Record<string, ComponentType<SectionComponentProps>> = {
  experience: ExperienceSection as unknown as ComponentType<SectionComponentProps>,
  education: EducationSection as unknown as ComponentType<SectionComponentProps>,
  projects: ProjectSection as unknown as ComponentType<SectionComponentProps>,
  skills: SkillSection as unknown as ComponentType<SectionComponentProps>,
  selfEvaluation: SelfEvaluationSection as unknown as ComponentType<SectionComponentProps>,
  certificates: CertificateSection as unknown as ComponentType<SectionComponentProps>,
  custom: CustomSection as unknown as ComponentType<SectionComponentProps>,
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
    const props = getSectionProps(section.id, data, template) as SectionComponentProps
    sections.push(<Component key={section.id} {...props} />)
  })

  return sections
}
