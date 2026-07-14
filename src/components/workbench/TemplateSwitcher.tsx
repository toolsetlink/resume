'use client'

import { Drawer } from 'antd'
import messages from '@/messages/zh.json'
import { TEMPLATE_REGISTRY } from '@/components/templates/registry'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { MiniTemplatePreview } from './MiniTemplatePreview'

interface TemplateSwitcherProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateSwitcher({ open, onOpenChange }: TemplateSwitcherProps) {
  const t = messages
  const activeResume = useResumeStore(selectActiveResume)
  const setTemplateId = useResumeStore(s => s.setTemplateId)

  const handleSelect = (id: string) => {
    if (!activeResume) return
    setTemplateId(activeResume.id, id)
    onOpenChange(false)
  }

  const sampleData = activeResume

  return (
    <Drawer title={t.templates.selectTemplate} open={open} onClose={() => onOpenChange(false)} size={560}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TEMPLATE_REGISTRY.map(entry => {
          const { config } = entry
          const isCurrent = activeResume?.templateId === config.id
          return (
            <div
              key={config.id}
              className={`rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${isCurrent ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand-light))]' : 'border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))]'}`}
              onClick={() => handleSelect(config.id)}
            >
              {sampleData ? (
                <MiniTemplatePreview
                  templateId={config.id}
                  sampleData={sampleData}
                  width={240}
                  visibleHeight={340}
                />
              ) : (
                <div className="h-[340px] flex items-center justify-center text-[hsl(var(--text-tertiary))]">
                  {t.common.loading}
                </div>
              )}
              <div className="p-3 space-y-1">
                <div className="font-medium text-sm text-[hsl(var(--text-primary))]">{config.name}</div>
                <div className="text-xs text-[hsl(var(--text-secondary))] line-clamp-2">{config.description}</div>
                {isCurrent && <div className="text-xs text-[hsl(var(--brand))] mt-1">{t.templates.currentTemplate}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </Drawer>
  )
}
