import type { ResumeTemplate } from '@/shared/types/template'

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
    itemGap: 14,
    contentPadding: 40,
  },
  basic: {
    layout: 'left',
  },
}
