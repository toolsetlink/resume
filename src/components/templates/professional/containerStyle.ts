import type { CSSProperties } from 'react'
import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'

// B2 阶段：把 4 套模板的容器级差异（字体 / 间距 / accent）从 ProfessionalTemplate
// 抽到这里 —— PaginatedResumePreview（B1.1 之后走单 React 树）也要复用。
// 字体栈差异让切换模板时肉眼立即可见（elegant 用衬线,其他 sans-serif）；
// itemGap 让 section 间距按模板区分;primary 作为 accent 注入给 section 标题。

export function fontFamilyFor(template: ResumeTemplate): string {
  if (template.id === 'elegant') {
    return "'Source Han Serif SC', 'Songti SC', 'Noto Serif CJK SC', 'PingFang SC', Georgia, serif"
  }
  if (template.id === 'creative') {
    return "'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif"
  }
  return "'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
}

export function templateContainerStyle(
  template: ResumeTemplate,
  data: ResumeData,
): CSSProperties {
  return {
    backgroundColor: template.colorScheme.background,
    color: template.colorScheme.text,
    padding: `${template.spacing.contentPadding}px`,
    fontSize: `${data.globalSettings?.baseFontSize || 16}px`,
    lineHeight: String(data.globalSettings?.lineHeight || 1.6),
    gap: `${template.spacing.itemGap}px`,
    fontFamily: fontFamilyFor(template),
    ['--template-accent' as string]: template.colorScheme.primary,
  }
}
