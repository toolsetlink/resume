'use client'

import { Input } from 'antd'
import type { Project } from '@/shared/types/resume'
import { ItemCard, Field, FieldRow } from '@/components/editor/ItemCard'
import { MonthRangePicker, splitDateRange, joinDateRange } from '@/components/editor/MonthRangePicker'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

interface ProjectItemProps {
  item: Project
  onChange: (id: string, data: Partial<Project>) => void
  onDelete: (id: string) => void
}

export function ProjectItem({ item, onChange, onDelete }: ProjectItemProps) {
  const { start, end } = splitDateRange(item.date)

  const handleDateChange = (next: { start: string; end: string }) => {
    onChange(item.id, { date: joinDateRange(next.start, next.end) })
  }

  return (
    <ItemCard onDelete={() => onDelete(item.id)} deleteLabel="删除项目">
      <FieldRow>
        <Field label="项目名称" required>
          <Input
            value={item.name}
            placeholder="请输入项目名称"
            onChange={(e) => onChange(item.id, { name: e.target.value })}
          />
        </Field>
        <Field label="担任角色">
          <Input
            value={item.role}
            placeholder="如 后端开发"
            onChange={(e) => onChange(item.id, { role: e.target.value })}
          />
        </Field>
      </FieldRow>
      <Field label="时间">
        <MonthRangePicker start={start} end={end} onChange={handleDateChange} />
      </Field>
      <FieldRow>
        <Field label="项目链接">
          <Input
            value={item.link ?? ''}
            placeholder="如 https://... (可选)"
            onChange={(e) => onChange(item.id, { link: e.target.value })}
          />
        </Field>
        <Field label="链接标签">
          <Input
            value={item.linkLabel ?? ''}
            placeholder="如 在线预览 (可选)"
            onChange={(e) => onChange(item.id, { linkLabel: e.target.value })}
          />
        </Field>
      </FieldRow>
      <Field label="项目描述">
        <RichTextEditor
          value={item.description}
          placeholder="说明项目目标、你的贡献、技术栈与成果（支持要点列表）"
          minHeight={100}
          onChange={(html) => onChange(item.id, { description: html })}
        />
      </Field>
    </ItemCard>
  )
}
