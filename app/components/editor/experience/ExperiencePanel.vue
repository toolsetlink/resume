<template>
  <div class="p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium">工作经历</h3>
      <t-button theme="primary" @click="add">
        <Plus class="w-4 h-4 mr-1" /> 添加
      </t-button>
    </div>

    <draggable
      v-model="list"
      :item-key="(item: Experience) => item.id"
      handle=".drag-handle"
      ghost-class="opacity-50"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <ExperienceItem
          :experience="element"
          @update="(data) => update(element.id, data)"
          @remove="remove(element.id)"
        />
      </template>
    </draggable>

    <div v-if="list.length === 0" class="text-center py-8 text-[hsl(var(--text-tertiary))] border border-dashed rounded">
      暂无工作经历，点击右上角添加
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { Experience } from '#shared/types/resume'
import { Plus } from 'lucide-vue-next'
import { useResumeStore } from '~/stores/resume'

const resumeStore = useResumeStore()

const list = computed({
  get: () => resumeStore.activeResume?.experience || [],
  set: (val: Experience[]) => {
    if (!resumeStore.activeResumeId) return
    resumeStore.importResume(resumeStore.activeResumeId, { experience: val })
  },
})

const onDragEnd = () => {
  // 由 v-model 自动同步
}

const add = () => {
  if (!resumeStore.activeResumeId) return
  resumeStore.addExperience(resumeStore.activeResumeId, {
    company: '',
    position: '',
    date: '',
    details: '',
    visible: true,
  })
}

const update = (id: string, data: Partial<Experience>) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.updateExperience(resumeStore.activeResumeId, id, data)
}

const remove = (id: string) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.removeExperience(resumeStore.activeResumeId, id)
}
</script>
