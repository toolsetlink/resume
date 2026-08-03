import type { ResumeData } from './resume'

export interface ResumeCaseMeta {
  id: string
  title: string
  description: string
  templateId: string
  industry: string
  position: string
  experienceLevel: string
  style: string
}

export interface ResumeCaseManifestEntry extends ResumeCaseMeta {
  path: string
}

export interface ResumeCaseGuide {
  overview: string[]
  projectSelection: string
}

export interface ResumeCase {
  meta: ResumeCaseMeta
  resumeData: ResumeData
  guide?: ResumeCaseGuide
}
