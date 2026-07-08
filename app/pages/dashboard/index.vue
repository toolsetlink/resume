<template>
  <div class="min-h-screen bg-[hsl(var(--bg-base))]">
    <LandingHeader />

    <div class="dashboard-page p-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ t('nav.dashboard') }}</h1>
      <t-button theme="primary" @click="createNewResume">
        <Plus class="w-4 h-4 mr-1" />
        {{ t('resume.create') }}
      </t-button>
    </div>

    <!-- 简历列表 -->
    <div v-if="resumes.length > 0" class="border border-[hsl(var(--border-default))] rounded-lg overflow-hidden">
      <div
        v-for="resume in resumes"
        :key="resume.id"
        class="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border-default))] last:border-b-0 hover:bg-[hsl(var(--brand-light))] transition-colors duration-150 cursor-pointer group"
        @click="goToWorkbench(resume.id)"
      >
        <div class="flex-1 min-w-0">
          <div class="text-[15px] font-medium text-[hsl(var(--text-primary))] truncate">
            {{ resume.title || t('resume.untitled') }}
          </div>
          <div class="text-[13px] text-[hsl(var(--text-tertiary))] mt-0.5">
            {{ t('common.edit') }} {{ formatDate(resume.updatedAt) }}
          </div>
        </div>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150" @click.stop>
          <t-button theme="primary" variant="text" size="small" @click="goToWorkbench(resume.id)">
            {{ t('common.edit') }}
          </t-button>
          <t-button theme="default" variant="text" size="small" @click="duplicate(resume.id)">
            {{ t('common.duplicate') }}
          </t-button>
          <t-button theme="danger" variant="text" size="small" @click="remove(resume.id)">
            {{ t('common.delete') }}
          </t-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16">
      <FileText class="w-12 h-12 mx-auto mb-3 text-[hsl(var(--text-tertiary))]" />
      <p class="text-[hsl(var(--text-tertiary))] mb-4">{{ t('resume.empty') }}</p>
      <t-button theme="primary" @click="createNewResume">
        <Plus class="w-4 h-4 mr-1" />
        {{ t('resume.create') }}
      </t-button>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, FileText } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { useResumeStore } from '~/stores/resume'

definePageMeta({
  layout: 'app',
})

const { t } = useI18n()
const router = useRouter()
const resumeStore = useResumeStore()
const localePath = useLocalePath()

const resumes = computed(() => resumeStore.resumes)

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

const goToWorkbench = (id: string) => {
  router.push(localePath(`/workbench/${id}`))
}

const createNewResume = () => {
  const resume = resumeStore.createResume()
  goToWorkbench(resume.id)
}

const duplicate = (id: string) => {
  resumeStore.duplicateResume(id)
}

const remove = (id: string) => {
  resumeStore.deleteResume(id)
}

onMounted(() => {
  resumeStore.initialize()
})

useHead({ title: `${t('nav.dashboard')} - 自由简历` })
</script>
