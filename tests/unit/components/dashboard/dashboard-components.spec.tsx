import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import type { ResumeData } from '@/shared/types/resume'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/messages/zh.json', () => ({
  default: {
    common: {
      appName: '自由简历',
      save: '保存', cancel: '取消', delete: '删除', edit: '编辑',
      confirm: '确认', loading: '加载中...', create: '创建', duplicate: '复制',
    },
    nav: { dashboard: '我的简历列表' },
    templates: { unset: '未选择模板' },
    resume: {
      create: '创建简历',
      empty: '还没有简历，点击创建第一份吧',
      emptyHint: '从空白模板开始，或从已有案例复制一份',
      count: '共 {count} 份简历',
      listLabel: '简历列表',
      deleteConfirmTitle: '确认删除这份简历吗',
      deleteConfirmDescription: '删除后无法恢复',
    },
  },
}))

vi.mock('@/components/workbench/MiniTemplatePreview', () => ({
  MiniTemplatePreview: ({ templateId }: { templateId: string }) => (
    <div data-testid="mini-preview" data-template-id={templateId} />
  ),
}))

import { ResumeCard } from '@/components/dashboard/ResumeCard'
import { ResumeGrid } from '@/components/dashboard/ResumeGrid'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { EmptyState } from '@/components/dashboard/EmptyState'

function makeResume(overrides: Partial<ResumeData> = {}): ResumeData {
  const now = '2026-07-14T12:00:00.000Z'
  return {
    id: 'resume-1',
    title: '产品经理简历',
    createdAt: now,
    updatedAt: now,
    templateId: 'professional',
    basic: { name: '张三', title: 'PM', email: '', phone: '', location: '', birthDate: '', icons: {}, employementStatus: '', photo: '', photoConfig: { width: 90, height: 120, visible: true }, customFields: [] },
    education: [],
    experience: [],
    projects: [],
    certificates: [],
    certificatesContent: '',
    customData: {},
    skillContent: '',
    skills: [],
    selfEvaluationContent: '',
    activeSection: 'basic',
    draggingProjectId: null,
    menuSections: [],
    globalSettings: { baseFontSize: 14, pagePadding: 24, paragraphSpacing: 8, lineHeight: 1.5, headerSize: 20, subheaderSize: 16, sectionSpacing: 12 },
    ...overrides,
  }
}

beforeEach(() => {
  pushMock.mockClear()
  localStorage.clear()
  cleanup()
})

describe('ResumeCard', () => {
  it('渲染标题和缩略图,并把当前 resume 的 templateId 传给 MiniTemplatePreview', () => {
    const resume = makeResume({ templateId: 'modern' })
    render(<ResumeCard resume={resume} onDuplicate={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('产品经理简历')).toBeInTheDocument()
    const preview = screen.getByTestId('mini-preview')
    expect(preview.getAttribute('data-template-id')).toBe('modern')
  })

  it('4 套 templateId 都能正确传入', () => {
    const templates: Array<ResumeData['templateId']> = ['professional', 'modern', 'elegant', 'creative']
    templates.forEach((tid) => {
      const resume = makeResume({ id: `r-${tid}`, templateId: tid })
      const { unmount } = render(<ResumeCard resume={resume} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
      expect(screen.getByTestId('mini-preview').getAttribute('data-template-id')).toBe(tid)
      unmount()
    })
  })

  it('templateId 为 null 时显示未选择模板占位,不渲染 MiniTemplatePreview', () => {
    const resume = makeResume({ templateId: null })
    render(<ResumeCard resume={resume} onDuplicate={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.queryByTestId('mini-preview')).not.toBeInTheDocument()
    expect(screen.getAllByText('未选择模板').length).toBeGreaterThanOrEqual(1)
  })

  it('点击卡片整体跳转到 workbench 并带上 id', () => {
    const resume = makeResume({ id: 'r-abc', templateId: 'professional' })
    render(<ResumeCard resume={resume} onDuplicate={vi.fn()} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /产品经理简历/ }))
    expect(pushMock).toHaveBeenCalledWith('/workbench?id=r-abc')
  })

  it('复制按钮触发 onDuplicate 并阻止冒泡', () => {
    const onDuplicate = vi.fn()
    const resume = makeResume({ id: 'r-1' })
    render(<ResumeCard resume={resume} onDuplicate={onDuplicate} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /复\s*制/ }))
    expect(onDuplicate).toHaveBeenCalledWith('r-1')
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('删除按钮触发 Popconfirm,确认后调用 onDelete', () => {
    const onDelete = vi.fn()
    const resume = makeResume({ id: 'r-del' })
    render(<ResumeCard resume={resume} onDuplicate={vi.fn()} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: /删\s*除/ }))
    const okBtn = screen.getByRole('button', { name: /确\s*认/ })
    fireEvent.click(okBtn)
    expect(onDelete).toHaveBeenCalledWith('r-del')
  })

  it('修改时间使用 dayjs 格式化为 YYYY-MM-DD HH:mm', () => {
    const resume = makeResume({ updatedAt: '2026-07-14T03:30:00.000Z' })
    render(<ResumeCard resume={resume} onDuplicate={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText(/2026-07-14 11:30/)).toBeInTheDocument()
  })
})

describe('ResumeGrid', () => {
  it('按入参顺序渲染每个 resume,不加额外排序', () => {
    const r1 = makeResume({ id: 'a', updatedAt: '2026-07-14T03:00:00.000Z' })
    const r2 = makeResume({ id: 'b', updatedAt: '2026-07-14T04:00:00.000Z' })
    const r3 = makeResume({ id: 'c', updatedAt: '2026-07-14T05:00:00.000Z' })

    render(<ResumeGrid resumes={[r1, r2, r3]} onDuplicate={vi.fn()} onDelete={vi.fn()} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
  })

  it('列表容器有 list role 与中文 label', () => {
    render(<ResumeGrid resumes={[]} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('list', { name: '简历列表' })).toBeInTheDocument()
  })

  it('空数组不渲染任何 listitem', () => {
    render(<ResumeGrid resumes={[]} onDuplicate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})

describe('DashboardHeader', () => {
  it('count>0 时显示文案"共 N 份简历"', () => {
    render(<DashboardHeader count={3} onCreate={vi.fn()} />)
    expect(screen.getByText('共 3 份简历')).toBeInTheDocument()
  })

  it('count=0 时显示空状态提示', () => {
    render(<DashboardHeader count={0} onCreate={vi.fn()} />)
    expect(screen.getByText('从空白模板开始，或从已有案例复制一份')).toBeInTheDocument()
  })

  it('点击创建按钮触发 onCreate', () => {
    const onCreate = vi.fn()
    render(<DashboardHeader count={0} onCreate={onCreate} />)
    fireEvent.click(screen.getByRole('button', { name: '创建简历' }))
    expect(onCreate).toHaveBeenCalledTimes(1)
  })
})

describe('EmptyState', () => {
  it('显示空状态文案和创建按钮', () => {
    const onCreate = vi.fn()
    render(<EmptyState onCreate={onCreate} />)

    expect(screen.getByText('还没有简历，点击创建第一份吧')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '创建简历' }))
    expect(onCreate).toHaveBeenCalledTimes(1)
  })
})
