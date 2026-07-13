'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * PDF 导出 hook — 直接调当前页 window.print()，由 globals.css 里的 @media print
 * 规则负责隐藏 workbench 侧栏/工具栏，PaginatedResumePreview 里的 .a4-page
 * 负责按 A4 分页。好处：
 *   - 不开新窗口，避免样式/字体在 about:blank 上下文里 404
 *   - 不被浏览器弹窗拦截
 *   - 不写 outerHTML，原页面 CSS 变量、@page、字体全部生效
 *   - onafterprint 事件精准清状态，不用 setTimeout 猜时机
 */
export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const handleAfterPrint = () => setIsExporting(false)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  const exportToPdf = useCallback(async () => {
    const sourceEl = document.getElementById('resume-preview')
    if (!sourceEl) throw new Error('找不到导出元素 #resume-preview')

    // 等所有图片加载完再打开系统打印框，否则可能打出空图片。
    const images = Array.from(sourceEl.querySelectorAll('img'))
    await Promise.all(
      images.map(img =>
        img.complete && img.naturalHeight !== 0
          ? Promise.resolve()
          : new Promise<void>(resolve => {
              img.addEventListener('load', () => resolve(), { once: true })
              img.addEventListener('error', () => resolve(), { once: true })
            })
      )
    )

    setIsExporting(true)
    try {
      window.print()
    } catch (e) {
      setIsExporting(false)
      throw e
    }
  }, [])

  return { isExporting, exportToPdf }
}
