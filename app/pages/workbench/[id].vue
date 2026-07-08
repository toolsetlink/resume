<template>
  <div class="workbench-page h-screen flex flex-col overflow-hidden bg-[hsl(var(--bg-base))]">
    <!-- 顶部工具栏 -->
    <WorkbenchHeader
      :resume-id="resumeId"
      :is-saving="isSaving"
      :last-saved-at="lastSavedAt"
      @toggle-sidebar="toggleSidebar"
      @export-pdf="handleExportPdf"
      @open-template-switcher="templateSwitcherVisible = true"
      @open-theme-color="themeColorVisible = true"
      @open-global-settings="globalSettingsVisible = true"
    />

    <!-- 主体：左侧编辑 + 右侧预览 -->
    <div class="flex-1 overflow-hidden">
      <Splitpanes class="default-theme h-full" @resize="onResize">
        <!-- 左侧编辑区 -->
        <Pane :size="sidebarVisible ? 40 : 0" :min-size="20" :max-size="60">
          <div class="h-full overflow-y-auto bg-[hsl(var(--bg-card))]">
            <!-- 模块折叠面板（导航 + 开关 + 内容编辑一体化） -->
            <SectionAccordion />
          </div>
        </Pane>

        <!-- 右侧预览区 -->
        <Pane :size="sidebarVisible ? 60 : 100">
          <div class="h-full overflow-auto bg-[hsl(var(--bg-canvas))] p-6">
            <!-- A4 预览页：作为 PDF 导出捕获目标，数据未就绪时显示 loading -->
            <div
              v-if="resumeData"
              id="resume-preview"
              data-preview-scroll-container="true"
              class="mx-auto bg-white shadow-lg"
              style="width: 794px; min-height: 1123px;"
            >
              <ResumePreview :resume-data="resumeData" />
            </div>
            <div
              v-else
              class="mx-auto bg-white shadow-lg flex items-center justify-center text-[hsl(var(--text-tertiary))]"
              style="width: 794px; min-height: 1123px;"
            >
              {{ t('common.loading') }}
            </div>
          </div>
        </Pane>
      </Splitpanes>
    </div>

    <!-- 模板切换器（浮动） -->
    <TemplateSwitcher
      v-model:visible="templateSwitcherVisible"
      @select="handleTemplateSelect"
    />

    <!-- 主题色选择器（浮动） -->
    <ThemeColorPopover
      v-model:visible="themeColorVisible"
      @select="handleThemeColorSelect"
    />

    <!-- 全局设置抽屉 -->
    <t-drawer
      v-model:visible="globalSettingsVisible"
      header="全局设置"
      size="400px"
    >
      <GlobalSettingsPanel :resume-id="resumeId" />
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { MessagePlugin } from 'tdesign-vue-next'
import { useResumeStore } from '~/stores/resume'
import type { ResumeData } from '#shared/types/resume'
import { useAutoSave } from '~/composables/useAutoSave'
import { usePdfExport } from '~/composables/usePdfExport'

definePageMeta({
  layout: 'app',
  // 工作台涉及大量客户端交互（Splitpanes、TDesign 抽屉等），禁用 SSR 避免 hydration 不匹配
  ssr: false,
})

const route = useRoute()
const { t } = useI18n()
const router = useRouter()
const resumeStore = useResumeStore()

// 简历 ID
const resumeId = computed(() => route.params.id as string)

// 简历数据
const resumeData = computed<ResumeData | null>(() => {
  return resumeStore.activeResume
})

// 侧边栏可见性
const sidebarVisible = ref(true)
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

// Splitpanes 大小变更（占位，预留扩展点）
const onResize = () => {
  // splitpanes 内部已管理 size，这里预留扩展点
}

// 模板切换器
const templateSwitcherVisible = ref(false)

// 主题色
const themeColorVisible = ref(false)

// 全局设置
const globalSettingsVisible = ref(false)

// 自动保存
const { isSaving, lastSavedAt } = useAutoSave()

// PDF 导出：直接调用客户端导出
const { exportToPdf } = usePdfExport()

const handleExportPdf = async () => {
  try {
    await exportToPdf()
    MessagePlugin.success('PDF 导出成功')
  } catch (e) {
    MessagePlugin.error(`导出失败: ${e instanceof Error ? e.message : '未知错误'}`)
  }
}

const handleTemplateSelect = (templateId: string) => {
  if (resumeStore.activeResumeId) {
    resumeStore.setTemplateId(resumeStore.activeResumeId, templateId)
  }
  templateSwitcherVisible.value = false
}

const handleThemeColorSelect = (color: string) => {
  if (resumeStore.activeResumeId) {
    resumeStore.updateGlobalSettings(resumeStore.activeResumeId, { themeColor: color })
  }
  themeColorVisible.value = false
}

// 初始化
onMounted(() => {
  resumeStore.initialize()
  if (resumeId.value) {
    resumeStore.setActiveResume(resumeId.value)
    // 如果 store 中没有该简历，回退到 dashboard
    if (!resumeStore.activeResume) {
      const localePath = useLocalePath()
      router.replace(localePath('/dashboard'))
    }
  }
})

// 设置页面 meta
useHead({
  title: '工作台 - 自由简历',
})
</script>

<style scoped>
.workbench-page {
  /* 防止整页滚动 */
}
</style>
