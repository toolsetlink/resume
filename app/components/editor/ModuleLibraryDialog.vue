<template>
  <t-dialog
    :visible="visible"
    :header="t('editor.moduleLibrary')"
    :close-on-overlay-click="true"
    :close-on-esc-keydown="true"
    width="480px"
    @close="handleClose"
  >
    <div class="space-y-2">
      <!-- 可启用模块列表 -->
      <div
        v-for="section in availableSections"
        :key="section.id"
        class="flex items-center gap-3 p-3 rounded-md border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] hover:bg-[hsl(var(--bg-subtle))] transition-colors"
      >
        <span class="text-xl flex-shrink-0">{{ section.icon }}</span>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium">{{ section.title }}</div>
          <div class="text-xs text-[hsl(var(--text-secondary))] truncate">{{ getDescription(section.id) }}</div>
        </div>
        <t-button
          theme="primary"
          variant="outline"
          size="small"
          :disabled="justEnabledId === section.id"
          @click="handleEnable(section.id)"
        >
          {{ justEnabledId === section.id ? t('editor.enabled') : t('editor.enable') }}
        </t-button>
      </div>

      <!-- 空状态：所有模块均已启用 -->
      <div
        v-if="availableSections.length === 0"
        class="flex flex-col items-center justify-center py-10 text-[hsl(var(--text-tertiary))]"
      >
        <CheckCircle2 class="w-10 h-10 mb-2 text-green-400" />
        <p class="text-sm">{{ t('editor.allEnabled') }}</p>
      </div>
    </div>

    <template #footer>
      <t-button variant="text" @click="handleClose">{{ t('common.close') }}</t-button>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'
import type { MenuSection } from '#shared/types/resume'
import { MODULE_CONFIGS } from '#shared/config/modules'
import { useResumeStore } from '~/stores/resume'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [val: boolean]; enabled: [sectionId: string] }>()

const { t, locale } = useI18n()
const resumeStore = useResumeStore()

// 刚刚启用的模块 id（用于按钮状态反馈）
const justEnabledId = ref<string | null>(null)

// 可启用的模块列表：menuSections 中 enabled=false 的内置模块
const availableSections = computed<MenuSection[]>(() => {
  const sections = resumeStore.activeResume?.menuSections || []
  return sections
    .filter((s) => !s.enabled)
    .sort((a, b) => a.order - b.order)
})

// 根据模块 id 获取描述文案
const getDescription = (sectionId: string): string => {
  const config = MODULE_CONFIGS.find((m) => m.id === sectionId)
  if (!config) return ''
  return locale.value === 'en' ? config.description.en : config.description.zh
}

// 启用模块
const handleEnable = (sectionId: string) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.enableMenuSection(resumeStore.activeResumeId, sectionId)
  justEnabledId.value = sectionId
  // 1.2s 后重置按钮状态，允许用户看到反馈
  setTimeout(() => {
    if (justEnabledId.value === sectionId) {
      justEnabledId.value = null
    }
  }, 1200)
  // 通知父组件：模块已启用（用于触发高亮闪烁与滚动）
  emit('enabled', sectionId)
}

const handleClose = () => {
  justEnabledId.value = null
  emit('update:visible', false)
}
</script>
