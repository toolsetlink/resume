'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import messages from '@/messages/zh.json'
import {
  RESUME_CASES,
  INDUSTRY_OPTIONS,
  EXPERIENCE_OPTIONS,
} from '@/data/cases'
import type { ResumeCase } from '@/shared/types/case'
import { useResumeStore } from '@/stores/resume-store'
import { MiniTemplatePreview } from '@/components/workbench/MiniTemplatePreview'

const t = messages

export function CasesSection() {
  const router = useRouter()
  const createResumeFromCase = useResumeStore((s) => s.createResumeFromCase)
  const [industry, setIndustry] = useState<string>('全部')
  const [experience, setExperience] = useState<string>('全部')

  const filtered = useMemo<ResumeCase[]>(
    () =>
      RESUME_CASES.filter(
        (c) =>
          (industry === '全部' || c.meta.industry === industry) &&
          (experience === '全部' || c.meta.experienceLevel === experience),
      ),
    [industry, experience],
  )

  const handleUseCase = (caseData: ResumeCase) => {
    const resume = createResumeFromCase(caseData)
    router.push(`/workbench?id=${resume.id}`)
  }

  return (
    <section id="cases" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-[hsl(var(--text-primary))] sm:text-4xl">
            {t.landing.cases.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[19px] leading-relaxed text-[hsl(var(--text-secondary))]">
            {t.landing.cases.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          <FilterRow
            label={t.landing.cases.filter.industry}
            options={INDUSTRY_OPTIONS}
            value={industry}
            onChange={setIndustry}
          />
          <FilterRow
            label={t.landing.cases.filter.experience}
            options={EXPERIENCE_OPTIONS}
            value={experience}
            onChange={setExperience}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-[15px] text-[hsl(var(--text-tertiary))]">
            {t.landing.cases.empty}
          </p>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((caseData) => (
              <CaseCard
                key={caseData.meta.id}
                caseData={caseData}
                onUse={() => handleUseCase(caseData)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

interface FilterRowProps {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

function FilterRow({ label, options, value, onChange }: FilterRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[13px] font-medium text-[hsl(var(--text-tertiary))]">
        {label}
      </span>
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={
              active
                ? 'rounded-full bg-[hsl(var(--brand))] px-4 py-1.5 text-[13px] font-medium text-white transition-colors'
                : 'rounded-full border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] px-4 py-1.5 text-[13px] font-medium text-[hsl(var(--text-secondary))] transition-colors hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))]'
            }
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

interface CaseCardProps {
  caseData: ResumeCase
  onUse: () => void
}

function CaseCard({ caseData, onUse }: CaseCardProps) {
  const { meta, resumeData } = caseData
  return (
    <div className="group flex flex-col overflow-hidden rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <MiniTemplatePreview
        templateId={meta.templateId}
        sampleData={resumeData}
        width={220}
        visibleHeight={320}
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[16px] font-semibold text-[hsl(var(--text-primary))]">
          {meta.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[hsl(var(--text-secondary))]">
          {meta.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Tag>{meta.industry}</Tag>
          <Tag>{meta.position}</Tag>
          <Tag>{meta.experienceLevel}</Tag>
        </div>
        <button
          type="button"
          onClick={onUse}
          className="mt-4 inline-flex items-center gap-1 self-start text-[13px] font-medium text-[hsl(var(--brand))] transition-opacity hover:opacity-80"
        >
          {t.landing.cases.useThis}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-[hsl(var(--bg-subtle))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--text-secondary))]">
      {children}
    </span>
  )
}
