'use client'

import { useRouter } from 'next/navigation'
import { Popconfirm } from 'antd'
import { Pencil, Copy, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import type { ResumeData } from '@/shared/types/resume'
import { getTemplateConfig } from '@/components/templates/registry'
import { MiniTemplatePreview } from '@/components/workbench/MiniTemplatePreview'
import messages from '@/messages/zh.json'

const t = messages

interface ResumeCardProps {
  resume: ResumeData
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function ResumeCard({ resume, onDuplicate, onDelete }: ResumeCardProps) {
  const router = useRouter()
  const template = getTemplateConfig(resume.templateId ?? '')
  const templateName = template?.name ?? t.templates.unset
  const updatedLabel = dayjs(resume.updatedAt).format('YYYY-MM-DD HH:mm')

  const goEdit = () => {
    router.push(`/workbench?id=${resume.id}`)
  }

  const handlePreviewKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      goEdit()
    }
  }

  return (
    <article className="group relative flex flex-col bg-[hsl(var(--bg-card))] border border-[hsl(var(--border-default))] rounded-2xl p-4 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-md hover:border-[hsl(var(--brand))]">
      <div role="button" tabIndex={0} onClick={goEdit} onKeyDown={handlePreviewKeyDown} aria-label={`${resume.title} - ${t.common.edit}`} className="rounded-xl overflow-hidden ring-1 ring-black/5 bg-[hsl(var(--bg-base))] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2">
        {resume.templateId ? (
          <MiniTemplatePreview
            templateId={resume.templateId}
            sampleData={resume}
            cropRatio={0.5}
            ariaHidden
          />
        ) : (
          <div
            className="flex items-center justify-center text-xs text-[hsl(var(--text-tertiary))]"
            style={{ aspectRatio: '1.414 / 1' }}
          >
            {t.templates.unset}
          </div>
        )}
      </div>

      <div className="mt-4 flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-[hsl(var(--text-primary))] truncate">
          {resume.title}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-[hsl(var(--text-tertiary))]">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[hsl(var(--brand-light))] text-[hsl(var(--brand))] truncate max-w-[60%]">
            {templateName}
          </span>
          <span className="shrink-0 tabular-nums">{updatedLabel}</span>
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-end gap-1 min-h-7 opacity-100 translate-y-0 transition-all duration-150 ease-out"
      >
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--brand))] transition-colors"
          onClick={goEdit}
        >
          <Pencil className="w-3.5 h-3.5" />
          {t.common.edit}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--brand))] transition-colors"
          onClick={() => onDuplicate(resume.id)}
        >
          <Copy className="w-3.5 h-3.5" />
          {t.common.duplicate}
        </button>
        <Popconfirm
          title={t.resume.deleteConfirmTitle}
          description={t.resume.deleteConfirmDescription}
          onConfirm={() => {
            onDelete(resume.id)
          }}
          okText={t.common.confirm}
          cancelText={t.common.cancel}
          okButtonProps={{ danger: true }}
        >
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--danger))] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.common.delete}
          </button>
        </Popconfirm>
      </div>
    </article>
  )
}
