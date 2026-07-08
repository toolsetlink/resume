<template>
  <header
    class="workbench-header flex items-center justify-between gap-4 px-4 py-2 border-b border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))]"
  >
    <!-- 左侧：返回 + 标题 -->
    <div class="flex items-center gap-2 flex-1 min-w-0">
      <t-button variant="text" shape="square" @click="goBack">
        <ArrowLeft class="w-4 h-4" />
      </t-button>
      <t-input
        v-model="titleModel"
        class="max-w-xs"
        :placeholder="t('resume.create')"
        @blur="commitTitle"
        @enter="commitTitle"
      />
    </div>

    <!-- 中间：工具按钮 -->
    <div class="flex items-center gap-1">
      <t-tooltip :content="t('workbench.collapseSidebar')">
        <t-button variant="text" shape="square" @click="emit('toggle-sidebar')">
          <PanelLeft class="w-4 h-4" />
        </t-button>
      </t-tooltip>
      <t-tooltip :content="t('nav.templates')">
        <t-button variant="text" shape="square" @click="emit('open-template-switcher')">
          <LayoutTemplate class="w-4 h-4" />
        </t-button>
      </t-tooltip>
      <t-tooltip :content="t('settings.themeColor')">
        <t-button variant="text" shape="square" @click="emit('open-theme-color')">
          <Palette class="w-4 h-4" />
        </t-button>
      </t-tooltip>
      <t-tooltip :content="t('common.settings')">
        <t-button variant="text" shape="square" @click="emit('open-global-settings')">
          <Settings class="w-4 h-4" />
        </t-button>
      </t-tooltip>
    </div>

    <!-- 右侧：导出 + 保存状态 -->
    <div class="flex items-center gap-2 flex-1 justify-end">
      <span class="text-xs text-[hsl(var(--text-tertiary))]">
        <template v-if="isSaving">{{ t('common.loading') }}</template>
        <template v-else-if="lastSavedAt">{{ savedText }}</template>
      </span>
      <t-button theme="primary" @click="emit('export-pdf')">
        <FileDown class="w-4 h-4 mr-1" />
        {{ t('common.export') }} PDF
      </t-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ArrowLeft,
  PanelLeft,
  LayoutTemplate,
  Palette,
  Settings,
  FileDown,
} from 'lucide-vue-next'
import { useResumeStore } from '~/stores/resume'

const props = defineProps<{
  resumeId: string
  isSaving?: boolean
  lastSavedAt?: Date | null
}>()

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'export-pdf'): void
  (e: 'open-template-switcher'): void
  (e: 'open-theme-color'): void
  (e: 'open-global-settings'): void
  (e: 'update:title', title: string): void
}>()

const { t, locale } = useI18n()
const router = useRouter()
const resumeStore = useResumeStore()

// 简历标题（本地副本）
const titleModel = ref('')

watch(
  () => resumeStore.activeResume?.title,
  (val) => {
    titleModel.value = val || ''
  },
  { immediate: true }
)

const commitTitle = () => {
  if (!props.resumeId) return
  resumeStore.updateResumeTitle(props.resumeId, titleModel.value)
  emit('update:title', titleModel.value)
}

const goBack = () => {
  router.back()
}

// 保存状态文案
const savedText = computed(() => {
  if (!props.lastSavedAt) return ''
  const time = props.lastSavedAt.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
  return `${t('common.save')} ${time}`
})
</script>

<style scoped>
.workbench-header {
  height: 56px;
}
</style>
