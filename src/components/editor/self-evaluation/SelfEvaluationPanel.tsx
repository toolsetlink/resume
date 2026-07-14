'use client'

import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

export function SelfEvaluationPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore(s => s.activeResumeId)
  const updateSelfEvaluation = useResumeStore(s => s.updateSelfEvaluation)

  return (
    <div className="p-4">
      <RichTextEditor
        value={activeResume?.selfEvaluationContent ?? ''}
        placeholder="请输入自我评价..."
        onChange={(html) => {
          if (activeResumeId) updateSelfEvaluation(activeResumeId, html)
        }}
      />
    </div>
  )
}
