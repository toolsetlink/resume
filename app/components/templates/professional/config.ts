// 专业简约模板配置 - 自由简历项目
import type { ResumeTemplate } from '#shared/types/template'

// 专业简约模板：深灰主色调，简约现代风格
export const professionalConfig: ResumeTemplate = {
  id: 'professional',
  name: '专业简约',
  description: '简约现代的专业简历模板，适合各类求职场景',
  thumbnail: 'professional',
  layout: 'professional',
  colorScheme: {
    primary: '#1f2937',
    secondary: '#6b7280',
    background: '#ffffff',
    text: '#374151',
  },
  spacing: {
    sectionGap: 20,
    itemGap: 14,
    contentPadding: 40,
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
