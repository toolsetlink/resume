<template>
  <div class="min-h-screen bg-[hsl(var(--background))]">
    <header class="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
            <FileText class="h-5 w-5" />
          </span>
          <span class="text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">
            {{ t('common.appName') }}
          </span>
        </NuxtLink>
      </div>
    </header>

    <div class="dashboard-page p-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ t('nav.dashboard') }}</h1>
      <t-button theme="primary" @click="createNewResume">
        <Plus class="w-4 h-4 mr-1" />
        {{ t('resume.create') }}
      </t-button>
    </div>

    <!-- 简历列表 -->
    <div v-if="resumes.length > 0" class="space-y-4">
      <t-card
        v-for="resume in resumes"
        :key="resume.id"
        :title="resume.title"
        :subtitle="formatDate(resume.updatedAt)"
        bordered
      >
        <template #actions>
          <t-button theme="primary" variant="text" @click="goToWorkbench(resume.id)">
            {{ t('common.edit') }}
          </t-button>
          <t-button theme="default" variant="text" @click="duplicate(resume.id)">
            {{ t('common.duplicate') }}
          </t-button>
          <t-button theme="danger" variant="text" @click="remove(resume.id)">
            {{ t('common.delete') }}
          </t-button>
        </template>
        <div class="text-sm text-gray-500">
          <div>{{ t('common.create') }}：{{ formatDate(resume.createdAt) }}</div>
          <div>{{ t('common.edit') }}：{{ formatDate(resume.updatedAt) }}</div>
        </div>
      </t-card>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16">
      <FileText class="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p class="text-gray-400 mb-4">{{ t('resume.empty') }}</p>
      <t-button theme="primary" @click="createNewResume">
        <Plus class="w-4 h-4 mr-1" />
        {{ t('resume.create') }}
      </t-button>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, FileText, LayoutTemplate } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { useResumeStore } from '~/stores/resume'

definePageMeta({
  layout: 'app',
})

const { t } = useI18n()
const router = useRouter()
const resumeStore = useResumeStore()
const localePath = useLocalePath()

// 简历列表
const resumes = computed(() => resumeStore.resumes)

// 格式化日期
const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

// 跳转到工作台
const goToWorkbench = (id: string) => {
  router.push(localePath(`/workbench/${id}`))
}

// 跳转到模板选择页
const goToTemplates = () => {
  router.push(localePath('/dashboard/templates'))
}

// 创建新简历
const createNewResume = () => {
  const resume = resumeStore.createResume()
  goToWorkbench(resume.id)
}

// 复制简历
const duplicate = (id: string) => {
  resumeStore.duplicateResume(id)
}

// 删除简历
const remove = (id: string) => {
  resumeStore.deleteResume(id)
}

// 初始化
onMounted(() => {
  resumeStore.initialize()
})

useHead({ title: `${t('nav.dashboard')} - 自由简历` })
</script>
