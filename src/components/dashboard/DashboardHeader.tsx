'use client'

import { Button } from 'antd'
import { Plus } from 'lucide-react'
import messages from '@/messages/zh.json'

const t = messages

interface DashboardHeaderProps {
  count: number
  onCreate: () => void
}

export function DashboardHeader({ count, onCreate }: DashboardHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-8 gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
          {t.nav.dashboard}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--text-tertiary))]">
          {count > 0 ? t.resume.count.replace('{count}', String(count)) : t.resume.emptyHint}
        </p>
      </div>
      <Button type="primary" onClick={onCreate}>
        <Plus className="w-4 h-4 mr-1" />
        {t.resume.create}
      </Button>
    </div>
  )
}
