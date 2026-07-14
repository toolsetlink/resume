import { describe, it, expect } from 'vitest'
import { splitDateRange, joinDateRange } from '@/components/editor/MonthRangePicker'

describe('splitDateRange', () => {
  it('returns empty pair for empty input', () => {
    expect(splitDateRange('')).toEqual({ start: '', end: '' })
    expect(splitDateRange(undefined)).toEqual({ start: '', end: '' })
  })

  it('splits canonical "2020.06 - 2023.12" format', () => {
    expect(splitDateRange('2020.06 - 2023.12')).toEqual({ start: '2020.06', end: '2023.12' })
  })

  it('splits with 至今 marker', () => {
    expect(splitDateRange('2020.06 - 至今')).toEqual({ start: '2020.06', end: '至今' })
  })

  it('splits year-only range "2020-2023" via bare-dash fallback', () => {
    expect(splitDateRange('2020-2023')).toEqual({ start: '2020', end: '2023' })
  })

  it('keeps single value as start when no separator', () => {
    expect(splitDateRange('2020.06')).toEqual({ start: '2020.06', end: '' })
  })

  it('handles Chinese 至 separator', () => {
    expect(splitDateRange('2020.06 至 2023.12')).toEqual({ start: '2020.06', end: '2023.12' })
  })

  it('preserves legacy dash-separated "2020-06" as single start (not split on inner dash)', () => {
    expect(splitDateRange('2020-06')).toEqual({ start: '2020-06', end: '' })
  })
})

describe('joinDateRange', () => {
  it('returns empty when both empty', () => {
    expect(joinDateRange('', '')).toBe('')
  })

  it('joins start and end with " - "', () => {
    expect(joinDateRange('2020.06', '2023.12')).toBe('2020.06 - 2023.12')
  })

  it('preserves 至今 marker when present', () => {
    expect(joinDateRange('2020.06', '至今')).toBe('2020.06 - 至今')
  })

  it('returns just start when end empty', () => {
    expect(joinDateRange('2020.06', '')).toBe('2020.06')
  })
})
