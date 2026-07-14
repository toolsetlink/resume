'use client'

import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

export function CertificatesPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore(s => s.activeResumeId)
  const updateCertificatesContent = useResumeStore(s => s.updateCertificatesContent)

  return (
    <div className="p-4">
      <RichTextEditor
        value={activeResume?.certificatesContent ?? ''}
        placeholder="请输入证书信息..."
        onChange={(html) => {
          if (activeResumeId) updateCertificatesContent(activeResumeId, html)
        }}
      />
    </div>
  )
}
