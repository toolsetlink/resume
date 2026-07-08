<template>
  <div class="resume-preview-container">
    <component
      :is="TemplateComponent"
      v-if="TemplateComponent"
      :data="resumeData"
      :template="templateConfig"
    />
    <div v-else class="flex items-center justify-center h-64 text-gray-400">
      请选择模板
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResumeData } from '#shared/types/resume'
import {
  getTemplateComponent,
  getTemplateConfig,
} from '~/components/templates/registry'
import { professionalConfig } from '~/components/templates/professional/config'

// 简历预览容器：根据当前模板从 registry 获取组件并渲染
const props = defineProps<{
  resumeData: ResumeData
}>()

// 当前模板配置（默认 professional）
const templateConfig = computed(() => {
  const id = props.resumeData.templateId
  return (id && getTemplateConfig(id)) || professionalConfig
})

// 当前模板组件
const TemplateComponent = computed(() => {
  return getTemplateComponent(templateConfig.value.layout)
})
</script>

<style scoped>
.resume-preview-container {
  width: 100%;
  min-height: 100%;
}
</style>
