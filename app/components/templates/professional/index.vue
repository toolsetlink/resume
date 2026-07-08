<template>
  <div
    class="professional-template"
    :style="containerStyle"
  >
    <!-- 顶部基本信息 -->
    <BaseInfo
      :basic="data.basic"
      :global-settings="data.globalSettings"
      :template="template"
    />

    <!-- 按顺序渲染启用的模块 -->
    <template v-for="section in enabledSections" :key="section.id">
      <component
        :is="getSectionComponent(section.id)"
        v-if="getSectionComponent(section.id) && hasSectionData(section.id)"
        v-bind="getSectionProps(section.id)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { ResumeData } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import BaseInfo from './sections/BaseInfo.vue'
import ExperienceSection from './sections/ExperienceSection.vue'
import EducationSection from './sections/EducationSection.vue'
import ProjectSection from './sections/ProjectSection.vue'
import SkillSection from './sections/SkillSection.vue'
import SelfEvaluationSection from './sections/SelfEvaluationSection.vue'
import CertificateSection from './sections/CertificateSection.vue'
import CustomSection from './sections/CustomSection.vue'

// 专业简约模板主组件
const props = defineProps<{
  data: ResumeData
  template: ResumeTemplate
}>()

// 启用模块并按 order 排序
const enabledSections = computed(() => {
  return [...(props.data.menuSections || [])]
    .filter((s) => s.enabled && s.id !== 'basic')
    .sort((a, b) => a.order - b.order)
})

// 容器样式：注入主题色、字号、行高
const containerStyle = computed(() => ({
  backgroundColor: props.template.colorScheme.background,
  color: props.template.colorScheme.text,
  padding: `${props.template.spacing.contentPadding}px`,
  fontSize: `${props.data.globalSettings?.baseFontSize || 16}px`,
  lineHeight: String(props.data.globalSettings?.lineHeight || 1.6),
}))

// 模块组件映射
const sectionComponents: Record<string, Component> = {
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectSection,
  skills: SkillSection,
  selfEvaluation: SelfEvaluationSection,
  certificates: CertificateSection,
  custom: CustomSection,
}

const getSectionComponent = (sectionId: string): Component | null => {
  return sectionComponents[sectionId] ?? null
}

// 模块是否有数据（空数据则不渲染）
const hasSectionData = (sectionId: string): boolean => {
  const data = props.data
  switch (sectionId) {
    case 'experience':
      return (data.experience || []).some((e) => e.visible !== false)
    case 'education':
      return (data.education || []).some((e) => e.visible !== false)
    case 'projects':
      return (data.projects || []).some((p) => p.visible !== false)
    case 'skills':
      return !!data.skillContent
    case 'selfEvaluation':
      return !!data.selfEvaluationContent
    case 'certificates':
      return !!data.certificatesContent
    case 'custom': {
      const customData = data.customData || {}
      return Object.values(customData)
        .flat()
        .some((i) => i.visible !== false)
    }
    default:
      return false
  }
}

// 各模块对应的 props
const getSectionProps = (sectionId: string): Record<string, unknown> => {
  const { data, template } = props
  const gs = data.globalSettings
  switch (sectionId) {
    case 'experience':
      return { experiences: data.experience, globalSettings: gs, template }
    case 'education':
      return { education: data.education, globalSettings: gs, template }
    case 'projects':
      return { projects: data.projects, globalSettings: gs, template }
    case 'skills':
      return { content: data.skillContent, globalSettings: gs, template }
    case 'selfEvaluation':
      return { content: data.selfEvaluationContent, globalSettings: gs, template }
    case 'certificates':
      return { content: data.certificatesContent, globalSettings: gs, template }
    case 'custom':
      return {
        customData: data.customData,
        globalSettings: gs,
        template,
        menuSections: data.menuSections,
      }
    default:
      return {}
  }
}
</script>

<style scoped>
.professional-template {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  font-family: 'Helvetica Neue', Helvetica, Arial, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
</style>
