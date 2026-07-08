<template>
  <div class="tiptap-editor-wrapper">
    <EditorContent :editor="editor" class="prose prose-sm max-w-none focus:outline-none" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
// 注意：@tiptap/extension-text-style@3.x 仅提供命名导出（TextStyle / Color / ...），
// 不像其它 extension 包那样通过 `export { X as default }` 暴露默认导出，
// 因此这里必须使用命名导入，否则浏览器端会抛出
// "does not provide an export named 'default'" 的 SyntaxError。
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'

// v-model 双向绑定 HTML 内容
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  editable?: boolean
}>(), {
  placeholder: '请输入内容...',
  editable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  editable: props.editable,
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    Color,
    Highlight,
    Link.configure({ openOnClick: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// 监听外部 modelValue 变化，避免光标跳动需判断当前内容是否一致
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue, false)
  }
})

// 监听 editable 变化
watch(() => props.editable, (editable) => {
  editor.value?.setEditable(editable)
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.tiptap-editor-wrapper :deep(.ProseMirror) {
  min-height: 80px;
  padding: 0.5rem;
  outline: none;
}

.tiptap-editor-wrapper :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: hsl(var(--muted-foreground));
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.tiptap-editor-wrapper :deep(.ProseMirror ul),
.tiptap-editor-wrapper :deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 0.25rem 0;
}

.tiptap-editor-wrapper :deep(.ProseMirror a) {
  color: hsl(var(--primary));
  text-decoration: underline;
}
</style>
