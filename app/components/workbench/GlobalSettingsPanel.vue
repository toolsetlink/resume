<template>
  <div class="global-settings-panel p-4 space-y-4">
    <t-form label-align="top" :data="formState">
      <!-- 字体大小 -->
      <t-form-item :label="t('settings.font') + '大小'">
        <t-slider
          v-model="formState.baseFontSize"
          :min="12"
          :max="22"
          :step="1"
          show-value
          @change="commit"
        />
      </t-form-item>

      <!-- 页面边距 -->
      <t-form-item label="页面边距">
        <t-slider
          v-model="formState.pagePadding"
          :min="0"
          :max="80"
          :step="2"
          show-value
          @change="commit"
        />
      </t-form-item>

      <!-- 段落间距 -->
      <t-form-item label="段落间距">
        <t-slider
          v-model="formState.paragraphSpacing"
          :min="0"
          :max="40"
          :step="1"
          show-value
          @change="commit"
        />
      </t-form-item>

      <!-- 行高 -->
      <t-form-item label="行高">
        <t-slider
          v-model="formState.lineHeight"
          :min="1"
          :max="2.5"
          :step="0.1"
          show-value
          @change="commit"
        />
      </t-form-item>

      <!-- 模块间距 -->
      <t-form-item label="模块间距">
        <t-slider
          v-model="formState.sectionSpacing"
          :min="0"
          :max="40"
          :step="1"
          show-value
          @change="commit"
        />
      </t-form-item>

      <!-- 标题大小 -->
      <t-form-item label="标题大小">
        <t-input-number
          v-model="formState.headerSize"
          :min="14"
          :max="32"
          :step="1"
          @change="commit"
        />
      </t-form-item>

      <!-- 副标题大小 -->
      <t-form-item label="副标题大小">
        <t-input-number
          v-model="formState.subheaderSize"
          :min="12"
          :max="28"
          :step="1"
          @change="commit"
        />
      </t-form-item>

      <t-divider />

      <!-- 图标模式 -->
      <t-form-item label="使用图标模式">
        <t-switch v-model="formState.useIconMode" @change="commit" />
      </t-form-item>

      <!-- 居中副标题 -->
      <t-form-item label="居中副标题">
        <t-switch v-model="formState.centerSubtitle" @change="commit" />
      </t-form-item>

      <!-- 灵活头部布局 -->
      <t-form-item label="灵活头部布局">
        <t-switch v-model="formState.flexibleHeaderLayout" @change="commit" />
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { GlobalSettings } from '#shared/types/resume'
import { initialGlobalSettings } from '#shared/config/initialResumeData'
import { useResumeStore } from '~/stores/resume'

const props = defineProps<{
  resumeId: string
}>()

const { t } = useI18n()
const resumeStore = useResumeStore()

// 本地副本
const formState = reactive<GlobalSettings>({ ...initialGlobalSettings })

// 从 store 同步
watch(
  () => resumeStore.activeResume?.globalSettings,
  (gs) => {
    if (gs) Object.assign(formState, gs)
  },
  { immediate: true, deep: true }
)

// 提交到 store
let commitTimer: ReturnType<typeof setTimeout> | null = null
const commit = () => {
  if (!props.resumeId) return
  if (commitTimer) clearTimeout(commitTimer)
  commitTimer = setTimeout(() => {
    resumeStore.updateGlobalSettings(props.resumeId, { ...formState })
  }, 200)
}
</script>

<style scoped>
.global-settings-panel {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
</style>
