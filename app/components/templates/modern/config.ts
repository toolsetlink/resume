// 现代极简模板配置 - 自由简历项目
import type { ResumeTemplate } from '#shared/types/template'

// 现代极简模板：双栏布局，深蓝黑主色调，简约现代
export const modernConfig: ResumeTemplate = {
  id: 'modern',
  name: '现代极简',
  description: '双栏布局，现代简约设计，适合技术类求职',
  thumbnail: 'modern',
  layout: 'modern',
  colorScheme: {
    primary: '#0f172a',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#1e293b',
  },
  spacing: {
    sectionGap: 18,
    itemGap: 12,
    contentPadding: 0,
  },
  basic: {
    layout: 'left',
  },
  availableSections: [
    'skills',
    'experience',
    'projects',
    'education',
    'selfEvaluation',
    'certificates',
  ],
}
