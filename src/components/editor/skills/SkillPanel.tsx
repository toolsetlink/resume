'use client'

import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

export function SkillPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore(s => s.activeResumeId)
  const updateSkillContent = useResumeStore(s => s.updateSkillContent)

  return (
    <div className="p-4">
      <RichTextEditor
        value={activeResume?.skillContent ?? ''}
        placeholder="请输入专业技能..."
        onChange={(html) => {
          if (activeResumeId) updateSkillContent(activeResumeId, html)
        }}
      />
    </div>
  )
}
