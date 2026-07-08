<template>
  <div class="p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium">项目经历</h3>
      <t-button theme="primary" @click="add">
        <Plus class="w-4 h-4 mr-1" /> 添加
      </t-button>
    </div>

    <draggable
      v-model="list"
      :item-key="(item: Project) => item.id"
      handle=".drag-handle"
      ghost-class="opacity-50"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <ProjectItem
          :project="element"
          @update="(data) => update(element.id, data)"
          @remove="remove(element.id)"
        />
      </template>
    </draggable>

    <div v-if="list.length === 0" class="text-center py-8 text-gray-400 border border-dashed rounded">
      暂无项目经历，点击右上角添加
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { Project } from '#shared/types/resume'
import { Plus } from 'lucide-vue-next'
import { useResumeStore } from '~/stores/resume'

const resumeStore = useResumeStore()

const list = computed({
  get: () => resumeStore.activeResume?.projects || [],
  set: (val: Project[]) => {
    if (!resumeStore.activeResumeId) return
    resumeStore.importResume(resumeStore.activeResumeId, { projects: val })
  },
})

const onDragEnd = () => {
  // 由 v-model 自动同步
}

const add = () => {
  if (!resumeStore.activeResumeId) return
  resumeStore.addProject(resumeStore.activeResumeId, {
    name: '',
    role: '',
    date: '',
    description: '',
    visible: true,
  })
}

const update = (id: string, data: Partial<Project>) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.updateProject(resumeStore.activeResumeId, id, data)
}

const remove = (id: string) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.removeProject(resumeStore.activeResumeId, id)
}
</script>
