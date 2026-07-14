'use client'

import { FileText } from 'lucide-react'
import messages from '@/messages/zh.json'

export function Footer() {
  const t = messages

  return (
    <footer className="border-t border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))]/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[hsl(var(--brand))] text-[hsl(var(--text-inverse))]"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <FileText className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold text-[hsl(var(--text-primary))]">
              {t.common.appName}
            </span>
          </div>
        </div>
        <div className="mt-8 border-t border-[hsl(var(--border-default))]/50 pt-8 text-center">
          <p className="text-[13px] text-[hsl(var(--text-secondary))]">{t.landing.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
