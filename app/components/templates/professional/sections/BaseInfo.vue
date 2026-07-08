<template>
  <div class="professional-base-info" :class="layoutClass">
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

    <!-- 基本信息主体 -->
    <div class="base-info-main" :style="mainStyle">
      <!-- 姓名 -->
      <h1 v-if="basic.name" class="name" :style="nameStyle">
        {{ basic.name }}
      </h1>

      <!-- 职位 -->
      <p v-if="basic.title" class="title" :style="titleStyleText">
        {{ basic.title }}
      </p>

      <!-- 联系信息 -->
      <ul v-if="contactItems.length" class="contact-list" :style="contactListStyle">
        <li
          v-for="item in contactItems"
          :key="item.key"
          class="contact-item"
          :style="contactItemStyle"
        >
          <span v-if="item.label && !useIconMode" class="contact-label">
            {{ item.label }}:
          </span>
          <span class="contact-value">{{ item.value }}</span>
        </li>
      </ul>

      <!-- 自定义字段 -->
      <ul v-if="customFields.length" class="contact-list" :style="contactListStyle">
        <li
          v-for="field in customFields"
          :key="field.id"
          class="contact-item"
          :style="contactItemStyle"
        >
          <span v-if="field.displayLabel !== false" class="contact-label">
            {{ field.label }}:
          </span>
          <span class="contact-value">{{ field.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BasicInfo, GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'
import { getBorderRadiusValue } from '#shared/types/resume'

// 基本信息组件：渲染照片、姓名、职位、联系信息
const props = defineProps<{
  basic: BasicInfo
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()

// 布局方向
const layout = computed(() => props.basic.layout || props.template.basic.layout || 'left')

const layoutClass = computed(() => {
  switch (layout.value) {
    case 'center':
      return 'layout-center'
    case 'right':
      return 'layout-right'
    default:
      return 'layout-left'
  }
})

// 是否显示照片
const showPhoto = computed(() => props.basic.photoConfig?.visible !== false && !!props.basic.photo)

// 主题色
const themeColor = computed(() => props.globalSettings?.themeColor || props.template.colorScheme.primary)

// 字号
const baseFontSize = computed(() => props.globalSettings?.baseFontSize || 16)
const headerSize = computed(() => props.globalSettings?.headerSize || 20)

// 图标模式
const useIconMode = computed(() => props.globalSettings?.useIconMode ?? true)

// 照片样式
const photoWrapperStyle = computed(() => {
  const cfg = props.basic.photoConfig
  if (!cfg) return {}
  return {
    width: `${cfg.width}px`,
    height: `${cfg.height}px`,
  }
})

const photoStyle = computed(() => {
  const cfg = props.basic.photoConfig
  return {
    width: cfg ? `${cfg.width}px` : '90px',
    height: cfg ? `${cfg.height}px` : '120px',
    borderRadius: getBorderRadiusValue(cfg),
  }
})

// 姓名首字母（占位用）
const nameInitial = computed(() => {
  return props.basic.name?.charAt(0) || '?'
})

// 主区域样式
const mainStyle = computed(() => ({
  color: props.template.colorScheme.text,
  fontSize: `${baseFontSize.value}px`,
  lineHeight: String(props.globalSettings?.lineHeight || 1.6),
}))

// 姓名样式
const nameStyle = computed(() => ({
  fontSize: `${headerSize.value + 8}px`,
  fontWeight: '700',
  color: themeColor.value,
  marginBottom: '4px',
}))

// 职位样式
const titleStyleText = computed(() => ({
  fontSize: `${headerSize.value}px`,
  color: props.template.colorScheme.secondary,
  marginBottom: '8px',
}))

// 联系列表样式
const contactListStyle = computed(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px 16px',
  marginTop: '4px',
}))

const contactItemStyle = computed(() => ({
  fontSize: `${baseFontSize.value - 2}px`,
  color: props.template.colorScheme.secondary,
}))

// 联系信息项
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

// 自定义字段（仅显示 visible !== false 的）
const customFields = computed(() => {
  return (props.basic.customFields || []).filter((f) => f.visible !== false)
})
</script>

<style scoped>
.professional-base-info {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.layout-center {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.layout-right {
  flex-direction: row-reverse;
  text-align: right;
}

.photo-wrapper {
  flex-shrink: 0;
  overflow: hidden;
  background: #f3f4f6;
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
  color: #9ca3af;
  font-size: 28px;
  font-weight: 600;
}

.layout-center .contact-list,
.layout-center .contact-list {
  justify-content: center;
}

.layout-right .contact-list {
  justify-content: flex-end;
}

.contact-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.contact-label {
  opacity: 0.7;
}

.contact-value {
  font-weight: 500;
}
</style>
