'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useResumeStore } from '@/stores/resume-store'
import { LandingHeader } from '@/components/home/LandingHeader'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ResumeGrid } from '@/components/dashboard/ResumeGrid'
import { EmptyState } from '@/components/dashboard/EmptyState'

export default function DashboardPage() {
  const router = useRouter()
  const resumes = useResumeStore(s => s.resumes)
  const createResume = useResumeStore(s => s.createResume)
  const deleteResume = useResumeStore(s => s.deleteResume)
  const duplicateResume = useResumeStore(s => s.duplicateResume)
  const initialize = useResumeStore(s => s.initialize)

  // 挂载时从 localStorage 恢复数据，只跑一次。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { initialize() }, [])

  const sortedResumes = useMemo(
    () => [...resumes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [resumes]
  )

  const handleCreate = () => {
    const r = createResume()
    router.push(`/workbench?id=${r.id}`)
  }

  const handleDelete = (id: string) => {
    deleteResume(id)
  }

  const handleDuplicate = (id: string) => {
    duplicateResume(id)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-base))]">
      <LandingHeader showAnchorLinks={false} />
      <div className="px-6 max-w-6xl mx-auto py-8">
        <DashboardHeader count={sortedResumes.length} onCreate={handleCreate} />
        {sortedResumes.length > 0 ? (
          <ResumeGrid
            resumes={sortedResumes}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState onCreate={handleCreate} />
        )}
      </div>
    </div>
  )
}
