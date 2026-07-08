<template>
  <section v-if="hasVisibleItems" class="professional-custom" :style="sectionStyle">
    <SectionTitle :title="title" :global-settings="globalSettings" />
    <div class="custom-list">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="custom-item"
        :style="itemStyle"
      >
        <!-- 顶部行：标题 + 日期 -->
        <div class="custom-header">
          <span class="item-title" :style="itemTitleStyle">{{ item.title }}</span>
          <span v-if="item.dateRange" class="date" :style="dateStyle">
            {{ item.dateRange }}
          </span>
        </div>

        <!-- 副标题 -->
        <div v-if="item.subtitle" class="subtitle" :style="subtitleStyle">
          {{ item.subtitle }}
        </div>

        <!-- 描述 -->
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

// 自定义条目模块：遍历 customData 中的所有条目
const props = defineProps<{
  customData: Record<string, CustomItem[]>
  globalSettings?: GlobalSettings
  template: ResumeTemplate
  menuSections?: MenuSection[]
}>()

const { t } = useI18n()
const title = t('resume.sections.custom')

// 把所有 customData 中的条目合并扁平化
const allItems = computed<CustomItem[]>(() => {
  const data = props.customData || {}
  return Object.values(data).flat()
})

// 过滤可见项
const visibleItems = computed(() => allItems.value.filter((i) => i.visible !== false))

const hasVisibleItems = computed(() => visibleItems.value.length > 0)

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

const itemTitleStyle = computed(() => ({
  fontSize: `${subheaderSize.value}px`,
  fontWeight: '700',
  color: themeColor.value,
}))

const dateStyle = computed(() => ({
  fontSize: `${baseFontSize.value - 2}px`,
  color: props.template.colorScheme.secondary,
}))

const subtitleStyle = computed(() => ({
  fontSize: `${baseFontSize.value}px`,
  fontWeight: '500',
  color: props.template.colorScheme.text,
  marginTop: '2px',
}))
</script>

<style scoped>
.custom-header {
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
</style>
