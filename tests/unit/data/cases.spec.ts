import { describe, expect, it } from 'vitest'
import { RESUME_CASES, getResumeCase } from '@/data/cases'

describe('resume cases', () => {
  it('按唯一 id 找到静态案例，并对未知 id 返回 undefined', () => {
    const ids = RESUME_CASES.map(({ meta }) => meta.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(getResumeCase('fe-professional')?.meta.position).toBe('前端开发')
    expect(getResumeCase('missing-case')).toBeUndefined()
  })

  it('案例不继承默认人物信息，并且每个案例都有岗位专属解析', () => {
    expect(RESUME_CASES.every(({ resumeData }) => resumeData.basic.age === '')).toBe(true)
    expect(RESUME_CASES.every(({ resumeData }) => resumeData.basic.birthDate === '')).toBe(true)
    expect(RESUME_CASES.some(({ resumeData }) =>
      resumeData.education.some(({ school }) => school === '清华大学'),
    )).toBe(false)
    expect(RESUME_CASES.every(({ guide }) => guide?.overview.length === 2)).toBe(true)
    expect(RESUME_CASES.every(({ guide }) => Boolean(guide?.projectSelection))).toBe(true)
  })
})
