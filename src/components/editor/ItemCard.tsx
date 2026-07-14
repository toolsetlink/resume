'use client'

import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

interface ItemCardProps {
  onDelete: () => void
  deleteLabel?: string
  children: ReactNode
}

// 统一的条目卡片外观：边框+圆角+柔色背景+右上角删除按钮。
// 替代 4 个 Item 组件中重复的 div+button 模式。
export function ItemCard({ onDelete, deleteLabel = '删除条目', children }: ItemCardProps) {
  return (
    <div className="group relative rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] p-4 space-y-3 transition-colors hover:border-[hsl(var(--border-hover))]">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          aria-label={deleteLabel}
          title={deleteLabel}
          onClick={onDelete}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--danger))] hover:bg-[hsl(var(--bg-subtle))] transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="pr-9 space-y-3">{children}</div>
    </div>
  )
}

interface FieldProps {
  label?: string
  required?: boolean
  children: ReactNode
  className?: string
}

// 字段行：统一 label 字号/颜色/spacing，避免每个 Item 重复写类名。
export function Field({ label, required, children, className = '' }: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-[hsl(var(--text-secondary))]">
          {required && <span className="text-[hsl(var(--danger))] mr-0.5">*</span>}
          {label}
        </label>
      )}
      <div>{children}</div>
    </div>
  )
}

export function FieldRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>{children}</div>
}
