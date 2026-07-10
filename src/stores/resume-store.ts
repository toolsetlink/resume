import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { ResumeCase } from '@/shared/types/case'
import type {
  ResumeData,
  BasicInfo,
  Education,
  Experience,
  Project,
  Certificate,
  Skill,
  GlobalSettings,
  MenuSection,
} from '@/shared/types/resume'
import {
  createNewResume,
  initialResumeState,
  initialResumeStateEn,
} from '@/shared/config/initialResumeData'
import { MODULE_CONFIGS } from '@/shared/config/modules'
import { STORAGE_KEYS } from '@/shared/config/constants'

interface ResumeState {
  resumes: ResumeData[]
  activeResumeId: string | null
}

interface ResumeActions {
  createResume: (title?: string) => ResumeData
  createResumeFromTemplate: (templateId: string, locale: 'zh' | 'en') => ResumeData
  createResumeFromCase: (caseData: ResumeCase) => ResumeData
  deleteResume: (id: string) => void
  duplicateResume: (id: string) => ResumeData | null
  setActiveResume: (id: string) => void
  ensureMenuSections: (id: string) => void
  updateResumeTitle: (id: string, title: string) => void
  updateBasicInfo: (id: string, info: Partial<BasicInfo>) => void
  addEducation: (id: string, edu: Omit<Education, 'id'>) => void
  updateEducation: (id: string, eduId: string, data: Partial<Education>) => void
  removeEducation: (id: string, eduId: string) => void
  addExperience: (id: string, exp: Omit<Experience, 'id'>) => void
  updateExperience: (id: string, expId: string, data: Partial<Experience>) => void
  removeExperience: (id: string, expId: string) => void
  addProject: (id: string, proj: Omit<Project, 'id'>) => void
  updateProject: (id: string, projId: string, data: Partial<Project>) => void
  removeProject: (id: string, projId: string) => void
  addCertificate: (id: string, cert: Certificate) => void
  updateCertificate: (id: string, certId: string, data: Partial<Certificate>) => void
  removeCertificate: (id: string, certId: string) => void
  updateSkillContent: (id: string, content: string) => void
  addSkill: (id: string, skill: Omit<Skill, 'id'>) => void
  updateSkill: (id: string, skillId: string, data: Partial<Skill>) => void
  removeSkill: (id: string, skillId: string) => void
  updateSelfEvaluation: (id: string, content: string) => void
  updateCertificatesContent: (id: string, content: string) => void
  setTemplateId: (id: string, templateId: string) => void
  updateGlobalSettings: (id: string, settings: Partial<GlobalSettings>) => void
  updateMenuSections: (id: string, sections: MenuSection[]) => void
  toggleMenuSection: (id: string, sectionId: string) => void
  setActiveSection: (id: string, section: string) => void
  moveMenuSection: (resumeId: string, sectionId: string, direction: 'up' | 'down') => void
  enableMenuSection: (resumeId: string, sectionId: string) => void
  setDraggingProjectId: (id: string, projectId: string | null) => void
  importResume: (id: string, data: Partial<ResumeData>) => void
  initialize: () => void
}

type ResumeStore = ResumeState & ResumeActions

