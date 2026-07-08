<template>
  <section class="creative-projects">
    <SectionTitle
      :title="t('resume.sections.projects')"
      :global-settings="globalSettings"
      :theme-color="themeColor"
    />
    <div class="project-list">
      <div
        v-for="proj in visibleProjects"
        :key="proj.id"
        class="project-item"
        :style="itemStyle"
      >
        <div class="project-header">
          <span class="name">{{ proj.name }}</span>
          <span v-if="proj.date" class="date">{{ proj.date }}</span>
        </div>
        <div v-if="proj.role" class="role">{{ proj.role }}</div>
        <div
          v-if="proj.description"
          class="description rich-content"
          v-html="proj.description"
        ></div>
        <a
          v-if="proj.link"
          :href="proj.link"
          class="project-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ proj.linkLabel || proj.link }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Project, GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import SectionTitle from './SectionTitle.vue'

// 项目经历模块
const props = defineProps<{
  projects: Project[]
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()

const { t } = useI18n()

const themeColor = computed(
  () => props.globalSettings?.themeColor || props.template.colorScheme.primary
)

const visibleProjects = computed(() =>
  (props.projects || []).filter((p) => p.visible !== false)
)

const itemStyle = computed(() => ({
  marginBottom: `${props.template.spacing.itemGap}px`,
}))

const subheaderSize = computed(() => props.globalSettings?.subheaderSize || 16)
const baseFontSize = computed(() => props.globalSettings?.baseFontSize || 16)
</script>

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
}

.project-item {
  padding: 12px;
  background: #f5f3ff;
  border-radius: 10px;
  border-left: 4px solid v-bind('themeColor');
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.name {
  font-size: v-bind('`${subheaderSize}px`');
  font-weight: 700;
  color: v-bind('themeColor');
}

.date {
  font-size: v-bind('`${baseFontSize - 2}px`');
  color: #6b7280;
  flex-shrink: 0;
}

.role {
  font-size: v-bind('`${baseFontSize}px`');
  font-weight: 500;
  color: #1f2937;
  margin-top: 2px;
  margin-bottom: 4px;
}

.description {
  color: #4b5563;
  font-size: v-bind('`${baseFontSize - 1}px`');
}

.project-link {
  display: inline-block;
  margin-top: 4px;
  font-size: 12px;
  color: #7c3aed;
  text-decoration: underline;
  word-break: break-all;
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
