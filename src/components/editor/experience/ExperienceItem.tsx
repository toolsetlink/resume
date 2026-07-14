'use client'

import { Input } from 'antd'
import type { Experience } from '@/shared/types/resume'
import { ItemCard, Field, FieldRow } from '@/components/editor/ItemCard'
import { MonthRangePicker, splitDateRange, joinDateRange } from '@/components/editor/MonthRangePicker'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

interface ExperienceItemProps {
  item: Experience
  onChange: (id: string, data: Partial<Experience>) => void
  onDelete: (id: string) => void
}

export function ExperienceItem({ item, onChange, onDelete }: ExperienceItemProps) {
  const { start, end } = splitDateRange(item.date)

  const handleDateChange = (next: { start: string; end: string }) => {
    onChange(item.id, { date: joinDateRange(next.start, next.end) })
  }

  return (
    <ItemCard onDelete={() => onDelete(item.id)} deleteLabel="删除工作经历">
      <FieldRow>
        <Field label="公司名称" required>
          <Input
            value={item.company}
            placeholder="请输入公司名称"
            onChange={(e) => onChange(item.id, { company: e.target.value })}
          />
        </Field>
        <Field label="职位" required>
          <Input
            value={item.position}
            placeholder="请输入职位"
            onChange={(e) => onChange(item.id, { position: e.target.value })}
          />
        </Field>
      </FieldRow>
      <Field label="时间">
        <MonthRangePicker start={start} end={end} onChange={handleDateChange} />
      </Field>
      <Field label="工作详情">
        <RichTextEditor
          value={item.details}
          placeholder="描述你的工作内容、成就与影响（支持要点列表、加粗等）"
          minHeight={100}
          onChange={(html) => onChange(item.id, { details: html })}
        />
      </Field>
    </ItemCard>
  )
}
