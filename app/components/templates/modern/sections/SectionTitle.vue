<template>
  <h2 class="modern-section-title" :style="titleStyle">
    <span class="title-text">{{ title }}</span>
    <span class="title-underline" :style="{ backgroundColor: themeColor }"></span>
  </h2>
</template>

<script setup lang="ts">
import type { GlobalSettings } from '#shared/types/resume'

// 模块标题组件：底部 2px 边框装饰
const props = defineProps<{
  title: string
  globalSettings?: GlobalSettings
  themeColor: string
  side?: 'sidebar' | 'main'
}>()

const themeColor = computed(() => props.themeColor)

const titleStyle = computed(() => ({
  fontSize: `${props.globalSettings?.headerSize || 18}px`,
  color: props.side === 'sidebar' ? '#ffffff' : props.themeColor,
}))
</script>

<style scoped>
.modern-section-title {
  position: relative;
  margin: 0 0 12px 0;
  padding-bottom: 6px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.title-underline {
  display: block;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 36px;
  height: 2px;
}
</style>
