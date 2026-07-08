// TiptapEditor 组件单元测试 - 自由简历项目
// Task 10.5 - 编辑器组件测试
//
// 说明：
// Tiptap 基于 prosemirror，在 happy-dom 下能完成基础挂载与渲染，
// 但 EditorContent 的 ProseMirror 视图挂载是异步的：在 nextTick 之后
// 才会渲染出 .ProseMirror 节点。因此涉及 DOM 内容的断言需要多次 nextTick。
// 本测试验证：组件导入、挂载、editor 实例创建、扩展注册、v-model 通信。
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import TiptapEditor from '@/components/editor/TiptapEditor.vue'

// Tiptap 的 EditorContent 在挂载后通过 microtask 异步渲染 ProseMirror，
// 需要多次 nextTick 才能让 .ProseMirror 节点出现在 DOM 中。
async function waitForEditor() {
  for (let i = 0; i < 5; i++) {
    await nextTick()
  }
}

describe('TiptapEditor.vue', () => {
  beforeEach(() => {
    // 每个用例前清理可能残留的 DOM
    document.body.innerHTML = ''
  })

  it('组件模块可正常导入', () => {
    expect(TiptapEditor).toBeDefined()
    expect(typeof TiptapEditor).toBe('object')
  })

  it('组件挂载成功且不抛错', () => {
    const wrapper = mount(TiptapEditor, {
      props: { modelValue: '<p>hello</p>' },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.tiptap-editor-wrapper').exists()).toBe(true)
  })

  it('接收 modelValue prop', () => {
    const wrapper = mount(TiptapEditor, {
      props: { modelValue: '<p>initial content</p>' },
    })
    // 组件实例存在
    expect(wrapper.vm).toBeDefined()
    // prop 通过 defineProps 暴露
    expect(wrapper.props('modelValue')).toBe('<p>initial content</p>')
  })

  it('接收 placeholder 与 editable props', () => {
    const wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: '自定义占位符',
        editable: false,
      },
    })
    expect(wrapper.props('placeholder')).toBe('自定义占位符')
    expect(wrapper.props('editable')).toBe(false)
  })

  it('使用默认 placeholder 值为 "请输入内容..."', () => {
    const wrapper = mount(TiptapEditor, {
      props: { modelValue: '' },
    })
    expect(wrapper.props('placeholder')).toBe('请输入内容...')
    expect(wrapper.props('editable')).toBe(true)
  })

  it('创建 editor 实例（通过 EditorContent 渲染 ProseMirror）', async () => {
    const wrapper = mount(TiptapEditor, {
      props: { modelValue: '<p>editor content</p>' },
    })
    await waitForEditor()
    // EditorContent 渲染一个 .ProseMirror 节点
    const prosemirror = wrapper.find('.ProseMirror')
    expect(prosemirror.exists()).toBe(true)
    // 内容应被注入
    expect(prosemirror.html()).toContain('editor content')
  })

  it('注册 placeholder 扩展并显示占位符（空内容时）', async () => {
    const wrapper = mount(TiptapEditor, {
      props: {
        modelValue: '',
        placeholder: '请输入内容...',
      },
    })
    await waitForEditor()
    // Placeholder 扩展会在空编辑器首个段落上加 data-placeholder 属性
    const prosemirror = wrapper.find('.ProseMirror')
    expect(prosemirror.exists()).toBe(true)
    const firstParagraph = prosemirror.find('p')
    expect(firstParagraph.exists()).toBe(true)
    expect(firstParagraph.attributes('data-placeholder')).toBe('请输入内容...')
  })

  it('扩展已注册：starter-kit 提供 paragraph/bold 等（editor 实例方法可用）', async () => {
    const wrapper = mount(TiptapEditor, {
      props: { modelValue: '<p>extensions test</p>' },
    })
    await waitForEditor()
    // 通过 EditorContent 的 props 拿到 editor 实例
    const editorContent = wrapper.findComponent({ name: 'EditorContent' })
    expect(editorContent.exists()).toBe(true)
    const editor: any = editorContent.props('editor')
    expect(editor).toBeTruthy()
    // StarterKit 包含 paragraph、bold、italic 等节点/标记
    expect(editor.isActive).toBeDefined()
    expect(editor.chain).toBeDefined()
    expect(editor.getHTML).toBeDefined()
    // 至少 ProseMirror 已渲染
    expect(wrapper.find('.ProseMirror').exists()).toBe(true)
  })

  it('editable=false 时编辑器不可编辑', async () => {
    const wrapper = mount(TiptapEditor, {
      props: { modelValue: '<p>read only</p>', editable: false },
    })
    await waitForEditor()
    const prosemirror = wrapper.find('.ProseMirror')
    expect(prosemirror.exists()).toBe(true)
    // ProseMirror 在不可编辑时会加 contenteditable="false"
    expect(prosemirror.attributes('contenteditable')).toBe('false')
  })

  it('响应 modelValue 变化（外部同步到编辑器）', async () => {
    const wrapper = mount(TiptapEditor, {
      props: { modelValue: '<p>old</p>' },
    })
    await waitForEditor()
    expect(wrapper.find('.ProseMirror').html()).toContain('old')

    await wrapper.setProps({ modelValue: '<p>new</p>' })
    await waitForEditor()
    expect(wrapper.find('.ProseMirror').html()).toContain('new')
  })

  it('卸载组件时不抛错（触发 onBeforeUnmount）', async () => {
    const wrapper = mount(TiptapEditor, {
      props: { modelValue: '<p>unmount</p>' },
    })
    await waitForEditor()
    expect(() => {
      wrapper.unmount()
    }).not.toThrow()
  })
})
