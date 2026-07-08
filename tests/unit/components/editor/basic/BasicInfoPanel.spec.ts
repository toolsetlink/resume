// BasicInfoPanel 组件单元测试 - 自由简历项目
// Task 10.5 - 编辑器组件测试
//
// 策略：
// BasicInfoPanel 依赖：
// 1. useI18n（Nuxt 自动导入，来自 vue-i18n）
// 2. useResumeStore（来自 ~/stores/resume）
// 3. TDesign 组件（t-radio-group/t-upload/t-input 等）
// 通过 vi.stubGlobal 注入 useI18n（默认实现已在 setup.ts 提供），
// vi.mock 桩化 store，挂载时 stub TDesign 组件。
// 重点验证：组件挂载、表单元素存在、输入触发 store 更新。
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'

// mock useResumeStore：提供可控的 store 数据
const mockUpdateBasicInfo = vi.fn()
const mockStore = {
  activeResumeId: 'resume-1',
  activeResume: {
    id: 'resume-1',
    basic: {
      name: '张三',
      title: '前端工程师',
      email: 'zhangsan@example.com',
      phone: '13800000000',
      location: '北京',
      birthDate: '1995-03',
      employementStatus: '在职',
      photo: '',
      photoConfig: { width: 90, height: 120, aspectRatio: '1:1', borderRadius: 'none', customBorderRadius: 0, visible: true },
      icons: {},
      customFields: [],
      layout: 'left',
    },
  },
  updateBasicInfo: mockUpdateBasicInfo,
}

vi.mock('~/stores/resume', () => ({
  useResumeStore: () => mockStore,
}))

import BasicInfoPanel from '@/components/editor/basic/BasicInfoPanel.vue'

// TDesign 组件桩：渲染默认插槽，转发必要事件
const tdesignStubs = {
  't-radio-group': {
    name: 'TRadioGroup',
    template: '<div class="t-radio-group"><slot /></div>',
    emits: ['update:modelValue', 'change'],
    methods: {
      // 暴露一个方法用于测试中触发 change 事件
      emitChange(value: string) {
        ;(this as any).$emit('change', value)
      },
    },
  },
  't-radio-button': {
    template: '<label class="t-radio-button"><slot /></label>',
    props: ['value'],
  },
  't-upload': {
    template: '<div class="t-upload"><slot /></div>',
    emits: ['select'],
  },
  't-button': {
    template: '<button class="t-button" @click="$emit(\'click\')"><slot /></button>',
    props: ['theme', 'variant'],
  },
  't-form': {
    template: '<form class="t-form"><slot /></form>',
  },
  't-form-item': {
    template: '<div class="t-form-item"><label v-if="label">{{ label }}</label><slot /></div>',
    props: ['label'],
  },
  't-input': {
    template: '<input class="t-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\')" />',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue', 'blur'],
  },
  't-input-number': {
    template: '<input class="t-input-number" type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" @change="$emit(\'change\')" />',
    props: ['modelValue', 'min', 'max'],
    emits: ['update:modelValue', 'change'],
  },
  't-select': {
    template: '<select class="t-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value); $emit(\'change\')"><slot /></select>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'change'],
  },
  't-option': {
    template: '<option :value="value"><slot /></option>',
    props: ['value'],
  },
  't-switch': {
    template: '<input type="checkbox" class="t-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked); $emit(\'change\')" />',
    props: ['modelValue'],
    emits: ['update:modelValue', 'change'],
  },
}

