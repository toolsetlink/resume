'use client'

import { useEffect, useRef } from 'react'
import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'

import { professionalConfig } from '@/components/templates/professional/config'
import { renderSections } from '@/components/templates/professional/renderSections'
import { templateContainerStyle } from '@/components/templates/professional/containerStyle'
import { getTemplateConfig } from '@/components/templates/registry'
import { paginateIntoA4Pages } from '@/lib/pagination'

/**
 * 屏幕态分页预览 —— 与 PDF 打印共用 paginateIntoA4Pages。
 *
 * 数据流:
 *   React render  → .resume-pages 容器 + 若干 .resume-section 子节点
 *   useEffect     → debounce 200ms → 等 fonts.ready + img.decode
 *                  → paginateIntoA4Pages 把 .resume-section 内容按 A4 高度
 *                    切到多个 .a4-page 卡片里
 *
 * 为什么 useEffect + DOM mutation 而非 React state 驱动:
 *   分页算法基于真实 DOM 测量(getBoundingClientRect + computedStyle.margin),
 *   流动单元包括 <p>/<li>/flex 行等结构 —— 把它们重新用 React state 渲染会要求
 *   renderSections 改成"输出 flat unit 数组",4 套模板全要改,改动面太大。
 *   实际副作用只有 className/children 顺序变化,在 useEffect 里 mutate 然后
 *   下次 React render 会重置回 .resume-section 结构 + 重新触发 effect,自洽。
 */
export function PaginatedResumePreview({ resumeData }: { resumeData: ResumeData }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const templateConfig: ResumeTemplate =
    (resumeData.templateId && getTemplateConfig(resumeData.templateId)) || professionalConfig
  const sections = renderSections(resumeData, templateConfig)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let cancelled = false
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    async function runPagination() {
      if (!root) return
      // 等字体加载完。中文 fallback 链在不同 OS 上宽度不同,
      // 必须在测量前加载完,否则 fallback 字体撑高/缩短内容导致分页不准。
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready
        } catch {
          // 字体加载失败不阻断分页
        }
      }
      if (cancelled || !root) return

      // 等图片解码完。complete+naturalWidth 对 base64 不可靠。
      const images = Array.from(root.querySelectorAll('img'))
      await Promise.all(
        images.map(async (img) => {
          if (img.complete && img.naturalWidth > 0) return
          try {
            await img.decode()
          } catch {
            // 图片解码失败也继续,避免阻塞分页
          }
        }),
      )
      if (cancelled || !root) return

      paginateIntoA4Pages(root)
    }

    function schedule() {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        void runPagination()
      }, 200)
    }

    schedule()

    return () => {
      cancelled = true
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [resumeData, templateConfig.id])

  return (
    <div
      ref={rootRef}
      id="resume-preview"
      className="resume-pages"
      data-template={templateConfig.id}
      style={templateContainerStyle(templateConfig, resumeData)}
    >
      {sections.map((section, idx) => (
        <div key={idx} className="resume-section" data-section-idx={idx}>
          {section}
        </div>
      ))}
    </div>
  )
}