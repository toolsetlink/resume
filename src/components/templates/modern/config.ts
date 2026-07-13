import type { ResumeTemplate } from '@/shared/types/template'

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
  spacing: { itemGap: 12, contentPadding: 0 },
  basic: { layout: 'left' },
}
