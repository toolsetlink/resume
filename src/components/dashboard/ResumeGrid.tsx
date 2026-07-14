'use client'

import type { ResumeData } from '@/shared/types/resume'
import { ResumeCard } from './ResumeCard'
import messages from '@/messages/zh.json'

const t = messages

const MAX_STAGGER_INDEX = 8

interface ResumeGridProps {
  resumes: ResumeData[]
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function ResumeGrid({ resumes, onDuplicate, onDelete }: ResumeGridProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      role="list"
      aria-label={t.resume.listLabel}
    >
      {resumes.map((resume, i) => {
        const delay = Math.min(i, MAX_STAGGER_INDEX) * 30
        return (
          <div
            key={resume.id}
            role="listitem"
            style={{
              animation: 'fade-in-up 0.4s ease-out both',
              animationDelay: `${delay}ms`,
            }}
          >
            <ResumeCard
              resume={resume}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
        )
      })}
    </div>
  )
}
