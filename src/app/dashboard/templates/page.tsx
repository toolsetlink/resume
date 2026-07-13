'use client'

import { useEffect } from 'react'
import { Button, message } from 'antd'
import messages from '@/messages/zh.json'
import { TEMPLATE_REGISTRY } from '@/components/templates/registry'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { LandingHeader } from '@/components/home/LandingHeader'

const t = messages

export default function DashboardTemplatesPage() {
  const activeResume = useResumeStore(selectActiveResume)
  const setTemplateId = useResumeStore(s => s.setTemplateId)
  const initialize = useResumeStore(s => s.initialize)

  // 挂载时从 localStorage 恢复数据，只跑一次。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { initialize() }, [])

  const handleSelect = (templateId: string) => {
    if (!activeResume) return
    setTemplateId(activeResume.id, templateId)
    message.success(t.templates.switchSuccess)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-base))]">
      <LandingHeader />
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t.templates.selectTemplate}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATE_REGISTRY.map(entry => (
            <div key={entry.config.id} className={`rounded-xl border p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${activeResume?.templateId === entry.config.id ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand-light))]' : 'border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))]'}`} onClick={() => handleSelect(entry.config.id)}>
              <div className="h-40 rounded-lg mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${entry.config.colorScheme.primary}22, ${entry.config.colorScheme.background})` }}>
                <span className="text-4xl opacity-30">{entry.config.name.charAt(0)}</span>
              </div>
              <h3 className="font-semibold text-[hsl(var(--text-primary))]">{entry.config.name}</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{entry.config.description}</p>
              <div className="flex gap-1 mt-3">
                {[entry.config.colorScheme.primary, entry.config.colorScheme.secondary, entry.config.colorScheme.text].map((c, i) => <span key={i} className="w-5 h-5 rounded-full border border-[hsl(var(--border-default))]" style={{ backgroundColor: c }} />)}
              </div>
              {activeResume?.templateId === entry.config.id && <Button type="primary" size="small" className="mt-3 w-full">{t.templates.currentTemplate}</Button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}