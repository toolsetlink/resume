// 简历数据类型定义 - 自由简历项目

// 照片配置
export interface PhotoConfig {
  width: number
  height: number
  aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | 'custom'
  borderRadius: 'none' | 'medium' | 'full' | 'custom'
  customBorderRadius: number
  visible: boolean
}

// 基本信息字段顺序定义
export interface BasicFieldType {
  id: string
  key: keyof BasicInfo
  label: string
  type: 'date' | 'textarea' | 'text' | 'editor'
  visible: boolean
  custom?: boolean
}

// 自定义字段
export interface CustomFieldType {
  id: string
  label: string
  value: string
  icon?: string
  visible?: boolean
  custom?: boolean
  displayLabel?: boolean
}

// 基本信息
export interface BasicInfo {
  birthDate: string
  name: string
  title: string
  email: string
  phone: string
  location: string
  icons: Record<string, string>
  employementStatus: string
  photo: string
  photoConfig: PhotoConfig
  fieldOrder?: BasicFieldType[]
  customFields: CustomFieldType[]
  layout?: 'left' | 'center' | 'right'
  age?: string
}

// 教育经历
export interface Education {
  id: string
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
  gpa?: string
  description?: string
  visible?: boolean
}

// 工作经历
export interface Experience {
  id: string
  company: string
  position: string
  date: string
  details: string
  visible?: boolean
}

// 技能
export interface Skill {
  id: string
  name: string          // 技能分类名称，如"前端框架"
  level: number         // 保留字段，0-100，默认 0 表示不显示
  details: string       // 富文本 HTML 详情
  visible: boolean      // 是否显示
}

// 项目经历
export interface Project {
  id: string
  name: string
  role: string
  date: string
  description: string
  visible: boolean
  link?: string
  linkLabel?: string
}

// 证书
export interface Certificate {
  id: string
  url: string
  width: number
}

// 全局设置
export interface GlobalSettings {
  themeColor?: string
  fontFamily?: string
  baseFontSize?: number
  pagePadding?: number
  paragraphSpacing?: number
  lineHeight?: number
  sectionSpacing?: number
  headerSize?: number
  subheaderSize?: number
  useIconMode?: boolean
  centerSubtitle?: boolean
  flexibleHeaderLayout?: boolean
  autoOnePage?: boolean
}

// 简历主题
export interface ResumeTheme {
  id: string
  name: string
  color: string
}

// 自定义条目
export interface CustomItem {
  id: string
  title: string
  subtitle: string
  dateRange: string
  description: string
  visible: boolean
}

// 菜单模块
export interface MenuSection {
  id: string
  title: string
  icon: string
  enabled: boolean
  order: number
}

// 简历数据主结构
export interface ResumeData {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  templateId: string | null
  basic: BasicInfo
  education: Education[]
  experience: Experience[]
  projects: Project[]
  certificates: Certificate[]
  certificatesContent: string
  customData: Record<string, CustomItem[]>
  skillContent: string
  skills: Skill[]
  selfEvaluationContent: string
  activeSection: string
  draggingProjectId: string | null
  menuSections: MenuSection[]
  globalSettings: GlobalSettings
}

// 默认照片配置
export const DEFAULT_PHOTO_CONFIG: PhotoConfig = {
  width: 90,
  height: 120,
  aspectRatio: '1:1',
  borderRadius: 'none',
  customBorderRadius: 0,
  visible: true,
}

// 主题色预设
export const THEME_COLORS = [
  '#000000',
  '#1A1A1A',
  '#333333',
  '#4D4D4D',
  '#666666',
  '#808080',
  '#999999',
  '#0047AB',
  '#8B0000',
  '#FF4500',
  '#4B0082',
  '#2E8B57',
]

// 照片比例计算
export const getRatioMultiplier = (ratio: PhotoConfig['aspectRatio']): number => {
  switch (ratio) {
    case '4:3':
      return 3 / 4
    case '3:4':
      return 4 / 3
    case '16:9':
      return 9 / 16
    default:
      return 1
  }
}

// 照片圆角值
export const getBorderRadiusValue = (config?: PhotoConfig): string => {
  if (!config) return '0'
  switch (config.borderRadius) {
    case 'medium':
      return '0.5rem'
    case 'full':
      return '9999px'
    case 'custom':
      return `${config.customBorderRadius}px`
    default:
      return '0'
  }
}
