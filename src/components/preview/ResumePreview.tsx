'use client'

import { getTemplateComponent, getTemplateConfig } from '@/components/templates/registry'
import { professionalConfig } from '@/components/templates/professional/config'
import type { ResumeData } from '@/shared/types/resume'

interface ResumePreviewProps {
  resumeData: ResumeData
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  const templateId = resumeData.templateId
  const templateConfig = (templateId && getTemplateConfig(templateId)) || professionalConfig
  const TemplateComponent = getTemplateComponent(templateConfig.layout)

  if (!TemplateComponent) {
    return (
      <div className="flex items-center justify-center h-64 text-[hsl(var(--text-tertiary))]">
        请选择模板
      </div>
    )
  }

  return (
    <div id="resume-preview" className="resume-preview-container">
      <TemplateComponent data={resumeData} template={templateConfig} />
    </div>
  )
}
