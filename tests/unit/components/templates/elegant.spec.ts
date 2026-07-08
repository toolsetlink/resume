// 单元测试：elegant 模板渲染
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed, ref, reactive, watch, watchEffect, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import ElegantTemplate from '@/components/templates/elegant/index.vue'
import { elegantConfig } from '@/components/templates/elegant/config'
import {
  initialResumeState,
  createNewResume,
} from '#shared/config/initialResumeData'
import type { ResumeData } from '#shared/types/resume'

// ============================================================
// 模拟 Nuxt 自动注入的全局 composable / Vue API
// Nuxt 在运行时通过 unimport 自动注入 Vue 的 ref/computed 等 API 以及
// @nuxtjs/i18n 的 useI18n。vitest 单独运行时无此机制，需手动全局注入。
// ============================================================
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('reactive', reactive)
vi.stubGlobal('watch', watch)
vi.stubGlobal('watchEffect', watchEffect)
vi.stubGlobal('nextTick', nextTick)
vi.stubGlobal('useI18n', () => ({
  t: (key: string) => {
    const map: Record<string, string> = {
      'resume.sections.education': '教育经历',
      'resume.sections.experience': '工作经验',
      'resume.sections.projects': '项目经历',
      'resume.sections.skills': '专业技能',
      'resume.sections.selfEvaluation': '自我评价',
    }
    return map[key] ?? key
  },
  locale: { value: 'zh-CN' },
}))

// 构造一份完整 ResumeData
function buildResumeData(): ResumeData {
  return {
    ...initialResumeState,
    ...createNewResume('测试简历'),
    basic: initialResumeState.basic,
    education: initialResumeState.education,
    experience: initialResumeState.experience,
    projects: initialResumeState.projects,
    skillContent: initialResumeState.skillContent,
    selfEvaluationContent: initialResumeState.selfEvaluationContent,
    menuSections: initialResumeState.menuSections,
    customData: {},
    certificates: [],
    globalSettings: initialResumeState.globalSettings,
  } as unknown as ResumeData
}

describe('ElegantTemplate - 优雅经典模板渲染', () => {
  let resumeData: ResumeData

  beforeEach(() => {
    resumeData = buildResumeData()
  })

  it('组件挂载成功', () => {
    const wrapper = mount(ElegantTemplate, {
      props: {
        data: resumeData,
        template: elegantConfig,
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.elegant-template').exists()).toBe(true)
  })

  it('渲染出姓名 "李明"', () => {
    const wrapper = mount(ElegantTemplate, {
      props: {
        data: resumeData,
        template: elegantConfig,
      },
    })
    expect(wrapper.html()).toContain('李明')
  })

  it('渲染出至少一个教育/工作/项目关键字段', () => {
    const wrapper = mount(ElegantTemplate, {
      props: {
        data: resumeData,
        template: elegantConfig,
      },
    })
    const html = wrapper.html()
    expect(
      html.includes('清华大学') ||
        html.includes('某科技公司') ||
        html.includes('企业中台系统')
    ).toBe(true)
  })

  it('渲染出教育经历学校名 "清华大学"', () => {
    const wrapper = mount(ElegantTemplate, {
      props: {
        data: resumeData,
        template: elegantConfig,
      },
    })
    expect(wrapper.html()).toContain('清华大学')
  })

  it('渲染出工作经历公司名 "某科技公司"', () => {
    const wrapper = mount(ElegantTemplate, {
      props: {
        data: resumeData,
        template: elegantConfig,
      },
    })
    expect(wrapper.html()).toContain('某科技公司')
  })

  it('渲染出项目经历项目名 "企业中台系统"', () => {
    const wrapper = mount(ElegantTemplate, {
      props: {
        data: resumeData,
        template: elegantConfig,
      },
    })
    expect(wrapper.html()).toContain('企业中台系统')
  })

  it('应用居中布局（elegant BaseInfo 居中显示姓名）', () => {
    const wrapper = mount(ElegantTemplate, {
      props: {
        data: resumeData,
        template: elegantConfig,
      },
    })
    // elegantConfig.basic.layout = 'center'，elegant BaseInfo 渲染居中布局
    // BaseInfo 渲染姓名在 h1.name 中
    const nameEl = wrapper.find('.elegant-base-info .name')
    expect(nameEl.exists()).toBe(true)
    expect(nameEl.text()).toContain('李明')
  })
})
