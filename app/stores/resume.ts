// 简历 Store - 自由简历项目
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
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
} from '#shared/types/resume'
import {
  createNewResume,
  initialResumeState,
  initialResumeStateEn,
} from '#shared/config/initialResumeData'
import { MODULE_CONFIGS } from '#shared/config/modules'
import { STORAGE_KEYS } from '#shared/config/constants'

interface ResumeState {
  resumes: ResumeData[]
  activeResumeId: string | null
}

export const useResumeStore = defineStore('resume', {
  state: (): ResumeState => ({
    resumes: [],
    activeResumeId: null,
  }),

  getters: {
    // 当前简历
    activeResume(state): ResumeData | null {
      if (!state.activeResumeId) return null
      return state.resumes.find((r) => r.id === state.activeResumeId) ?? null
    },
    // 简历数量
    resumeCount(state): number {
      return state.resumes.length
    },
  },

  actions: {
    // 创建简历
    createResume(title?: string): ResumeData {
      const resume = createNewResume(title)
      this.resumes.push(resume)
      this.activeResumeId = resume.id
      return resume
    },

    // 从模板创建简历：填充对应 locale 的示例数据 + 指定 templateId
    createResumeFromTemplate(
      templateId: string,
      locale: 'zh' | 'en'
    ): ResumeData {
      const skeleton = createNewResume('新建简历')
      const seed =
        locale === 'en'
          ? (initialResumeStateEn as ResumeData)
          : (initialResumeState as ResumeData)
      const resume: ResumeData = {
        ...seed,
        id: skeleton.id,
        title: skeleton.title,
        createdAt: skeleton.createdAt,
        updatedAt: skeleton.updatedAt,
        templateId,
      }
      this.resumes.push(resume)
      this.activeResumeId = resume.id
      return resume
    },

    // 删除简历
    deleteResume(id: string) {
      const idx = this.resumes.findIndex((r) => r.id === id)
      if (idx === -1) return
      this.resumes.splice(idx, 1)
      if (this.activeResumeId === id) {
        this.activeResumeId = this.resumes[0]?.id ?? null
      }
    },

    // 复制简历
    duplicateResume(id: string): ResumeData | null {
      const src = this.resumes.find((r) => r.id === id)
      if (!src) return null
      const now = new Date().toISOString()
      const copy: ResumeData = {
        ...JSON.parse(JSON.stringify(src)),
        id: uuidv4(),
        title: `${src.title} 副本`,
        createdAt: now,
        updatedAt: now,
      }
      this.resumes.push(copy)
      return copy
    },

    // 设置当前简历
    setActiveResume(id: string) {
      this.activeResumeId = id
      // 兼容旧数据：补齐缺失的菜单模块
      this.ensureMenuSections(id)
    },

    // 确保简历的 menuSections 包含全部模块（兼容旧数据迁移）
    ensureMenuSections(id: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      const existingIds = new Set(r.menuSections.map((s) => s.id))
      let changed = false
      // 追加缺失的模块
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
      // 按 order 排序并归一化 order
      r.menuSections.sort((a, b) => a.order - b.order)
      r.menuSections = r.menuSections.map((s, idx) => ({ ...s, order: idx }))
      // 确保 activeSection 有效
      const validSection = r.menuSections.some((s) => s.id === r.activeSection)
      if (!r.activeSection || !validSection) {
        r.activeSection = 'basic'
        changed = true
      }
      // 兼容旧持久化数据：补齐可能缺失的富文本字段
      if (r.certificatesContent === undefined) {
        r.certificatesContent = ''
        changed = true
      }
      if (changed) {
        r.updatedAt = new Date().toISOString()
      }
    },

    // 更新简历标题
    updateResumeTitle(id: string, title: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.title = title
      r.updatedAt = new Date().toISOString()
    },

    // 更新基本信息
    updateBasicInfo(id: string, info: Partial<BasicInfo>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.basic = { ...r.basic, ...info }
      r.updatedAt = new Date().toISOString()
    },

    // 教育经历
    addEducation(id: string, edu: Omit<Education, 'id'>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.education.push({ ...edu, id: uuidv4() })
      r.updatedAt = new Date().toISOString()
    },
    updateEducation(id: string, eduId: string, data: Partial<Education>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      const edu = r.education.find((e) => e.id === eduId)
      if (!edu) return
      Object.assign(edu, data)
      r.updatedAt = new Date().toISOString()
    },
    removeEducation(id: string, eduId: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.education = r.education.filter((e) => e.id !== eduId)
      r.updatedAt = new Date().toISOString()
    },

    // 工作经历
    addExperience(id: string, exp: Omit<Experience, 'id'>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.experience.push({ ...exp, id: uuidv4() })
      r.updatedAt = new Date().toISOString()
    },
    updateExperience(id: string, expId: string, data: Partial<Experience>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      const exp = r.experience.find((e) => e.id === expId)
      if (!exp) return
      Object.assign(exp, data)
      r.updatedAt = new Date().toISOString()
    },
    removeExperience(id: string, expId: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.experience = r.experience.filter((e) => e.id !== expId)
      r.updatedAt = new Date().toISOString()
    },

    // 项目经历
    addProject(id: string, proj: Omit<Project, 'id'>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.projects.push({ ...proj, id: uuidv4() })
      r.updatedAt = new Date().toISOString()
    },
    updateProject(id: string, projId: string, data: Partial<Project>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      const proj = r.projects.find((p) => p.id === projId)
      if (!proj) return
      Object.assign(proj, data)
      r.updatedAt = new Date().toISOString()
    },
    removeProject(id: string, projId: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.projects = r.projects.filter((p) => p.id !== projId)
      r.updatedAt = new Date().toISOString()
    },

    // 证书
    addCertificate(id: string, cert: Certificate) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.certificates.push(cert)
      r.updatedAt = new Date().toISOString()
    },
    updateCertificate(id: string, certId: string, data: Partial<Certificate>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      const cert = r.certificates.find((c) => c.id === certId)
      if (!cert) return
      Object.assign(cert, data)
      r.updatedAt = new Date().toISOString()
    },
    removeCertificate(id: string, certId: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.certificates = r.certificates.filter((c) => c.id !== certId)
      r.updatedAt = new Date().toISOString()
    },

    // 技能与自我评价
    updateSkillContent(id: string, content: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.skillContent = content
      r.updatedAt = new Date().toISOString()
    },
    // 结构化技能
    addSkill(id: string, skill: Omit<Skill, 'id'>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.skills.push({ ...skill, id: uuidv4() })
      r.updatedAt = new Date().toISOString()
    },
    updateSkill(id: string, skillId: string, data: Partial<Skill>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      const s = r.skills.find((s) => s.id === skillId)
      if (!s) return
      Object.assign(s, data)
      r.updatedAt = new Date().toISOString()
    },
    removeSkill(id: string, skillId: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.skills = r.skills.filter((s) => s.id !== skillId)
      r.updatedAt = new Date().toISOString()
    },
    updateSelfEvaluation(id: string, content: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.selfEvaluationContent = content
      r.updatedAt = new Date().toISOString()
    },
    updateCertificatesContent(id: string, content: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.certificatesContent = content
      r.updatedAt = new Date().toISOString()
    },

    // 模板
    setTemplateId(id: string, templateId: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.templateId = templateId
      r.updatedAt = new Date().toISOString()
    },

    // 全局设置
    updateGlobalSettings(id: string, settings: Partial<GlobalSettings>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.globalSettings = { ...r.globalSettings, ...settings }
      r.updatedAt = new Date().toISOString()
    },

    // 菜单模块
    updateMenuSections(id: string, sections: MenuSection[]) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.menuSections = sections
      r.updatedAt = new Date().toISOString()
    },
    toggleMenuSection(id: string, sectionId: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      const s = r.menuSections.find((s) => s.id === sectionId)
      if (!s) return
      s.enabled = !s.enabled
      r.updatedAt = new Date().toISOString()
    },

    // 当前激活模块
    setActiveSection(id: string, section: string) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.activeSection = section
    },

    // 移动模块顺序（上移/下移）
    // resumeId: 简历 ID；sectionId: 模块 ID；direction: 'up' | 'down'
    moveMenuSection(resumeId: string, sectionId: string, direction: 'up' | 'down') {
      const r = this.resumes.find((r) => r.id === resumeId)
      if (!r) return
      // 按 order 排序得到当前顺序
      const sorted = [...r.menuSections].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((s) => s.id === sectionId)
      if (idx === -1) return
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      // 边界检查：首模块上移 / 末模块下移直接返回（按钮已 disabled，此处为兜底）
      if (targetIdx < 0 || targetIdx >= sorted.length) return
      // 交换位置
      const tmp = sorted[idx]
      if (tmp) {
        sorted[idx] = sorted[targetIdx]
        sorted[targetIdx] = tmp
      }
      // 归一化 order 并写回
      r.menuSections = sorted.map((s, i) => ({ ...s, order: i }))
      r.updatedAt = new Date().toISOString()
    },

    // 启用模块（从模块库恢复已隐藏模块）
    enableMenuSection(resumeId: string, sectionId: string) {
      const r = this.resumes.find((r) => r.id === resumeId)
      if (!r) return
      const section = r.menuSections.find((s) => s.id === sectionId)
      if (!section) return
      if (section.enabled) return // 已启用则无操作
      section.enabled = true
      r.updatedAt = new Date().toISOString()
    },

    // 拖拽状态
    setDraggingProjectId(id: string, projectId: string | null) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      r.draggingProjectId = projectId
    },

    // 导入简历（替换全部数据）
    importResume(id: string, data: Partial<ResumeData>) {
      const r = this.resumes.find((r) => r.id === id)
      if (!r) return
      Object.assign(r, data, { updatedAt: new Date().toISOString() })
    },

    // 初始化（如果没有简历则创建一个示例）
    initialize() {
      if (this.resumes.length === 0) {
        const resume = createNewResume('我的简历')
        // 用示例数据填充
        Object.assign(resume, initialResumeState, {
          id: resume.id,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
        })
        this.resumes.push(resume)
        this.activeResumeId = resume.id
        // 补齐示例简历可能缺失的菜单模块
        this.ensureMenuSections(resume.id)
      } else if (!this.activeResumeId) {
        // noUncheckedIndexedAccess 下数组访问可能为 undefined，需要显式判断
        const first = this.resumes[0]
        if (first) {
          this.activeResumeId = first.id
          this.ensureMenuSections(first.id)
        }
      }
    },
  },

  // 持久化到 localStorage
  persist: {
    key: STORAGE_KEYS.RESUME,
    storage: piniaPluginPersistedstate.localStorage(),
  },
})
