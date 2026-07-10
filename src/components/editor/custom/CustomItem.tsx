'use client'

import { Input } from 'antd'
import { Trash2 } from 'lucide-react'
import type { CustomItem as CustomItemType } from '@/shared/types/resume'

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
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-[hsl(var(--bg-elevated))]">
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={item.title}
          placeholder="标题"
          onChange={(e) =>
            onChange(sectionId, item.id, { title: e.target.value })
          }
        />
        <Input
          value={item.subtitle}
          placeholder="副标题"
          onChange={(e) =>
            onChange(sectionId, item.id, { subtitle: e.target.value })
          }
        />
      </div>
      <Input
        value={item.dateRange}
        placeholder="时间范围 (如 2020-2023)"
        onChange={(e) =>
          onChange(sectionId, item.id, { dateRange: e.target.value })
        }
      />
      <Input.TextArea
        value={item.description}
        placeholder="描述"
        rows={4}
        onChange={(e) =>
          onChange(sectionId, item.id, { description: e.target.value })
        }
      />
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
          onClick={() => onDelete(sectionId, item.id)}
        >
          <Trash2 className="w-4 h-4" />
          删除
        </button>
      </div>
    </div>
  )
}
