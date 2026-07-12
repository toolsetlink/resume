'use client'

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { getTemplateConfig } from '@/components/templates/registry'
import { professionalConfig } from '@/components/templates/professional/config'
import { renderSections } from '@/components/templates/professional/renderSections'
import type { ResumeData } from '@/shared/types/resume'

const A4_WIDTH = 794
const A4_HEIGHT = 1123

type AnalyzedSection = {
  id: string
  el: HTMLElement | null
  elHeight: number
  titleEl: HTMLElement | null
  titleHeight: number
  items: HTMLElement[]
  itemHeights: number[]
  isItemized: boolean
}

function findItems(el: HTMLElement): { items: HTMLElement[]; isItemized: boolean } {
  const titleEl = el.querySelector(':scope > h2') as HTMLElement | null
  if (!titleEl) {
    return { items: [el], isItemized: false }
  }

  const directDivs = Array.from(el.children).filter(c => c.tagName === 'DIV') as HTMLElement[]
  if (directDivs.length === 0) {
    return { items: [el], isItemized: false }
  }

  if (directDivs.length === 1) {
    const innerDiv = directDivs[0]
    if (innerDiv.classList.contains('rich-content')) {
      return { items: [el], isItemized: false }
    }
    if (innerDiv.children.length > 1) {
      return { items: Array.from(innerDiv.children) as HTMLElement[], isItemized: true }
    }
    return { items: [el], isItemized: false }
  }

  return { items: directDivs, isItemized: true }
}

function analyzeContainer(container: HTMLElement): AnalyzedSection[] {
  const result: AnalyzedSection[] = []
  Array.from(container.children).forEach((topEl, idx) => {
    const el = topEl as HTMLElement
    const { items, isItemized } = findItems(el)

    if (!isItemized) {
      result.push({
        id: `atomic-${idx}`,
        el,
        elHeight: el.offsetHeight,
        titleEl: null,
        titleHeight: 0,
        items: [],
        itemHeights: [],
        isItemized: false,
      })
      return
    }

    const titleEl = el.querySelector(':scope > h2') as HTMLElement | null
    result.push({
      id: `items-${idx}`,
      el: null,
      elHeight: 0,
      titleEl,
      titleHeight: titleEl?.offsetHeight ?? 0,
      items,
      itemHeights: items.map(i => i.offsetHeight),
      isItemized: true,
    })
  })
  return result
}

function packPages(analyzed: AnalyzedSection[], pageHeight: number): HTMLElement[][] {
  const pages: HTMLElement[][] = []
  let currentPage: HTMLElement[] = []
  let currentHeight = 0
  const titlePlaced = new Set<string>()

  const flushPage = () => {
    if (currentPage.length > 0) pages.push(currentPage)
    currentPage = []
    currentHeight = 0
  }

  for (const section of analyzed) {
    if (!section.isItemized) {
      const h = section.elHeight
      if (currentHeight + h > pageHeight && currentPage.length > 0) {
        flushPage()
      }
      if (section.el) {
        currentPage.push(section.el)
        currentHeight += h
      }
      continue
    }

    for (let i = 0; i < section.items.length; i++) {
      const itemH = section.itemHeights[i]
      const needsTitle = !titlePlaced.has(section.id)
      const titleH = needsTitle ? section.titleHeight : 0

      if (currentHeight + titleH + itemH > pageHeight && currentPage.length > 0) {
        flushPage()
      }

      if (!titlePlaced.has(section.id) && section.titleEl) {
        currentPage.push(section.titleEl)
        currentHeight += section.titleHeight
        titlePlaced.add(section.id)
      }

      currentPage.push(section.items[i])
      currentHeight += itemH
    }
  }

  if (currentPage.length > 0) pages.push(currentPage)
  return pages
}

export function PaginatedResumePreview({ resumeData }: { resumeData: ResumeData }) {
  const templateConfig = (resumeData.templateId && getTemplateConfig(resumeData.templateId)) || professionalConfig
  const sections = useMemo(() => renderSections(resumeData, templateConfig), [resumeData, templateConfig])

  const measureRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<HTMLElement[][]>([])

  const pageContentStyle: CSSProperties = useMemo(() => ({
    width: A4_WIDTH,
    padding: `${templateConfig.spacing.contentPadding}px`,
    backgroundColor: templateConfig.colorScheme.background,
    color: templateConfig.colorScheme.text,
    fontSize: `${resumeData.globalSettings?.baseFontSize || 16}px`,
    lineHeight: String(resumeData.globalSettings?.lineHeight || 1.6),
    fontFamily: "'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    boxSizing: 'border-box',
  }), [templateConfig, resumeData.globalSettings])

  const pageContentHeight = A4_HEIGHT - templateConfig.spacing.contentPadding * 2

  useLayoutEffect(() => {
    if (!measureRef.current) return
    const analyzed = analyzeContainer(measureRef.current)
    const packed = packPages(analyzed, pageContentHeight)
    setPages(packed)
  }, [sections, pageContentHeight])

  const displayPages = pages.length > 0 ? pages : [[] as HTMLElement[]]

  return (
    <>
      <div
        aria-hidden="true"
        className="resume-measurement"
        style={{
          ...pageContentStyle,
          position: 'absolute',
          visibility: 'hidden',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div ref={measureRef}>
          {sections}
        </div>
      </div>

      <div id="resume-preview" className="resume-pages flex flex-col items-center gap-6 pt-6 pb-12">
        {displayPages.map((pageItems, pageIdx) => (
          <div
            key={pageIdx}
            className="a4-page bg-white shadow-lg"
            style={{ ...pageContentStyle, height: A4_HEIGHT, overflow: 'hidden', position: 'relative' }}
          >
            <div className="flex flex-col h-full">
              {pageItems.map((item, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: item.outerHTML }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
