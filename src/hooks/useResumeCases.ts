'use client'

import { useState, useCallback } from 'react'
import type { ResumeCaseManifestEntry, ResumeCase } from '@/shared/types/case'

export function useResumeCases() {
  const [manifest, setManifest] = useState<ResumeCaseManifestEntry[]>([])
  const [loading, setLoading] = useState(false)

  const loadManifest = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/cases/index.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setManifest(await res.json())
    } catch (e) {
      console.error('[useResumeCases] Failed to load manifest:', e)
      setManifest([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCase = useCallback(async (path: string): Promise<ResumeCase | null> => {
    try {
      const res = await fetch(path)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (e) {
      console.error('[useResumeCases] Failed to load case:', e)
      return null
    }
  }, [])

  return { manifest, loading, loadManifest, loadCase }
}
