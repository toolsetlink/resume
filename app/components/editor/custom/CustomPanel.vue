<template>
  <div class="p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium">自定义内容</h3>
      <t-button theme="primary" @click="add">
        <Plus class="w-4 h-4 mr-1" /> 添加
      </t-button>
    </div>

    <draggable
      v-model="list"
      :item-key="(item: CustomItem) => item.id"
      handle=".drag-handle"
      ghost-class="opacity-50"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <CustomItem
          :item="element"
          @update="(data) => update(element.id, data)"
          @remove="remove(element.id)"
        />
      </template>
    </draggable>

    <div v-if="list.length === 0" class="text-center py-8 text-gray-400 border border-dashed rounded">
      暂无自定义内容，点击右上角添加
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { CustomItem } from '#shared/types/resume'
import { Plus } from 'lucide-vue-next'
import { useResumeStore } from '~/stores/resume'

const resumeStore = useResumeStore()

// 自定义数据使用固定的 key 'custom'（与初始数据保持一致）
const CUSTOM_KEY = 'custom'

const list = computed<CustomItem[]>({
  get: () => {
    const data = resumeStore.activeResume?.customData
    return (data && data[CUSTOM_KEY]) || []
  },
  set: (val: CustomItem[]) => {
    if (!resumeStore.activeResumeId) return
    const newData = { ...(resumeStore.activeResume?.customData || {}) }
    newData[CUSTOM_KEY] = val
    resumeStore.importResume(resumeStore.activeResumeId, { customData: newData })
  },
})

const onDragEnd = () => {
  // 由 v-model 自动同步
}

const add = () => {
  if (!resumeStore.activeResumeId) return
  const newItem: CustomItem = {
    id: crypto.randomUUID(),
    title: '',
    subtitle: '',
    dateRange: '',
    description: '',
    visible: true,
  }
  const newData = { ...(resumeStore.activeResume?.customData || {}) }
  newData[CUSTOM_KEY] = [...list.value, newItem]
  resumeStore.importResume(resumeStore.activeResumeId, { customData: newData })
}

const update = (id: string, data: Partial<CustomItem>) => {
  if (!resumeStore.activeResumeId) return
  const newData = { ...(resumeStore.activeResume?.customData || {}) }
  const arr = [...(newData[CUSTOM_KEY] || [])]
  const idx = arr.findIndex((i) => i.id === id)
  if (idx === -1) return
  arr[idx] = { ...arr[idx]!, ...data }
  newData[CUSTOM_KEY] = arr
  resumeStore.importResume(resumeStore.activeResumeId, { customData: newData })
}

const remove = (id: string) => {
  if (!resumeStore.activeResumeId) return
  const newData = { ...(resumeStore.activeResume?.customData || {}) }
  newData[CUSTOM_KEY] = (newData[CUSTOM_KEY] || []).filter((i) => i.id !== id)
  resumeStore.importResume(resumeStore.activeResumeId, { customData: newData })
}
</script>
