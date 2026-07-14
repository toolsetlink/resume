'use client'

import { Button } from 'antd'
import { FileText, Plus } from 'lucide-react'
import messages from '@/messages/zh.json'

const t = messages

interface EmptyStateProps {
  onCreate: () => void
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-20 px-6 bg-[hsl(var(--bg-card))] border border-dashed border-[hsl(var(--border-default))] rounded-2xl"
    >
      <FileText className="w-12 h-12 mb-4 text-[hsl(var(--text-tertiary))]" />
      <p className="text-[hsl(var(--text-secondary))] mb-6">{t.resume.empty}</p>
      <Button type="primary" size="large" onClick={onCreate}>
        <Plus className="w-4 h-4 mr-1" />
        {t.resume.create}
      </Button>
    </div>
  )
}
