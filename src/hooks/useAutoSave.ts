'use client'

import { useState, useRef, useEffect } from 'react'
import { getPersistenceError, useResumeStore } from '@/stores/resume-store'

export function useAutoSave() {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubscribe = useResumeStore.subscribe(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      setIsSaving(true)
      setSaveError(null)
      saveTimer.current = setTimeout(() => {
        setIsSaving(false)
        const error = getPersistenceError()
        setSaveError(error)
        if (!error) setLastSavedAt(new Date())
      }, 1500)
    })
    return () => {
      unsubscribe()
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  return { isSaving, lastSavedAt, saveError }
}
