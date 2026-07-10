'use client'

import { useMemo } from 'react'
import { Modal, Button } from 'antd'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { MODULE_CONFIGS } from '@/shared/config/modules'

interface ModuleLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEnabled?: (sectionId: string) => void
}

export function ModuleLibraryDialog({ open, onOpenChange, onEnabled }: ModuleLibraryDialogProps) {
  const t = useTranslations()
  const activeResume = useResumeStore(selectActiveResume)
  const enableMenuSection = useResumeStore(s => s.enableMenuSection)

  const disabledModules = useMemo(() => {
    if (!activeResume) return []
    const enabledIds = new Set(activeResume.menuSections.filter(s => s.enabled).map(s => s.id))
    return MODULE_CONFIGS.filter(c => !enabledIds.has(c.id))
  }, [activeResume])

  const allEnabled = disabledModules.length === 0

  const handleEnable = (sectionId: string) => {
    if (!activeResume) return
    enableMenuSection(activeResume.id, sectionId)
    onEnabled?.(sectionId)
  }

  return (
    <Modal title={t('editor.moduleLibrary')} open={open} onCancel={() => onOpenChange(false)} footer={null} width={480}>
      {allEnabled ? (
        <p className="text-center text-[hsl(var(--text-secondary))] py-4">{t('editor.allEnabled')}</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {disabledModules.map(mod => (
            <div key={mod.id} className="flex items-center justify-between px-3 py-2 rounded border border-[hsl(var(--border-default))]">
              <div className="flex items-center gap-2">
                <span>{mod.icon}</span>
                <span className="text-sm font-medium">{mod.title.zh}</span>
              </div>
              <Button type="primary" size="small" onClick={() => handleEnable(mod.id)}>
                <Plus className="w-3 h-3 mr-1" />{t('editor.enable')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
