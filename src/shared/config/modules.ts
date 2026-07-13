export interface ModuleConfig {
  id: string
  title: string
  icon: string
  enabled: boolean
  order: number
  description: string
}

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 'basic',
    title: '基本信息',
    icon: '👤',
    enabled: true,
    order: 0,
    description: '姓名、联系方式、照片等基础信息',
  },
  {
    id: 'skills',
    title: '专业技能',
    icon: '⚡',
    enabled: true,
    order: 1,
    description: '技术技能与熟练度',
  },
  {
    id: 'experience',
    title: '工作经验',
    icon: '💼',
    enabled: true,
    order: 2,
    description: '工作经历与职责',
  },
  {
    id: 'projects',
    title: '项目经历',
    icon: '🚀',
    enabled: true,
    order: 3,
    description: '项目案例与贡献',
  },
  {
    id: 'education',
    title: '教育经历',
    icon: '🎓',
    enabled: true,
    order: 4,
    description: '学校与专业',
  },
  {
    id: 'certificates',
    title: '证书',
    icon: '📜',
    enabled: false,
    order: 5,
    description: '专业证书与资质',
  },
  {
    id: 'selfEvaluation',
    title: '自我评价',
    icon: '✍️',
    enabled: false,
    order: 6,
    description: '个人简介与求职意向',
  },
  {
    id: 'custom',
    title: '自定义',
    icon: '⚙️',
    enabled: false,
    order: 7,
    description: '自定义内容板块',
  },
]
