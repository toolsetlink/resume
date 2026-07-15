'use client'

import { useState, useEffect } from 'react'
import { Drawer, ColorPicker } from 'antd'
import messages from '@/messages/zh.json'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'

const THEME_COLORS = [
  '#1f2937', '#0f172a', '#1e293b',
  '#7c3aed', '#db2777', '#dc2626',
  '#ea580c', '#ca8a04', '#16a34a',
  '#0891b2', '#2563eb', '#4f46e5',
]

interface ThemeColorDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThemeColorDrawer({ open, onOpenChange }: ThemeColorDrawerProps) {
  const t = messages
  const activeResume = useResumeStore(selectActiveResume)
  const updateGlobalSettings = useResumeStore(s => s.updateGlobalSettings)
  const currentColor = activeResume?.globalSettings?.themeColor

  // antd ColorPicker 在 SSR 时会注入 <script> 标签，触发 React 19 hydration 警告；
  // 仅在 client mount 后再渲染。React 19 禁止 effect 内同步 setState，defer 到 microtask。
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    Promise.resolve().then(() => setMounted(true))
  }, [])

  const handleChange = (color: string) => {
    if (!activeResume) return
    updateGlobalSettings(activeResume.id, { themeColor: color })
  }

  return (
    <Drawer
      title={t.settings.themeColor}
      open={open}
      onClose={() => onOpenChange(false)}
      size={480}
    >
      <div className="space-y-6">
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          主题色将应用于简历标题、姓名、章节标题等关键位置。
        </p>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[hsl(var(--text-primary))]">预设主题色</h4>
          <div className="grid grid-cols-4 gap-3">
            {THEME_COLORS.map(c => {
              const isActive = currentColor === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleChange(c)}
                  className="flex flex-col items-center gap-2 p-2 rounded-lg border border-transparent hover:border-[hsl(var(--border-default))] transition-colors"
                >
                  <span
                    className={`w-10 h-10 rounded-lg transition-all ${
                      isActive
                        ? 'ring-2 ring-offset-2 ring-[hsl(var(--brand))] scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                  <span className="text-xs font-mono text-[hsl(var(--text-tertiary))]">{c}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[hsl(var(--border-default))]">
          <h4 className="text-sm font-medium text-[hsl(var(--text-primary))]">自定义颜色</h4>
          {mounted && (
            <ColorPicker
              value={currentColor || '#1f2937'}
              onChange={(_, hex) => handleChange(hex)}
              showText
            />
          )}
        </div>
      </div>
    </Drawer>
  )
}
