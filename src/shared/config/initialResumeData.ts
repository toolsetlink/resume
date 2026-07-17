// 初始简历数据 - 自由简历项目
import { DEFAULT_FIELD_ORDER } from './constants'
import {
  DEFAULT_PHOTO_CONFIG,
  type GlobalSettings,
  type MenuSection,
  type ResumeData,
} from '@/shared/types/resume'

// 初始全局设置
export const initialGlobalSettings: GlobalSettings = {
  baseFontSize: 16,
  pagePadding: 32,
  paragraphSpacing: 12,
  lineHeight: 1.5,
  sectionSpacing: 10,
  headerSize: 18,
  subheaderSize: 16,
  useIconMode: true,
  themeColor: '#000000',
  fontFamily: 'template',
  headerAlignment: 'template',
}

// 中文初始简历数据（示例）
export const initialResumeState: Omit<ResumeData, 'id' | 'createdAt' | 'updatedAt' | 'templateId'> = {
  title: '新建简历',
  basic: {
    name: '李明',
    title: '高级前端工程师',
    employementStatus: '在职',
    email: 'liming@example.com',
    phone: '13800138000',
    location: '北京市海淀区',
    birthDate: '1995-03',
    age: '28',
    fieldOrder: DEFAULT_FIELD_ORDER,
    icons: {
      email: 'Mail',
      phone: 'Phone',
      birthDate: 'CalendarRange',
      employementStatus: 'Briefcase',
      location: 'MapPin',
    },
    photoConfig: DEFAULT_PHOTO_CONFIG,
    customFields: [
      { id: 'personal-website', label: '个人网站', value: '' },
    ],
    photo: '',
  },
  education: [
    {
      id: '1',
      school: '清华大学',
      major: '计算机科学与技术',
      degree: '本科',
      startDate: '2013-09',
      endDate: '2017-06',
      visible: true,
      gpa: '',
      description:
        '<ul><li>主修课程：数据结构、算法设计、操作系统、计算机网络</li><li>专业排名前 10%</li></ul>',
    },
  ],
  skillContent:
    '<ul><li>前端框架：Vue、React，熟悉 Nuxt、Next.js</li><li>开发语言：TypeScript、JavaScript(ES6+)</li><li>UI 样式：Tailwind CSS、Sass</li><li>工程化：Vite、Webpack、ESLint</li></ul>',
  skills: [
    {
      id: 's1',
      name: '前端框架',
      level: 0,
      details: '<ul><li>Vue、React，熟悉 Nuxt、Next.js</li></ul>',
      visible: true,
    },
    {
      id: 's2',
      name: '开发语言',
      level: 0,
      details: '<ul><li>TypeScript、JavaScript(ES6+)</li></ul>',
      visible: true,
    },
    {
      id: 's3',
      name: 'UI 样式',
      level: 0,
      details: '<ul><li>Tailwind CSS、Sass</li></ul>',
      visible: true,
    },
    {
      id: 's4',
      name: '工程化',
      level: 0,
      details: '<ul><li>Vite、Webpack、ESLint</li></ul>',
      visible: true,
    },
  ],
  selfEvaluationContent: '',
  certificatesContent: '',
  experience: [
    {
      id: '1',
      company: '某科技公司',
      position: '前端工程师',
      date: '2017.07 - 至今',
      visible: true,
      details:
        '<ul><li>负责公司核心产品的前端开发</li><li>优化性能，首屏加载提升 40%</li></ul>',
    },
  ],
  draggingProjectId: null,
  projects: [
    {
      id: 'p1',
      name: '企业中台系统',
      role: '前端负责人',
      date: '2020.06 - 2023.12',
      description:
        '<ul><li>基于 Vue 3 + TypeScript 开发</li><li>组件库设计，复用率提升 60%</li></ul>',
      visible: true,
    },
  ],
  menuSections: [
    { id: 'basic', title: '基本信息', icon: '👤', enabled: true, order: 0, region: 'main' },
    { id: 'skills', title: '专业技能', icon: '⚡', enabled: true, order: 1, region: 'sidebar' },
    { id: 'experience', title: '工作经验', icon: '💼', enabled: true, order: 2, region: 'main' },
    { id: 'projects', title: '项目经历', icon: '🚀', enabled: true, order: 3, region: 'main' },
    { id: 'education', title: '教育经历', icon: '🎓', enabled: true, order: 4, region: 'sidebar' },
  ],
  certificates: [],
  customData: {},
  customSectionTitles: {},
  activeSection: 'basic',
  globalSettings: initialGlobalSettings,
}

// 空白简历默认模块列表（全部 8 个模块，前 5 个默认开启，后 3 个默认关闭）
export const DEFAULT_MENU_SECTIONS: MenuSection[] = [
  { id: 'basic', title: '基本信息', icon: '👤', enabled: true, order: 0, region: 'main' },
  { id: 'skills', title: '专业技能', icon: '⚡', enabled: true, order: 1, region: 'sidebar' },
  { id: 'experience', title: '工作经验', icon: '💼', enabled: true, order: 2, region: 'main' },
  { id: 'projects', title: '项目经历', icon: '🚀', enabled: true, order: 3, region: 'main' },
  { id: 'education', title: '教育经历', icon: '🎓', enabled: true, order: 4, region: 'sidebar' },
  { id: 'certificates', title: '证书', icon: '📜', enabled: false, order: 5, region: 'sidebar' },
  { id: 'selfEvaluation', title: '自我评价', icon: '✍️', enabled: false, order: 6, region: 'main' },
  { id: 'custom', title: '自定义', icon: '⚙️', enabled: false, order: 7, region: 'main' },
]

// 空白简历（用于新建）
export const blankResumeState = {
  ...initialResumeState,
  title: '新建简历',
  basic: {
    ...initialResumeState.basic,
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    birthDate: '',
    employementStatus: '',
    photo: '',
    customFields: [],
  },
  education: [],
  skillContent: '',
  skills: [],
  selfEvaluationContent: '',
  certificatesContent: '',
  experience: [],
  projects: [],
  certificates: [],
  customSectionTitles: {},
  menuSections: DEFAULT_MENU_SECTIONS,
}

// 创建新简历的工厂函数
export function createNewResume(title: string = '新建简历'): ResumeData {
  const now = new Date().toISOString()
  // blankResumeState 中已包含 title 字段，这里显式覆盖
  return {
    ...structuredClone(blankResumeState),
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    templateId: null,
  }
}
