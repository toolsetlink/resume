'use client'

import { useMemo } from 'react'
import { Button } from 'antd'
import { ShieldCheck, Plus, LayoutTemplate } from 'lucide-react'
import { useRouter } from 'next/navigation'
import messages from '@/messages/zh.json'

const TAGS = ['React', 'TypeScript', 'Node.js', 'Vue', '团队管理']

export function HeroSection() {
  const t = messages
  const router = useRouter()

  const tags = useMemo(() => TAGS, [])

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
          <div className="fade-in-up text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))]/80 px-3.5 py-1.5 text-[12px] font-medium text-[hsl(var(--text-secondary))]">
              <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--brand))]" />
              {t.landing.hero.badge}
            </span>
            <h1 className="mt-7 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] text-[hsl(var(--text-primary))] sm:text-5xl lg:text-[4.5rem]">
              {t.landing.hero.title}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[19px] leading-relaxed text-[hsl(var(--text-secondary))] lg:mx-0">
              {t.landing.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button
                type="primary"
                size="large"
                className="!h-12 !px-7 !text-[15px] !font-medium"
                onClick={() => router.push('/dashboard')}
              >
                <Plus className="mr-1.5 h-[18px] w-[18px]" />
                {t.landing.hero.cta.create}
              </Button>
              <Button
                size="large"
                className="!h-12 !px-7 !text-[15px] !font-medium"
                onClick={() => {
                  document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <LayoutTemplate className="mr-1.5 h-[18px] w-[18px]" />
                {t.landing.hero.cta.templates}
              </Button>
            </div>
          </div>
          <div className="fade-in-up relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              className="rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] p-8 transition-shadow duration-200 hover:shadow-lg"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="flex items-center gap-4 border-b border-[hsl(var(--border-default))] pb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-[18px] font-bold text-white">
                  {t.landing.hero.preview.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[18px] font-semibold text-[hsl(var(--text-primary))]">
                    {t.landing.hero.preview.name}
                  </div>
                  <div className="text-[14px] text-[hsl(var(--text-secondary))]">
                    {t.landing.hero.preview.title}
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-5">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="space-y-2.5">
                    <div className="h-3 w-24 rounded bg-[hsl(var(--brand))] opacity-80" />
                    <div className="h-2 w-full rounded bg-[hsl(var(--bg-subtle))]" />
                    <div className="h-2 w-5/6 rounded bg-[hsl(var(--bg-subtle))]" />
                    <div className="h-2 w-4/6 rounded bg-[hsl(var(--bg-subtle))]" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[hsl(var(--bg-subtle))] px-3 py-1 text-[12px] font-medium text-[hsl(var(--text-primary))] transition-colors hover:bg-[hsl(var(--brand))] hover:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
