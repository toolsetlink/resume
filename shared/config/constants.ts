// 配置常量 - 自由简历项目
import type { BasicFieldType } from '#shared/types/resume'

// 默认字段顺序
export const DEFAULT_FIELD_ORDER: BasicFieldType[] = [
  { id: '1', key: 'name', label: '姓名', type: 'text', visible: true },
  { id: '2', key: 'title', label: '职位', type: 'text', visible: true },
  { id: '3', key: 'employementStatus', label: '状态', type: 'text', visible: true },
  { id: '4', key: 'birthDate', label: '生日', type: 'date', visible: true },
  { id: '5', key: 'email', label: '邮箱', type: 'text', visible: true },
  { id: '6', key: 'phone', label: '电话', type: 'text', visible: true },
  { id: '7', key: 'location', label: '所在地', type: 'text', visible: true },
]

// 本地存储 keys
export const STORAGE_KEYS = {
  RESUME: 'resume-storage',
} as const
