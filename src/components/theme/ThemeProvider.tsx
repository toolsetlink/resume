'use client'

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react'

interface ThemeContextValue {
  theme: string
  setTheme: (next: string) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const THEME_STORAGE_KEY = 'ziyou-resume-theme'
export const DEFAULT_THEME = 'light'

function applyThemeToHtml(theme: string): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

function readStoredTheme(): string {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getServerSnapshot(): string {
  return DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readStoredTheme, getServerSnapshot)

  const setTheme = useCallback((next: string) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // ignore storage failures (private mode, quota exceeded, etc.)
    }
    applyThemeToHtml(next)
    window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: next }))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (ctx) return ctx
  return { theme: DEFAULT_THEME, setTheme: () => {} }
}