<template>
  <div class="border border-[hsl(var(--border))] rounded-md mb-2">
    <!-- 折叠头 -->
    <div class="flex items-center gap-2 p-3 bg-[hsl(var(--muted))]">
      <button class="drag-handle cursor-move text-gray-400 hover:text-gray-600" title="拖动排序">
        <GripVertical class="w-4 h-4" />
      </button>
      <t-button variant="text" size="small" @click="collapsed = !collapsed">
        <ChevronDown v-if="collapsed" class="w-4 h-4" />
        <ChevronUp v-else class="w-4 h-4" />
      </t-button>
      <div class="flex-1 truncate">
        <span class="font-medium">{{ local.school || '未填写学校' }}</span>
        <span v-if="local.major" class="text-gray-500 ml-2">· {{ local.major }}</span>
      </div>
      <span v-if="status === 'saving'" class="text-xs text-gray-400 ml-2">保存中...</span>
      <span v-else-if="status === 'saved'" class="text-xs text-green-500 ml-2">已保存</span>
      <t-tooltip content="可见性">
        <t-switch v-model="local.visible" size="small" @change="commit" />
      </t-tooltip>
      <t-tooltip content="删除">
        <t-button variant="text" size="small" theme="danger" @click="emit('remove')">
          <Trash2 class="w-4 h-4" />
        </t-button>
      </t-tooltip>
    </div>

    <!-- 展开内容 -->
    <div v-show="!collapsed" class="p-4 space-y-3">
      <t-form label-align="top">
        <div class="grid grid-cols-2 gap-3">
          <t-form-item label="学校">
            <t-input v-model="local.school" @blur="commit" />
          </t-form-item>
          <t-form-item label="专业">
            <t-input v-model="local.major" @blur="commit" />
          </t-form-item>
          <t-form-item label="学位">
            <t-input v-model="local.degree" @blur="commit" />
          </t-form-item>
          <t-form-item label="GPA">
            <t-input v-model="local.gpa" @blur="commit" />
          </t-form-item>
          <t-form-item label="开始时间">
            <t-input v-model="local.startDate" placeholder="2013-09" @blur="commit" />
          </t-form-item>
          <t-form-item label="结束时间">
            <t-input v-model="local.endDate" placeholder="2017-06" @blur="commit" />
          </t-form-item>
        </div>
      </t-form>
      <!-- 描述富文本 -->
      <div class="space-y-2">
        <div class="text-sm font-medium">描述</div>
        <EditorToolbar :editor="editor" />
        <TiptapEditor v-model="local.description" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Education } from '#shared/types/resume'
import type { Editor } from '@tiptap/vue-3'
import { GripVertical, ChevronDown, ChevronUp, Trash2 } from 'lucide-vue-next'
import { useItemSaveStatus } from '~/composables/useItemSaveStatus'
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

const props = defineProps<{ education: Education }>()
const emit = defineEmits<{ update: [data: Partial<Education>]; remove: [] }>()

// 本地副本
const local = reactive<Education>({ ...props.education })
const collapsed = ref(false)
const { status, markSaving } = useItemSaveStatus()

// 当外部数据变化时同步
watch(() => props.education, (edu) => {
  Object.assign(local, edu)
}, { deep: true })

const commit = () => {
  emit('update', { ...local })
  markSaving()
}

// 每条教育经历拥有独立的富文本编辑器实例
const editor = useEditor({
  content: local.description || '',
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    Color,
    Highlight,
    Link.configure({ openOnClick: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: '请输入描述...' }),
  ],
  onUpdate: ({ editor }) => {
    local.description = editor.getHTML()
    commit()
  },
})

// 同步外部 description
watch(() => local.description, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val || '', false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>
