<template>
  <div class="creative-banner">
    <!-- 装饰圆点 -->
    <span class="deco-dot dot-1"></span>
    <span class="deco-dot dot-2"></span>
    <span class="deco-dot dot-3"></span>

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
    <h1 v-if="basic.name" class="name">{{ basic.name }}</h1>
    <p v-if="basic.title" class="title">{{ basic.title }}</p>

    <!-- 联系信息 -->
    <ul v-if="contactItems.length || customFields.length" class="contact-list">
      <li v-for="item in contactItems" :key="item.key" class="contact-item">
        <span class="contact-label">{{ item.label }}</span>
        <span class="contact-value">{{ item.value }}</span>
      </li>
      <li v-for="field in customFields" :key="field.id" class="contact-item">
        <span class="contact-label">{{ field.label }}</span>
        <span class="contact-value">{{ field.value }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { BasicInfo, GlobalSettings } from '#shared/types/resume'
import type { ResumeTemplate } from '#shared/types/template'

// 彩色横幅：渐变背景 + 照片 + 姓名 + 联系方式
const props = defineProps<{
  basic: BasicInfo
  globalSettings?: GlobalSettings
  template: ResumeTemplate
}>()

const showPhoto = computed(() => props.basic.photoConfig?.visible !== false && !!props.basic.photo)
const nameInitial = computed(() => props.basic.name?.charAt(0) || '?')

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
.creative-banner {
  position: relative;
  padding: 36px 24px 28px;
  text-align: center;
  background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
  color: #ffffff;
  overflow: hidden;
}

/* 装饰圆点 */
.deco-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.dot-1 {
  width: 80px;
  height: 80px;
  top: -20px;
  left: -20px;
}

.dot-2 {
  width: 50px;
  height: 50px;
  bottom: -10px;
  right: 10%;
}

.dot-3 {
  width: 30px;
  height: 30px;
  top: 30%;
  right: 5%;
  background: rgba(255, 255, 255, 0.25);
}

.photo-wrapper {
  position: relative;
  z-index: 1;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 12px;
  border: 4px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 36px;
  font-weight: 600;
}

.name {
  position: relative;
  z-index: 1;
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 4px 0;
  letter-spacing: 0.05em;
}

.title {
  position: relative;
  z-index: 1;
  font-size: 15px;
  font-weight: 500;
  opacity: 0.95;
  margin: 0 0 14px 0;
}

.contact-list {
  position: relative;
  z-index: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 18px;
  font-size: 12px;
}

.contact-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.contact-label {
  opacity: 0.8;
}

.contact-value {
  font-weight: 500;
}
</style>
