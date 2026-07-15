'use client'

import { getTemplateConfig } from '@/components/templates/registry'
import { professionalConfig } from '@/components/templates/professional/config'
import { renderSections } from '@/components/templates/professional/renderSections'
import type { ResumeData } from '@/shared/types/resume'

// B 阶段：迁到原生 CSS Paged Media。
// 屏幕态：单棵 React 树自然流，由 CSS column-* + break-* 模拟分页（见 globals.css）。
// 打印态：Chrome 按 @page size: A4 + .item-no-break 自动分页。
// 之前 318 行的 packPages + dangerouslySetInnerHTML 序列化已被删除 ——
//   - 解决了 A3 评估的所有序列化风险（图片重新加载 / refs 丢失 / Tailwind className 丢失）
//   - 屏幕/PDF 现在共用同一棵 DOM 树，不会有屏幕看见 ≠ 打印出来 的不一致
export function PaginatedResumePreview({ resumeData }: { resumeData: ResumeData }) {
  const templateConfig =
    (resumeData.templateId && getTemplateConfig(resumeData.templateId)) || professionalConfig
  const sections = renderSections(resumeData, templateConfig)

  return (
    <div id="resume-preview" className="resume-pages">
      {sections.map((section, idx) => (
        <div key={idx} className="resume-section item-no-break" data-section-idx={idx}>
          {section}
        </div>
      ))}
    </div>
  )
}