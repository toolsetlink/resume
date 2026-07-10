'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'

interface TiptapEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function TiptapEditor({ value, onChange, placeholder = '请输入内容...' }: TiptapEditorProps) {
  const editor = useEditor({
    content: value,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [])

  return (
    <div className="tiptap-editor-wrapper">
      <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
      <style>{`
        .tiptap-editor-wrapper .ProseMirror { min-height: 80px; padding: 0.5rem; outline: none; }
        .tiptap-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before { color: hsl(var(--text-secondary)); content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  )
}
