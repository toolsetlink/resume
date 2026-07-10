'use client'

import { useMemo } from 'react'
import type { BasicInfo, GlobalSettings } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { getBorderRadiusValue } from '@/shared/types/resume'

interface BaseInfoProps {
  basic: BasicInfo
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}

export function BaseInfo({ basic, globalSettings, template }: BaseInfoProps) {
  const layout = basic.layout || template.basic.layout || 'left'

  const layoutClass = useMemo(() => {
    switch (layout) {
      case 'center': return 'flex-col items-center text-center'
      case 'right': return 'flex-row-reverse text-right'
      default: return ''
    }
  }, [layout])

  const showPhoto = basic.photoConfig?.visible !== false && !!basic.photo

  const themeColor = globalSettings?.themeColor || template.colorScheme.primary
  const baseFontSize = globalSettings?.baseFontSize || 16
  const headerSize = globalSettings?.headerSize || 20
  const useIconMode = globalSettings?.useIconMode ?? true

  const photoWrapperStyle = useMemo(() => {
    const cfg = basic.photoConfig
    if (!cfg) return {}
    return { width: cfg.width, height: cfg.height }
  }, [basic.photoConfig])

  const photoStyle = useMemo(() => {
    const cfg = basic.photoConfig
    return {
      width: cfg ? cfg.width : 90,
      height: cfg ? cfg.height : 120,
      borderRadius: getBorderRadiusValue(cfg),
    }
  }, [basic.photoConfig])

  const nameInitial = basic.name?.charAt(0) || '?'

  const contactItems = useMemo(() => {
    const items: { key: string; label: string; value: string }[] = []
    if (basic.email) items.push({ key: 'email', label: '邮箱', value: basic.email })
    if (basic.phone) items.push({ key: 'phone', label: '电话', value: basic.phone })
    if (basic.location) items.push({ key: 'location', label: '所在地', value: basic.location })
    if (basic.age) items.push({ key: 'age', label: '年龄', value: basic.age })
    if (basic.employementStatus) items.push({ key: 'status', label: '状态', value: basic.employementStatus })
    return items
  }, [basic])

  const customFields = useMemo(() =>
    (basic.customFields || []).filter(f => f.visible !== false),
  [basic.customFields])

  return (
    <div className={`flex gap-5 items-start mb-4 ${layoutClass}`} style={{ color: template.colorScheme.text, fontSize: baseFontSize, lineHeight: String(globalSettings?.lineHeight || 1.6) }}>
      {showPhoto && (
        <div className="flex-shrink-0 overflow-hidden bg-[#f3f4f6]" style={photoWrapperStyle}>
          {basic.photo ? (
            <img src={basic.photo} style={photoStyle} className="object-cover block" alt="avatar" />
          ) : (
            <div className="flex items-center justify-center bg-[#e5e7eb] text-[#9ca3af] text-[28px] font-semibold" style={photoStyle}>
              {nameInitial}
            </div>
          )}
        </div>
      )}

      <div>
        {basic.name && (
          <h1 style={{ fontSize: headerSize + 8, fontWeight: 700, color: themeColor, marginBottom: 4 }}>
            {basic.name}
          </h1>
        )}
        {basic.title && (
          <p style={{ fontSize: headerSize, color: template.colorScheme.secondary, marginBottom: 8 }}>
            {basic.title}
          </p>
        )}

        {contactItems.length > 0 && (
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 4, justifyContent: layout === 'center' ? 'center' : layout === 'right' ? 'flex-end' : 'flex-start' }}>
            {contactItems.map(item => (
              <li key={item.key} style={{ fontSize: baseFontSize - 2, color: template.colorScheme.secondary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {!useIconMode && <span style={{ opacity: 0.7 }}>{item.label}:</span>}
                <span style={{ fontWeight: 500 }}>{item.value}</span>
              </li>
            ))}
          </ul>
        )}

        {customFields.length > 0 && (
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 4, justifyContent: layout === 'center' ? 'center' : layout === 'right' ? 'flex-end' : 'flex-start' }}>
            {customFields.map(field => (
              <li key={field.id} style={{ fontSize: baseFontSize - 2, color: template.colorScheme.secondary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {field.displayLabel !== false && <span style={{ opacity: 0.7 }}>{field.label}:</span>}
                <span style={{ fontWeight: 500 }}>{field.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
