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

export function SkillPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore(s => s.activeResumeId)
  const updateSkillContent = useResumeStore(s => s.updateSkillContent)

  // 不再在组件里维护本地 content 副本。editor.getHTML() 才是唯一真值，
  // store 变化时通过 effect 把内容塞进 editor，避免 setState in effect 触发 cascading renders。
  const editor = useEditor({
    immediatelyRender: true,
    content: activeResume?.skillContent ?? '',
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextStyle,
      Color,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: '请输入专业技能...' }),
    ],
    onUpdate: ({ editor: ed }) => {
      if (activeResumeId) updateSkillContent(activeResumeId, ed.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const next = activeResume?.skillContent ?? ''
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [activeResume?.skillContent, editor])

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
