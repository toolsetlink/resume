// 简历模块定义 - 自由简历项目

// 模块配置接口
export interface ModuleConfig {
  id: string
  title: { zh: string; en: string }
  icon: string
  enabled: boolean
  order: number
  description: { zh: string; en: string }
}

// 简历模块列表
export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 'basic',
    title: { zh: '基本信息', en: 'Profile' },
    icon: '👤',
    enabled: true,
    order: 0,
    description: { zh: '姓名、联系方式、照片等基础信息', en: 'Name, contact, photo' },
  },
  {
    id: 'skills',
    title: { zh: '专业技能', en: 'Skills' },
    icon: '⚡',
    enabled: true,
    order: 1,
    description: { zh: '技术技能与熟练度', en: 'Technical skills and proficiency' },
  },
  {
    id: 'experience',
    title: { zh: '工作经验', en: 'Experience' },
    icon: '💼',
    enabled: true,
    order: 2,
    description: { zh: '工作经历与职责', en: 'Work history and responsibilities' },
  },
  {
    id: 'projects',
    title: { zh: '项目经历', en: 'Projects' },
    icon: '🚀',
    enabled: true,
    order: 3,
    description: { zh: '项目案例与贡献', en: 'Project cases and contributions' },
  },
  {
    id: 'education',
    title: { zh: '教育经历', en: 'Education' },
    icon: '🎓',
    enabled: true,
    order: 4,
    description: { zh: '学校与专业', en: 'Schools and majors' },
  },
  {
    id: 'certificates',
    title: { zh: '证书', en: 'Certificates' },
    icon: '📜',
    enabled: false,
    order: 5,
    description: { zh: '专业证书与资质', en: 'Professional certificates' },
  },
  {
    id: 'selfEvaluation',
    title: { zh: '自我评价', en: 'Self Evaluation' },
    icon: '✍️',
    enabled: false,
    order: 6,
    description: { zh: '个人简介与求职意向', en: 'Personal summary' },
  },
  {
    id: 'custom',
    title: { zh: '自定义', en: 'Custom' },
    icon: '⚙️',
    enabled: false,
    order: 7,
    description: { zh: '自定义内容板块', en: 'Custom content sections' },
  },
]
