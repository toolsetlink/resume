<template>
  <div class="elegant-base-info">
    <!-- 照片 -->
    <div v-if="showPhoto" class="photo-wrapper" :style="photoWrapperStyle">
      <img
        v-if="basic.photo"
        :src="basic.photo"
        :style="photoStyle"
        class="photo-img"
        alt="avatar"
      />
      <div v-else class="photo-placeholder" :style="photoStyle">
        <span class="placeholder-text">{{ nameInitial }}</span>
      </div>
    </div>

    <!-- 姓名 -->
    <h1 v-if="basic.name" class="name" :style="nameStyle">{{ basic.name }}</h1>

    <!-- 职位 -->
    <p v-if="basic.title" class="title" :style="titleStyleText">{{ basic.title }}</p>

    <!-- 联系信息 -->
    <ul v-if="contactItems.length || customFields.length" class="contact-list" :style="contactListStyle">
      <li
        v-for="item in contactItems"
        :key="item.key"
        class="contact-item"
      >
        <span class="contact-value">{{ item.value }}</span>
        <span v-if="item.label" class="contact-divider">·</span>
      </li>
      <li
        v-for="field in customFields"
        :key="field.id"
        class="contact-item"
      >
        <span class="contact-value">{{ field.value }}</span>
        <span class="contact-divider">·</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { BasicInfo, GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import { getBorderRadiusValue } from '#shared/types/resume'

// 基本信息：照片居中 + 姓名 + 职位 + 横向联系信息
const props = defineProps<{
  basic: BasicInfo
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()

const themeColor = computed(
  () => props.globalSettings?.themeColor || props.template.colorScheme.primary
)

const baseFontSize = computed(() => props.globalSettings?.baseFontSize || 16)
const headerSize = computed(() => props.globalSettings?.headerSize || 20)

const showPhoto = computed(() => props.basic.photoConfig?.visible !== false && !!props.basic.photo)
const nameInitial = computed(() => props.basic.name?.charAt(0) || '?')

const photoWrapperStyle = computed(() => ({
  marginBottom: '14px',
}))

const photoStyle = computed(() => {
  const cfg = props.basic.photoConfig
  return {
    width: cfg ? `${Math.min(cfg.width, 110)}px` : '100px',
    height: cfg ? `${Math.min(cfg.height, 140)}px` : '130px',
    borderRadius: cfg?.borderRadius === 'full' ? '9999px' : '6px',
  }
})

const nameStyle = computed(() => ({
  fontSize: `${headerSize.value + 10}px`,
  fontWeight: '600',
  color: themeColor.value,
  letterSpacing: '0.08em',
  margin: '0 0 4px 0',
}))

const titleStyleText = computed(() => ({
  fontSize: `${headerSize.value}px`,
  color: props.template.colorScheme.secondary,
  fontStyle: 'italic',
  margin: '0 0 12px 0',
}))

const contactListStyle = computed(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0 8px',
  listStyle: 'none',
  padding: 0,
  margin: 0,
}))

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
.elegant-base-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 24px;
}

.photo-wrapper {
  flex-shrink: 0;
  overflow: hidden;
}

.photo-img {
  object-fit: cover;
  display: block;
}

.photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #94a3b8;
  font-size: 32px;
  font-weight: 500;
}

.contact-item {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  color: #475569;
}

.contact-divider {
  color: #cbd5e1;
  margin-left: 8px;
}

.contact-item:last-child .contact-divider {
  display: none;
}
</style>
