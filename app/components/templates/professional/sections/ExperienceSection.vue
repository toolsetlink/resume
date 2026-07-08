<template>
  <section class="professional-experience" :style="sectionStyle">
    <SectionTitle :title="title" :global-settings="globalSettings" />

    <div class="experience-list">
      <div
        v-for="exp in visibleExperiences"
        :key="exp.id"
        class="experience-item"
        :style="itemStyle"
      >
        <!-- 顶部行：公司 + 日期 -->
        <div class="experience-header">
          <span class="company" :style="companyStyle">{{ exp.company }}</span>
          <span class="date" :style="dateStyle">{{ exp.date }}</span>
        </div>
        <!-- 职位 -->
        <div v-if="exp.position" class="position" :style="positionStyle">
          {{ exp.position }}
        </div>
        <!-- 详情 -->
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
const title = t('resume.sections.experience')

// 过滤可见项
const visibleExperiences = computed(() =>
  (props.experiences || []).filter((e) => e.visible !== false)
)

// 主题色
const themeColor = computed(
  () => props.globalSettings?.themeColor || props.template.colorScheme.primary
)

// 字号
const subheaderSize = computed(() => props.globalSettings?.subheaderSize || 16)
const baseFontSize = computed(() => props.globalSettings?.baseFontSize || 16)
const paragraphSpacing = computed(() => props.globalSettings?.paragraphSpacing || 12)
const sectionSpacing = computed(() => props.globalSettings?.sectionSpacing || 10)

// 模块样式
const sectionStyle = computed(() => ({
  marginBottom: `${sectionSpacing.value}px`,
}))

// 单项样式
const itemStyle = computed(() => ({
  marginBottom: `${props.template.spacing.itemGap}px`,
}))

const companyStyle = computed(() => ({
  fontSize: `${subheaderSize.value}px`,
  fontWeight: '700',
  color: themeColor.value,
}))

const dateStyle = computed(() => ({
  fontSize: `${baseFontSize.value - 2}px`,
  color: props.template.colorScheme.secondary,
}))

const positionStyle = computed(() => ({
  fontSize: `${baseFontSize.value}px`,
  fontWeight: '500',
  color: props.template.colorScheme.text,
  marginTop: '2px',
  marginBottom: `${paragraphSpacing.value * 0.5}px`,
}))
</script>

<style scoped>
.experience-header {
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

.rich-content :deep(p) {
  margin: 4px 0;
}
</style>
