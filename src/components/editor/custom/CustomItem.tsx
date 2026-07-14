'use client'

import { Input } from 'antd'
import type { CustomItem as CustomItemType } from '@/shared/types/resume'
import { ItemCard, Field, FieldRow } from '@/components/editor/ItemCard'
import { MonthRangePicker, splitDateRange, joinDateRange } from '@/components/editor/MonthRangePicker'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

interface CustomItemProps {
  item: CustomItemType
  sectionId: string
  onChange: (
    sectionId: string,
    itemId: string,
    data: Partial<CustomItemType>
  ) => void
  onDelete: (sectionId: string, itemId: string) => void
}

export function CustomItem({
  item,
  sectionId,
  onChange,
  onDelete,
}: CustomItemProps) {
  const { start, end } = splitDateRange(item.dateRange)

  const handleDateChange = (next: { start: string; end: string }) => {
    onChange(sectionId, item.id, { dateRange: joinDateRange(next.start, next.end) })
  }

  return (
    <ItemCard onDelete={() => onDelete(sectionId, item.id)} deleteLabel="删除条目">
      <FieldRow>
        <Field label="标题" required>
          <Input
            value={item.title}
            placeholder="请输入标题"
            onChange={(e) =>
              onChange(sectionId, item.id, { title: e.target.value })
            }
          />
        </Field>
        <Field label="副标题">
          <Input
            value={item.subtitle}
            placeholder="请输入副标题"
            onChange={(e) =>
              onChange(sectionId, item.id, { subtitle: e.target.value })
            }
          />
        </Field>
      </FieldRow>
      <Field label="时间">
        <MonthRangePicker start={start} end={end} onChange={handleDateChange} />
      </Field>
      <Field label="描述">
        <RichTextEditor
          value={item.description}
          placeholder="补充说明（可选）"
          minHeight={80}
          onChange={(html) =>
            onChange(sectionId, item.id, { description: html })
          }
        />
      </Field>
    </ItemCard>
  )
}
