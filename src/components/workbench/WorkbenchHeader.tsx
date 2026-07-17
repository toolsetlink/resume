'use client'

import { Button, Tooltip } from 'antd'
import { ArrowLeft, PanelLeft, FileDown, LayoutTemplate, Palette, SlidersHorizontal } from 'lucide-react'
import { ResumeTitleEditor } from './ResumeTitleEditor'

interface WorkbenchHeaderProps {
  isSaving: boolean
  lastSavedAt: Date | null
  saveError: string | null
  isExporting: boolean
  resumeTitle?: string
  onTitleChange?: (title: string) => void
  onBack: () => void
  onToggleSidebar: () => void
  onExportPdf: () => void
  onOpenTemplateSwitcher: () => void
  onOpenThemeColor: () => void
  onOpenGlobalSettings: () => void
}

// 顶栏右侧的「文字+图标」分组按钮：让模板/主题色/排版不再藏在纯图标后面。
// 行为：通过 onClick 触发原有 onOpenXxx，弹 Drawer/Popover 的逻辑完全不变。
function HeaderAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof LayoutTemplate
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-card))] hover:text-[hsl(var(--text-primary))] transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

export function WorkbenchHeader({ isSaving, lastSavedAt, saveError, isExporting, resumeTitle, onTitleChange, onBack, onToggleSidebar, onExportPdf, onOpenTemplateSwitcher, onOpenThemeColor, onOpenGlobalSettings }: WorkbenchHeaderProps) {
  return (
    <header className="no-print flex items-center justify-between h-14 px-3 sm:px-4 border-b border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))]">
      <div className="flex items-center gap-2 min-w-0">
        <Tooltip title="返回简历列表">
          <Button type="text" size="small" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />} aria-label="返回简历列表" />
        </Tooltip>
        <div className="w-px h-5 bg-[hsl(var(--border-default))]" />
        <Tooltip title="切换侧栏">
          <Button type="text" size="small" onClick={onToggleSidebar} icon={<PanelLeft className="w-4 h-4" />} aria-label="切换侧栏" />
        </Tooltip>
        <span className="text-sm font-semibold text-[hsl(var(--text-primary))] shrink-0 hidden sm:inline">自由简历</span>
        {resumeTitle !== undefined && onTitleChange && (
          <>
            <span className="text-xs text-[hsl(var(--text-tertiary))] shrink-0 hidden sm:inline">·</span>
            <ResumeTitleEditor title={resumeTitle} onChange={onTitleChange} />
          </>
        )}
        <div className="flex items-center gap-1.5 ml-1">
          {isSaving && (
            <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--text-tertiary))]">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--warning))] animate-pulse" />
              保存中
            </span>
          )}
          {lastSavedAt && !isSaving && (
            <span className="text-xs text-[hsl(var(--text-tertiary))] hidden md:inline">
              已保存 {lastSavedAt.toLocaleTimeString()}
            </span>
          )}
          {saveError && !isSaving && (
            <span className="text-xs text-[hsl(var(--danger))]" role="status" title={saveError}>保存失败</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center p-0.5 rounded-lg bg-[hsl(var(--bg-subtle))]">
          <HeaderAction icon={LayoutTemplate} label="模板" onClick={onOpenTemplateSwitcher} />
          <HeaderAction icon={Palette} label="主题色" onClick={onOpenThemeColor} />
          <HeaderAction icon={SlidersHorizontal} label="排版" onClick={onOpenGlobalSettings} />
        </div>
        <Button
          type="primary"
          size="small"
          loading={isExporting}
          onClick={onExportPdf}
          icon={<FileDown className="w-4 h-4" />}
          className="ml-1"
        >
          导出 PDF
        </Button>
      </div>
    </header>
  )
}
