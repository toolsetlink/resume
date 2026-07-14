'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { getTemplateConfig } from '@/components/templates/registry'
import { professionalConfig } from '@/components/templates/professional/config'
import { renderSections } from '@/components/templates/professional/renderSections'
import type { ResumeData } from '@/shared/types/resume'
import {
  A4_WIDTH_PX,
  A4_HEIGHT_PX,
  DEFAULT_PAGE_PADDING_PX,
  a4ContentHeightPx,
} from '@/shared/config/print'

// 单个 item 高度超过半页就别硬塞，宁可整段换页——剩下的白空用户还能接受，
// 但一整段 item 被切成两半既难看又丢内容。
const SINGLE_PAGE_FRACTION = 0.5

type AnalyzedItem = {
  el: HTMLElement
  height: number
}

type AnalyzedSection = {
  id: string
  titleEl: HTMLElement | null
  titleHeight: number
  isItemized: boolean
  // atomic 模式：整个 section 是一个 item
  atomic?: AnalyzedItem
  // itemized 模式：一组 item，外加一个可选标题（itemized section 必有标题）
  items?: AnalyzedItem[]
}

// 把 section 顶层 children 拆成 "标题 + item 列表"。
// 返回的是 HTMLElement[]，由调用方包成 AnalyzedItem。
//
// BaseInfo / 其他无标题的"页头型" section：顶层没有 H2/H3，直接整段当 atomic item。
// 否则会把它内部的子 div 当成 items 列表，dangerouslySetInnerHTML 序列化后会丢
// 掉外层 wrapper 的 className（典型现象：`professional-base-info` 只在测量容器里
// 出现，#resume-preview 里看不到）。
function findSectionItems(section: HTMLElement): HTMLElement[] | undefined {
  const titleEl = Array.from(section.children).find(
    (c) => c.tagName === 'H2' || c.tagName === 'H3'
  ) as HTMLElement | undefined

  // 没标题 → 整段就是 item
  if (!titleEl) return [section]

  const containerIdx = Array.from(section.children).indexOf(titleEl) + 1
  const container = section.children[containerIdx] as HTMLElement | undefined
  if (!container || container.tagName !== 'DIV') return [section]

  // 容器自身是 rich-content（详情型 section）→ 整段当一个 item
  if (container.classList.contains('rich-content')) {
    return [container]
  }

  const kids = Array.from(container.children)
  if (kids.length === 0) return [container]
  return kids as HTMLElement[]
}

function analyzeContainer(container: HTMLElement): AnalyzedSection[] {
  const result: AnalyzedSection[] = []
  Array.from(container.children).forEach((topEl, idx) => {
    const el = topEl as HTMLElement
    const titleEl =
      (Array.from(el.children).find(
        (c) => c.tagName === 'H2' || c.tagName === 'H3'
      ) as HTMLElement | undefined) ?? null

    // 没有标题的 section（BaseInfo / 装饰 div）→ 整段 atomic，避免把外层
    // wrapper 的 className 当成 item 序列切掉（#resume-preview 里就找不到
    // `*-base-info` 了）。
    if (!titleEl) {
      result.push({
        id: `atomic-${idx}`,
        titleEl: null,
        titleHeight: 0,
        isItemized: false,
        atomic: { el, height: el.offsetHeight },
      })
      return
    }

    const items = findSectionItems(el)!
    result.push({
      id: `items-${idx}`,
      titleEl,
      titleHeight: titleEl.offsetHeight,
      isItemized: true,
      items: items.map((i) => ({ el: i, height: i.offsetHeight })),
    })
  })
  return result
}

// 居中阈值：最后一页内容高度 < 页面可用高度的 75% 时，认为页面"明显有富余"，
// 上下均分空白做居中。75%+ 按满页排（看着更像正常页面而不是空文档）。
const CENTERING_THRESHOLD = 0.75

type PackedPage = {
  items: HTMLElement[]
  height: number
}

