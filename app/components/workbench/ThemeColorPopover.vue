<template>
  <!-- 主题色选择对话框：使用 t-dialog 受控显隐，内容由预设色板 + 自定义颜色选择器组成 -->
  <t-dialog
    :visible="visible"
    :header="t('settings.themeColor')"
    :footer="false"
    width="360px"
    @update:visible="(v: boolean) => emit('update:visible', v)"
  >
    <div class="theme-color-content py-2">
      <!-- 预设色板 -->
      <div class="grid grid-cols-6 gap-2 mb-4">
        <button
          v-for="color in THEME_COLORS"
          :key="color"
          type="button"
          class="w-10 h-10 rounded border border-[hsl(var(--border-default))] cursor-pointer transition-transform hover:scale-110"
          :class="{ 'ring-2 ring-offset-1 ring-blue-500': isSelected(color) }"
          :style="{ backgroundColor: color }"
          :title="color"
          @click="emit('select', color)"
        />
      </div>
      <!-- 自定义颜色 -->
      <t-divider />
      <div class="mt-3 space-y-2">
        <div class="text-xs text-[hsl(var(--text-secondary))]">{{ t('settings.themeColor') }}</div>
        <div class="flex items-center gap-2">
          <t-color-picker v-model="customColor" @change="handleCustomChange" />
          <t-button size="small" @click="emit('select', customColor)">
            {{ t('common.confirm') }}
          </t-button>
        </div>
      </div>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { THEME_COLORS } from '#shared/types/resume'
import { useResumeStore } from '~/stores/resume'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'select', color: string): void
}>()

const { t } = useI18n()
const resumeStore = useResumeStore()

// 自定义颜色
const customColor = ref(resumeStore.activeResume?.globalSettings?.themeColor || '#000000')

// 是否选中
const isSelected = (color: string) => {
  return resumeStore.activeResume?.globalSettings?.themeColor === color
}

// 自定义颜色变化
const handleCustomChange = (val: string) => {
  customColor.value = val
}
</script>
