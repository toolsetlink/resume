<template>
  <div class="flex items-center gap-1 p-2 border-b border-[hsl(var(--border))] flex-wrap">
    <!-- 文字格式 -->
    <t-tooltip content="加粗 (Ctrl+B)">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive('bold') }" @click="editor?.chain().focus().toggleBold().run()">
        <Bold class="w-4 h-4" />
      </t-button>
    </t-tooltip>
    <t-tooltip content="斜体 (Ctrl+I)">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive('italic') }" @click="editor?.chain().focus().toggleItalic().run()">
        <Italic class="w-4 h-4" />
      </t-button>
    </t-tooltip>
    <t-tooltip content="下划线 (Ctrl+U)">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive('underline') }" @click="editor?.chain().focus().toggleUnderline().run()">
        <Underline class="w-4 h-4" />
      </t-button>
    </t-tooltip>
    <t-tooltip content="删除线">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive('strike') }" @click="editor?.chain().focus().toggleStrike().run()">
        <Strikethrough class="w-4 h-4" />
      </t-button>
    </t-tooltip>

    <t-divider layout="vertical" />

    <!-- 文字颜色 -->
    <t-popup trigger="click">
      <t-button variant="text">
        <Palette class="w-4 h-4" />
      </t-button>
      <template #content>
        <div class="p-2 w-64">
          <t-color-picker-panel v-model="textColor" @change="handleColorChange" />
        </div>
      </template>
    </t-popup>
    <t-tooltip content="高亮">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive('highlight') }" @click="editor?.chain().focus().toggleHighlight().run()">
        <Highlighter class="w-4 h-4" />
      </t-button>
    </t-tooltip>

    <t-divider layout="vertical" />

    <!-- 对齐 -->
    <t-tooltip content="左对齐">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive({ textAlign: 'left' }) }" @click="editor?.chain().focus().setTextAlign('left').run()">
        <AlignLeft class="w-4 h-4" />
      </t-button>
    </t-tooltip>
    <t-tooltip content="居中">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive({ textAlign: 'center' }) }" @click="editor?.chain().focus().setTextAlign('center').run()">
        <AlignCenter class="w-4 h-4" />
      </t-button>
    </t-tooltip>
    <t-tooltip content="右对齐">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive({ textAlign: 'right' }) }" @click="editor?.chain().focus().setTextAlign('right').run()">
        <AlignRight class="w-4 h-4" />
      </t-button>
    </t-tooltip>

    <t-divider layout="vertical" />

    <!-- 列表 -->
    <t-tooltip content="无序列表">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive('bulletList') }" @click="editor?.chain().focus().toggleBulletList().run()">
        <List class="w-4 h-4" />
      </t-button>
    </t-tooltip>
    <t-tooltip content="有序列表">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive('orderedList') }" @click="editor?.chain().focus().toggleOrderedList().run()">
        <ListOrdered class="w-4 h-4" />
      </t-button>
    </t-tooltip>

    <t-divider layout="vertical" />

    <!-- 链接 -->
    <t-tooltip content="链接">
      <t-button variant="text" :class="{ 'is-active': editor?.isActive('link') }" @click="openLinkDialog">
        <LinkIcon class="w-4 h-4" />
      </t-button>
    </t-tooltip>

    <!-- 链接对话框 -->
    <t-dialog v-model:visible="linkDialogVisible" header="插入链接" :on-confirm="handleLinkConfirm">
      <t-form>
        <t-form-item label="URL">
          <t-input v-model="linkUrl" placeholder="https://example.com" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Highlighter,
  Palette,
} from 'lucide-vue-next'

const props = defineProps<{ editor: Editor | null | undefined }>()

// 文字颜色
const textColor = ref('#000000')
const handleColorChange = (value: string) => {
  props.editor?.chain().focus().setColor(value).run()
}

// 链接对话框
const linkDialogVisible = ref(false)
const linkUrl = ref('')
const openLinkDialog = () => {
  const prevUrl = (props.editor?.getAttributes('link')?.href as string) || ''
  linkUrl.value = prevUrl
  linkDialogVisible.value = true
}
const handleLinkConfirm = () => {
  if (!linkUrl.value) {
    props.editor?.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    props.editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run()
  }
  linkDialogVisible.value = false
}
</script>

<style scoped>
.is-active {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}
</style>