export const useResumeStore = create<ResumeStore>()(
  persist(
    immer((set, get) => ({
      resumes: [],
      activeResumeId: null,

      createResume(title?: string): ResumeData {
        const resume = createNewResume(title)
        set((state) => {
          state.resumes.push(resume)
          state.activeResumeId = resume.id
        })
        return resume
      },

      createResumeFromTemplate(templateId: string, locale: 'zh' | 'en'): ResumeData {
        const skeleton = createNewResume('新建简历')
        const seed = locale === 'en' ? initialResumeStateEn : initialResumeState
        const resume = {
          ...seed,
          id: skeleton.id,
          title: skeleton.title,
          createdAt: skeleton.createdAt,
          updatedAt: skeleton.updatedAt,
          templateId,
        } as ResumeData
        set((state) => {
          state.resumes.push(resume)
          state.activeResumeId = resume.id
        })
        return resume
      },

      createResumeFromCase(caseData: ResumeCase): ResumeData {
        const now = new Date().toISOString()
        const resume: ResumeData = {
          ...JSON.parse(JSON.stringify(caseData.resumeData)),
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => {
          state.resumes.push(resume)
          state.activeResumeId = resume.id
        })
        return resume
      },

      deleteResume(id: string) {
        set((state) => {
          const idx = state.resumes.findIndex((r) => r.id === id)
          if (idx === -1) return
          state.resumes.splice(idx, 1)
          if (state.activeResumeId === id) {
            state.activeResumeId = state.resumes[0]?.id ?? null
          }
        })
      },

      duplicateResume(id: string): ResumeData | null {
        const src = get().resumes.find((r) => r.id === id)
        if (!src) return null
        const now = new Date().toISOString()
        const copy: ResumeData = {
          ...JSON.parse(JSON.stringify(src)),
          id: uuidv4(),
          title: `${src.title} 副本`,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => {
          state.resumes.push(copy)
        })
        return copy
      },

      setActiveResume(id: string) {
        set((state) => {
          state.activeResumeId = id
        })
        get().ensureMenuSections(id)
      },

      ensureMenuSections(id: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          const existingIds = new Set(r.menuSections.map((s) => s.id))
          let changed = false
          for (const config of MODULE_CONFIGS) {
            if (!existingIds.has(config.id)) {
              r.menuSections.push({
                id: config.id,
                title: config.title.zh,
                icon: config.icon,
                enabled: config.enabled,
                order: config.order,
              })
              changed = true
            }
          }
          r.menuSections.sort((a, b) => a.order - b.order)
          r.menuSections = r.menuSections.map((s, idx) => ({ ...s, order: idx }))
          const validSection = r.menuSections.some((s) => s.id === r.activeSection)
          if (!r.activeSection || !validSection) {
            r.activeSection = 'basic'
            changed = true
          }
          if (r.certificatesContent === undefined) {
            r.certificatesContent = ''
            changed = true
          }
          if (changed) {
            r.updatedAt = new Date().toISOString()
          }
        })
      },

      updateResumeTitle(id: string, title: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.title = title
          r.updatedAt = new Date().toISOString()
        })
      },

      updateBasicInfo(id: string, info: Partial<BasicInfo>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.basic = { ...r.basic, ...info }
          r.updatedAt = new Date().toISOString()
        })
      },

      addEducation(id: string, edu: Omit<Education, 'id'>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.education.push({ ...edu, id: uuidv4() })
          r.updatedAt = new Date().toISOString()
        })
      },
      updateEducation(id: string, eduId: string, data: Partial<Education>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          const edu = r.education.find((e) => e.id === eduId)
          if (!edu) return
          Object.assign(edu, data)
          r.updatedAt = new Date().toISOString()
        })
      },
      removeEducation(id: string, eduId: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.education = r.education.filter((e) => e.id !== eduId)
          r.updatedAt = new Date().toISOString()
        })
      },

      addExperience(id: string, exp: Omit<Experience, 'id'>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.experience.push({ ...exp, id: uuidv4() })
          r.updatedAt = new Date().toISOString()
        })
      },
      updateExperience(id: string, expId: string, data: Partial<Experience>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          const exp = r.experience.find((e) => e.id === expId)
          if (!exp) return
          Object.assign(exp, data)
          r.updatedAt = new Date().toISOString()
        })
      },
      removeExperience(id: string, expId: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.experience = r.experience.filter((e) => e.id !== expId)
          r.updatedAt = new Date().toISOString()
        })
      },

      addProject(id: string, proj: Omit<Project, 'id'>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.projects.push({ ...proj, id: uuidv4() })
          r.updatedAt = new Date().toISOString()
        })
      },
      updateProject(id: string, projId: string, data: Partial<Project>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          const proj = r.projects.find((p) => p.id === projId)
          if (!proj) return
          Object.assign(proj, data)
          r.updatedAt = new Date().toISOString()
        })
      },
      removeProject(id: string, projId: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.projects = r.projects.filter((p) => p.id !== projId)
          r.updatedAt = new Date().toISOString()
        })
      },

      addCertificate(id: string, cert: Certificate) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.certificates.push(cert)
          r.updatedAt = new Date().toISOString()
        })
      },
      updateCertificate(id: string, certId: string, data: Partial<Certificate>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          const cert = r.certificates.find((c) => c.id === certId)
          if (!cert) return
          Object.assign(cert, data)
          r.updatedAt = new Date().toISOString()
        })
      },
      removeCertificate(id: string, certId: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.certificates = r.certificates.filter((c) => c.id !== certId)
          r.updatedAt = new Date().toISOString()
        })
      },

      updateSkillContent(id: string, content: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.skillContent = content
          r.updatedAt = new Date().toISOString()
        })
      },
      addSkill(id: string, skill: Omit<Skill, 'id'>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.skills.push({ ...skill, id: uuidv4() })
          r.updatedAt = new Date().toISOString()
        })
      },
      updateSkill(id: string, skillId: string, data: Partial<Skill>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          const s = r.skills.find((s) => s.id === skillId)
          if (!s) return
          Object.assign(s, data)
          r.updatedAt = new Date().toISOString()
        })
      },
      removeSkill(id: string, skillId: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.skills = r.skills.filter((s) => s.id !== skillId)
          r.updatedAt = new Date().toISOString()
        })
      },
      updateSelfEvaluation(id: string, content: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.selfEvaluationContent = content
          r.updatedAt = new Date().toISOString()
        })
      },
      updateCertificatesContent(id: string, content: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.certificatesContent = content
          r.updatedAt = new Date().toISOString()
        })
      },

      setTemplateId(id: string, templateId: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.templateId = templateId
          r.updatedAt = new Date().toISOString()
        })
      },

      updateGlobalSettings(id: string, settings: Partial<GlobalSettings>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.globalSettings = { ...r.globalSettings, ...settings }
          r.updatedAt = new Date().toISOString()
        })
      },

      updateMenuSections(id: string, sections: MenuSection[]) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.menuSections = sections
          r.updatedAt = new Date().toISOString()
        })
      },
      toggleMenuSection(id: string, sectionId: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          const s = r.menuSections.find((s) => s.id === sectionId)
          if (!s) return
          s.enabled = !s.enabled
          r.updatedAt = new Date().toISOString()
        })
      },

      setActiveSection(id: string, section: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.activeSection = section
        })
      },

      moveMenuSection(resumeId: string, sectionId: string, direction: 'up' | 'down') {
        set((state) => {
          const r = state.resumes.find((r) => r.id === resumeId)
          if (!r) return
          const sorted = [...r.menuSections].sort((a, b) => a.order - b.order)
          const idx = sorted.findIndex((s) => s.id === sectionId)
          if (idx === -1) return
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1
          if (targetIdx < 0 || targetIdx >= sorted.length) return
          const tmp = sorted[idx]
          if (tmp) {
            sorted[idx] = sorted[targetIdx]
            sorted[targetIdx] = tmp
          }
          r.menuSections = sorted.map((s, i) => ({ ...s, order: i }))
          r.updatedAt = new Date().toISOString()
        })
      },

      enableMenuSection(resumeId: string, sectionId: string) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === resumeId)
          if (!r) return
          const section = r.menuSections.find((s) => s.id === sectionId)
          if (!section) return
          if (section.enabled) return
          section.enabled = true
          r.updatedAt = new Date().toISOString()
        })
      },

      setDraggingProjectId(id: string, projectId: string | null) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          r.draggingProjectId = projectId
        })
      },

      importResume(id: string, data: Partial<ResumeData>) {
        set((state) => {
          const r = state.resumes.find((r) => r.id === id)
          if (!r) return
          Object.assign(r, data, { updatedAt: new Date().toISOString() })
        })
      },

      initialize() {
        const { resumes, activeResumeId } = get()
        if (resumes.length === 0) {
          const resume = createNewResume('我的简历')
          Object.assign(resume, initialResumeState, {
            id: resume.id,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
          })
          set((state) => {
            state.resumes.push(resume)
            state.activeResumeId = resume.id
          })
          get().ensureMenuSections(resume.id)
        } else if (!activeResumeId) {
          const first = resumes[0]
          if (first) {
            set((state) => {
              state.activeResumeId = first.id
            })
            get().ensureMenuSections(first.id)
          }
        }
      },
    })),
    {
      name: STORAGE_KEYS.RESUME,
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Selectors (replace Pinia getters)
export function selectActiveResume(state: ResumeStore): ResumeData | null {
  if (!state.activeResumeId) return null
  return state.resumes.find((r) => r.id === state.activeResumeId) ?? null
}

export function selectResumeCount(state: ResumeStore): number {
  return state.resumes.length
}
