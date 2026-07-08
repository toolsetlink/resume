<template>
  <section v-if="content" class="elegant-self-evaluation">
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
.evaluation-content {
  text-align: justify;
  color: #475569;
  font-style: italic;
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
