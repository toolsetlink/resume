<template>
  <aside class="modern-sidebar" :style="sideBarStyle">
    <!-- 照片 -->
    <div v-if="showPhoto" class="photo-wrapper">
      <img
        v-if="basic.photo"
        :src="basic.photo"
        class="photo-img"
        alt="avatar"
      />
      <div v-else class="photo-placeholder">
        <span class="placeholder-text">{{ nameInitial }}</span>
      </div>
    </div>

    <!-- 姓名 + 职位 -->
    <div class="basic-block">
      <h1 v-if="basic.name" class="name">{{ basic.name }}</h1>
      <p v-if="basic.title" class="title">{{ basic.title }}</p>
    </div>

    <!-- 联系方式 -->
    <div v-if="contactItems.length || customFields.length" class="contact-block">
      <SectionTitle
        title="联系方式"
        :global-settings="globalSettings"
        :theme-color="themeColor"
        side="sidebar"
      />
      <ul class="contact-list">
        <li v-for="item in contactItems" :key="item.key" class="contact-item">
          <span v-if="item.label" class="contact-label">{{ item.label }}</span>
          <span class="contact-value">{{ item.value }}</span>
        </li>
        <li v-for="field in customFields" :key="field.id" class="contact-item">
          <span v-if="field.displayLabel !== false" class="contact-label">{{ field.label }}</span>
          <span class="contact-value">{{ field.value }}</span>
        </li>
      </ul>
    </div>

    <!-- 技能 -->
    <div v-if="skillContent" class="skill-block">
      <SectionTitle
        :title="t('resume.sections.skills')"
        :global-settings="globalSettings"
        :theme-color="themeColor"
        side="sidebar"
      />
      <div class="skill-content rich-content" v-html="skillContent"></div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { BasicInfo, GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import SectionTitle from './SectionTitle.vue'

// 现代极简模板侧边栏：照片 + 基本信息 + 联系方式 + 技能
const props = defineProps<{
  basic: BasicInfo
  skillContent: string
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()

const { t } = useI18n()

const themeColor = computed(
  () => props.globalSettings?.themeColor || props.template.colorScheme.primary
)

const showPhoto = computed(() => props.basic.photoConfig?.visible !== false && !!props.basic.photo)
const nameInitial = computed(() => props.basic.name?.charAt(0) || '?')

const sideBarStyle = computed(() => ({
  backgroundColor: props.template.colorScheme.primary,
  color: '#e2e8f0',
  padding: '32px 24px',
  width: '35%',
  flexShrink: 0,
}))

// 联系信息
const contactItems = computed(() => {
  const b = props.basic
  const items: { key: string; label: string; value: string }[] = []
  if (b.email) items.push({ key: 'email', label: '邮箱', value: b.email })
  if (b.phone) items.push({ key: 'phone', label: '电话', value: b.phone })
  if (b.location) items.push({ key: 'location', label: '所在地', value: b.location })
  if (b.age) items.push({ key: 'age', label: '年龄', value: b.age })
  if (b.employementStatus)
    items.push({ key: 'employementStatus', label: '状态', value: b.employementStatus })
  return items
})

const customFields = computed(() =>
  (props.basic.customFields || []).filter((f) => f.visible !== false)
)
</script>

<style scoped>
.modern-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.photo-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 8px;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 40px;
  font-weight: 600;
}

.basic-block {
  text-align: center;
}

.name {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.title {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.contact-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  line-height: 1.4;
  word-break: break-all;
}

.contact-label {
  color: #64748b;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.contact-value {
  color: #e2e8f0;
}

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
