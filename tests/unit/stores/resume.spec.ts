// resume store 单元测试 - 自由简历项目
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'

// 提供 piniaPluginPersistedstate 全局变量
// 在 Nuxt 应用中由 pinia-plugin-persistedstate/nuxt 模块自动注入，
// 单元测试环境需要手动提供，且必须在 store 模块加载前定义（vi.hoisted 保证提升到 import 前）。
vi.hoisted(() => {
  const g = globalThis as unknown as {
    piniaPluginPersistedstate: {
      localStorage: () => {
        getItem: (key: string) => string | null
        setItem: (key: string, value: string) => void
      }
      sessionStorage: () => {
        getItem: (key: string) => string | null
        setItem: (key: string, value: string) => void
      }
      cookies: () => {
        getItem: (key: string) => string | null
        setItem: (key: string, value: string) => void
      }
    }
  }
  const makeStorage = () => ({
    getItem: (key: string) => globalThis.localStorage.getItem(key),
    setItem: (key: string, value: string) =>
      globalThis.localStorage.setItem(key, value),
  })
  g.piniaPluginPersistedstate = {
    localStorage: makeStorage,
    sessionStorage: () => ({
      getItem: (key: string) => globalThis.sessionStorage.getItem(key),
      setItem: (key: string, value: string) =>
        globalThis.sessionStorage.setItem(key, value),
    }),
    cookies: () => ({ getItem: () => null, setItem: () => {} }),
  }
})

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useResumeStore } from '@/stores/resume'
import { blankResumeState } from '#shared/config/initialResumeData'
import type { Certificate } from '#shared/types/resume'

beforeEach(() => {
  // createNewResume 使用 ...blankResumeState 浅拷贝，数组/对象引用共享。
  // 为避免测试间相互污染，每个测试前重置这些共享可变字段。
  blankResumeState.education = []
  blankResumeState.experience = []
  blankResumeState.projects = []
  blankResumeState.certificates = []
  blankResumeState.menuSections = [
    { id: 'basic', title: '基本信息', icon: '👤', enabled: true, order: 0 },
  ]
  blankResumeState.skillContent = ''
  blankResumeState.selfEvaluationContent = ''
  blankResumeState.draggingProjectId = null
  blankResumeState.activeSection = 'basic'

  // 创建 Pinia 实例并注册持久化插件
  // 注意：pinia.use(plugin) 只会把插件推入 toBeInstalled，需要 app.use(pinia) 触发安装，
  // 否则插件不会执行，$persist / $hydrate 不会被附加到 store 上。
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  const app = createApp({})
  app.use(pinia)
  setActivePinia(pinia)
  localStorage.clear()
})

describe('resume store - 创建简历', () => {
  it('createResume 返回完整对象并设置 activeResumeId', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试简历')

    expect(resume.id).toBeTruthy()
    expect(resume.title).toBe('测试简历')
    expect(resume.createdAt).toBeTruthy()
    expect(resume.updatedAt).toBeTruthy()
    expect(resume.templateId).toBeNull()
    expect(resume.basic).toBeDefined()
    expect(resume.education).toEqual([])
    expect(resume.experience).toEqual([])
    expect(resume.projects).toEqual([])

    expect(store.resumeCount).toBe(1)
    expect(store.activeResumeId).toBe(resume.id)
  })

  it('createResume 不传 title 时使用默认标题', () => {
    const store = useResumeStore()
    const resume = store.createResume()

    expect(resume.title).toBe('新建简历')
    expect(store.resumeCount).toBe(1)
  })

  it('createResume 后 activeResume getter 返回当前简历', () => {
    const store = useResumeStore()
    const resume = store.createResume('active 测试')

    expect(store.activeResume).not.toBeNull()
    expect(store.activeResume?.id).toBe(resume.id)
    expect(store.activeResume?.title).toBe('active 测试')
  })

  it('activeResume 在没有 activeResumeId 时返回 null', () => {
    const store = useResumeStore()

    expect(store.activeResume).toBeNull()
  })
})

