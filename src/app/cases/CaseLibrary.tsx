'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { CaseCard } from '@/components/cases/CaseCard'
import { EXPERIENCE_OPTIONS, INDUSTRY_OPTIONS, RESUME_CASES } from '@/data/cases'
import { useResumeStore } from '@/stores/resume-store'

export function CaseLibrary() {
  const router = useRouter()
  const createResumeFromCase = useResumeStore((state) => state.createResumeFromCase)
  const [query, setQuery] = useState('')
  const [industry, setIndustry] = useState('全部')
  const [experience, setExperience] = useState('全部')

  const filteredCases = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return RESUME_CASES.filter(({ meta }) => {
      const matchesQuery = !keyword || [meta.title, meta.description, meta.position, meta.industry]
        .some((value) => value.toLowerCase().includes(keyword))

      return matchesQuery
        && (industry === '全部' || meta.industry === industry)
        && (experience === '全部' || meta.experienceLevel === experience)
    })
  }, [experience, industry, query])

  return (
    <section className="pb-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[12px] border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] p-5 sm:p-6">
          <label htmlFor="case-search" className="text-[13px] font-medium text-[hsl(var(--text-primary))]">
            搜索案例
          </label>
          <div className="relative mt-2 max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
            <input
              id="case-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入职位、行业或案例名称"
              className="h-11 w-full rounded-[8px] border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-base))] pl-10 pr-4 text-[14px] text-[hsl(var(--text-primary))] outline-none transition-colors placeholder:text-[hsl(var(--text-tertiary))] focus:border-[hsl(var(--brand))] focus:ring-2 focus:ring-[hsl(var(--brand))]/15"
            />
          </div>

          <div className="mt-5 space-y-3">
            <FilterRow label="行业" options={INDUSTRY_OPTIONS} value={industry} onChange={setIndustry} />
            <FilterRow label="经验" options={EXPERIENCE_OPTIONS} value={experience} onChange={setExperience} />
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">全部简历案例</h2>
            <p className="mt-1 text-[14px] text-[hsl(var(--text-secondary))]">共 {filteredCases.length} 个可直接使用的案例</p>
          </div>
        </div>

        {filteredCases.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCases.map((caseData) => (
              <CaseCard
                key={caseData.meta.id}
                caseData={caseData}
                onUse={() => {
                  const resume = createResumeFromCase(caseData)
                  router.push(`/workbench?id=${resume.id}`)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[12px] border border-dashed border-[hsl(var(--border-default))] px-6 py-16 text-center">
            <p className="text-[15px] font-medium text-[hsl(var(--text-primary))]">没有找到匹配的案例</p>
            <p className="mt-1 text-[13px] text-[hsl(var(--text-secondary))]">换一个职位关键词或清除筛选条件</p>
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
  onChange: (value: string) => void
}

function FilterRow({ label, options, value, onChange }: FilterRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 w-8 text-[13px] font-medium text-[hsl(var(--text-secondary))]">{label}</span>
      {options.map((option) => {
        const active = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={active
              ? 'rounded-full bg-[hsl(var(--brand))] px-3.5 py-1.5 text-[13px] font-medium text-white'
              : 'rounded-full border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-base))] px-3.5 py-1.5 text-[13px] font-medium text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))]'}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
