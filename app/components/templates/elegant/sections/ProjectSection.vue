<template>
  <section class="elegant-projects">
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

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.name {
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

.role {
  font-size: v-bind('`${baseFontSize}px`');
  font-weight: 500;
  color: #334155;
  margin-top: 4px;
  margin-bottom: 8px;
}

.description {
  color: #475569;
  font-size: v-bind('`${baseFontSize - 1}px`');
  text-align: justify;
}

.project-link {
  display: inline-block;
  margin-top: 4px;
  font-size: 13px;
  color: #475569;
  font-style: italic;
  text-decoration: underline;
  word-break: break-all;
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
