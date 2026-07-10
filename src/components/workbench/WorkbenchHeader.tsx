'use client'

import { Button, Tooltip } from 'antd'
import { PanelLeft, FileDown, LayoutTemplate, Palette, Settings } from 'lucide-react'

interface WorkbenchHeaderProps {
  resumeId: string
  isSaving: boolean
  lastSavedAt: Date | null
  isExporting: boolean
  onToggleSidebar: () => void
  onExportPdf: () => void
  onOpenTemplateSwitcher: () => void
  onOpenThemeColor: () => void
  onOpenGlobalSettings: () => void
}

export function WorkbenchHeader({ resumeId, isSaving, lastSavedAt, isExporting, onToggleSidebar, onExportPdf, onOpenTemplateSwitcher, onOpenThemeColor, onOpenGlobalSettings }: WorkbenchHeaderProps) {
  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))]">
      <div className="flex items-center gap-2">
        <Tooltip title="切换侧栏"><Button type="text" size="small" onClick={onToggleSidebar} icon={<PanelLeft className="w-4 h-4" />} /></Tooltip>
        <span className="text-sm font-medium text-[hsl(var(--text-primary))]">自由简历</span>
        {isSaving && <span className="text-xs text-[hsl(var(--text-tertiary))]">保存中...</span>}
        {lastSavedAt && !isSaving && <span className="text-xs text-[hsl(var(--text-tertiary))]">已保存 {lastSavedAt.toLocaleTimeString()}</span>}
      </div>
      <div className="flex items-center gap-1">
        <Tooltip title="模板"><Button type="text" size="small" onClick={onOpenTemplateSwitcher} icon={<LayoutTemplate className="w-4 h-4" />} /></Tooltip>
        <Tooltip title="主题色"><Button type="text" size="small" onClick={onOpenThemeColor} icon={<Palette className="w-4 h-4" />} /></Tooltip>
        <Tooltip title="全局设置"><Button type="text" size="small" onClick={onOpenGlobalSettings} icon={<Settings className="w-4 h-4" />} /></Tooltip>
        <Tooltip title="导出 PDF"><Button type="primary" size="small" loading={isExporting} onClick={onExportPdf} icon={<FileDown className="w-4 h-4" />}>导出</Button></Tooltip>
      </div>
    </header>
  )
}
