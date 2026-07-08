<template>
  <section class="modern-education">
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

.education-item {
  position: relative;
  padding-left: 16px;
  border-left: 2px solid #e2e8f0;
}

.education-item::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0f172a;
}

.education-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.school {
  font-size: v-bind('`${subheaderSize}px`');
  font-weight: 700;
  color: v-bind('themeColor');
}

.date {
  font-size: v-bind('`${baseFontSize - 2}px`');
  color: #64748b;
  flex-shrink: 0;
}

.major-degree {
  font-size: v-bind('`${baseFontSize}px`');
  color: #1e293b;
  margin-top: 2px;
}

.gpa {
  font-size: v-bind('`${baseFontSize - 1}px`');
  color: #64748b;
  margin-top: 2px;
}

.rich-content :deep(ul) {
  list-style: none;
  padding-left: 0;
  margin: 4px 0;
}

.rich-content :deep(ul li) {
  position: relative;
  padding-left: 16px;
  margin-bottom: 2px;
}

.rich-content :deep(ul li::before) {
  content: '';
  position: absolute;
  left: 4px;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.rich-content :deep(ol) {
  list-style: none;
  padding-left: 0;
  margin: 4px 0;
  counter-reset: item;
}

.rich-content :deep(ol li) {
  position: relative;
  padding-left: 20px;
  margin-bottom: 2px;
  counter-increment: item;
}

.rich-content :deep(ol li::before) {
  content: counter(item) '.';
  position: absolute;
  left: 0;
  font-weight: 600;
}
</style>
