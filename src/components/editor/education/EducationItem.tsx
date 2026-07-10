'use client'

import { Input } from 'antd'
import { Trash2 } from 'lucide-react'
import type { Education } from '@/shared/types/resume'

interface EducationItemProps {
  item: Education
  onChange: (id: string, data: Partial<Education>) => void
  onDelete: (id: string) => void
}

export function EducationItem({ item, onChange, onDelete }: EducationItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-[hsl(var(--bg-elevated))]">
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={item.school}
          placeholder="学校名称"
          onChange={(e) => onChange(item.id, { school: e.target.value })}
        />
        <Input
          value={item.major}
          placeholder="专业"
          onChange={(e) => onChange(item.id, { major: e.target.value })}
        />
      </div>
      <Input
        value={item.degree}
        placeholder="学位 (如 本科、硕士)"
        onChange={(e) => onChange(item.id, { degree: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={item.startDate}
          placeholder="开始日期 (如 2019-09)"
          onChange={(e) => onChange(item.id, { startDate: e.target.value })}
        />
        <Input
          value={item.endDate}
          placeholder="结束日期 (如 2023-06)"
          onChange={(e) => onChange(item.id, { endDate: e.target.value })}
        />
      </div>
      <Input
        value={item.gpa}
        placeholder="GPA (可选)"
        onChange={(e) => onChange(item.id, { gpa: e.target.value })}
      />
      <Input.TextArea
        value={item.description}
        placeholder="描述 (可选)"
        rows={3}
        onChange={(e) => onChange(item.id, { description: e.target.value })}
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
