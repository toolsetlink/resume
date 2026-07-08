// 单元测试：modern 模板渲染
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed, ref, reactive, watch, watchEffect, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import ModernTemplate from '@/components/templates/modern/index.vue'
import { modernConfig } from '@/components/templates/modern/config'
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

describe('ModernTemplate - 现代极简模板渲染', () => {
  let resumeData: ResumeData

  beforeEach(() => {
    resumeData = buildResumeData()
  })

  it('组件挂载成功', () => {
    const wrapper = mount(ModernTemplate, {
      props: {
        data: resumeData,
        template: modernConfig,
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.modern-template').exists()).toBe(true)
  })

  it('渲染出姓名 "李明"', () => {
    const wrapper = mount(ModernTemplate, {
      props: {
        data: resumeData,
        template: modernConfig,
      },
    })
    // SideBar 中渲染姓名
    expect(wrapper.html()).toContain('李明')
  })

  it('渲染出至少一个教育/工作/项目关键字段', () => {
    const wrapper = mount(ModernTemplate, {
      props: {
        data: resumeData,
        template: modernConfig,
      },
    })
    const html = wrapper.html()
    // MainContent 渲染工作/项目/教育
    expect(
      html.includes('清华大学') ||
        html.includes('某科技公司') ||
        html.includes('企业中台系统')
    ).toBe(true)
  })

  it('渲染出工作经历公司名 "某科技公司"', () => {
    const wrapper = mount(ModernTemplate, {
      props: {
        data: resumeData,
        template: modernConfig,
      },
    })
    expect(wrapper.html()).toContain('某科技公司')
  })

  it('渲染出教育经历学校名 "清华大学"', () => {
    const wrapper = mount(ModernTemplate, {
      props: {
        data: resumeData,
        template: modernConfig,
      },
    })
    expect(wrapper.html()).toContain('清华大学')
  })

  it('应用双栏布局（左右两个子区域）', () => {
    const wrapper = mount(ModernTemplate, {
      props: {
        data: resumeData,
        template: modernConfig,
      },
    })
    // SideBar + MainContent 两个子组件
    expect(wrapper.find('.modern-sidebar').exists()).toBe(true)
    expect(wrapper.find('.modern-main').exists()).toBe(true)
  })
})
