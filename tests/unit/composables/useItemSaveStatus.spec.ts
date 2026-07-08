// useItemSaveStatus composable 单元测试 - 自由简历项目
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useItemSaveStatus } from '@/composables/useItemSaveStatus'

// 包装组件：composable 中的 onBeforeUnmount 需要组件上下文
const createHost = () =>
  defineComponent({
    setup() {
      const state = useItemSaveStatus()
      return { ...state }
    },
    render() {
      return h('div', this.status as string)
    },
  })

describe('useItemSaveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初始 status 为 idle', () => {
    const wrapper = mount(createHost())
    expect(wrapper.vm.status).toBe('idle')
    wrapper.unmount()
  })

  it('调用 markSaving 后 status 变为 saving', async () => {
    const wrapper = mount(createHost())
    wrapper.vm.markSaving()
    await nextTick()
    expect(wrapper.vm.status).toBe('saving')
    wrapper.unmount()
  })

  it('400ms 后 status 变为 saved', async () => {
    const wrapper = mount(createHost())
    wrapper.vm.markSaving()
    await nextTick()
    expect(wrapper.vm.status).toBe('saving')

    vi.advanceTimersByTime(400)
    await nextTick()
    expect(wrapper.vm.status).toBe('saved')
    wrapper.unmount()
  })

  it('saved 状态 1500ms 后回到 idle', async () => {
    const wrapper = mount(createHost())
    wrapper.vm.markSaving()
    await nextTick()
    vi.advanceTimersByTime(400)
    await nextTick()
    expect(wrapper.vm.status).toBe('saved')

    vi.advanceTimersByTime(1500)
    await nextTick()
    expect(wrapper.vm.status).toBe('idle')
    wrapper.unmount()
  })

  it('连续多次 markSaving 重置定时器，不会提前切到 saved', async () => {
    const wrapper = mount(createHost())
    wrapper.vm.markSaving()
    await nextTick()
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(wrapper.vm.status).toBe('saving')

    // 再次触发，重置 saving 定时器
    wrapper.vm.markSaving()
    await nextTick()
    vi.advanceTimersByTime(300)
    await nextTick()
    // 距离第二次 markSaving 仅 300ms，不应切到 saved
    expect(wrapper.vm.status).toBe('saving')

    vi.advanceTimersByTime(100)
    await nextTick()
    // 累计 400ms 后切到 saved
    expect(wrapper.vm.status).toBe('saved')
    wrapper.unmount()
  })

  it('saved 状态期间再次 markSaving 会取消回到 idle 的定时器', async () => {
    const wrapper = mount(createHost())
    wrapper.vm.markSaving()
    await nextTick()
    vi.advanceTimersByTime(400)
    await nextTick()
    expect(wrapper.vm.status).toBe('saved')

    // saved 期间再次编辑
    wrapper.vm.markSaving()
    await nextTick()
    expect(wrapper.vm.status).toBe('saving')

    // 推进 1500ms（原 saved→idle 定时器已被取消，不应回到 idle）
    vi.advanceTimersByTime(1500)
    await nextTick()
    // saving 定时器 400ms 已触发 → saved
    expect(wrapper.vm.status).toBe('saved')
    wrapper.unmount()
  })

  it('组件卸载时清理定时器，不抛错', async () => {
    const wrapper = mount(createHost())
    wrapper.vm.markSaving()
    await nextTick()
    // 卸载应清理 saving/saved 定时器，不抛错
    expect(() => wrapper.unmount()).not.toThrow()
  })
})
