// PDF 导出 composable - 自由简历项目
// 方案：打开新窗口渲染简历 → 调用浏览器原生打印 → 用户选择"另存为 PDF"
// 浏览器原生打印保留矢量文字、完整 CSS 支持，输出质量和预览完全一致
import { useResumeStore } from '~/stores/resume'

// 安全文件名：替换非法字符，去除多余空白
const getSafeFileName = (title?: string) => {
  const normalized = (title || 'resume')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
  return normalized || 'resume'
}

export function usePdfExport() {
  const resumeStore = useResumeStore()
  const isExporting = ref(false)

  const exportToPdf = async (options?: {
    title?: string
  }) => {
    if (!import.meta.client) return

    const title = options?.title || resumeStore.activeResume?.title || '简历'
    const sourceEl = document.getElementById('resume-preview')
    if (!sourceEl) {
      throw new Error('找不到导出元素 #resume-preview')
    }

    isExporting.value = true

    try {
      // 收集所有的 <style> 标签（Vue scoped CSS、组件样式等）
      const styleTags = Array.from(document.querySelectorAll('style'))
        .map((el) => el.outerHTML)
        .join('\n')

      // 收集所有的 <link rel="stylesheet">（TDesign、Tailwind 等外部样式）
      const linkTags = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
      )
        .map((el) => el.outerHTML)
        .join('\n')

      // 收集 Web 字体声明（如果有 @font-face 定义在 style 之外）
      const fontDeclarations = Array.from(document.styleSheets)
        .flatMap((sheet) => {
          try {
            return Array.from(sheet.cssRules || [])
          } catch {
            return []
          }
        })
        .filter(
          (rule) => rule instanceof CSSFontFaceRule,
        )
        .map((rule) => rule.cssText)
        .join('\n')

      // 获取预览内容的完整 HTML（包含 data-v-* 属性、Vue v-bind 内联自定义属性）
      const content = sourceEl.outerHTML

      // 打开新窗口用于打印
      const printWindow = window.open(
        '',
        '_blank',
        'width=800,height=600,scrollbars=yes',
      )
      if (!printWindow) {
        throw new Error('弹出窗口被拦截，请允许弹出窗口')
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=794">
          ${linkTags}
          ${styleTags}
          ${fontDeclarations ? `<style>${fontDeclarations}</style>` : ''}
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              html, body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            (function() {
              var printAndClose = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
              if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(function() {
                  setTimeout(printAndClose, 300);
                });
              } else {
                setTimeout(printAndClose, 1000);
              }
            })();
          <\/script>
        </body>
        </html>
      `)
      printWindow.document.close()
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    exportToPdf,
  }
}
