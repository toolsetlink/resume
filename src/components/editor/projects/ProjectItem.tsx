'use client'

import { Input } from 'antd'
import { Trash2 } from 'lucide-react'
import type { Project } from '@/shared/types/resume'

interface ProjectItemProps {
  item: Project
  onChange: (id: string, data: Partial<Project>) => void
  onDelete: (id: string) => void
}

export function ProjectItem({ item, onChange, onDelete }: ProjectItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-[hsl(var(--bg-elevated))]">
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={item.name}
          placeholder="项目名称"
          onChange={(e) => onChange(item.id, { name: e.target.value })}
        />
        <Input
          value={item.role}
          placeholder="担任角色"
          onChange={(e) => onChange(item.id, { role: e.target.value })}
        />
      </div>
      <Input
        value={item.date}
        placeholder="时间 (如 2020.06 - 2023.12)"
        onChange={(e) => onChange(item.id, { date: e.target.value })}
      />
      <Input.TextArea
        value={item.description}
        placeholder="项目描述"
        rows={4}
        onChange={(e) => onChange(item.id, { description: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={item.link}
          placeholder="项目链接 (可选)"
          onChange={(e) => onChange(item.id, { link: e.target.value })}
        />
        <Input
          value={item.linkLabel}
          placeholder="链接标签 (可选)"
          onChange={(e) => onChange(item.id, { linkLabel: e.target.value })}
        />
      </div>
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
