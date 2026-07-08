<template>
  <div class="w-full flex flex-col">
    <div class="px-4 pt-4 pb-2">
      <h2 class="text-sm font-medium text-gray-600">模块</h2>
    </div>

    <draggable
      v-model="sections"
      :item-key="(item: MenuSection) => item.id"
      ghost-class="opacity-50"
      class="px-2 pb-3 space-y-1"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div
          class="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-[hsl(var(--muted))]"
          :class="{ 'bg-[hsl(var(--accent))]': isActive(element.id) }"
          @click="selectSection(element.id)"
        >
          <span class="text-base">{{ element.icon }}</span>
          <span class="flex-1 text-sm">{{ element.title }}</span>
          <t-switch
            :model-value="element.enabled"
            size="small"
            @change="(val: boolean) => toggleSection(element.id, val)"
            @click.stop
          />
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { MenuSection } from '#shared/types/resume'
import { useResumeStore } from '~/stores/resume'

const resumeStore = useResumeStore()

// 可排序的模块列表（绑定到 store.menuSections）
const sections = computed<MenuSection[]>({
  get: () => resumeStore.activeResume?.menuSections || [],
  set: (val: MenuSection[]) => {
    if (!resumeStore.activeResumeId) return
    // 排序后重新计算 order
    const ordered = val.map((s, idx) => ({ ...s, order: idx }))
    resumeStore.updateMenuSections(resumeStore.activeResumeId, ordered)
  },
})

const onDragEnd = () => {
  // 由 v-model 自动同步
}

const isActive = (id: string) => {
  return resumeStore.activeResume?.activeSection === id
}

const selectSection = (id: string) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.setActiveSection(resumeStore.activeResumeId, id)
}

const toggleSection = (id: string, val: boolean) => {
  if (!resumeStore.activeResumeId) return
  // store 中 toggleMenuSection 是切换；这里直接设置值
  const resume = resumeStore.activeResume
  if (!resume) return
  const section = resume.menuSections.find((s) => s.id === id)
  if (!section) return
  if (section.enabled !== val) {
    resumeStore.toggleMenuSection(resumeStore.activeResumeId, id)
  }
}
</script>
