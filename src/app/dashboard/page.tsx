'use client'

import { useEffect } from 'react'
import { Button } from 'antd'
import { Plus, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import messages from '@/messages/zh.json'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { LandingHeader } from '@/components/home/LandingHeader'

const t = messages

export default function DashboardPage() {
  const router = useRouter()
  const resumes = useResumeStore(s => s.resumes)
  const createResume = useResumeStore(s => s.createResume)
  const deleteResume = useResumeStore(s => s.deleteResume)
  const duplicateResume = useResumeStore(s => s.duplicateResume)
  const initialize = useResumeStore(s => s.initialize)

  useEffect(() => { initialize() }, [])

  const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

  const handleCreate = () => {
    const r = createResume()
    router.push(`/workbench?id=${r.id}`)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-base))]">
      <LandingHeader />
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t.nav.dashboard}</h1>
          <Button type="primary" onClick={handleCreate}><Plus className="w-4 h-4 mr-1" />{t.resume.create}</Button>
        </div>
        {resumes.length > 0 ? (
          <div className="border border-[hsl(var(--border-default))] rounded-lg overflow-hidden">
            {resumes.map(resume => (
              <div key={resume.id} className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border-default))] last:border-b-0 hover:bg-[hsl(var(--brand-light))] transition-colors duration-150 cursor-pointer group" onClick={() => router.push(`/workbench?id=${resume.id}`)}>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-[hsl(var(--text-primary))] truncate">{resume.title}</div>
                  <div className="text-[13px] text-[hsl(var(--text-tertiary))] mt-0.5">{t.common.edit} {formatDate(resume.updatedAt)}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150" onClick={e => e.stopPropagation()}>
                  <Button type="link" size="small" onClick={() => router.push(`/workbench?id=${resume.id}`)}>{t.common.edit}</Button>
                  <Button type="link" size="small" onClick={() => duplicateResume(resume.id)}>{t.common.duplicate}</Button>
                  <Button type="link" danger size="small" onClick={() => deleteResume(resume.id)}>{t.common.delete}</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--text-tertiary))]" />
            <p className="text-[hsl(var(--text-tertiary))] mb-4">{t.resume.empty}</p>
            <Button type="primary" size="large" onClick={handleCreate}><Plus className="w-4 h-4 mr-1" />{t.resume.create}</Button>
          </div>
        )}
      </div>
    </div>
  )
}