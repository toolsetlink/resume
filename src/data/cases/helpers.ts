import type { ResumeCase, ResumeCaseGuide, ResumeCaseMeta } from '@/shared/types/case'
import type { ResumeData } from '@/shared/types/resume'
import { blankResumeState } from '@/shared/config/initialResumeData'

// createResumeFromCase(store) 会在创建新简历时覆盖 id/createdAt/updatedAt,
// 这里只放占位值,保证类型满足 ResumeData。
const PLACEHOLDER_TIMESTAMP = '2026-07-14T00:00:00.000Z'

export function buildCase(
  meta: ResumeCaseMeta,
  overrides: Partial<ResumeData> = {},
  guide?: ResumeCaseGuide,
): ResumeCase {
  return {
    meta,
    resumeData: {
      ...blankResumeState,
      id: `case-${meta.id}`,
      createdAt: PLACEHOLDER_TIMESTAMP,
      updatedAt: PLACEHOLDER_TIMESTAMP,
      templateId: meta.templateId,
      ...overrides,
    },
    guide,
  }
}
