'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import { EditorToolbar } from '@/components/editor/EditorToolbar'

export function SkillPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore(s => s.activeResumeId)
  const updateSkillContent = useResumeStore(s => s.updateSkillContent)
  const [content, setContent] = useState(activeResume?.skillContent || '')

  useEffect(() => {
    if (activeResume?.skillContent !== undefined && activeResume.skillContent !== content) {
      setContent(activeResume.skillContent)
    }
  }, [activeResume?.skillContent])

  const editor = useEditor({
    content,
    extensions: [StarterKit, Underline, TextStyle, Color, Highlight, Link.configure({ openOnClick: false }), TextAlign.configure({ types: ['heading', 'paragraph'] }), Placeholder.configure({ placeholder: '请输入专业技能...' })],
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      setContent(html)
      if (activeResumeId) updateSkillContent(activeResumeId, html)
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  useEffect(() => { return () => { editor?.destroy() } }, [])

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-base font-medium">专业技能</h3>
      <EditorToolbar editor={editor} />
      <div className="tiptap-editor-wrapper">
        <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
        <style>{`.tiptap-editor-wrapper .ProseMirror { min-height: 80px; padding: 0.5rem; outline: none; }`}</style>
      </div>
    </div>
  )
}
