import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useItemSaveStatus } from '@/hooks/useItemSaveStatus'

describe('useItemSaveStatus', () => {
  afterEach(() => { vi.useRealTimers() })

  it('starts with idle status', () => {
    const { result } = renderHook(() => useItemSaveStatus())
    expect(result.current.status).toBe('idle')
  })

  it('transitions to saving then saved', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useItemSaveStatus())
    act(() => { result.current.markSaving() })
    expect(result.current.status).toBe('saving')
    act(() => { vi.advanceTimersByTime(400) })
    expect(result.current.status).toBe('saved')
    act(() => { vi.advanceTimersByTime(1500) })
    expect(result.current.status).toBe('idle')
  })
})
