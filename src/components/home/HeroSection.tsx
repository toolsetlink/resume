'use client'

import { Button } from 'antd'
import { ShieldCheck, Plus, LayoutTemplate } from 'lucide-react'
import { useRouter } from 'next/navigation'
import messages from '@/messages/zh.json'
import { case01 } from '@/data/cases/case-01-fe-professional'
import { MiniTemplatePreview } from '@/components/workbench/MiniTemplatePreview'

export function HeroSection() {
  const t = messages
  const router = useRouter()

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
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
          <div className="fade-in-up relative mx-auto min-w-0 w-full max-w-full sm:max-w-lg lg:max-w-none">
            <div
              className="overflow-hidden rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-white transition-shadow duration-200 hover:shadow-lg"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <MiniTemplatePreview
                templateId={case01.meta.templateId}
                sampleData={case01.resumeData}
                cropRatio={0.58}
                ariaHidden
              />
            </div>
            <p className="mt-3 text-center text-[12px] text-[hsl(var(--text-tertiary))]">真实简历案例预览</p>
          </div>
        </div>
      </div>
    </section>
  )
}
