'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * PDF 导出 hook — 直接调当前页 window.print()，由 globals.css 里的 @media print
 * 规则负责隐藏 workbench 侧栏/工具栏，PaginatedResumePreview 里的 .a4-page
 * 负责按 A4 分页。好处：
 *   - 不开新窗口，避免样式/字体在 about:blank 上下文里 404
 *   - 不被浏览器弹窗拦截
 *   - 不写 outerHTML，原页面 CSS 变量、@page、字体全部生效
 *
 * 准备顺序（解决打印态与屏幕态不一致的几个常见坑）：
 *   1. 等待 document.fonts.ready —— 否则中文 fallback 字体在打印时撑高/缩短
 *   2. img.decode() —— complete+naturalHeight 对 base64 不可靠，decode 真正解码
 *   3. document.title 改为 "{title}-YYYY-MM-DD.pdf"，Chrome 系统对话框会读取
 *   4. afterprint 触发后恢复 title —— 不能在 print() 后立即恢复，Chrome 可能在
 *      同步代码里就读取 title 作默认文件名（"另存为 PDF"场景）
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

    // 1) 等字体加载完。中文 fallback 链（PingFang / 微软雅黑）在不同 OS 上宽度不同，
    //    必须在 print 前就加载完，否则 Chrome 打印引擎会用 fallback 字体撑高/缩短内容。
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready
      } catch {
        // 字体加载失败不阻断导出
      }
    }

    // 2) 等所有图片解码完。complete+naturalHeight 对 base64 图片不可靠（某些浏览器
    //    complete=true 时 naturalHeight 还是 0），decode() 是 W3C 标准 API，真正等到
    //    图片可绘制后再继续。
    const images = Array.from(sourceEl.querySelectorAll('img'))
    await Promise.all(
      images.map(async (img) => {
        if (img.complete && img.naturalWidth > 0) return
        try {
          await img.decode()
        } catch {
          // 图片解码失败也继续，避免阻塞导出
        }
      })
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

    // 4) 注册一次性 afterprint 恢复 title。不能在 print() 后立即同步恢复 —— Chrome
    //    在某些版本里会同步读取 document.title 作为默认文件名，同步恢复会导致
    //    PDF 文件名变成原 title。
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
