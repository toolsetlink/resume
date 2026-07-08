<template>
  <div class="templates-page p-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ t('nav.templates') }}</h1>
      <t-button theme="default" variant="outline" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-1" />
        {{ t('common.back') }}
      </t-button>
    </div>

    <!-- 当前激活简历提示 -->
    <div v-if="activeResume" class="mb-4 text-sm text-gray-500">
      {{ t('templates.currentTemplate') }}：
      <t-tag theme="primary" variant="light" size="small">
        {{ currentTemplateName }}
      </t-tag>
    </div>

    <!-- 模板网格 -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="tpl in templates"
        :key="tpl.config.id"
        class="template-card border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md"
        :class="{
          'border-primary ring-2 ring-primary/30': isSelected(tpl.config.id),
          'border-[hsl(var(--border))]': !isSelected(tpl.config.id),
        }"
        @click="selectTemplate(tpl.config.id)"
      >
        <!-- 缩略图占位（渐变背景 + LayoutTemplate 图标） -->
        <div
          class="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center"
        >
          <div class="text-gray-400 text-sm text-center">
            <LayoutTemplate class="w-8 h-8 mx-auto mb-2" />
            {{ tpl.config.name }}
          </div>
        </div>
        <!-- 名称、描述与主色调 -->
        <div class="p-3">
          <div class="flex items-center justify-between mb-1">
            <h4 class="text-sm font-medium">{{ tpl.config.name }}</h4>
            <t-tag v-if="isSelected(tpl.config.id)" theme="primary" size="small">
              {{ t('templates.currentTemplate') }}
            </t-tag>
          </div>
          <p class="text-xs text-gray-500 line-clamp-2 mb-2">
            {{ tpl.config.description }}
          </p>
          <div class="flex items-center gap-1">
            <span
              class="inline-block w-3 h-3 rounded-full border border-gray-200"
              :style="{ backgroundColor: tpl.config.colorScheme.primary }"
            />
            <span
              class="inline-block w-3 h-3 rounded-full border border-gray-200"
              :style="{ backgroundColor: tpl.config.colorScheme.secondary }"
            />
            <span
              class="inline-block w-3 h-3 rounded-full border border-gray-200"
              :style="{ backgroundColor: tpl.config.colorScheme.text }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 无激活简历时的提示 -->
    <div v-if="!activeResume" class="text-center py-12 text-gray-400">
      <LayoutTemplate class="w-10 h-10 mx-auto mb-3" />
      <p>{{ t('resume.empty') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, LayoutTemplate } from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { TEMPLATE_REGISTRY } from '~/components/templates/registry'
import { useResumeStore } from '~/stores/resume'

definePageMeta({
  layout: 'app',
})

const { t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()
const resumeStore = useResumeStore()

// 所有可用模板
const templates = TEMPLATE_REGISTRY

// 当前激活简历
const activeResume = computed(() => resumeStore.activeResume)

// 当前模板名称
const currentTemplateName = computed(() => {
  const id = activeResume.value?.templateId
  if (!id) return ''
  return templates.find((tpl) => tpl.config.id === id)?.config.name ?? ''
})

// 判断是否为当前选中模板
const isSelected = (id: string) => {
  return activeResume.value?.templateId === id
}

// 切换模板
const selectTemplate = (templateId: string) => {
  const resumeId = resumeStore.activeResumeId
  if (!resumeId) return
  if (isSelected(templateId)) return
  resumeStore.setTemplateId(resumeId, templateId)
  MessagePlugin.success(t('templates.switchSuccess'))
}

// 返回控制台
const goBack = () => {
  router.push(localePath('/dashboard'))
}

// 初始化
onMounted(() => {
  resumeStore.initialize()
})

useHead({ title: `${t('nav.templates')} - 自由简历` })
</script>

<style scoped>
.template-card {
  background-color: hsl(var(--card));
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
