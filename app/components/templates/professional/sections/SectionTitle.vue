<template>
  <h2
    class="professional-section-title flex items-center gap-2 font-bold mb-3"
    :style="titleStyle"
  >
    <span class="title-bar" :style="{ backgroundColor: themeColor }"></span>
    <span>{{ title }}</span>
  </h2>
</template>

<script setup lang="ts">
import type { GlobalSettings } from '#shared/types/resume'

// 模块标题组件：左侧 4px 竖线装饰
const props = defineProps<{
  title: string
  globalSettings?: GlobalSettings
}>()

// 主题色，默认使用模板主色
const themeColor = computed(
  () => props.globalSettings?.themeColor || '#1f2937'
)

// 标题样式：字体大小由 headerSize 控制
const titleStyle = computed(() => ({
  fontSize: `${props.globalSettings?.headerSize || 20}px`,
  color: themeColor.value,
}))
</script>

<style scoped>
.professional-section-title {
  position: relative;
  line-height: 1.2;
}
.title-bar {
  display: inline-block;
  width: 4px;
  height: 18px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
