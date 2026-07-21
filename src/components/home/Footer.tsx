'use client'

import Image from 'next/image'
import messages from '@/messages/zh.json'

export function Footer() {
  const t = messages

  return (
    <footer className="border-t border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))]/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Image
            src="/logo-lockup.png"
            alt={t.common.appName}
            width={121}
            height={28}
            className="h-7 w-auto"
          />
        </div>
        <div className="mt-8 border-t border-[hsl(var(--border-default))]/50 pt-8 text-center">
          <p className="text-[13px] text-[hsl(var(--text-secondary))]">{t.landing.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
