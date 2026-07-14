'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import messages from '@/messages/zh.json'
import { TEMPLATE_REGISTRY } from '@/components/templates/registry'
import { initialResumeState } from '@/shared/config/initialResumeData'
import type { ResumeData } from '@/shared/types/resume'

const A4_WIDTH = 794
const A4_HEIGHT = 1123
const PREVIEW_SCALE = 0.32
const PREVIEW_HEIGHT = 360

export function TemplatesSection() {
  const t = messages

  const sampleData = useMemo<ResumeData>(
    () => ({
      ...initialResumeState,
      id: 'preview-sample',
      title: '示例简历',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: null,
    }),
    [],
  )

  return (
    <section id="templates" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-[hsl(var(--text-primary))] sm:text-4xl">
            {t.landing.templatePreview.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[19px] leading-relaxed text-[hsl(var(--text-secondary))]">
            {t.landing.templatePreview.subtitle}
          </p>
        </div>
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATE_REGISTRY.map((entry) => {
            const { config, Component } = entry
            return (
              <div
                key={config.id}
                className="fade-in-up group flex flex-col overflow-hidden rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="relative overflow-hidden bg-[hsl(var(--bg-subtle))]"
                  style={{ height: `${PREVIEW_HEIGHT}px` }}
                >
                  <div
                    style={{
                      width: `${A4_WIDTH}px`,
                      height: `${A4_HEIGHT}px`,
                      transform: `scale(${PREVIEW_SCALE})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <Component data={sampleData} template={config} />
                  </div>
                  <Link
                    href="/dashboard/templates"
                    aria-label={t.landing.templatePreview.useThis}
                    className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  >
                    <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-[13px] font-medium text-[hsl(var(--text-primary))] shadow-sm">
                      {t.landing.templatePreview.useThis}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[16px] font-semibold text-[hsl(var(--text-primary))]">
                      {config.name}
                    </h3>
                    <div className="flex shrink-0 gap-1">
                      {[config.colorScheme.primary, config.colorScheme.secondary, config.colorScheme.text].map((c, i) => (
                        <span
                          key={i}
                          className="h-3 w-3 rounded-full border border-[hsl(var(--border-default))]"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[hsl(var(--text-secondary))]">
                    {config.description}
                  </p>
                  <Link
                    href="/dashboard/templates"
                    className="mt-4 inline-flex items-center gap-1 self-start text-[13px] font-medium text-[hsl(var(--brand))] transition-opacity hover:opacity-80"
                  >
                    {t.landing.templatePreview.useThis}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/dashboard/templates"
            className="text-[14px] font-medium text-[hsl(var(--brand))] underline-offset-4 hover:underline"
          >
            {(t.landing.templatePreview.learnMore ?? '').replace('{name}', t.nav.templates) || t.nav.templates}
          </Link>
        </div>
      </div>
    </section>
  )
}