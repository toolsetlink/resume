'use client'

import { useCallback } from 'react'
import { Button } from 'antd'
import { Plus } from 'lucide-react'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import type { Project } from '@/shared/types/resume'
import { ProjectItem } from './ProjectItem'

export function ProjectPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore((s) => s.activeResumeId)
  const addProject = useResumeStore((s) => s.addProject)
  const updateProject = useResumeStore((s) => s.updateProject)
  const removeProject = useResumeStore((s) => s.removeProject)

  const projects = (activeResume?.projects || []).filter(
    (p) => p.visible !== false
  )

  const handleAdd = useCallback(() => {
    if (!activeResumeId) return
    addProject(activeResumeId, {
      name: '',
      role: '',
      date: '',
      description: '',
      visible: true,
    })
  }, [activeResumeId, addProject])

  const handleChange = useCallback(
    (id: string, data: Partial<Project>) => {
      if (!activeResumeId) return
      updateProject(activeResumeId, id, data)
    },
    [activeResumeId, updateProject]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!activeResumeId) return
      removeProject(activeResumeId, id)
    },
    [activeResumeId, removeProject]
  )

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-base font-medium">项目经历</h3>
      <div className="space-y-3">
        {projects.map((proj) => (
          <ProjectItem
            key={proj.id}
            item={proj}
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
        添加项目经历
      </Button>
    </div>
  )
}
