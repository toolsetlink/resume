'use client'

import { useState, useRef, useEffect } from 'react'
import { useResumeStore } from '@/stores/resume-store'

export function useAutoSave() {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubscribe = useResumeStore.subscribe(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      setIsSaving(true)
      saveTimer.current = setTimeout(() => {
        setIsSaving(false)
        setLastSavedAt(new Date())
      }, 1500)
    })
    return () => {
      unsubscribe()
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  return { isSaving, lastSavedAt }
}
