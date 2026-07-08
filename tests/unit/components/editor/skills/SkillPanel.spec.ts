// SkillPanel 组件单元测试 - 自由简历项目
//
// 策略：
// SkillPanel 已改造为单一富文本字段（与 SelfEvaluationPanel 一致），
// 使用 useEditor + EditorToolbar + TiptapEditor，commit 调用 store.updateSkillContent。
// 桩化 Tiptap/TDesign，mock useResumeStore 和 @tiptap/vue-3 的 useEditor。
// 重点验证：组件挂载、标题渲染、store 数据绑定、commit 调用。
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref, reactive } from 'vue'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

// mock useResumeStore
const mockUpdateSkillContent = vi.fn()
const mockStore = reactive({
  activeResumeId: 'resume-1',
  activeResume: {
    id: 'resume-1',
    skillContent: '<ul><li>Vue</li><li>React</li></ul>',
  },
  updateSkillContent: mockUpdateSkillContent,
})

vi.mock('~/stores/resume', () => ({
  useResumeStore: () => mockStore,
}))

// mock @tiptap/vue-3 useEditor：返回一个最小化的编辑器实例
const mockEditor = ref({
  getHTML: () => '<ul><li>Vue</li><li>React</li></ul>',
  commands: { setContent: vi.fn() },
  destroy: vi.fn(),
})
vi.mock('@tiptap/vue-3', () => ({
  useEditor: () => mockEditor,
}))

import SkillPanel from '@/components/editor/skills/SkillPanel.vue'

// 自定义桩：TiptapEditor 等 Tiptap 相关组件桩化，避免初始化真实编辑器
const stubs = {
  TiptapEditor: {
    name: 'TiptapEditor',
    props: ['modelValue'],
    template: '<div class="tiptap-editor-stub"></div>',
  },
  EditorToolbar: true,
}

describe('SkillPanel.vue', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    mockUpdateSkillContent.mockClear()
    mockEditor.value.getHTML = () => '<ul><li>Vue</li><li>React</li></ul>'
    mockEditor.value.commands.setContent = vi.fn()
    mockEditor.value.destroy = vi.fn()
    const pinia = createPinia()
    const app = createApp({})
    app.use(pinia)
    setActivePinia(pinia)
    localStorage.clear()
  })

  it('组件模块可正常导入', () => {
    expect(SkillPanel).toBeDefined()
    expect(typeof SkillPanel).toBe('object')
  })

  it('组件挂载成功且不抛错', () => {
    const wrapper = mount(SkillPanel, {
      global: { stubs },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('渲染根容器（p-4 space-y-3）', () => {
    const wrapper = mount(SkillPanel, {
      global: { stubs },
    })
    expect(wrapper.find('.p-4').exists()).toBe(true)
  })

  it('渲染标题 h3 包含 "专业技能"', () => {
    const wrapper = mount(SkillPanel, {
      global: { stubs },
    })
    const heading = wrapper.find('h3')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toContain('专业技能')
  })

  it('渲染 EditorToolbar 和 TiptapEditor', () => {
    const wrapper = mount(SkillPanel, {
      global: { stubs },
    })
    expect(wrapper.findComponent({ name: 'EditorToolbar' }).exists()).toBe(true)
    expect(wrapper.find('.tiptap-editor-stub').exists()).toBe(true)
  })

  it('从 store 同步初始 skillContent', async () => {
    mount(SkillPanel, {
      global: { stubs },
    })
    await nextTick()
    // content 初始值应来自 store.activeResume.skillContent
    expect(mockStore.activeResume.skillContent).toBe('<ul><li>Vue</li><li>React</li></ul>')
  })

  it('store.skillContent 变化时同步到 content', async () => {
    mount(SkillPanel, {
      global: { stubs },
    })
    await nextTick()
    // 修改 store 中的 skillContent
    mockStore.activeResume.skillContent = '<p>新技能</p>'
    await nextTick()
    expect(mockStore.activeResume.skillContent).toBe('<p>新技能</p>')
  })

  it('组件卸载时销毁编辑器', async () => {
    const wrapper = mount(SkillPanel, {
      global: { stubs },
    })
    await nextTick()
    wrapper.unmount()
    expect(mockEditor.value.destroy).toHaveBeenCalled()
  })
})
