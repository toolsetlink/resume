'use client'

import { useState, useEffect } from 'react'
import { Drawer, message } from 'antd'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { ResumePreview } from '@/components/preview/ResumePreview'
import { SectionAccordion } from '@/components/editor/SectionAccordion'
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader'
import { TemplateSwitcher } from '@/components/workbench/TemplateSwitcher'
import { ThemeColorPopover } from '@/components/workbench/ThemeColorPopover'
import { GlobalSettingsPanel } from '@/components/workbench/GlobalSettingsPanel'
import { useAutoSave } from '@/hooks/useAutoSave'
import { usePdfExport } from '@/hooks/usePdfExport'

export default function WorkbenchPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations()
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const resumeId = resolvedParams?.id
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

  if (!resumeId) return <div className="min-h-screen flex items-center justify-center"><p>{t('common.loading')}</p></div>

  return (
    <div className="workbench-page h-screen flex flex-col overflow-hidden bg-[hsl(var(--bg-base))]">
      <WorkbenchHeader
        resumeId={resumeId}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        isExporting={isExporting}
        onToggleSidebar={() => setSidebarVisible(v => !v)}
        onExportPdf={handleExportPdf}
        onOpenTemplateSwitcher={() => setTemplateSwitcherVisible(true)}
        onOpenThemeColor={() => setThemeColorVisible(true)}
        onOpenGlobalSettings={() => setGlobalSettingsVisible(true)}
      />
      <div className="flex-1 overflow-hidden">
        <Allotment>
          <Allotment.Pane preferredSize={sidebarVisible ? '40%' : '0%'} minSize={sidebarVisible ? 20 : 0} maxSize={60}>
            <div className="h-full overflow-y-auto bg-[hsl(var(--bg-card))]">
              <SectionAccordion />
            </div>
          </Allotment.Pane>
          <Allotment.Pane>
            <div className="h-full overflow-auto bg-[hsl(var(--bg-canvas))] p-6">
              {activeResume ? (
                <div id="resume-preview" className="mx-auto bg-white shadow-lg" style={{ width: 794, minHeight: 1123 }}>
                  <ResumePreview resumeData={activeResume} />
                </div>
              ) : (
                <div className="mx-auto bg-white shadow-lg flex items-center justify-center text-[hsl(var(--text-tertiary))]" style={{ width: 794, minHeight: 1123 }}>
                  {t('common.loading')}
                </div>
              )}
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>

      <TemplateSwitcher open={templateSwitcherVisible} onOpenChange={setTemplateSwitcherVisible} />
      <ThemeColorPopover open={themeColorVisible} onOpenChange={setThemeColorVisible} />
      <Drawer title="全局设置" open={globalSettingsVisible} onClose={() => setGlobalSettingsVisible(false)} width={400}>
        {globalSettingsVisible && <GlobalSettingsPanel resumeId={resumeId} />}
      </Drawer>
    </div>
  )
}
