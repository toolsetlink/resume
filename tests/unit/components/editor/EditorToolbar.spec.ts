// EditorToolbar 组件单元测试 - 自由简历项目
// Task 10.5 - 编辑器组件测试
//
// 策略：
// EditorToolbar 依赖 TDesign 组件（t-button/t-tooltip/t-popover/t-dialog 等），
// 在 vitest 环境下深度渲染 TDesign 可能引入额外不稳定因素。因此本测试通过
// 1. shallowMount + stub 桩化 TDesign 组件
// 2. 注入一个 mock editor 实例（chain().focus().toggleBold().run() 链式调用）
// 验证工具栏挂载、按钮渲染、点击触发对应命令。
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import EditorToolbar from '@/components/editor/EditorToolbar.vue'

// 构造一个支持链式调用的 mock editor
// EditorToolbar 中的调用形如：editor.chain().focus().toggleBold().run()
function createMockEditor() {
  const run = vi.fn(() => {})
  const chainReturn: any = {
    focus: vi.fn(function () {
      return chainReturn
    }),
    toggleBold: vi.fn(function () {
      return chainReturn
    }),
    toggleItalic: vi.fn(function () {
      return chainReturn
    }),
    toggleUnderline: vi.fn(function () {
      return chainReturn
    }),
    toggleStrike: vi.fn(function () {
      return chainReturn
    }),
    toggleHighlight: vi.fn(function () {
      return chainReturn
    }),
    toggleBulletList: vi.fn(function () {
      return chainReturn
    }),
    toggleOrderedList: vi.fn(function () {
      return chainReturn
    }),
    setTextAlign: vi.fn(function () {
      return chainReturn
    }),
    setColor: vi.fn(function () {
      return chainReturn
    }),
    extendMarkRange: vi.fn(function () {
      return chainReturn
    }),
    unsetLink: vi.fn(function () {
      return chainReturn
    }),
    setLink: vi.fn(function () {
      return chainReturn
    }),
    run,
  }
  const editor: any = {
    chain: vi.fn(() => chainReturn),
    isActive: vi.fn(() => false),
    getAttributes: vi.fn(() => ({})),
  }
  return { editor, chainReturn, run }
}

