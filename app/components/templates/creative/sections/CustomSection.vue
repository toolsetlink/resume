<template>
  <section v-if="hasVisibleItems" class="creative-custom">
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

.custom-item {
  padding: 12px;
  background: #fdf2f8;
  border-radius: 10px;
  border-left: 4px solid v-bind('themeColor');
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.item-title {
  font-size: v-bind('`${subheaderSize}px`');
  font-weight: 700;
  color: v-bind('themeColor');
}

.date {
  font-size: v-bind('`${baseFontSize - 2}px`');
  color: #6b7280;
  flex-shrink: 0;
}

.subtitle {
  font-size: v-bind('`${baseFontSize}px`');
  font-weight: 500;
  color: #1f2937;
  margin-top: 2px;
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
