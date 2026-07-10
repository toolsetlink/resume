'use client'

import { useCallback } from 'react'
import { Button } from 'antd'
import { Plus } from 'lucide-react'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import type { Experience } from '@/shared/types/resume'
import { ExperienceItem } from './ExperienceItem'

export function ExperiencePanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore((s) => s.activeResumeId)
  const addExperience = useResumeStore((s) => s.addExperience)
  const updateExperience = useResumeStore((s) => s.updateExperience)
  const removeExperience = useResumeStore((s) => s.removeExperience)

  const experiences = (activeResume?.experience || []).filter(
    (e) => e.visible !== false
  )

  const handleAdd = useCallback(() => {
    if (!activeResumeId) return
    addExperience(activeResumeId, {
      company: '',
      position: '',
      date: '',
      details: '',
      visible: true,
    })
  }, [activeResumeId, addExperience])

  const handleChange = useCallback(
    (id: string, data: Partial<Experience>) => {
      if (!activeResumeId) return
      updateExperience(activeResumeId, id, data)
    },
    [activeResumeId, updateExperience]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!activeResumeId) return
      removeExperience(activeResumeId, id)
    },
    [activeResumeId, removeExperience]
  )

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-base font-medium">工作经历</h3>
      <div className="space-y-3">
        {experiences.map((exp) => (
          <ExperienceItem
            key={exp.id}
            item={exp}
            onChange={handleChange}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <Button
        type="dashed"
        block
        onClick={handleAdd}
        icon={<Plus className="w-4 h-4" />}
      >
        添加工作经历
      </Button>
    </div>
  )
}