// 按内容顶满切页：
//   - 累计 height，超 pageHeight 就先 flush
//   - 单个 item 高度 >= 50% pageHeight 就独占一页（避免切碎）
//   - itemized section 的标题只放一次，跟着 section 首个落页的 item 一起；
//     切页后续 item 直接跟过去（不再补标题，避免重复标题跨页）。
//   - titlePlacedForSection 按 section 维度累计，flushPage 不能重置。
function packPages(analyzed: AnalyzedSection[], pageHeight: number): PackedPage[] {
  const pages: PackedPage[] = []
  let currentItems: HTMLElement[] = []
  let currentHeight = 0
  const titlePlacedForSection: Set<string> = new Set()

  const flushPage = () => {
    if (currentItems.length > 0) {
      pages.push({ items: currentItems, height: currentHeight })
    }
    currentItems = []
    currentHeight = 0
  }

  for (const section of analyzed) {
    if (!section.isItemized) {
      const item = section.atomic!
      if (currentHeight + item.height > pageHeight && currentItems.length > 0) {
        flushPage()
      }
      currentItems.push(item.el)
      currentHeight += item.height
      continue
    }

    const items = section.items!
    const titleH = section.titleHeight

    for (let i = 0; i < items.length; i++) {
      const itemH = items[i].height
      const titleAlreadyPlaced = titlePlacedForSection.has(section.id)

      // 单个 item 超过半页 → 独占一页，标题也跟过去（贴在内容上方）
      if (itemH >= pageHeight * SINGLE_PAGE_FRACTION) {
        flushPage()
        if (section.titleEl && !titleAlreadyPlaced) {
          currentItems.push(section.titleEl)
          currentHeight += titleH
          titlePlacedForSection.add(section.id)
        }
        currentItems.push(items[i].el)
        currentHeight += itemH
        flushPage()
        continue
      }

      // 加上标题高度后会越界 → 切页，标题放新页第一行
      if (
        section.titleEl &&
        !titleAlreadyPlaced &&
        currentHeight + titleH + itemH > pageHeight
      ) {
        flushPage()
      }

      // 放标题（仅本 section 第一次）
      if (section.titleEl && !titleAlreadyPlaced) {
        if (currentHeight + titleH > pageHeight && currentItems.length > 0) {
          flushPage()
        }
        currentItems.push(section.titleEl)
        currentHeight += titleH
        titlePlacedForSection.add(section.id)
      }

      // 放 item；如果还是越界就 flush 之后再放（item 跨页时不再补标题）
      if (currentHeight + itemH > pageHeight && currentItems.length > 0) {
        flushPage()
      }
      currentItems.push(items[i].el)
      currentHeight += itemH
    }
  }

  if (currentItems.length > 0) {
    pages.push({ items: currentItems, height: currentHeight })
  }
  return pages
}

export function PaginatedResumePreview({ resumeData }: { resumeData: ResumeData }) {
  const templateConfig =
    (resumeData.templateId && getTemplateConfig(resumeData.templateId)) || professionalConfig
  const sections = useMemo(
    () => renderSections(resumeData, templateConfig),
    [resumeData, templateConfig]
  )

  const measureRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<PackedPage[]>([])

  const contentPadding = templateConfig.spacing.contentPadding ?? DEFAULT_PAGE_PADDING_PX
  const pageContentHeight = a4ContentHeightPx(contentPadding)
  const pageContentWidth = A4_WIDTH_PX - contentPadding * 2

  const pageContentStyle: CSSProperties = useMemo(
    () => ({
      width: A4_WIDTH_PX,
      padding: `${contentPadding}px`,
      backgroundColor: templateConfig.colorScheme.background,
      color: templateConfig.colorScheme.text,
      fontSize: `${resumeData.globalSettings?.baseFontSize || 16}px`,
      lineHeight: String(resumeData.globalSettings?.lineHeight || 1.6),
      fontFamily:
        "'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
      boxSizing: 'border-box',
    }),
    [templateConfig, resumeData.globalSettings, contentPadding]
  )

  // 一次同步测量（layout 阶段拿到初值）。后面字体加载完成/窗口尺寸变化时再异步补一次。
  useLayoutEffect(() => {
    if (!measureRef.current) return
    const analyzed = analyzeContainer(measureRef.current)
    const packed = packPages(analyzed, pageContentHeight)
    setPages(packed)
  }, [sections, pageContentHeight])

  useEffect(() => {
    const measure = () => {
      if (!measureRef.current) return
      const analyzed = analyzeContainer(measureRef.current)
      const packed = packPages(analyzed, pageContentHeight)
      setPages(packed)
    }

    // 字体加载完后重测（中文/英文字体切换会影响 offsetHeight）
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fonts?.ready) {
      fonts.ready.then(measure).catch(() => {})
    }

    // 窗口尺寸变化时重测（用户拖动分栏/缩放）
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageContentHeight])

  const displayPages = pages.length > 0 ? pages : [{ items: [] as HTMLElement[], height: 0 }]
  const lastPageIdx = displayPages.length - 1

  return (
    <>
      {/* 测量容器：藏在屏幕外但参与布局（visibility:hidden 会让 offsetHeight=0） */}
      <div
        aria-hidden="true"
        className="resume-measurement"
        style={{
          ...pageContentStyle,
          position: 'fixed',
          top: 0,
          left: '-99999px',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div ref={measureRef} style={{ width: pageContentWidth }}>
          {sections}
        </div>
      </div>

      <div id="resume-preview" className="resume-pages flex flex-col items-center gap-6 pt-6 pb-12">
        {displayPages.map((page, pageIdx) => {
          const isLast = pageIdx === lastPageIdx
          const shouldCenter =
            isLast && page.height < pageContentHeight * CENTERING_THRESHOLD
          const topPad = shouldCenter ? (pageContentHeight - page.height) / 2 : 0
          return (
            <div
              key={pageIdx}
              className="a4-page bg-white shadow-lg"
              style={{
                ...pageContentStyle,
                height: A4_HEIGHT_PX,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                className="a4-page-content flex flex-col h-full"
                style={
                  shouldCenter
                    ? { paddingTop: `${topPad}px`, paddingBottom: `${topPad}px` }
                    : undefined
                }
              >
                {page.items.map((item, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: item.outerHTML }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}