<template>
  <div class="p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium">教育经历</h3>
      <t-button theme="primary" @click="add">
        <Plus class="w-4 h-4 mr-1" /> 添加
      </t-button>
    </div>

    <draggable
      v-model="list"
      :item-key="(item: Education) => item.id"
      handle=".drag-handle"
      ghost-class="opacity-50"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <EducationItem
          :education="element"
          @update="(data) => update(element.id, data)"
          @remove="remove(element.id)"
        />
      </template>
    </draggable>

    <div v-if="list.length === 0" class="text-center py-8 text-gray-400 border border-dashed rounded">
      暂无教育经历，点击右上角添加
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { Education } from '#shared/types/resume'
import { Plus } from 'lucide-vue-next'
import { useResumeStore } from '~/stores/resume'

const resumeStore = useResumeStore()

// 从 store 派生的可排序列表
const list = computed({
  get: () => resumeStore.activeResume?.education || [],
  set: (val: Education[]) => {
    if (!resumeStore.activeResumeId) return
    // 通过 importResume 替换整个 education 数组以保留顺序
    resumeStore.importResume(resumeStore.activeResumeId, { education: val })
  },
})

const onDragEnd = () => {
  // 由 v-model 自动同步
}

const add = () => {
  if (!resumeStore.activeResumeId) return
  resumeStore.addEducation(resumeStore.activeResumeId, {
    school: '',
    major: '',
    degree: '',
    startDate: '',
    endDate: '',
    gpa: '',
    description: '',
    visible: true,
  })
}

const update = (id: string, data: Partial<Education>) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.updateEducation(resumeStore.activeResumeId, id, data)
}

const remove = (id: string) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.removeEducation(resumeStore.activeResumeId, id)
}
</script>
