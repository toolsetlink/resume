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
 *
 * 文件名：导出时把 document.title 改成 "{resumeTitle}-YYYY-MM-DD.pdf"，
 * Chrome 系统打印对话框"另存为 PDF"默认会用这个作为文件名。导出后
 * 立即恢复原 title（不必等 afterprint），避免污染用户后续操作。
 */
export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const handleAfterPrint = () => setIsExporting(false)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  const exportToPdf = useCallback(async (resumeTitle?: string) => {
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

    // 改 document.title → Chrome 系统打印对话框"另存为 PDF"会用它作默认文件名。
    // 保存原值，导出后（catch 路径）恢复。
    const originalTitle = document.title
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    const safeTitle = (resumeTitle || '').trim() || '简历'
    document.title = `${safeTitle}-${dateStr}`

    setIsExporting(true)
    try {
      window.print()
      // 同步恢复：Chrome 系统对话框关闭后立即执行，不必等 afterprint，
      // 避免用户在 PDF 已存盘后立刻操作页面时 title 仍是临时值。
      document.title = originalTitle
    } catch (e) {
      document.title = originalTitle
      setIsExporting(false)
      throw e
    }
  }, [])

  return { isExporting, exportToPdf }
}
