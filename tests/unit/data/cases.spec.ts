import { describe, expect, it } from 'vitest'
import { RESUME_CASES, getResumeCase } from '@/data/cases'

describe('resume cases', () => {
  it('按唯一 id 找到静态案例，并对未知 id 返回 undefined', () => {
    const ids = RESUME_CASES.map(({ meta }) => meta.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(getResumeCase('fe-professional')?.meta.position).toBe('前端开发')
    expect(getResumeCase('missing-case')).toBeUndefined()
  })
})