describe('resume store - 删除简历', () => {
  it('deleteResume 后 resumes 长度减 1', () => {
    const store = useResumeStore()
    const r1 = store.createResume('简历1')
    store.createResume('简历2')

    expect(store.resumeCount).toBe(2)

    store.deleteResume(r1.id)

    expect(store.resumeCount).toBe(1)
    expect(store.resumes.find((r) => r.id === r1.id)).toBeUndefined()
  })

  it('deleteResume 删除 active 时自动切换到第一个', () => {
    const store = useResumeStore()
    const r1 = store.createResume('简历1')
    const r2 = store.createResume('简历2')

    expect(store.activeResumeId).toBe(r2.id)

    store.deleteResume(r2.id)

    expect(store.activeResumeId).toBe(r1.id)
  })

  it('deleteResume 删除最后一个简历时 activeResumeId 变为 null', () => {
    const store = useResumeStore()
    const r1 = store.createResume('唯一简历')

    store.deleteResume(r1.id)

    expect(store.resumeCount).toBe(0)
    expect(store.activeResumeId).toBeNull()
    expect(store.activeResume).toBeNull()
  })

  it('deleteResume 传入不存在的 id 不影响现有数据', () => {
    const store = useResumeStore()
    store.createResume('简历1')

    store.deleteResume('non-existent-id')

    expect(store.resumeCount).toBe(1)
  })
})

describe('resume store - 复制简历', () => {
  it('duplicateResume 新 id 不同且标题加 " 副本"', () => {
    const store = useResumeStore()
    const original = store.createResume('我的简历')

    const copy = store.duplicateResume(original.id)

    expect(copy).not.toBeNull()
    expect(copy!.id).not.toBe(original.id)
    expect(copy!.title).toBe('我的简历 副本')
    expect(store.resumeCount).toBe(2)
  })

  it('duplicateResume 复制所有数据', () => {
    const store = useResumeStore()
    const original = store.createResume('原始简历')
    store.addEducation(original.id, {
      school: '测试大学',
      major: '计算机',
      degree: '本科',
      startDate: '2020-09',
      endDate: '2024-06',
      visible: true,
    })

    const copy = store.duplicateResume(original.id)

    expect(copy).not.toBeNull()
    expect(copy!.education.length).toBe(1)
    expect(copy!.education[0].school).toBe('测试大学')
  })

  it('duplicateResume 传入不存在的 id 返回 null', () => {
    const store = useResumeStore()

    const result = store.duplicateResume('non-existent')

    expect(result).toBeNull()
    expect(store.resumeCount).toBe(0)
  })
})

describe('resume store - 教育经历 CRUD', () => {
  it('addEducation / updateEducation / removeEducation', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.addEducation(resume.id, {
      school: '清华大学',
      major: '计算机',
      degree: '本科',
      startDate: '2017-09',
      endDate: '2021-06',
      visible: true,
    })

    expect(resume.education.length).toBe(1)
    expect(resume.education[0].school).toBe('清华大学')
    expect(resume.education[0].id).toBeTruthy()

    const eduId = resume.education[0].id
    store.updateEducation(resume.id, eduId, { school: '北京大学' })

    expect(resume.education[0].school).toBe('北京大学')
    expect(resume.education[0].major).toBe('计算机')

    store.removeEducation(resume.id, eduId)

    expect(resume.education.length).toBe(0)
  })

  it('updateEducation 传入不存在的 eduId 不报错', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    expect(() => {
      store.updateEducation(resume.id, 'non-existent', { school: 'X' })
    }).not.toThrow()
  })
})

describe('resume store - 工作经历 CRUD', () => {
  it('addExperience / updateExperience / removeExperience', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.addExperience(resume.id, {
      company: '字节跳动',
      position: '前端工程师',
      date: '2021.07 - 至今',
      details: '<p>负责前端开发</p>',
      visible: true,
    })

    expect(resume.experience.length).toBe(1)
    expect(resume.experience[0].company).toBe('字节跳动')

    const expId = resume.experience[0].id
    store.updateExperience(resume.id, expId, { position: '高级前端工程师' })

    expect(resume.experience[0].position).toBe('高级前端工程师')

    store.removeExperience(resume.id, expId)

    expect(resume.experience.length).toBe(0)
  })
})