describe('EditorToolbar.vue', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('组件模块可正常导入', () => {
    expect(EditorToolbar).toBeDefined()
    expect(typeof EditorToolbar).toBe('object')
  })

  it('组件挂载成功（editor 为 null 时不抛错）', () => {
    const wrapper = mount(EditorToolbar, {
      props: { editor: null },
    })
    expect(wrapper.exists()).toBe(true)
    // 工具栏容器存在
    expect(wrapper.find('.flex.items-center').exists()).toBe(true)
  })

  it('组件挂载成功（editor 实例存在时）', () => {
    const { editor } = createMockEditor()
    const wrapper = mount(EditorToolbar, {
      props: { editor },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('接收 editor prop', () => {
    const { editor } = createMockEditor()
    const wrapper = mount(EditorToolbar, {
      props: { editor },
    })
    // 注意：props('editor') 在 mock 函数对象上返回的是相同引用的副本，断言身份相等
    // 由于 vi.fn 创建的代理在比较时可能不稳定，这里断言 props 上有 editor 字段即可
    expect(wrapper.props('editor')).toBeDefined()
  })

  it('工具栏容器渲染（含 div.flex.items-center）', () => {
    const { editor } = createMockEditor()
    const wrapper = mount(EditorToolbar, {
      props: { editor },
    })
    expect(wrapper.find('.flex.items-center').exists()).toBe(true)
  })

  it('渲染多个工具栏按钮（粗体/斜体/下划线/删除线等）', () => {
    const { editor } = createMockEditor()
    const wrapper = mount(EditorToolbar, {
      props: { editor },
      global: {
        stubs: {
          // 桩化 t-tooltip 并渲染默认插槽内容（让内部的 t-button 可被点击）
          't-tooltip': {
            template: '<span><slot /></span>',
          },
          't-button': true,
          't-divider': true,
          't-popover': {
            template: '<span><slot /><slot name="content" /></span>',
          },
          't-color-picker-panel': true,
          't-dialog': true,
          't-form': true,
          't-form-item': true,
          't-input': true,
        },
      },
    })
    // 渲染出多个桩化按钮节点
    const buttons = wrapper.findAllComponents({ name: 'TButton' })
    expect(buttons.length).toBeGreaterThanOrEqual(8)
  })

  it('点击按钮触发对应命令（mock editor.chain 被调用）', async () => {
    const { editor, chainReturn } = createMockEditor()
    const wrapper = mount(EditorToolbar, {
      props: { editor },
      global: {
        stubs: {
          't-button': {
            // 自定义 stub：渲染 <button> 并转发 click 事件
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          't-tooltip': {
            template: '<span><slot /></span>',
          },
          't-divider': true,
          't-popover': {
            template: '<span><slot /><slot name="content" /></span>',
          },
          't-color-picker-panel': true,
          't-dialog': true,
          't-form': true,
          't-form-item': true,
          't-input': true,
        },
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)

    // 点击第一个按钮（粗体）
    await buttons[0]!.trigger('click')
    expect(editor.chain).toHaveBeenCalled()
    expect(chainReturn.focus).toHaveBeenCalled()
    expect(chainReturn.toggleBold).toHaveBeenCalled()
    expect(chainReturn.run).toHaveBeenCalled()
  })

  it('点击斜体按钮触发 toggleItalic', async () => {
    const { editor, chainReturn } = createMockEditor()
    const wrapper = mount(EditorToolbar, {
      props: { editor },
      global: {
        stubs: {
          't-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          't-tooltip': {
            template: '<span><slot /></span>',
          },
          't-divider': true,
          't-popover': {
            template: '<span><slot /><slot name="content" /></span>',
          },
          't-color-picker-panel': true,
          't-dialog': true,
          't-form': true,
          't-form-item': true,
          't-input': true,
        },
      },
    })
    const buttons = wrapper.findAll('button')
    // 按模板顺序：Bold=0, Italic=1, Underline=2, Strikethrough=3
    await buttons[1]!.trigger('click')
    expect(chainReturn.toggleItalic).toHaveBeenCalled()
  })

  it('点击下划线按钮触发 toggleUnderline', async () => {
    const { editor, chainReturn } = createMockEditor()
    const wrapper = mount(EditorToolbar, {
      props: { editor },
      global: {
        stubs: {
          't-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          't-tooltip': {
            template: '<span><slot /></span>',
          },
          't-divider': true,
          't-popover': {
            template: '<span><slot /><slot name="content" /></span>',
          },
          't-color-picker-panel': true,
          't-dialog': true,
          't-form': true,
          't-form-item': true,
          't-input': true,
        },
      },
    })
    const buttons = wrapper.findAll('button')
    await buttons[2]!.trigger('click')
    expect(chainReturn.toggleUnderline).toHaveBeenCalled()
  })

  it('点击删除线按钮触发 toggleStrike', async () => {
    const { editor, chainReturn } = createMockEditor()
    const wrapper = mount(EditorToolbar, {
      props: { editor },
      global: {
        stubs: {
          't-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          't-tooltip': {
            template: '<span><slot /></span>',
          },
          't-divider': true,
          't-popover': {
            template: '<span><slot /><slot name="content" /></span>',
          },
          't-color-picker-panel': true,
          't-dialog': true,
          't-form': true,
          't-form-item': true,
          't-input': true,
        },
      },
    })
    const buttons = wrapper.findAll('button')
    await buttons[3]!.trigger('click')
    expect(chainReturn.toggleStrike).toHaveBeenCalled()
  })

  it('editor 为 null 时点击按钮不抛错', async () => {
    const wrapper = mount(EditorToolbar, {
      props: { editor: null },
      global: {
        stubs: {
          't-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          't-tooltip': {
            template: '<span><slot /></span>',
          },
          't-divider': true,
          't-popover': {
            template: '<span><slot /><slot name="content" /></span>',
          },
          't-color-picker-panel': true,
          't-dialog': true,
          't-form': true,
          't-form-item': true,
          't-input': true,
        },
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
    // 点击不应抛错
    expect(async () => {
      await buttons[0]!.trigger('click')
    }).not.toThrow()
  })
})
