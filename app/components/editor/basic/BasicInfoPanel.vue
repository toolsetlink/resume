<template>
  <div class="space-y-6 p-6">
    <!-- 布局选择 -->
    <div class="space-y-2">
      <h3 class="text-base font-medium">布局</h3>
      <t-radio-group v-model="layout" variant="default-filled" @change="handleLayoutChange">
        <t-radio-button value="left">左对齐</t-radio-button>
        <t-radio-button value="center">居中</t-radio-button>
        <t-radio-button value="right">右对齐</t-radio-button>
      </t-radio-group>
    </div>

    <!-- 照片上传 -->
    <div class="space-y-2">
      <h3 class="text-base font-medium">照片</h3>
      <div class="flex items-center gap-4">
        <div class="w-24 h-32 border rounded overflow-hidden bg-[hsl(var(--bg-base))] flex items-center justify-center">
          <img v-if="photo" :src="photo" class="w-full h-full object-cover" />
          <span v-else class="text-xs text-[hsl(var(--text-tertiary))]">无照片</span>
        </div>
        <div class="flex flex-col gap-2">
          <t-upload :show-upload-progress="false" :auto-upload="false" @select-change="handlePhotoSelect">
            <t-button theme="primary">选择照片</t-button>
          </t-upload>
          <t-button v-if="photo" theme="default" @click="removePhoto">移除</t-button>
        </div>
      </div>
      <!-- 照片配置 -->
      <div class="grid grid-cols-3 gap-3 mt-3">
        <t-form-item label="宽度">
          <t-input-number v-model="photoConfig.width" :min="50" :max="200" @change="updatePhotoConfig" />
        </t-form-item>
        <t-form-item label="高度">
          <t-input-number v-model="photoConfig.height" :min="50" :max="200" @change="updatePhotoConfig" />
        </t-form-item>
        <t-form-item label="圆角">
          <t-select v-model="photoConfig.borderRadius" @change="updatePhotoConfig">
            <t-option value="none">无</t-option>
            <t-option value="medium">中等</t-option>
            <t-option value="full">圆形</t-option>
          </t-select>
        </t-form-item>
      </div>
    </div>

    <!-- 基本信息字段 -->
    <div class="space-y-3">
      <h3 class="text-base font-medium">{{ t('resume.sections.basic') }}</h3>
      <t-form label-align="top">
        <div class="grid grid-cols-2 gap-3">
          <t-form-item :label="t('editor.basicInfo.name')">
            <t-input v-model="basicInfo.name" @blur="commitBasicInfo" />
          </t-form-item>
          <t-form-item :label="t('editor.basicInfo.title')">
            <t-input v-model="basicInfo.title" @blur="commitBasicInfo" />
          </t-form-item>
          <t-form-item :label="t('editor.basicInfo.email')">
            <t-input v-model="basicInfo.email" @blur="commitBasicInfo" />
          </t-form-item>
          <t-form-item :label="t('editor.basicInfo.phone')">
            <t-input v-model="basicInfo.phone" @blur="commitBasicInfo" />
          </t-form-item>
          <t-form-item :label="t('editor.basicInfo.location')">
            <t-input v-model="basicInfo.location" @blur="commitBasicInfo" />
          </t-form-item>
          <t-form-item :label="t('editor.basicInfo.age')">
            <t-input v-model="basicInfo.age" placeholder="28" @blur="commitBasicInfo" />
          </t-form-item>
          <t-form-item :label="t('editor.basicInfo.website')">
            <t-input v-model="personalWebsite" @blur="commitBasicInfo" placeholder="https://example.com" />
          </t-form-item>
          <t-form-item :label="t('editor.basicInfo.status')">
            <t-input v-model="basicInfo.employementStatus" @blur="commitBasicInfo" />
          </t-form-item>
        </div>
      </t-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BasicInfo, PhotoConfig } from '#shared/types/resume'
import { useResumeStore } from '~/stores/resume'

const { t } = useI18n()
const resumeStore = useResumeStore()

// 本地副本，避免每次输入都触发 store 更新
const basicInfo = reactive<BasicInfo>({
  birthDate: '',
  age: '',
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  icons: {},
  employementStatus: '',
  photo: '',
  photoConfig: { width: 90, height: 120, aspectRatio: '1:1', borderRadius: 'none', customBorderRadius: 0, visible: true },
  customFields: [],
})

const layout = ref<'left' | 'center' | 'right'>('left')

// 从 store 同步
watch(() => resumeStore.activeResume, (resume) => {
  if (resume?.basic) {
    Object.assign(basicInfo, resume.basic)
    layout.value = resume.basic.layout || 'left'
  }
}, { immediate: true })

const commitBasicInfo = () => {
  if (!resumeStore.activeResumeId) return
  resumeStore.updateBasicInfo(resumeStore.activeResumeId, { ...basicInfo, layout: layout.value })
}

// 个人网站：复用 customFields 中 id==='personal' 的项
const personalWebsite = computed({
  get() {
    const field = basicInfo.customFields.find((f) => f.id === 'personal')
    return field?.value || ''
  },
  set(val: string) {
    const idx = basicInfo.customFields.findIndex((f) => f.id === 'personal')
    if (idx >= 0) {
      basicInfo.customFields[idx].value = val
    } else {
      basicInfo.customFields.push({
        id: 'personal',
        label: t('editor.basicInfo.website'),
        value: val,
        icon: 'Globe',
      })
    }
  },
})

const handleLayoutChange = (value: string) => {
  layout.value = value as 'left' | 'center' | 'right'
  commitBasicInfo()
}

// 照片
const photo = computed(() => basicInfo.photo)

const photoConfig = reactive<PhotoConfig>({
  width: 90,
  height: 120,
  aspectRatio: '1:1',
  borderRadius: 'none',
  customBorderRadius: 0,
  visible: true,
})

watch(() => basicInfo.photoConfig, (cfg) => {
  if (cfg) Object.assign(photoConfig, cfg)
}, { immediate: true, deep: true })

const handlePhotoSelect = (files: File[]) => {
  const file = files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    basicInfo.photo = e.target?.result as string
    commitBasicInfo()
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  basicInfo.photo = ''
  commitBasicInfo()
}

const updatePhotoConfig = () => {
  basicInfo.photoConfig = { ...photoConfig }
  commitBasicInfo()
}
</script>
