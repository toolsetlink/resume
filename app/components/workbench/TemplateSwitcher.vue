<template>
  <t-dialog
    :visible="visible"
    :header="t('nav.templates')"
    :footer="false"
    width="800px"
    @update:visible="(v: boolean) => emit('update:visible', v)"
  >
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
      <div
        v-for="tpl in templates"
        :key="tpl.config.id"
        class="template-card border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md"
        :class="{
          'border-primary ring-2 ring-primary/30': isSelected(tpl.config.id),
          'border-[hsl(var(--border))]': !isSelected(tpl.config.id),
        }"
        @click="emit('select', tpl.config.id)"
      >
        <!-- 运行时渲染的模板预览（等比缩放） -->
        <div class="template-preview-wrapper aspect-[3/4] bg-white">
          <div class="template-preview-scaled">
            <ResumePreview :resume-data="getPreviewData(tpl.config.id)" />
          </div>
        </div>
        <!-- 名称与描述 -->
        <div class="p-3">
          <div class="flex items-center justify-between mb-1">
            <h4 class="text-sm font-medium">{{ tpl.config.name }}</h4>
            <t-tag v-if="isSelected(tpl.config.id)" theme="primary" size="small">
              {{ t('common.confirm') }}
            </t-tag>
          </div>
          <p class="text-xs text-gray-500 line-clamp-2">{{ tpl.config.description }}</p>
        </div>
      </div>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { TEMPLATE_REGISTRY } from '~/components/templates/registry'
import { useResumeStore } from '~/stores/resume'
import ResumePreview from '~/components/preview/ResumePreview.vue'
import { initialResumeState } from '#shared/config/initialResumeData'
import type { ResumeData } from '#shared/types/resume'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'select', templateId: string): void
}>()

const { t } = useI18n()
const resumeStore = useResumeStore()

// 所有可用模板
const templates = TEMPLATE_REGISTRY

// 当前选中的模板
const isSelected = (id: string) => {
  return resumeStore.activeResume?.templateId === id
}

// 构造预览数据：复用 initialResumeState，覆盖 templateId 以渲染对应模板
const getPreviewData = (templateId: string): ResumeData => ({
  ...(initialResumeState as ResumeData),
  templateId,
})
</script>

<style scoped>
.template-card {
  background-color: hsl(var(--card));
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* 预览容器：固定 3:4 比例，裁切溢出部分 */
.template-preview-wrapper {
  overflow: hidden;
  position: relative;
  width: 100%;
}
/* 内层缩放层：将 794px 宽的模板等比缩小至卡片宽度
   卡片可视宽度约 220px，scale ≈ 220/794 ≈ 0.277
   预览原始高度 1123px，缩放后约 311px，符合 3:4 比例 */
.template-preview-scaled {
  width: 794px;
  transform: scale(0.277);
  transform-origin: top left;
  pointer-events: none;
}
</style>
