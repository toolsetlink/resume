<template>
  <div class="modern-template" :style="containerStyle">
    <!-- 左侧侧边栏 -->
    <SideBar
      :basic="data.basic"
      :skill-content="data.skillContent"
      :global-settings="data.globalSettings"
      :template="template"
    />

    <!-- 右侧主内容 -->
    <MainContent
      :basic="data.basic"
      :experiences="data.experience"
      :projects="data.projects"
      :education="data.education"
      :custom-data="data.customData"
      :menu-sections="data.menuSections"
      :self-evaluation-content="data.selfEvaluationContent"
      :certificates-content="data.certificatesContent"
      :global-settings="data.globalSettings"
      :template="template"
    />
  </div>
</template>

<script setup lang="ts">
import type { ResumeData } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import SideBar from './sections/SideBar.vue'
import MainContent from './sections/MainContent.vue'

// 现代极简模板主组件：左右双栏
const props = defineProps<{
  data: ResumeData
  template: ResumeTemplate
}>()

// 容器样式：双栏布局
const containerStyle = computed(() => ({
  backgroundColor: props.template.colorScheme.background,
  color: props.template.colorScheme.text,
  fontSize: `${props.data.globalSettings?.baseFontSize || 16}px`,
  lineHeight: String(props.data.globalSettings?.lineHeight || 1.6),
  display: 'flex',
  minHeight: '100%',
  width: '100%',
}))
</script>

<style scoped>
.modern-template {
  font-family: 'Helvetica Neue', Helvetica, Arial, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
</style>
