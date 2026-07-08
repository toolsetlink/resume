<template>
  <div class="creative-base-info" />
</template>

<script setup lang="ts">
import type { BasicInfo, GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'

// 创意活泼模板 BaseInfo 占位组件（实际渲染在 HeaderBanner）
defineProps<{
  basic: BasicInfo
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()
</script>

<style scoped>
.creative-base-info {
  display: none;
}
</style>
