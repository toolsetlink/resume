import { useMemo } from 'react'
import type { GlobalSettings } from '@/shared/types/resume'

interface SectionTitleProps {
  title: string
  globalSettings?: GlobalSettings
}

export function SectionTitle({ title, globalSettings }: SectionTitleProps) {
  const themeColor = useMemo(() => globalSettings?.themeColor || '#1f2937', [globalSettings?.themeColor])
  const titleStyle = useMemo(() => ({
    fontSize: `${globalSettings?.headerSize || 20}px`,
    color: themeColor,
  }), [globalSettings?.headerSize, themeColor])

  return (
    <h2 className="flex items-center gap-2 font-bold mb-3" style={titleStyle}>
      <span className="inline-block w-[4px] h-[18px] rounded-[2px] flex-shrink-0" style={{ backgroundColor: themeColor }} />
      <span>{title}</span>
    </h2>
  )
}
