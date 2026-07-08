<template>
  <section class="professional-projects" :style="sectionStyle">
    <SectionTitle :title="title" :global-settings="globalSettings" />

    <div class="project-list">
      <div
        v-for="proj in visibleProjects"
        :key="proj.id"
        class="project-item"
        :style="itemStyle"
      >
        <!-- 顶部行：项目名 + 时间 -->
        <div class="project-header">
          <span class="name" :style="nameStyle">{{ proj.name }}</span>
          <span v-if="proj.date" class="date" :style="dateStyle">{{ proj.date }}</span>
        </div>

        <!-- 角色 -->
        <div v-if="proj.role" class="role" :style="roleStyle">
          {{ proj.role }}
        </div>

        <!-- 描述 -->
        <div
          v-if="proj.description"
          class="description rich-content"
          v-html="proj.description"
        ></div>

        <!-- 链接 -->
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
const title = t('resume.sections.projects')

// 过滤可见项
const visibleProjects = computed(() =>
  (props.projects || []).filter((p) => p.visible !== false)
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

const nameStyle = computed(() => ({
  fontSize: `${subheaderSize.value}px`,
  fontWeight: '700',
  color: themeColor.value,
}))

const dateStyle = computed(() => ({
  fontSize: `${baseFontSize.value - 2}px`,
  color: props.template.colorScheme.secondary,
}))

const roleStyle = computed(() => ({
  fontSize: `${baseFontSize.value}px`,
  fontWeight: '500',
  color: props.template.colorScheme.text,
  marginTop: '2px',
  marginBottom: '4px',
}))
</script>

<style scoped>
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.project-link {
  display: inline-block;
  margin-top: 4px;
  font-size: 13px;
  color: #2563eb;
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
