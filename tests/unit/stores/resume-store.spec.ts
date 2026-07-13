import { describe, it, expect, beforeEach } from 'vitest'
import { useResumeStore } from '@/stores/resume-store'
import { blankResumeState } from '@/shared/config/initialResumeData'
import type { ResumeCase } from '@/shared/types/case'

beforeEach(() => {
  blankResumeState.education = []
  blankResumeState.experience = []
  blankResumeState.projects = []
  blankResumeState.certificates = []
  blankResumeState.menuSections = [{ id: 'basic', title: '基本信息', icon: '👤', enabled: true, order: 0 }]
  blankResumeState.skillContent = ''
  blankResumeState.selfEvaluationContent = ''
  blankResumeState.draggingProjectId = null
  blankResumeState.activeSection = 'basic'
  useResumeStore.setState({ resumes: [], activeResumeId: null })
  localStorage.clear()
})

describe('resume store - CRUD', () => {
  it('createResume returns complete object and sets activeResumeId', () => {
    const store = useResumeStore.getState()
    const resume = store.createResume('测试简历')
    expect(resume.id).toBeTruthy()
    expect(resume.title).toBe('测试简历')
    expect(resume.createdAt).toBeTruthy()
    expect(useResumeStore.getState().activeResumeId).toBe(resume.id)
  })

  it('createResume uses default title', () => {
    const resume = useResumeStore.getState().createResume()
    expect(resume.title).toBeTruthy()
  })

  it('deleteResume removes and updates activeResumeId', () => {
    const store = useResumeStore.getState()
    const r1 = store.createResume('A')
    const r2 = store.createResume('B')
    store.deleteResume(r1.id)
    expect(useResumeStore.getState().resumes).toHaveLength(1)
    expect(useResumeStore.getState().activeResumeId).toBe(r2.id)
  })

  it('duplicateResume creates a copy with 副本 suffix', () => {
    const store = useResumeStore.getState()
    const r1 = store.createResume('原版')
    const copy = store.duplicateResume(r1.id)
    expect(copy).toBeTruthy()
    expect(copy!.title).toContain('副本')
    expect(copy!.id).not.toBe(r1.id)
    expect(useResumeStore.getState().resumes).toHaveLength(2)
  })

  it('createResumeFromTemplate seeds Chinese example data', () => {
    const store = useResumeStore.getState()
    expect(store.createResumeFromTemplate).toHaveLength(1)

    const resume = store.createResumeFromTemplate('professional')
    expect(resume.templateId).toBe('professional')
    expect(resume.basic.name).toBe('李明')
  })

  it('createResumeFromCase deep clones case data', () => {
    const store = useResumeStore.getState()
    const caseData = {
      meta: { id: 'test', title: 'Test Case', description: '', templateId: 'professional', industry: '互联网', position: '前端', experienceLevel: '高级', style: '简约' },
      resumeData: { ...blankResumeState, id: 'old-id', title: 'Old', basic: { ...blankResumeState.basic, name: 'Test' }, createdAt: '', updatedAt: '', templateId: null, customData: {}, education: [], experience: [], projects: [], certificates: [], certificatesContent: '', skillContent: '', skills: [], selfEvaluationContent: '', activeSection: 'basic', draggingProjectId: null, menuSections: [], globalSettings: { baseFontSize: 16, pagePadding: 32, paragraphSpacing: 12, lineHeight: 1.5, headerSize: 20, subheaderSize: 16, sectionSpacing: 10 } }
    } satisfies ResumeCase
    const resume = store.createResumeFromCase(caseData)
    expect(resume.id).not.toBe('old-id')
    expect(resume.basic.name).toBe('Test')
  })
})

