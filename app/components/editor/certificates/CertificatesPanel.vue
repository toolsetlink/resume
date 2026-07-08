<template>
  <div class="p-4 space-y-3">
    <h3 class="text-base font-medium">证书</h3>
    <EditorToolbar :editor="editor" />
    <TiptapEditor v-model="content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
// @tiptap/extension-text-style@3.x 仅提供命名导出，无默认导出
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { useResumeStore } from '~/stores/resume'

const resumeStore = useResumeStore()

const content = ref(resumeStore.activeResume?.certificatesContent || '')

watch(() => resumeStore.activeResume?.certificatesContent, (val) => {
  if (val !== undefined && val !== content.value) {
    content.value = val
  }
})

const editor = useEditor({
  content: content.value,
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    Color,
    Highlight,
    Link.configure({ openOnClick: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: '请输入证书信息...' }),
  ],
  onUpdate: ({ editor }) => {
    content.value = editor.getHTML()
    commit()
  },
})

watch(content, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val, false)
  }
})

const commit = () => {
  if (!resumeStore.activeResumeId) return
  resumeStore.updateCertificatesContent(resumeStore.activeResumeId, content.value)
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>
