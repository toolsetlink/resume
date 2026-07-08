<template>
  <section class="elegant-education">
    <SectionTitle
      :title="t('resume.sections.education')"
      :global-settings="globalSettings"
      :theme-color="themeColor"
    />
    <div class="education-list">
      <div
        v-for="edu in visibleEducations"
        :key="edu.id"
        class="education-item"
        :style="itemStyle"
      >
        <div class="education-header">
          <span class="school">{{ edu.school }}</span>
          <span v-if="formatDateRange(edu)" class="date">{{ formatDateRange(edu) }}</span>
        </div>
        <div v-if="majorDegree(edu)" class="major-degree">{{ majorDegree(edu) }}</div>
        <div v-if="edu.gpa" class="gpa">GPA: {{ edu.gpa }}</div>
        <div
          v-if="edu.description"
          class="description rich-content"
          v-html="edu.description"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Education, GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import SectionTitle from './SectionTitle.vue'

// 教育经历模块
const props = defineProps<{
  education: Education[]
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()

const { t } = useI18n()

const themeColor = computed(
  () => props.globalSettings?.themeColor || props.template.colorScheme.primary
)

const visibleEducations = computed(() =>
  (props.education || []).filter((e) => e.visible !== false)
)

const itemStyle = computed(() => ({
  marginBottom: `${props.template.spacing.itemGap}px`,
}))

const subheaderSize = computed(() => props.globalSettings?.subheaderSize || 16)
const baseFontSize = computed(() => props.globalSettings?.baseFontSize || 16)

const formatDateRange = (edu: Education): string => {
  const parts: string[] = []
  if (edu.startDate) parts.push(edu.startDate)
  if (edu.endDate) parts.push(edu.endDate)
  return parts.join(' - ')
}

const majorDegree = (edu: Education): string => {
  const parts: string[] = []
  if (edu.major) parts.push(edu.major)
  if (edu.degree) parts.push(edu.degree)
  return parts.join(' · ')
}
</script>

<style scoped>
.education-list {
  display: flex;
  flex-direction: column;
}

.education-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.school {
  font-size: v-bind('`${subheaderSize}px`');
  font-weight: 600;
  color: v-bind('themeColor');
  font-style: italic;
}

.date {
  font-size: v-bind('`${baseFontSize - 2}px`');
  color: #94a3b8;
  font-style: italic;
  flex-shrink: 0;
}

.major-degree {
  font-size: v-bind('`${baseFontSize}px`');
  color: #334155;
  margin-top: 2px;
}

.gpa {
  font-size: v-bind('`${baseFontSize - 1}px`');
  color: #64748b;
  margin-top: 2px;
}

.rich-content :deep(ul) {
  list-style: none;
  padding: 0;
  margin: 4px 0;
}

.rich-content :deep(li) {
  margin-bottom: 6px;
  padding-left: 14px;
  position: relative;
}

.rich-content :deep(li)::before {
  content: '◆';
  position: absolute;
  left: 0;
  top: 0;
  font-size: 8px;
  color: v-bind('themeColor');
}
</style>
