'use client'

import { useCallback, useEffect, useState } from 'react'

async function waitForPagination(preview: HTMLElement) {
  if (preview.dataset.paginationReady === 'true') return
  await new Promise<void>((resolve) => {
    const observer = new MutationObserver(() => {
      if (preview.dataset.paginationReady === 'true') {
        observer.disconnect()
        resolve()
      }
    })
    observer.observe(preview, { attributes: true, attributeFilter: ['data-pagination-ready'] })
    window.setTimeout(() => {
      observer.disconnect()
      resolve()
    }, 3000)
  })
}

/**
 * PDF 导出 hook —— 直接调当前页 window.print(),由 globals.css 里的 @media print
 * 规则负责隐藏 workbench 侧栏/工具栏。
 *
 * 分页已统一在 PaginatedResumePreview 里生成；屏幕态的 .a4-page 卡片就是
 * 打印会输出的页。本 hook 只负责:
 *   1. 防御式同步分页(用户极快点击导出时,屏幕态 200ms 防抖可能还没跑完)
 *   2. 等字体 / 图片就绪
 *   3. 改 document.title(Chrome 打印对话框"另存为 PDF"读这个作为默认文件名)
 *   4. afterprint 恢复 title
 *   5. 调 window.print()
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

    await waitForPagination(sourceEl)

    // 1) 等字体加载完。中文 fallback 链(PingFang / 微软雅黑)在不同 OS 上宽度不同,
    //    必须在 print 前就加载完,否则 Chrome 打印引擎会用 fallback 字体撑高/缩短内容。
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready
      } catch {
        // 字体加载失败不阻断导出
      }
    }

    // 2) 等所有图片解码完。complete+naturalHeight 对 base64 图片不可靠。
    const images = Array.from(sourceEl.querySelectorAll('img'))
    await Promise.all(
      images.map(async (img) => {
        if (img.complete && img.naturalWidth > 0) return
        try {
          await img.decode()
        } catch {
          // 图片解码失败也继续,避免阻塞导出
        }
      }),
    )

    // 3) 改 document.title → Chrome 系统打印对话框"另存为 PDF"会读这个作为默认文件名。
    const originalTitle = document.title
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    const safeTitle = (resumeTitle || '').trim() || '简历'
    document.title = `${safeTitle}-${dateStr}`

    // 4) 注册一次性 afterprint 恢复 title —— 不能在 print() 后立即同步恢复,
    //    Chrome 可能在同步代码里就读取 title 作默认文件名("另存为 PDF"场景)。
    let restored = false
    const restoreTitle = () => {
      if (restored) return
      restored = true
      document.title = originalTitle
      window.removeEventListener('afterprint', restoreTitle)
    }
    window.addEventListener('afterprint', restoreTitle)

    setIsExporting(true)
    try {
      window.print()
    } catch (e) {
      restoreTitle()
      throw e
    }
  }, [])

  return { isExporting, exportToPdf }
}
