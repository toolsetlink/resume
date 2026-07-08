<template>
  <h2 class="elegant-section-title" :style="titleStyle">
    <span class="title-line left" :style="{ backgroundColor: themeColor }"></span>
    <span class="title-text">{{ title }}</span>
    <span class="title-line right" :style="{ backgroundColor: themeColor }"></span>
  </h2>
</template>

<script setup lang="ts">
import type { GlobalSettings } from '#shared/types/resume'

// 模块标题组件：居中大写 + 两侧装饰线
const props = defineProps<{
  title: string
  globalSettings?: GlobalSettings
  themeColor: string
}>()

const themeColor = computed(() => props.themeColor)

const titleStyle = computed(() => ({
  fontSize: `${props.globalSettings?.headerSize || 18}px`,
  color: props.themeColor,
}))
</script>

<style scoped>
.elegant-section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 0 0 18px 0;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.title-line {
  display: inline-block;
  width: 48px;
  height: 2px;
  flex-shrink: 0;
}
</style>