describe('BasicInfoPanel.vue', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    mockUpdateBasicInfo.mockClear()
    // 创建 Pinia 实例（虽然 store 已 mock，但保留以备其他 composable 使用）
    const pinia = createPinia()
    const app = createApp({})
    app.use(pinia)
    setActivePinia(pinia)
    localStorage.clear()
  })

  it('组件模块可正常导入', () => {
    expect(BasicInfoPanel).toBeDefined()
    expect(typeof BasicInfoPanel).toBe('object')
  })

  it('组件挂载成功且不抛错', () => {
    const wrapper = mount(BasicInfoPanel, {
      global: {
        stubs: tdesignStubs,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('挂载后渲染根容器（space-y-6 p-6）', () => {
    const wrapper = mount(BasicInfoPanel, {
      global: {
        stubs: tdesignStubs,
      },
    })
    expect(wrapper.find('.space-y-6').exists()).toBe(true)
  })

  it('渲染布局标题（h3）', () => {
    const wrapper = mount(BasicInfoPanel, {
      global: {
        stubs: tdesignStubs,
      },
    })
    const headings = wrapper.findAll('h3')
    expect(headings.length).toBeGreaterThan(0)
    // 至少包含布局标题
    const texts = headings.map((h) => h.text())
    expect(texts).toContain('布局')
  })

  it('渲染照片标题与照片占位区', () => {
    const wrapper = mount(BasicInfoPanel, {
      global: {
        stubs: tdesignStubs,
      },
    })
    const headings = wrapper.findAll('h3')
    const texts = headings.map((h) => h.text())
    expect(texts).toContain('照片')
  })

  it('从 store 同步初始数据到表单（姓名显示）', async () => {
    const wrapper = mount(BasicInfoPanel, {
      global: {
        stubs: tdesignStubs,
      },
    })
    await nextTick()
    // basicInfo.name 应来自 store.activeResume.basic.name
    const inputs = wrapper.findAll('.t-input')
    // 至少有姓名、邮箱等输入框
    expect(inputs.length).toBeGreaterThan(0)
    // 第一个输入框的 value 应为张三（按模板顺序，姓名是第一个）
    const nameInput = inputs[0]
    expect((nameInput.element as HTMLInputElement).value).toBe('张三')
  })

  it('输入姓名 blur 后触发 store.updateBasicInfo', async () => {
    const wrapper = mount(BasicInfoPanel, {
      global: {
        stubs: tdesignStubs,
      },
    })
    await nextTick()
    const inputs = wrapper.findAll('.t-input')
    const nameInput = inputs[0]
    // 模拟用户输入
    await nameInput.setValue('李四')
    // 触发 blur 提交
    await nameInput.trigger('blur')
    await nextTick()

    expect(mockUpdateBasicInfo).toHaveBeenCalled()
    const callArgs = mockUpdateBasicInfo.mock.calls[0]
    expect(callArgs[0]).toBe('resume-1')
    expect(callArgs[1].name).toBe('李四')
  })

  it('布局 radio-group 存在并包含三个 radio-button', () => {
    const wrapper = mount(BasicInfoPanel, {
      global: {
        stubs: tdesignStubs,
      },
    })
    const radioGroup = wrapper.find('.t-radio-group')
    expect(radioGroup.exists()).toBe(true)
    const radioButtons = radioGroup.findAll('.t-radio-button')
    expect(radioButtons.length).toBe(3)
  })

  it('切换布局触发 commitBasicInfo', async () => {
    const wrapper = mount(BasicInfoPanel, {
      global: {
        stubs: tdesignStubs,
      },
    })
    await nextTick()
    // 通过 name 找到 t-radio-group 桩组件实例
    const radioGroup = wrapper.findComponent({ name: 'TRadioGroup' })
    expect(radioGroup.exists()).toBe(true)
    // 调用桩暴露的方法触发 change 事件
    ;(radioGroup.vm as any).emitChange('center')
    await nextTick()
    expect(mockUpdateBasicInfo).toHaveBeenCalled()
    const callArgs = mockUpdateBasicInfo.mock.calls[0]
    expect(callArgs[1].layout).toBe('center')
  })

  it('移除照片按钮存在（store 中 photo 为空时不显示）', () => {
    const wrapper = mount(BasicInfoPanel, {
      global: {
        stubs: tdesignStubs,
      },
    })
    // photo 为空时，"移除" 按钮不应显示
    const removeButtons = wrapper.findAll('button').filter((b) => b.text() === '移除')
    expect(removeButtons.length).toBe(0)
  })
})
