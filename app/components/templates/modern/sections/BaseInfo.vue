<template>
  <div class="modern-base-info">
    <!-- 此模板中 BaseInfo 主体已在 SideBar 渲染，此文件为占位/扩展 -->
  </div>
</template>

<script setup lang="ts">
import type { BasicInfo, GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'

// 现代极简模板 BaseInfo 占位组件（实际渲染在 SideBar）
defineProps<{
  basic: BasicInfo
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()
</script>

<style scoped>
.modern-base-info {
  display: none;
}
</style>
