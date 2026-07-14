'use client'

import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import type { ComponentType } from 'react'
import { TEMPLATE_REGISTRY } from '@/components/templates/registry'

const A4_WIDTH = 794
const A4_HEIGHT = 1123

// 模块顶层组件表：按 templateId 查表，避免在 render 中创建组件。
const COMPONENT_BY_ID: Record<string, ComponentType<{ data: ResumeData; template: ResumeTemplate }>> =
  TEMPLATE_REGISTRY.reduce(
    (acc, entry) => {
      acc[entry.config.id] = entry.Component
      return acc
    },
    {} as Record<string, ComponentType<{ data: ResumeData; template: ResumeTemplate }>>
  )

const TEMPLATE_BY_ID: Record<string, ResumeTemplate> = TEMPLATE_REGISTRY.reduce(
  (acc, entry) => {
    acc[entry.config.id] = entry.config
    return acc
  },
  {} as Record<string, ResumeTemplate>
)

interface MiniTemplatePreviewProps {
  templateId: string
  sampleData: ResumeData
  width?: number
  visibleHeight?: number
}

export function MiniTemplatePreview({
  templateId,
  sampleData,
  width = 220,
  visibleHeight = 320,
}: MiniTemplatePreviewProps) {
  const Component = COMPONENT_BY_ID[templateId]
  const template = TEMPLATE_BY_ID[templateId]
  const scale = width / A4_WIDTH

  if (!template || !Component) {
    return (
      <div
        className="flex items-center justify-center bg-[hsl(var(--bg-subtle))] text-[hsl(var(--text-tertiary))]"
        style={{ height: visibleHeight }}
      >
        模板不可用
      </div>
    )
  }

  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{ height: visibleHeight }}
    >
      <div
        style={{
          width: A4_WIDTH,
          height: A4_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <Component data={sampleData} template={template} />
      </div>
    </div>
  )
}