describe('resume store - 项目经历 CRUD', () => {
  it('addProject / updateProject / removeProject', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.addProject(resume.id, {
      name: '自由简历',
      role: '负责人',
      date: '2024.01 - 至今',
      description: '<p>开源简历工具</p>',
      visible: true,
    })

    expect(resume.projects.length).toBe(1)
    expect(resume.projects[0].name).toBe('自由简历')

    const projId = resume.projects[0].id
    store.updateProject(resume.id, projId, { name: '自由简历 Pro' })

    expect(resume.projects[0].name).toBe('自由简历 Pro')

    store.removeProject(resume.id, projId)

    expect(resume.projects.length).toBe(0)
  })
})

describe('resume store - 证书 CRUD', () => {
  it('addCertificate / updateCertificate / removeCertificate', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    const cert: Certificate = {
      id: 'cert-1',
      url: 'https://example.com/cert.png',
      width: 200,
    }
    store.addCertificate(resume.id, cert)

    expect(resume.certificates.length).toBe(1)
    expect(resume.certificates[0].url).toBe('https://example.com/cert.png')

    store.updateCertificate(resume.id, 'cert-1', { width: 300 })

    expect(resume.certificates[0].width).toBe(300)

    store.removeCertificate(resume.id, 'cert-1')

    expect(resume.certificates.length).toBe(0)
  })
})

describe('resume store - 基本信息 / 技能 / 自我评价', () => {
  it('updateBasicInfo 部分更新生效', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.updateBasicInfo(resume.id, {
      name: '张三',
      email: 'zhangsan@example.com',
    })

    expect(resume.basic.name).toBe('张三')
    expect(resume.basic.email).toBe('zhangsan@example.com')
  })

  it('updateSkillContent 更新技能内容', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.updateSkillContent(resume.id, '<ul><li>Vue</li><li>React</li></ul>')

    expect(resume.skillContent).toBe('<ul><li>Vue</li><li>React</li></ul>')
  })

  it('updateSelfEvaluation 更新自我评价', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.updateSelfEvaluation(resume.id, '热爱前端开发')

    expect(resume.selfEvaluationContent).toBe('热爱前端开发')
  })

  it('updateCertificatesContent 更新证书内容', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.updateCertificatesContent(resume.id, '<ul><li>CET-6</li></ul>')

    expect(resume.certificatesContent).toBe('<ul><li>CET-6</li></ul>')
  })
})

describe('resume store - 模板与全局设置', () => {
  it('setTemplateId 更新模板 ID', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.setTemplateId(resume.id, 'modern')

    expect(resume.templateId).toBe('modern')
  })

  it('updateGlobalSettings 部分更新生效', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')
    const originalFontSize = resume.globalSettings.baseFontSize

    store.updateGlobalSettings(resume.id, {
      themeColor: '#FF4500',
      lineHeight: 1.8,
    })

    expect(resume.globalSettings.themeColor).toBe('#FF4500')
    expect(resume.globalSettings.lineHeight).toBe(1.8)
    // 未更新字段保持原值
    expect(resume.globalSettings.baseFontSize).toBe(originalFontSize)
  })
})

describe('resume store - 菜单模块', () => {
  it('updateMenuSections 替换整个模块列表', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    const newSections = [
      { id: 'basic', title: '基本信息', icon: '👤', enabled: true, order: 0 },
      { id: 'skills', title: '技能', icon: '⚡', enabled: false, order: 1 },
    ]
    store.updateMenuSections(resume.id, newSections)

    expect(resume.menuSections.length).toBe(2)
    expect(resume.menuSections[1].enabled).toBe(false)
  })

  it('toggleMenuSection 切换模块可见性', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')
    const originalEnabled = resume.menuSections[0].enabled

    store.toggleMenuSection(resume.id, resume.menuSections[0].id)

    expect(resume.menuSections[0].enabled).toBe(!originalEnabled)

    // 再切回来
    store.toggleMenuSection(resume.id, resume.menuSections[0].id)

    expect(resume.menuSections[0].enabled).toBe(originalEnabled)
  })

  it('toggleMenuSection 传入不存在的 id 不报错', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    expect(() => {
      store.toggleMenuSection(resume.id, 'non-existent')
    }).not.toThrow()
  })
})

