'use client'

import { Input } from 'antd'
import type { Education } from '@/shared/types/resume'
import { ItemCard, Field, FieldRow } from '@/components/editor/ItemCard'
import { MonthRangePicker } from '@/components/editor/MonthRangePicker'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

interface EducationItemProps {
  item: Education
  onChange: (id: string, data: Partial<Education>) => void
  onDelete: (id: string) => void
}

export function EducationItem({ item, onChange, onDelete }: EducationItemProps) {
  const handleDateChange = (next: { start: string; end: string }) => {
    onChange(item.id, { startDate: next.start, endDate: next.end })
  }

  return (
    <ItemCard onDelete={() => onDelete(item.id)} deleteLabel="删除教育经历">
      <FieldRow>
        <Field label="学校" required>
          <Input
            value={item.school}
            placeholder="请输入学校名称"
            onChange={(e) => onChange(item.id, { school: e.target.value })}
          />
        </Field>
        <Field label="专业" required>
          <Input
            value={item.major}
            placeholder="请输入专业"
            onChange={(e) => onChange(item.id, { major: e.target.value })}
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="学位">
          <Input
            value={item.degree}
            placeholder="如 本科、硕士"
            onChange={(e) => onChange(item.id, { degree: e.target.value })}
          />
        </Field>
        <Field label="GPA">
          <Input
            value={item.gpa ?? ''}
            placeholder="如 3.8/4.0 (可选)"
            onChange={(e) => onChange(item.id, { gpa: e.target.value })}
          />
        </Field>
      </FieldRow>
      <Field label="时间">
        <MonthRangePicker
          start={item.startDate}
          end={item.endDate}
          onChange={handleDateChange}
        />
      </Field>
      <Field label="描述">
        <RichTextEditor
          value={item.description ?? ''}
          placeholder="描述主修课程、研究方向、成绩亮点等（可选）"
          minHeight={80}
          onChange={(html) => onChange(item.id, { description: html })}
        />
      </Field>
    </ItemCard>
  )
}
