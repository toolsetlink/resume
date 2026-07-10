import type { ResumeTemplate } from '@/shared/types/template'

export const elegantConfig: ResumeTemplate = {
  id: 'elegant',
  name: '优雅经典',
  description: '单栏居中布局，衬线字体，优雅留白，适合管理类岗位',
  thumbnail: 'elegant',
  layout: 'elegant',
  colorScheme: {
    primary: '#1e293b',
    secondary: '#94a3b8',
    background: '#fafafa',
    text: '#334155',
  },
  spacing: { sectionGap: 24, itemGap: 16, contentPadding: 48 },
  basic: { layout: 'center' },
  availableSections: ['skills', 'experience', 'projects', 'education', 'selfEvaluation', 'certificates'],
}