describe('resume store - field updates', () => {
  it('updateResumeTitle changes title and updatedAt', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('旧标题')
    store.updateResumeTitle(r.id, '新标题')
    const updated = useResumeStore.getState().resumes.find(x => x.id === r.id)
    expect(updated?.title).toBe('新标题')
    expect(updated?.updatedAt).toBeTruthy()
  })

  it('updateBasicInfo merges partial data', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('Test')
    store.updateBasicInfo(r.id, { name: '张三', email: 'test@test.com' })
    const updated = useResumeStore.getState().resumes.find(x => x.id === r.id)
    expect(updated?.basic.name).toBe('张三')
    expect(updated?.basic.email).toBe('test@test.com')
  })

  it('setTemplateId updates templateId', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('Test')
    store.setTemplateId(r.id, 'modern')
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.templateId).toBe('modern')
  })
})

describe('resume store - collection CRUD', () => {
  it('add/update/remove Education', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('Test')
    store.addEducation(r.id, { school: '清华', major: 'CS', degree: '本科', startDate: '2019', endDate: '2023', visible: true })
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.education).toHaveLength(1)

    const edu = useResumeStore.getState().resumes.find(x => x.id === r.id)!.education[0]!
    store.updateEducation(r.id, edu.id, { school: '北大' })
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.education[0]?.school).toBe('北大')

    store.removeEducation(r.id, edu.id)
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.education).toHaveLength(0)
  })

  it('add/update/remove Experience', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('Test')
    store.addExperience(r.id, { company: 'Google', position: 'SDE', date: '2020-2023', details: '<p>Work</p>', visible: true })
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.experience).toHaveLength(1)
    const exp = useResumeStore.getState().resumes.find(x => x.id === r.id)!.experience[0]!
    store.updateExperience(r.id, exp.id, { position: 'Senior SDE' })
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.experience[0]?.position).toBe('Senior SDE')
    store.removeExperience(r.id, exp.id)
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.experience).toHaveLength(0)
  })
})

describe('resume store - content updates', () => {
  it('updateSkillContent', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('Test')
    store.updateSkillContent(r.id, '<p>Skills</p>')
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.skillContent).toBe('<p>Skills</p>')
  })

  it('updateSelfEvaluation', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('Test')
    store.updateSelfEvaluation(r.id, '<p>Evaluation</p>')
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.selfEvaluationContent).toBe('<p>Evaluation</p>')
  })

  it('updateCertificatesContent', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('Test')
    store.updateCertificatesContent(r.id, '<p>Certs</p>')
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)?.certificatesContent).toBe('<p>Certs</p>')
  })
})

describe('resume store - menu sections', () => {
  it('ensureMenuSections fills missing modules', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('Test')
    store.ensureMenuSections(r.id)
    const sections = useResumeStore.getState().resumes.find(x => x.id === r.id)?.menuSections
    expect(sections!.length).toBeGreaterThanOrEqual(5)
  })

  it('toggleMenuSection toggles enabled', () => {
    const store = useResumeStore.getState()
    const r = store.createResume('Test')
    store.ensureMenuSections(r.id)
    const sid = useResumeStore.getState().resumes.find(x => x.id === r.id)!.menuSections[0]!.id
    const before = useResumeStore.getState().resumes.find(x => x.id === r.id)!.menuSections.find(s => s.id === sid)!.enabled
    store.toggleMenuSection(r.id, sid)
    expect(useResumeStore.getState().resumes.find(x => x.id === r.id)!.menuSections.find(s => s.id === sid)!.enabled).toBe(!before)
  })

  it('initialize populates store when empty', () => {
    useResumeStore.getState().initialize()
    expect(useResumeStore.getState().resumes.length).toBeGreaterThan(0)
    expect(useResumeStore.getState().activeResumeId).toBeTruthy()
  })
})

describe('resume store - persistence', () => {
  it('persists state to localStorage', () => {
    const store = useResumeStore.getState()
    store.createResume('PersistTest')
    const stored = JSON.parse(localStorage.getItem('resume-storage') || '{}')
    expect(stored.state?.resumes?.length).toBeGreaterThan(0)
  })
})
