<template>
  <h2 class="creative-section-title">
    <span class="badge" :style="badgeStyle">{{ title }}</span>
  </h2>
</template>

<script setup lang="ts">
import type { GlobalSettings } from '#shared/types/resume'

// 模块标题组件：圆角 badge 样式
const props = defineProps<{
  title: string
  globalSettings?: GlobalSettings
  themeColor: string
}>()

const themeColor = computed(() => props.themeColor)

const badgeStyle = computed(() => ({
  fontSize: `${props.globalSettings?.headerSize || 16}px`,
  backgroundColor: props.themeColor,
  color: '#ffffff',
}))
</script>

<style scoped>
.creative-section-title {
  margin: 0 0 14px 0;
  line-height: 1.2;
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 9999px;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);
  border: 1px solid rgba(124, 58, 237, 0.1);
}
</style>
