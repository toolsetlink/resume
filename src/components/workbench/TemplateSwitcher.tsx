'use client'

import { Drawer } from 'antd'
import { useTranslations } from 'next-intl'
import { TEMPLATE_REGISTRY } from '@/components/templates/registry'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'

interface TemplateSwitcherProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateSwitcher({ open, onOpenChange }: TemplateSwitcherProps) {
  const t = useTranslations()
  const activeResume = useResumeStore(selectActiveResume)
  const setTemplateId = useResumeStore(s => s.setTemplateId)

  const handleSelect = (id: string) => {
    if (!activeResume) return
    setTemplateId(activeResume.id, id)
    onOpenChange(false)
  }

  return (
    <Drawer title={t('templates.selectTemplate')} open={open} onClose={() => onOpenChange(false)} width={480}>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATE_REGISTRY.map(entry => (
          <div key={entry.config.id} className={`rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${activeResume?.templateId === entry.config.id ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand-light))]' : 'border-[hsl(var(--border-default))]'}`} onClick={() => handleSelect(entry.config.id)}>
            <div className="h-28 rounded mb-2 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${entry.config.colorScheme.primary}15, ${entry.config.colorScheme.background})` }}>
              <span className="text-2xl opacity-30">{entry.config.name.charAt(0)}</span>
            </div>
            <div className="font-medium text-sm">{entry.config.name}</div>
            <div className="text-xs text-[hsl(var(--text-secondary))]">{entry.config.description}</div>
            {activeResume?.templateId === entry.config.id && <div className="text-xs text-[hsl(var(--brand))] mt-1">{t('templates.currentTemplate')}</div>}
          </div>
        ))}
      </div>
    </Drawer>
  )
}
