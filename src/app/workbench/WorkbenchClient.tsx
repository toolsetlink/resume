'use client'

import { useState, useEffect } from 'react'
import { Drawer, message } from 'antd'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { useRouter, useSearchParams } from 'next/navigation'
import messages from '@/messages/zh.json'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { PaginatedResumePreview } from '@/components/preview/PaginatedResumePreview'
import { SectionAccordion } from '@/components/editor/SectionAccordion'
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader'
import { TemplateSwitcher } from '@/components/workbench/TemplateSwitcher'
import { ThemeColorPopover } from '@/components/workbench/ThemeColorPopover'
import { GlobalSettingsPanel } from '@/components/workbench/GlobalSettingsPanel'
import { useAutoSave } from '@/hooks/useAutoSave'
import { usePdfExport } from '@/hooks/usePdfExport'

const t = messages

export default function WorkbenchClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resumeId = searchParams.get('id') ?? ''

  const activeResume = useResumeStore(selectActiveResume)
  const initialize = useResumeStore(s => s.initialize)
  const setActiveResume = useResumeStore(s => s.setActiveResume)

  const { isSaving, lastSavedAt } = useAutoSave()
  const { isExporting, exportToPdf } = usePdfExport()

  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [templateSwitcherVisible, setTemplateSwitcherVisible] = useState(false)
  const [themeColorVisible, setThemeColorVisible] = useState(false)
  const [globalSettingsVisible, setGlobalSettingsVisible] = useState(false)

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (resumeId) {
      setActiveResume(resumeId)
      const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)
      if (!resume) router.replace('/dashboard')
    }
  }, [resumeId])

  const handleExportPdf = async () => {
    try { await exportToPdf(); message.success('PDF 导出成功') }
    catch (e: any) { message.error(`导出失败: ${e.message}`) }
  }

  if (!resumeId) return <div className="min-h-screen flex items-center justify-center"><p>{t.common.loading}</p></div>

  return (
    <div className="workbench-page h-screen flex flex-col overflow-hidden bg-[hsl(var(--bg-base))]">
      <WorkbenchHeader
        resumeId={resumeId}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        isExporting={isExporting}
        onBack={() => router.push('/dashboard')}
        onToggleSidebar={() => setSidebarVisible(v => !v)}
        onExportPdf={handleExportPdf}
        onOpenTemplateSwitcher={() => setTemplateSwitcherVisible(true)}
        onOpenThemeColor={() => setThemeColorVisible(true)}
        onOpenGlobalSettings={() => setGlobalSettingsVisible(true)}
      />
      <div className="flex-1 overflow-hidden">
        <Allotment>
          <Allotment.Pane preferredSize="40%" minSize={280} maxSize={560} visible={sidebarVisible}>
            <div className="h-full overflow-y-auto bg-[hsl(var(--bg-card))]">
              <SectionAccordion />
            </div>
          </Allotment.Pane>
          <Allotment.Pane>
            <div className="h-full overflow-auto bg-[hsl(var(--bg-canvas))] px-6 pt-6 pb-12">
              {activeResume ? (
                <PaginatedResumePreview resumeData={activeResume} />
              ) : (
                <div className="mx-auto bg-white shadow-lg flex items-center justify-center text-[hsl(var(--text-tertiary))]" style={{ width: 794, minHeight: 1123 }}>
                  {t.common.loading}
                </div>
              )}
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>

      <TemplateSwitcher open={templateSwitcherVisible} onOpenChange={setTemplateSwitcherVisible} />
      <ThemeColorPopover open={themeColorVisible} onOpenChange={setThemeColorVisible} />
      <Drawer title="全局设置" open={globalSettingsVisible} onClose={() => setGlobalSettingsVisible(false)} size={400}>
        {globalSettingsVisible && <GlobalSettingsPanel resumeId={resumeId} />}
      </Drawer>
    </div>
  )
}