'use client'

import { Slider, Switch, Select } from 'antd'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import type { GlobalSettings } from '@/shared/types/resume'

export function GlobalSettingsPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const updateGlobalSettings = useResumeStore(s => s.updateGlobalSettings)
  const gs = activeResume?.globalSettings
  if (!gs) return null

  // 用 keyof GlobalSettings 收窄 key/value 类型，避免 any 漏类型。
  const update = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    if (!activeResume) return
    updateGlobalSettings(activeResume.id, { [key]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">基础字号 ({gs.baseFontSize}px)</label>
        <Slider min={12} max={24} step={1} value={gs.baseFontSize} onChange={v => update('baseFontSize', v)} />
      </div>
      <div>
        <label className="text-sm font-medium">页面边距 ({gs.pagePadding}px)</label>
        <Slider min={16} max={64} step={4} value={gs.pagePadding} onChange={v => update('pagePadding', v)} />
      </div>
      <div>
        <label className="text-sm font-medium">标题字号 ({gs.headerSize}px)</label>
        <Slider min={14} max={36} step={1} value={gs.headerSize} onChange={v => update('headerSize', v)} />
      </div>
      <div>
        <label className="text-sm font-medium">副标题字号 ({gs.subheaderSize}px)</label>
        <Slider min={12} max={28} step={1} value={gs.subheaderSize} onChange={v => update('subheaderSize', v)} />
      </div>
      <div>
        <label className="text-sm font-medium">段落间距 ({gs.paragraphSpacing}px)</label>
        <Slider min={4} max={24} step={2} value={gs.paragraphSpacing} onChange={v => update('paragraphSpacing', v)} />
      </div>
      <div>
        <label className="text-sm font-medium">模块间距 ({gs.sectionSpacing}px)</label>
        <Slider min={4} max={32} step={2} value={gs.sectionSpacing} onChange={v => update('sectionSpacing', v)} />
      </div>
      <div>
        <label className="text-sm font-medium">行高 ({gs.lineHeight})</label>
        <Slider min={1.2} max={2.4} step={0.1} value={gs.lineHeight} onChange={v => update('lineHeight', v)} />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">图标模式</label>
        <Switch checked={gs.useIconMode} onChange={v => update('useIconMode', v)} />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">副标题居中</label>
        <Switch checked={gs.centerSubtitle} onChange={v => update('centerSubtitle', v)} />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">自适应一页</label>
        <Switch checked={gs.autoOnePage} onChange={v => update('autoOnePage', v)} />
      </div>
      <div>
        <label className="text-sm font-medium">字形</label>
        <Select value={gs.fontFamily || 'sans'} onChange={v => update('fontFamily', v)} style={{ width: '100%' }} options={[{value:'sans',label:'无衬线'},{value:'serif',label:'衬线'}]} />
      </div>
    </div>
  )
}
