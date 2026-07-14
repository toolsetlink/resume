'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil } from 'lucide-react'

interface ResumeTitleEditorProps {
  title: string
  onChange: (title: string) => void
  fallback?: string
  maxLength?: number
}

export function ResumeTitleEditor({
  title,
  onChange,
  fallback = '未命名简历',
  maxLength = 60,
}: ResumeTitleEditorProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const displayTitle = title.trim() || fallback

  const startEdit = () => {
    setDraft(title)
    setEditing(true)
  }

  const commit = () => {
    const trimmed = draft.trim().slice(0, maxLength)
    if (trimmed !== title) onChange(trimmed)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(title)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        maxLength={maxLength}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
          }
        }}
        aria-label="编辑简历名称"
        className="text-sm font-medium px-2 py-1 -mx-2 rounded bg-[hsl(var(--bg-base))] border border-[hsl(var(--brand))] outline-none min-w-[120px] max-w-[280px] text-[hsl(var(--text-primary))]"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-subtle))] px-2 py-1 -mx-2 rounded transition-colors max-w-[280px]"
      aria-label="编辑简历名称"
    >
      <span className="truncate">{displayTitle}</span>
      <Pencil className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  )
}