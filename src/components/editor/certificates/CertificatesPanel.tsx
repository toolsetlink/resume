'use client'

import { useEffect } from 'react'
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

  // 见 SkillPanel：去掉本地 content state，editor.getHTML() 当真值，
  // store 变化时通过 effect 灌入 editor，不再 setState in effect。
  const editor = useEditor({
    immediatelyRender: true,
    content: activeResume?.certificatesContent ?? '',
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextStyle,
      Color,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: '请输入证书信息...' }),
    ],
    onUpdate: ({ editor: ed }) => {
      if (activeResumeId) updateCertificatesContent(activeResumeId, ed.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const next = activeResume?.certificatesContent ?? ''
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [activeResume?.certificatesContent, editor])

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
