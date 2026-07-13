'use client'

import { useMemo } from 'react'
import { getTemplateComponent, getTemplateConfig } from '@/components/templates/registry'
import { professionalConfig } from '@/components/templates/professional/config'
import type { ResumeData } from '@/shared/types/resume'

interface ResumePreviewProps {
  resumeData: ResumeData
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  // 把 templateConfig 和 TemplateComponent 都用 useMemo 包住，
  // 避免每次渲染都新建组件引用、导致模板内部 state 被重置。
  const templateConfig = useMemo(
    () =>
      (resumeData.templateId && getTemplateConfig(resumeData.templateId)) ||
      professionalConfig,
    [resumeData.templateId]
  )
  const TemplateComponent = useMemo(
    () => getTemplateComponent(templateConfig.layout),
    [templateConfig.layout]
  )

  if (!TemplateComponent) {
    return (
      <div className="flex items-center justify-center h-64 text-[hsl(var(--text-tertiary))]">
        请选择模板
      </div>
    )
  }

  // useMemo 已经把 TemplateComponent 引用稳定住了，lint 的静态分析识别不出来
  // getTemplateComponent(layout) 返回的是稳定引用，所以这里禁用 lint。
  return (
    <div id="resume-preview" className="resume-preview-container">
      {/* eslint-disable-next-line react-hooks/static-components */}
      <TemplateComponent data={resumeData} template={templateConfig} />
    </div>
  )
}
