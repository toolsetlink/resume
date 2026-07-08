<template>
  <div class="snapshot-page">
    <div class="snapshot-container">
      <ResumePreview :resume-data="resumeData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResumeData } from '#shared/types/resume'
import { initialResumeState } from '#shared/config/initialResumeData'
import ResumePreview from '~/components/preview/ResumePreview.vue'

// 模板快照预览页面（阶段 7 Task 7.10）
// 用 initialResumeState 作为示例数据，强制 templateId 为路由参数指定的模板
definePageMeta({
  layout: false,
  ssr: false,
})

useHead({
  title: 'Template Snapshot',
})

const route = useRoute()
const templateId = computed(() => route.params.template as string)

const resumeData = computed<ResumeData>(() => ({
  ...(initialResumeState as ResumeData),
  templateId: templateId.value,
}))
</script>

<style scoped>
.snapshot-page {
  background: #ffffff;
  margin: 0;
  padding: 0;
}

.snapshot-container {
  width: 794px;
  min-height: 1123px;
  margin: 0 auto;
  background: #ffffff;
}
</style>
