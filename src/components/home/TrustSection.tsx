'use client'

import { ShieldCheck, FileText, Sparkles, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TrustItem {
  key: string
  icon: LucideIcon
}

const trustItems: TrustItem[] = [
  { key: 'free', icon: FileText },
  { key: 'privacy', icon: ShieldCheck },
  { key: 'ai', icon: Sparkles },
  { key: 'export', icon: Globe },
]

export function TrustSection() {
  const t = useTranslations()

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.key} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))]">
                <item.icon className="h-[22px] w-[22px]" />
              </div>
              <div className="text-[13px] font-medium text-[hsl(var(--text-secondary))]">
                {t(`landing.trust.${item.key}`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
