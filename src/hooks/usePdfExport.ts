'use client'

import { useState, useCallback } from 'react'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false)
  const activeResume = useResumeStore(selectActiveResume)

  const exportToPdf = useCallback(async () => {
    const sourceEl = document.getElementById('resume-preview')
    if (!sourceEl) throw new Error('找不到导出元素 #resume-preview')
    setIsExporting(true)
    try {
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML).join('\n')
      const html = sourceEl.outerHTML
      const printWindow = window.open('', '_blank')
      if (!printWindow) throw new Error('弹窗被浏览器拦截')
      printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">${styles}</head><body>${html}</body></html>`)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      setTimeout(() => printWindow.close(), 500)
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { isExporting, exportToPdf }
}
