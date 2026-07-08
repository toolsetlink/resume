<template>
  <section class="creative-experience">
    <SectionTitle
      :title="t('resume.sections.experience')"
      :global-settings="globalSettings"
      :theme-color="themeColor"
    />
    <div class="experience-list">
      <div
        v-for="exp in visibleExperiences"
        :key="exp.id"
        class="experience-item"
        :style="itemStyle"
      >
        <div class="experience-header">
          <span class="company">{{ exp.company }}</span>
          <span v-if="exp.date" class="date">{{ exp.date }}</span>
        </div>
        <div v-if="exp.position" class="position">{{ exp.position }}</div>
        <div
          v-if="exp.details"
          class="details rich-content"
          v-html="exp.details"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Experience, GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import SectionTitle from './SectionTitle.vue'

// 工作经历模块
const props = defineProps<{
  experiences: Experience[]
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()

const { t } = useI18n()

const themeColor = computed(
  () => props.globalSettings?.themeColor || props.template.colorScheme.primary
)

const visibleExperiences = computed(() =>
  (props.experiences || []).filter((e) => e.visible !== false)
)

const itemStyle = computed(() => ({
  marginBottom: `${props.template.spacing.itemGap}px`,
}))

const subheaderSize = computed(() => props.globalSettings?.subheaderSize || 16)
const baseFontSize = computed(() => props.globalSettings?.baseFontSize || 16)
</script>

<style scoped>
.experience-list {
  display: flex;
  flex-direction: column;
}

.experience-item {
  padding: 12px;
  background: #faf5ff;
  border-radius: 10px;
  border-left: 4px solid v-bind('themeColor');
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.company {
  font-size: v-bind('`${subheaderSize}px`');
  font-weight: 700;
  color: v-bind('themeColor');
}

.date {
  font-size: v-bind('`${baseFontSize - 2}px`');
  color: #6b7280;
  flex-shrink: 0;
}

.position {
  font-size: v-bind('`${baseFontSize}px`');
  font-weight: 500;
  color: #1f2937;
  margin-top: 2px;
  margin-bottom: 6px;
}

.details {
  color: #4b5563;
  font-size: v-bind('`${baseFontSize - 1}px`');
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

.rich-content :deep(p) {
  margin: 4px 0;
}
</style>
