import type { ResumeCase } from '@/shared/types/case'

import { case01 } from './case-01-fe-professional'
import { case02 } from './case-02-pm-professional'
import { case03 } from './case-03-be-modern'
import { case04 } from './case-04-da-modern'
import { case05 } from './case-05-ops-elegant'
import { case06 } from './case-06-mkt-elegant'
import { case07 } from './case-07-ui-creative'
import { case08 } from './case-08-nm-creative'

export const RESUME_CASES: ResumeCase[] = [
  case01,
  case02,
  case03,
  case04,
  case05,
  case06,
  case07,
  case08,
]

// 筛选选项从 8 个 case 的 meta 中动态 derive,避免文案硬编码。
export const INDUSTRY_OPTIONS: string[] = [
  '全部',
  ...Array.from(new Set(RESUME_CASES.map((c) => c.meta.industry))),
]

export const EXPERIENCE_OPTIONS: string[] = [
  '全部',
  ...Array.from(new Set(RESUME_CASES.map((c) => c.meta.experienceLevel))),
]
