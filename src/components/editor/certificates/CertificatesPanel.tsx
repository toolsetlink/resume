'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { EditorToolbar } from '@/components/editor/EditorToolbar'

export function CertificatesPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore(s => s.activeResumeId)
  const updateCertificatesContent = useResumeStore(s => s.updateCertificatesContent)
  const [content, setContent] = useState(activeResume?.certificatesContent || '')

  useEffect(() => {
    if (activeResume?.certificatesContent !== undefined && activeResume.certificatesContent !== content) {
      setContent(activeResume.certificatesContent)
    }
  }, [activeResume?.certificatesContent])

  const editor = useEditor({
    immediatelyRender: true,
    content,
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), TextStyle, Color, Highlight, TextAlign.configure({ types: ['heading', 'paragraph'] }), Placeholder.configure({ placeholder: '请输入证书信息...' })],
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      setContent(html)
      if (activeResumeId) updateCertificatesContent(activeResumeId, html)
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-base font-medium">证书</h3>
      <EditorToolbar editor={editor} />
      <div className="tiptap-editor-wrapper">
        <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
        <style>{`.tiptap-editor-wrapper .ProseMirror { min-height: 80px; padding: 0.5rem; outline: none; }`}</style>
      </div>
    </div>
  )
}
