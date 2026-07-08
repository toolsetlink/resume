<template>
  <section class="professional-education" :style="sectionStyle">
    <SectionTitle :title="title" :global-settings="globalSettings" />

    <div class="education-list">
      <div
        v-for="edu in visibleEducations"
        :key="edu.id"
        class="education-item"
        :style="itemStyle"
      >
        <!-- 顶部行：学校 + 时间 -->
        <div class="education-header">
          <span class="school" :style="schoolStyle">{{ edu.school }}</span>
          <span v-if="formatDateRange(edu)" class="date" :style="dateStyle">
            {{ formatDateRange(edu) }}
          </span>
        </div>

        <!-- 专业 / 学位 -->
        <div v-if="majorDegree(edu)" class="major-degree" :style="majorStyle">
          {{ majorDegree(edu) }}
        </div>

        <!-- GPA -->
        <div v-if="edu.gpa" class="gpa" :style="gpaStyle">
          GPA: {{ edu.gpa }}
        </div>

        <!-- 描述 -->
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
const title = t('resume.sections.education')

// 过滤可见项
const visibleEducations = computed(() =>
  (props.education || []).filter((e) => e.visible !== false)
)

// 主题色
const themeColor = computed(
  () => props.globalSettings?.themeColor || props.template.colorScheme.primary
)

// 字号
const subheaderSize = computed(() => props.globalSettings?.subheaderSize || 16)
const baseFontSize = computed(() => props.globalSettings?.baseFontSize || 16)
const sectionSpacing = computed(() => props.globalSettings?.sectionSpacing || 10)

const sectionStyle = computed(() => ({
  marginBottom: `${sectionSpacing.value}px`,
}))

const itemStyle = computed(() => ({
  marginBottom: `${props.template.spacing.itemGap}px`,
}))

const schoolStyle = computed(() => ({
  fontSize: `${subheaderSize.value}px`,
  fontWeight: '700',
  color: themeColor.value,
}))

const dateStyle = computed(() => ({
  fontSize: `${baseFontSize.value - 2}px`,
  color: props.template.colorScheme.secondary,
}))

const majorStyle = computed(() => ({
  fontSize: `${baseFontSize.value}px`,
  color: props.template.colorScheme.text,
  marginTop: '2px',
}))

const gpaStyle = computed(() => ({
  fontSize: `${baseFontSize.value - 1}px`,
  color: props.template.colorScheme.secondary,
  marginTop: '2px',
}))

// 计算时间范围
const formatDateRange = (edu: Education): string => {
  const parts: string[] = []
  if (edu.startDate) parts.push(edu.startDate)
  if (edu.endDate) parts.push(edu.endDate)
  return parts.join(' - ')
}

// 拼接专业 + 学位
const majorDegree = (edu: Education): string => {
  const parts: string[] = []
  if (edu.major) parts.push(edu.major)
  if (edu.degree) parts.push(edu.degree)
  return parts.join(' · ')
}
</script>

<style scoped>
.education-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
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
