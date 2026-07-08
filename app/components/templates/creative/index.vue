<template>
  <div class="creative-template" :style="containerStyle">
    <!-- 顶部彩色横幅 -->
    <HeaderBanner
      :basic="data.basic"
      :global-settings="data.globalSettings"
      :template="template"
    />

    <!-- 下方两栏内容 -->
    <div class="creative-body">
      <!-- 左侧：技能 -->
      <div class="creative-left">
        <SkillSection
          v-if="data.skillContent && hasSection('skills')"
          :content="data.skillContent"
          :global-settings="data.globalSettings"
          :template="template"
        />
        <SelfEvaluationSection
          v-if="data.selfEvaluationContent && hasSection('selfEvaluation')"
          :content="data.selfEvaluationContent"
          :global-settings="data.globalSettings"
          :template="template"
        />
        <CertificateSection
          v-if="data.certificatesContent && hasSection('certificates')"
          :content="data.certificatesContent"
          :global-settings="data.globalSettings"
          :template="template"
        />
      </div>

      <!-- 右侧：工作 + 项目 + 教育 + 自定义 -->
      <div class="creative-right">
        <template v-for="section in enabledMainSections" :key="section.id">
          <component
            :is="getSectionComponent(section.id)"
            v-if="getSectionComponent(section.id) && hasSectionData(section.id)"
            v-bind="getSectionProps(section.id)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { ResumeData } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import HeaderBanner from './sections/HeaderBanner.vue'
import SkillSection from './sections/SkillSection.vue'
import SelfEvaluationSection from './sections/SelfEvaluationSection.vue'
import CertificateSection from './sections/CertificateSection.vue'
import ExperienceSection from './sections/ExperienceSection.vue'
import EducationSection from './sections/EducationSection.vue'
import ProjectSection from './sections/ProjectSection.vue'
import CustomSection from './sections/CustomSection.vue'

// 创意活泼模板主组件：横幅 + 双栏
const props = defineProps<{
  data: ResumeData
  template: ResumeTemplate
}>()

const containerStyle = computed(() => ({
  backgroundColor: props.template.colorScheme.background,
  color: props.template.colorScheme.text,
  fontSize: `${props.data.globalSettings?.baseFontSize || 16}px`,
  lineHeight: String(props.data.globalSettings?.lineHeight || 1.6),
}))

// 是否启用某模块
const hasSection = (id: string): boolean => {
  return (props.data.menuSections || []).some((s) => s.id === id && s.enabled)
}

// 右侧主区域启用的模块
const enabledMainSections = computed(() => {
  return [...(props.data.menuSections || [])]
    .filter((s) => s.enabled && ['experience', 'projects', 'education', 'custom'].includes(s.id))
    .sort((a, b) => a.order - b.order)
})

const sectionComponents: Record<string, Component> = {
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectSection,
  custom: CustomSection,
}

const getSectionComponent = (id: string): Component | null =>
  sectionComponents[id] ?? null

const hasSectionData = (sectionId: string): boolean => {
  const data = props.data
  switch (sectionId) {
    case 'experience':
      return (data.experience || []).some((e) => e.visible !== false)
    case 'education':
      return (data.education || []).some((e) => e.visible !== false)
    case 'projects':
      return (data.projects || []).some((p) => p.visible !== false)
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
.creative-template {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.creative-body {
  display: flex;
  gap: 20px;
  padding: 24px;
}

.creative-left {
  width: 35%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.creative-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
</style>