describe('resume store - 其他操作', () => {
  it('setActiveSection 设置当前激活模块', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.setActiveSection(resume.id, 'experience')

    expect(resume.activeSection).toBe('experience')
  })

  it('setDraggingProjectId 设置拖拽项目 ID', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.setDraggingProjectId(resume.id, 'proj-1')

    expect(resume.draggingProjectId).toBe('proj-1')

    store.setDraggingProjectId(resume.id, null)

    expect(resume.draggingProjectId).toBeNull()
  })

  it('setActiveResume 切换当前简历', () => {
    const store = useResumeStore()
    const r1 = store.createResume('简历1')
    const r2 = store.createResume('简历2')

    expect(store.activeResumeId).toBe(r2.id)

    store.setActiveResume(r1.id)

    expect(store.activeResumeId).toBe(r1.id)
    expect(store.activeResume?.title).toBe('简历1')
  })

  it('updateResumeTitle 更新简历标题', () => {
    const store = useResumeStore()
    const resume = store.createResume('旧标题')

    store.updateResumeTitle(resume.id, '新标题')

    expect(resume.title).toBe('新标题')
  })

  it('importResume 替换简历数据', () => {
    const store = useResumeStore()
    const resume = store.createResume('测试')

    store.importResume(resume.id, {
      title: '导入的简历',
      basic: {
        ...resume.basic,
        name: '李四',
        email: 'lisi@example.com',
      },
    })

    expect(resume.title).toBe('导入的简历')
    expect(resume.basic.name).toBe('李四')
  })
})

describe('resume store - initialize', () => {
  it('空 store 调用 initialize 后创建示例简历', () => {
    const store = useResumeStore()

    expect(store.resumeCount).toBe(0)

    store.initialize()

    expect(store.resumeCount).toBe(1)
    expect(store.activeResumeId).not.toBeNull()
    expect(store.activeResume).not.toBeNull()
    // initialize 使用 initialResumeState 填充，包含示例数据
    expect(store.activeResume?.basic.name).toBe('李明')
    expect(store.activeResume?.education.length).toBeGreaterThan(0)
  })

  it('有简历但无 activeResumeId 时 initialize 设置第一个为 active', () => {
    const store = useResumeStore()
    const r1 = store.createResume('简历1')

    // 手动清除 activeResumeId
    store.activeResumeId = null

    store.initialize()

    expect(store.activeResumeId).toBe(r1.id)
  })

  it('有简历且有 activeResumeId 时 initialize 不做任何改变', () => {
    const store = useResumeStore()
    store.createResume('简历1')
    const originalCount = store.resumeCount
    const originalActive = store.activeResumeId

    store.initialize()

    expect(store.resumeCount).toBe(originalCount)
    expect(store.activeResumeId).toBe(originalActive)
  })
})

describe('resume store - 持久化', () => {
  it('createResume 后 localStorage 包含 resume-storage key', async () => {
    const store = useResumeStore()
    store.createResume('持久化测试')

    // 持久化插件通过 $subscribe 异步触发，需要 nextTick 让订阅回调执行
    await nextTick()

    const stored = localStorage.getItem('resume-storage')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.resumes).toBeDefined()
    expect(parsed.resumes.length).toBe(1)
    expect(parsed.resumes[0].title).toBe('持久化测试')
  })

  it('deleteResume 后 localStorage 数据同步更新', async () => {
    const store = useResumeStore()
    const r1 = store.createResume('简历1')
    store.createResume('简历2')

    store.deleteResume(r1.id)

    await nextTick()

    const stored = localStorage.getItem('resume-storage')
    const parsed = JSON.parse(stored!)
    expect(parsed.resumes.length).toBe(1)
    expect(parsed.resumes[0].title).toBe('简历2')
  })

  it('persist key 为 resume-storage', async () => {
    const store = useResumeStore()
    store.createResume('key 测试')

    await nextTick()

    expect(localStorage.getItem('resume-storage')).not.toBeNull()
    // 不应存在其他 store 的 key
    expect(localStorage.getItem('ai-config-storage')).toBeNull()
  })

  it('$persist 手动调用可以写入 storage', () => {
    const store = useResumeStore()
    store.createResume('手动 persist')

    // 手动调用 $persist 同步写入
    store.$persist()

    const stored = localStorage.getItem('resume-storage')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.resumes[0].title).toBe('手动 persist')
  })
})
