'use client'

import { Popover, ColorPicker } from 'antd'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'

const THEME_COLORS = ['#1f2937', '#0f172a', '#1e293b', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#4f46e5']

interface ThemeColorPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThemeColorPopover({ open, onOpenChange }: ThemeColorPopoverProps) {
  const activeResume = useResumeStore(selectActiveResume)
  const updateGlobalSettings = useResumeStore(s => s.updateGlobalSettings)

  const handleChange = (color: string) => {
    if (!activeResume) return
    updateGlobalSettings(activeResume.id, { themeColor: color })
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange} trigger="click" content={
      <div className="p-2 w-56">
        <div className="grid grid-cols-4 gap-2">
          {THEME_COLORS.map(c => (
            <button key={c} className="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: c, borderColor: activeResume?.globalSettings?.themeColor === c ? 'hsl(var(--brand))' : 'transparent' }} onClick={() => handleChange(c)} />
          ))}
        </div>
        <div className="mt-3 pt-3 border-t">
          <ColorPicker value={activeResume?.globalSettings?.themeColor || '#1f2937'} onChange={(_, hex) => handleChange(hex)} />
        </div>
      </div>
    }>
      <div />
    </Popover>
  )
}
