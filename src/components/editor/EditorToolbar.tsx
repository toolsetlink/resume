'use client'

import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
  Highlighter,
} from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor | null
}

const TOOLBAR_GROUPS = [
  {
    id: 'history',
    buttons: [
      { icon: Undo2, action: 'undo', title: '撤销' },
      { icon: Redo2, action: 'redo', title: '重做' },
    ],
  },
  {
    id: 'text-style',
    buttons: [
      { icon: Bold, action: 'bold', title: '加粗' },
      { icon: Italic, action: 'italic', title: '斜体' },
      { icon: UnderlineIcon, action: 'underline', title: '下划线' },
      { icon: Strikethrough, action: 'strike', title: '删除线' },
    ],
  },
  {
    id: 'heading',
    buttons: [
      { icon: Heading1, action: 'heading1', title: '标题 1' },
      { icon: Heading2, action: 'heading2', title: '标题 2' },
      { icon: Heading3, action: 'heading3', title: '标题 3' },
    ],
  },
  {
    id: 'alignment',
    buttons: [
      { icon: AlignLeft, action: 'alignLeft', title: '左对齐' },
      { icon: AlignCenter, action: 'alignCenter', title: '居中' },
      { icon: AlignRight, action: 'alignRight', title: '右对齐' },
    ],
  },
  {
    id: 'list',
    buttons: [
      { icon: List, action: 'bulletList', title: '无序列表' },
      { icon: ListOrdered, action: 'orderedList', title: '有序列表' },
      { icon: Quote, action: 'blockquote', title: '引用' },
    ],
  },
  {
    id: 'extra',
    buttons: [
      { icon: Highlighter, action: 'highlight', title: '高亮' },
    ],
  },
]

const ACTIONS_MAP: Record<
  string,
  (editor: Editor) => boolean | void
> = {
  undo: (editor) => editor.chain().focus().undo().run(),
  redo: (editor) => editor.chain().focus().redo().run(),
  bold: (editor) => editor.chain().focus().toggleBold().run(),
  italic: (editor) => editor.chain().focus().toggleItalic().run(),
  underline: (editor) => editor.chain().focus().toggleUnderline().run(),
  strike: (editor) => editor.chain().focus().toggleStrike().run(),
  heading1: (editor) =>
    editor.chain().focus().toggleHeading({ level: 1 }).run(),
  heading2: (editor) =>
    editor.chain().focus().toggleHeading({ level: 2 }).run(),
  heading3: (editor) =>
    editor.chain().focus().toggleHeading({ level: 3 }).run(),
  bulletList: (editor) => editor.chain().focus().toggleBulletList().run(),
  orderedList: (editor) => editor.chain().focus().toggleOrderedList().run(),
  blockquote: (editor) => editor.chain().focus().toggleBlockquote().run(),
  alignLeft: (editor) =>
    editor.chain().focus().setTextAlign('left').run(),
  alignCenter: (editor) =>
    editor.chain().focus().setTextAlign('center').run(),
  alignRight: (editor) =>
    editor.chain().focus().setTextAlign('right').run(),
  highlight: (editor) =>
    editor.chain().focus().toggleHighlight().run(),
}

const ACTIVE_CHECK: Record<
  string,
  (editor: Editor) => boolean
> = {
  bold: (editor) => editor.isActive('bold'),
  italic: (editor) => editor.isActive('italic'),
  underline: (editor) => editor.isActive('underline'),
  strike: (editor) => editor.isActive('strike'),
  heading1: (editor) => editor.isActive('heading', { level: 1 }),
  heading2: (editor) => editor.isActive('heading', { level: 2 }),
  heading3: (editor) => editor.isActive('heading', { level: 3 }),
  bulletList: (editor) => editor.isActive('bulletList'),
  orderedList: (editor) => editor.isActive('orderedList'),
  blockquote: (editor) => editor.isActive('blockquote'),
  alignLeft: (editor) => editor.isActive({ textAlign: 'left' }),
  alignCenter: (editor) => editor.isActive({ textAlign: 'center' }),
  alignRight: (editor) => editor.isActive({ textAlign: 'right' }),
  highlight: (editor) => editor.isActive('highlight'),
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-[hsl(var(--bg-base))]">
      {TOOLBAR_GROUPS.map((group, groupIdx) => (
        <div key={group.id} className="flex items-center gap-0.5">
          {groupIdx > 0 && (
            <div className="w-px h-5 bg-[hsl(var(--border-base))] mx-1" />
          )}
          {group.buttons.map((btn) => {
            const Icon = btn.icon
            const actionFn = ACTIONS_MAP[btn.action]
            const isActive = ACTIVE_CHECK[btn.action]?.(editor)

            if (!actionFn) return null

            return (
              <button
                key={btn.action}
                type="button"
                title={btn.title}
                className={`p-1.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))]'
                }`}
                onClick={() => actionFn(editor)}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
