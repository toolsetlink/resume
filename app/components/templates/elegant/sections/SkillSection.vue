<template>
  <section v-if="content" class="elegant-skills">
    <SectionTitle
      :title="t('resume.sections.skills')"
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

// 专业技能模块
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
