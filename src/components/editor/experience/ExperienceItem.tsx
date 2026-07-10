'use client'

import { Input } from 'antd'
import { Trash2 } from 'lucide-react'
import type { Experience } from '@/shared/types/resume'

interface ExperienceItemProps {
  item: Experience
  onChange: (id: string, data: Partial<Experience>) => void
  onDelete: (id: string) => void
}

export function ExperienceItem({ item, onChange, onDelete }: ExperienceItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-[hsl(var(--bg-elevated))]">
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={item.company}
          placeholder="公司名称"
          onChange={(e) => onChange(item.id, { company: e.target.value })}
        />
        <Input
          value={item.position}
          placeholder="职位"
          onChange={(e) => onChange(item.id, { position: e.target.value })}
        />
      </div>
      <Input
        value={item.date}
        placeholder="时间 (如 2020-2023)"
        onChange={(e) => onChange(item.id, { date: e.target.value })}
      />
      <Input.TextArea
        value={item.details}
        placeholder="工作详情"
        rows={4}
        onChange={(e) => onChange(item.id, { details: e.target.value })}
      />
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
          删除
        </button>
      </div>
    </div>
  )
}
