<template>
  <div>
    <component :is="currentPanel" v-if="currentPanel" />
    <div v-else class="p-8 text-center text-[hsl(var(--text-tertiary))]">
      请在左侧选择要编辑的模块
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useResumeStore } from '~/stores/resume'

const resumeStore = useResumeStore()

// 模块 id 到组件的映射
const panelMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  basic: defineAsyncComponent(() => import('~/components/editor/basic/BasicInfoPanel.vue')),
  education: defineAsyncComponent(() => import('~/components/editor/education/EducationPanel.vue')),
  experience: defineAsyncComponent(() => import('~/components/editor/experience/ExperiencePanel.vue')),
  projects: defineAsyncComponent(() => import('~/components/editor/project/ProjectPanel.vue')),
  certificates: defineAsyncComponent(() => import('~/components/editor/certificates/CertificatesPanel.vue')),
  skills: defineAsyncComponent(() => import('~/components/editor/skills/SkillPanel.vue')),
  selfEvaluation: defineAsyncComponent(() => import('~/components/editor/self-evaluation/SelfEvaluationPanel.vue')),
  custom: defineAsyncComponent(() => import('~/components/editor/custom/CustomPanel.vue')),
}

const currentPanel = computed(() => {
  const section = resumeStore.activeResume?.activeSection || 'basic'
  return panelMap[section] ?? null
})
</script>
