import type { ResumeTemplate } from '@/shared/types/template'

export const creativeConfig: ResumeTemplate = {
  id: 'creative',
  name: '创意活泼',
  description: '顶部彩色横幅 + 双栏布局，紫粉渐变，适合创意类岗位',
  thumbnail: 'creative',
  layout: 'creative',
  colorScheme: {
    primary: '#7c3aed',
    secondary: '#ec4899',
    background: '#ffffff',
    text: '#1f2937',
  },
  spacing: { sectionGap: 16, itemGap: 12, contentPadding: 24 },
  basic: { layout: 'center' },
  availableSections: ['skills', 'experience', 'projects', 'education', 'selfEvaluation', 'certificates'],
}
