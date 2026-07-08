<template>
  <section v-if="content" class="modern-skills">
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
.rich-content :deep(ul) {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rich-content :deep(li) {
  margin-bottom: 6px;
  padding-left: 12px;
  position: relative;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.5;
}

.rich-content :deep(li)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #94a3b8;
}

.rich-content :deep(p) {
  margin: 4px 0;
  color: #cbd5e1;
}
</style>
