<template>
  <section v-if="hasVisibleItems" class="elegant-custom">
    <SectionTitle
      :title="t('resume.sections.custom')"
      :global-settings="globalSettings"
      :theme-color="themeColor"
    />
    <div class="custom-list">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="custom-item"
        :style="itemStyle"
      >
        <div class="custom-header">
          <span class="item-title">{{ item.title }}</span>
          <span v-if="item.dateRange" class="date">{{ item.dateRange }}</span>
        </div>
        <div v-if="item.subtitle" class="subtitle">{{ item.subtitle }}</div>
        <div
          v-if="item.description"
          class="description rich-content"
          v-html="item.description"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CustomItem, GlobalSettings, MenuSection } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import SectionTitle from './SectionTitle.vue'

// 自定义条目模块
const props = defineProps<{
  customData: Record<string, CustomItem[]>
  globalSettings?: GlobalSettings
  template: ResumeTemplate
  menuSections?: MenuSection[]
}>()

const { t } = useI18n()

const themeColor = computed(
  () => props.globalSettings?.themeColor || props.template.colorScheme.primary
)

const allItems = computed<CustomItem[]>(() => {
  const data = props.customData || {}
  return Object.values(data).flat()
})

const visibleItems = computed(() => allItems.value.filter((i) => i.visible !== false))
const hasVisibleItems = computed(() => visibleItems.value.length > 0)

const itemStyle = computed(() => ({
  marginBottom: `${props.template.spacing.itemGap}px`,
}))

const subheaderSize = computed(() => props.globalSettings?.subheaderSize || 16)
const baseFontSize = computed(() => props.globalSettings?.baseFontSize || 16)
</script>

<style scoped>
.custom-list {
  display: flex;
  flex-direction: column;
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.item-title {
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

.subtitle {
  font-size: v-bind('`${baseFontSize}px`');
  font-weight: 500;
  color: #334155;
  margin-top: 2px;
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
