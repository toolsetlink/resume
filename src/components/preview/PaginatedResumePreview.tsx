'use client'

import { useEffect, useRef } from 'react'
import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'
import { professionalConfig } from '@/components/templates/professional/config'
import { getTemplateConfig, TEMPLATE_REGISTRY } from '@/components/templates/registry'
import { paginateTemplate } from '@/lib/pagination'

async function waitForAssets(root: HTMLElement) {
  try {
    await document.fonts?.ready
  } catch {
    // 字体失败时继续用系统字体测量，避免预览一直空白。
  }
  await Promise.all(Array.from(root.querySelectorAll('img')).map(async (image) => {
    if (image.complete && image.naturalWidth > 0) return
    try {
      await image.decode()
    } catch {
      // 用户头像解码失败不影响其他内容分页。
    }
  }))
}

export function PaginatedResumePreview({ resumeData }: { resumeData: ResumeData }) {
  const previewRef = useRef<HTMLDivElement>(null)
  const sourceRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const templateConfig: ResumeTemplate =
    (resumeData.templateId && getTemplateConfig(resumeData.templateId)) || professionalConfig
  const TemplateComponent = TEMPLATE_REGISTRY.find((entry) => entry.config.id === templateConfig.id)?.Component

  useEffect(() => {
    const preview = previewRef.current
    const source = sourceRef.current
    const output = outputRef.current
    if (!preview || !source || !output) return

    let cancelled = false
    preview.dataset.paginationReady = 'false'

    void (async () => {
      await waitForAssets(source)
      if (cancelled) return
      const template = source.querySelector<HTMLElement>('.resume-template')
      if (!template) return
      output.replaceChildren(...paginateTemplate(template))
      preview.dataset.paginationReady = 'true'
    })()

    return () => {
      cancelled = true
    }
  }, [resumeData, templateConfig.id])

  return (
    <div ref={previewRef} id="resume-preview" className="resume-pages" data-template={templateConfig.id} data-pagination-ready="false">
      <div ref={sourceRef} className="resume-pagination-source" aria-hidden="true">
        {TemplateComponent && <TemplateComponent data={resumeData} template={templateConfig} />}
      </div>
      <div ref={outputRef} className="resume-pagination-output" />
    </div>
  )
}
