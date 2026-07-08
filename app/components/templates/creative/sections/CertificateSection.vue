<template>
  <section v-if="content" class="creative-certificates">
    <SectionTitle
      :title="t('resume.sections.certificates')"
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

// 证书模块
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
  color: #4b5563;
}

.rich-content :deep(ul) {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rich-content :deep(li) {
  padding: 4px 10px;
  background: #faf5ff;
  border-radius: 6px;
  font-size: 13px;
  color: #4b5563;
  border-left: 3px solid v-bind('themeColor');
}

.rich-content :deep(p) {
  margin: 4px 0;
}
</style>
