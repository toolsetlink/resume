'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ResumeCase } from '@/shared/types/case'
import { MiniTemplatePreview } from '@/components/workbench/MiniTemplatePreview'

interface CaseCardProps {
  caseData: ResumeCase
  onUse: () => void
}

export function CaseCard({ caseData, onUse }: CaseCardProps) {
  const { meta, resumeData } = caseData

  return (
    <article className="group flex flex-col overflow-hidden rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/cases/${meta.id}`} aria-label={`查看${meta.title}详情`}>
        <MiniTemplatePreview
          templateId={meta.templateId}
          sampleData={resumeData}
          cropRatio={0.5}
          ariaHidden
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[16px] font-semibold text-[hsl(var(--text-primary))]">
          <Link href={`/cases/${meta.id}`} className="hover:text-[hsl(var(--brand))]">
            {meta.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[hsl(var(--text-secondary))]">
          {meta.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Tag>{meta.industry}</Tag>
          <Tag>{meta.position}</Tag>
          <Tag>{meta.experienceLevel}</Tag>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href={`/cases/${meta.id}`}
            className="text-[13px] font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--brand))]"
          >
            查看解析
          </Link>
          <button
            type="button"
            onClick={onUse}
            className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-medium text-[hsl(var(--brand))] transition-opacity hover:opacity-80 active:translate-y-px"
          >
            使用此案例
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-[hsl(var(--bg-subtle))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--text-secondary))]">
      {children}
    </span>
  )
}
