// ResumePreview 组件单元测试 - 自由简历项目
// Task 10.7：预览与共享组件测试
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import type { ResumeData } from '#shared/types/resume'
import {
  createNewResume,
  initialResumeState,
} from '#shared/config/initialResumeData'
import ResumePreview from '@/components/preview/ResumePreview.vue'
import {
  getTemplateConfig,
  getTemplateComponent,
} from '@/components/templates/registry'
import { professionalConfig } from '@/components/templates/professional/config'
import { modernConfig } from '@/components/templates/modern/config'

// 全局 mock useI18n：Nuxt 自动注入的 composable，vitest 单独运行时不可用。
// 模板内部组件（如 SkillSection / SideBar）使用了 useI18n().t(...)。
// stubGlobal 会在全局对象上注入，所有 SFC 中未显式 import 的 useI18n 都会落到这里。
vi.stubGlobal('useI18n', () => ({
  t: (key: string) => key,
  locale: { value: 'zh' },
}))

// 构造一份完整的测试用 ResumeData：基于 createNewResume + initialResumeState
function buildTestResumeData(
  overrides: Partial<ResumeData> = {}
): ResumeData {
  return {
    ...createNewResume(),
    ...initialResumeState,
    id: 'test-id',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as unknown as ResumeData
}

beforeEach(() => {
  // 重置 Pinia，避免其他 store 影响组件渲染
  const pinia = createPinia()
  const app = createApp({})
  app.use(pinia)
  setActivePinia(pinia)
})

describe('ResumePreview - 组件挂载', () => {
  it('组件挂载成功（不抛错）', () => {
    const resumeData = buildTestResumeData()
    expect(() => {
      mount(ResumePreview, {
        props: { resumeData },
      })
    }).not.toThrow()
  })

  it('根元素不再承载 #resume-preview 与 data-preview-scroll-container（已迁移至外层 A4 wrapper）', () => {
    // PDF 导出捕获目标 #resume-preview 已移到 workbench/[id].vue 的 A4 wrapper div 上，
    // ResumePreview 组件本身不再持有这两个属性，避免 id 重复并让被捕获元素自带 A4 尺寸。
    const resumeData = buildTestResumeData()
    const wrapper = mount(ResumePreview, {
      props: { resumeData },
    })
    expect(wrapper.find('#resume-preview').exists()).toBe(false)
    expect(
      wrapper.find('[data-preview-scroll-container="true"]').exists()
    ).toBe(false)
    // 根元素仍保留 .resume-preview-container 类
    expect(wrapper.find('.resume-preview-container').exists()).toBe(true)
  })
})

describe('ResumePreview - 模板选择逻辑', () => {
  it('默认渲染 professional 模板（无 templateId 时）', () => {
    // 无 templateId：应当渲染 professional 模板
    // professional 模板根节点有 .professional-template 类
    const resumeData = buildTestResumeData({ templateId: null })
    const wrapper = mount(ResumePreview, {
      props: { resumeData },
    })
    expect(wrapper.find('.professional-template').exists()).toBe(true)
    // 不应渲染其他模板
    expect(wrapper.find('.modern-template').exists()).toBe(false)
    expect(wrapper.find('.elegant-template').exists()).toBe(false)
  })

  it('传入 templateId="modern" 时切换为 modern 模板', () => {
    const resumeData = buildTestResumeData({ templateId: 'modern' })
    const wrapper = mount(ResumePreview, {
      props: { resumeData },
    })
    // modern 模板根节点有 .modern-template 类
    expect(wrapper.find('.modern-template').exists()).toBe(true)
    // 不应渲染 professional 模板
    expect(wrapper.find('.professional-template').exists()).toBe(false)
  })

  it('传入不存在的 templateId 时回退到 professional', () => {
    const resumeData = buildTestResumeData({
      templateId: 'this-template-does-not-exist',
    })
    const wrapper = mount(ResumePreview, {
      props: { resumeData },
    })
    // 回退到 professional
    expect(wrapper.find('.professional-template').exists()).toBe(true)
  })

  it('传入 templateId="elegant" 时切换为 elegant 模板', () => {
    const resumeData = buildTestResumeData({ templateId: 'elegant' })
    const wrapper = mount(ResumePreview, {
      props: { resumeData },
    })
    expect(wrapper.find('.elegant-template').exists()).toBe(true)
  })

  it('传入 templateId="creative" 时切换为 creative 模板', () => {
    const resumeData = buildTestResumeData({ templateId: 'creative' })
    const wrapper = mount(ResumePreview, {
      props: { resumeData },
    })
    expect(wrapper.find('.creative-template').exists()).toBe(true)
  })
})

describe('ResumePreview - 数据渲染', () => {
  it('传入有效 resumeData 时渲染出姓名"李明"', () => {
    // 不桩化模板，让模板真实渲染姓名
    const resumeData = buildTestResumeData({ templateId: 'professional' })
    const wrapper = mount(ResumePreview, {
      props: { resumeData },
    })
    expect(wrapper.text()).toContain('李明')
  })

  it('切换到 modern 模板时同样渲染出姓名', () => {
    const resumeData = buildTestResumeData({ templateId: 'modern' })
    const wrapper = mount(ResumePreview, {
      props: { resumeData },
    })
    expect(wrapper.text()).toContain('李明')
  })

  it('渲染联系信息（邮箱、电话）', () => {
    const resumeData = buildTestResumeData({ templateId: 'professional' })
    const wrapper = mount(ResumePreview, {
      props: { resumeData },
    })
    expect(wrapper.text()).toContain('liming@example.com')
    expect(wrapper.text()).toContain('13800138000')
  })
})

describe('ResumePreview - 与 registry 协作', () => {
  it('registry 在 templateId 不存在时返回 null 配置', () => {
    // 验证 registry 行为：传入不存在的 id 应返回 null
    expect(getTemplateConfig('non-existent-id')).toBeNull()
  })

  it('registry 在 layout 不存在时返回 null 组件', () => {
    expect(getTemplateComponent('non-existent-layout')).toBeNull()
  })

  it('professionalConfig 是默认配置', () => {
    // 验证 professionalConfig 的关键属性
    expect(professionalConfig.id).toBe('professional')
    expect(professionalConfig.layout).toBe('professional')
  })

  it('modernConfig 关键属性', () => {
    expect(modernConfig.id).toBe('modern')
    expect(modernConfig.layout).toBe('modern')
  })

  it('registry 能根据 professional layout 获取到组件', () => {
    const comp = getTemplateComponent('professional')
    expect(comp).not.toBeNull()
  })

  it('registry 能根据 modern layout 获取到组件', () => {
    const comp = getTemplateComponent('modern')
    expect(comp).not.toBeNull()
  })
})
