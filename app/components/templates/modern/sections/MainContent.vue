<template>
  <main class="modern-main" :style="mainStyle">
    <!-- 按顺序渲染启用的模块 -->
    <template v-for="section in enabledSections" :key="section.id">
      <component
        :is="getSectionComponent(section.id)"
        v-if="getSectionComponent(section.id) && hasSectionData(section.id)"
        v-bind="getSectionProps(section.id)"
      />
    </template>
  </main>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type {
  BasicInfo,
  CustomItem,
  Education,
  Experience,
  GlobalSettings,
  MenuSection,
  Project,
} from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import ExperienceSection from './ExperienceSection.vue'
import EducationSection from './EducationSection.vue'
import ProjectSection from './ProjectSection.vue'
import BaseInfo from './BaseInfo.vue'
import SelfEvaluationSection from './SelfEvaluationSection.vue'
import CertificateSection from './CertificateSection.vue'
import CustomSection from './CustomSection.vue'

// 现代极简模板主内容区：基本信息 + 工作 + 项目 + 教育
const props = defineProps<{
  basic: BasicInfo
  experiences: Experience[]
  projects: Project[]
  education: Education[]
  customData: Record<string, CustomItem[]>
  menuSections?: MenuSection[]
  selfEvaluationContent?: string
  certificatesContent?: string
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()

const mainStyle = computed(() => ({
  padding: '32px 28px',
  width: '65%',
  flex: 1,
}))

// 启用模块并按 order 排序（排除 basic/skills - 已在侧边栏）
const enabledSections = computed(() => {
  return [...(props.menuSections || [])]
    .filter((s) => s.enabled && s.id !== 'basic' && s.id !== 'skills')
    .sort((a, b) => a.order - b.order)
})

const sectionComponents: Record<string, Component> = {
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectSection,
  selfEvaluation: SelfEvaluationSection,
  certificates: CertificateSection,
  custom: CustomSection,
}

const getSectionComponent = (id: string): Component | null =>
  sectionComponents[id] ?? null

// 模块是否有数据
const hasSectionData = (sectionId: string): boolean => {
  switch (sectionId) {
    case 'experience':
      return (props.experiences || []).some((e) => e.visible !== false)
    case 'education':
      return (props.education || []).some((e) => e.visible !== false)
    case 'projects':
      return (props.projects || []).some((p) => p.visible !== false)
    case 'selfEvaluation':
      return !!props.selfEvaluationContent
    case 'certificates':
      return !!props.certificatesContent
    case 'custom': {
      const customData = props.customData || {}
      return Object.values(customData)
        .flat()
        .some((i) => i.visible !== false)
    }
    default:
      return false
  }
}

const getSectionProps = (sectionId: string): Record<string, unknown> => {
  const { globalSettings, template } = props
  switch (sectionId) {
    case 'experience':
      return { experiences: props.experiences, globalSettings, template }
    case 'education':
      return { education: props.education, globalSettings, template }
    case 'projects':
      return { projects: props.projects, globalSettings, template }
    case 'custom':
      return {
        customData: props.customData,
        globalSettings,
        template,
        menuSections: props.menuSections,
      }
    case 'selfEvaluation':
      return { content: props.selfEvaluationContent, globalSettings, template }
    case 'certificates':
      return { content: props.certificatesContent, globalSettings, template }
    default:
      return {}
  }
}
</script>

<style scoped>
.modern-main {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
</style>
