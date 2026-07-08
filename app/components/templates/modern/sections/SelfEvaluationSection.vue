<template>
  <section v-if="content" class="modern-self-evaluation">
    <SectionTitle
      :title="t('resume.sections.selfEvaluation')"
      :global-settings="globalSettings"
      :theme-color="themeColor"
    />
    <div class="evaluation-content rich-content" v-html="content"></div>
  </section>
</template>

<script setup lang="ts">
import type { GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import SectionTitle from './SectionTitle.vue'

// 自我评价模块
const props = defineProps<{
  content: string
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()

const { t } = useI18n()

const themeColor = computed(
  () => props.globalSettings?.themeColor || props.template.colorScheme.primary
)
</script>

<style scoped>
.rich-content :deep(ul) {
  list-style: none;
  padding-left: 0;
  margin: 4px 0;
}

.rich-content :deep(ul li) {
  position: relative;
  padding-left: 16px;
  margin-bottom: 4px;
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
  margin-bottom: 4px;
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
