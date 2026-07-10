'use client'

import { useState, useRef, useEffect } from 'react'

export function useItemSaveStatus() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const savingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const markSaving = () => {
    if (savedTimer.current) { clearTimeout(savedTimer.current); savedTimer.current = null }
    setStatus('saving')
    if (savingTimer.current) clearTimeout(savingTimer.current)
    savingTimer.current = setTimeout(() => {
      setStatus('saved')
      savingTimer.current = null
      savedTimer.current = setTimeout(() => { setStatus('idle'); savedTimer.current = null }, 1500)
    }, 400)
  }

  useEffect(() => {
    return () => {
      if (savingTimer.current) clearTimeout(savingTimer.current)
      if (savedTimer.current) clearTimeout(savedTimer.current)
    }
  }, [])

  return { status, markSaving }
}
