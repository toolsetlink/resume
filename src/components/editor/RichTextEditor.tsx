'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { EditorToolbar } from '@/components/editor/EditorToolbar'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

// 全站唯一的富文本编辑器：技能/证书/自我评价及各条目描述统一复用。
// editor.getHTML() 是唯一真值，外部 value 变化时通过 effect 灌入，避免 setState in effect。
export function RichTextEditor({
  value,
  onChange,
  placeholder = '请输入内容...',
  minHeight = 80,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: true,
    content: value,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextStyle,
      Color,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  return (
    <div className="rich-text-editor space-y-2">
      <EditorToolbar editor={editor} />
      <div className="rich-text-editor-body rounded-md border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] transition-colors focus-within:border-[hsl(var(--brand))]">
        <EditorContent
          editor={editor}
          className="rich-content prose prose-sm max-w-none focus:outline-none"
        />
      </div>
      <style>{`
        .rich-text-editor-body .ProseMirror { min-height: ${minHeight}px; padding: 0.625rem 0.75rem; outline: none; }
        .rich-text-editor-body .ProseMirror p.is-editor-empty:first-child::before { color: hsl(var(--text-tertiary)); content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  )
}
