'use client'

import { useCallback } from 'react'
import { Button } from 'antd'
import { Plus } from 'lucide-react'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import type { Education } from '@/shared/types/resume'
import { EducationItem } from './EducationItem'

export function EducationPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore((s) => s.activeResumeId)
  const addEducation = useResumeStore((s) => s.addEducation)
  const updateEducation = useResumeStore((s) => s.updateEducation)
  const removeEducation = useResumeStore((s) => s.removeEducation)

  const educationItems = (activeResume?.education || []).filter(
    (e) => e.visible !== false
  )

  const handleAdd = useCallback(() => {
    if (!activeResumeId) return
    addEducation(activeResumeId, {
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
      visible: true,
    })
  }, [activeResumeId, addEducation])

  const handleChange = useCallback(
    (id: string, data: Partial<Education>) => {
      if (!activeResumeId) return
      updateEducation(activeResumeId, id, data)
    },
    [activeResumeId, updateEducation]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!activeResumeId) return
      removeEducation(activeResumeId, id)
    },
    [activeResumeId, removeEducation]
  )

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-base font-medium">教育经历</h3>
      <div className="space-y-3">
        {educationItems.map((edu) => (
          <EducationItem
            key={edu.id}
            item={edu}
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
        添加教育经历
      </Button>
    </div>
  )
}
