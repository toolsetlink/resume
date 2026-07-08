<template>
  <section class="elegant-experience">
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

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.company {
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

.position {
  font-size: v-bind('`${baseFontSize}px`');
  font-weight: 500;
  color: #334155;
  margin-top: 4px;
  margin-bottom: 8px;
}

.details {
  color: #475569;
  font-size: v-bind('`${baseFontSize - 1}px`');
  text-align: justify;
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

.rich-content :deep(p) {
  margin: 4px 0;
}
</style>
