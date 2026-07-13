'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import messages from '@/messages/zh.json'

const faqKeys = ['free', 'privacy', 'export'] as const

export function FAQSection() {
  const t = messages
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-[hsl(var(--text-primary))] sm:text-4xl">
            {t.landing.faq.title}
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqKeys.map((key, idx) => (
            <div
              key={key}
              className="overflow-hidden rounded-[16px] border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] transition-all duration-300 hover:border-[hsl(var(--border-default))]"
              style={{ boxShadow: openIndex === idx ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}
            >
              <button
                className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left transition-colors duration-200 hover:bg-[hsl(var(--bg-subtle))]/40"
                aria-expanded={openIndex === idx}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="text-[16px] font-medium text-[hsl(var(--text-primary))]">
                  {t.landing.faq.items[key].q}
                </span>
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--bg-subtle))] transition-all duration-300 ${
                    openIndex === idx
                      ? 'rotate-180 bg-[hsl(var(--brand))] text-[hsl(var(--text-inverse))]'
                      : 'text-[hsl(var(--text-secondary))]'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ${openIndex === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-[15px] leading-[1.6] text-[hsl(var(--text-secondary))]">
                    {t.landing.faq.items[key].a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
