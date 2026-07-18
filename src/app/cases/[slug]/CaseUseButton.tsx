'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import type { ResumeCase } from '@/shared/types/case'
import { useResumeStore } from '@/stores/resume-store'

export function CaseUseButton({ caseData }: { caseData: ResumeCase }) {
  const router = useRouter()
  const createResumeFromCase = useResumeStore((state) => state.createResumeFromCase)

  return (
    <button
      type="button"
      onClick={() => {
        const resume = createResumeFromCase(caseData)
        router.push(`/workbench?id=${resume.id}`)
      }}
      className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-[hsl(var(--brand))] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[hsl(var(--brand-hover))] active:translate-y-px"
    >
      使用此案例
      <ArrowRight className="h-4 w-4" />
    </button>
  )
}
