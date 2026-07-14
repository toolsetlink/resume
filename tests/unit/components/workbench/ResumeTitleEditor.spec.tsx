import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ResumeTitleEditor } from '@/components/workbench/ResumeTitleEditor'

beforeEach(() => {
  cleanup()
})

describe('ResumeTitleEditor', () => {
  it('默认渲染标题文字', () => {
    render(<ResumeTitleEditor title="产品经理简历" onChange={vi.fn()} />)
    expect(screen.getByText('产品经理简历')).toBeInTheDocument()
  })

  it('title 为空时显示 fallback', () => {
    render(<ResumeTitleEditor title="" onChange={vi.fn()} fallback="未命名简历" />)
    expect(screen.getByText('未命名简历')).toBeInTheDocument()
  })

  it('点击进入编辑态,显示 input 并自动聚焦', () => {
    render(<ResumeTitleEditor title="产品经理简历" onChange={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '编辑简历名称' }))

    const input = screen.getByLabelText('编辑简历名称') as HTMLInputElement
    expect(input.tagName).toBe('INPUT')
    expect(input.value).toBe('产品经理简历')
    expect(document.activeElement).toBe(input)
  })

  it('Enter 提交,触发 onChange 并退出编辑态', () => {
    const onChange = vi.fn()
    render(<ResumeTitleEditor title="旧标题" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '编辑简历名称' }))
    const input = screen.getByLabelText('编辑简历名称') as HTMLInputElement
    fireEvent.change(input, { target: { value: '新标题' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith('新标题')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('Escape 取消,不触发 onChange', () => {
    const onChange = vi.fn()
    render(<ResumeTitleEditor title="原标题" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '编辑简历名称' }))
    const input = screen.getByLabelText('编辑简历名称') as HTMLInputElement
    fireEvent.change(input, { target: { value: '草稿' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onChange).not.toHaveBeenCalled()
    // 回到原标题
    expect(screen.getByText('原标题')).toBeInTheDocument()
  })

  it('blur 自动提交', () => {
    const onChange = vi.fn()
    render(<ResumeTitleEditor title="原" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '编辑简历名称' }))
    const input = screen.getByLabelText('编辑简历名称') as HTMLInputElement
    fireEvent.change(input, { target: { value: '新值' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenCalledWith('新值')
  })

  it('内容未变不触发 onChange', () => {
    const onChange = vi.fn()
    render(<ResumeTitleEditor title="原" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '编辑简历名称' }))
    const input = screen.getByLabelText('编辑简历名称') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('提交时自动 trim 首尾空白', () => {
    const onChange = vi.fn()
    render(<ResumeTitleEditor title="原" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '编辑简历名称' }))
    const input = screen.getByLabelText('编辑简历名称') as HTMLInputElement
    fireEvent.change(input, { target: { value: '  新值  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith('新值')
  })
})
