<template>
  <section id="templates" class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-[hsl(var(--text-primary))] sm:text-4xl">
          {{ t('landing.templatePreview.title') }}
        </h2>
        <p class="mx-auto mt-5 max-w-2xl text-[19px] leading-relaxed text-[hsl(var(--text-secondary))]">
          {{ t('landing.templatePreview.subtitle') }}
        </p>
      </div>

      
      <div class="mt-12 flex flex-wrap justify-center gap-2">
        <button
          v-for="entry in templates"
          :key="entry.config.id"
          class="rounded-md px-5 py-2 text-[14px] font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          :class="
            activeId === entry.config.id
              ? 'bg-[hsl(var(--brand))] text-[hsl(var(--text-inverse))] shadow-md'
              : 'border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--border-default))]'
          "
          :style="activeId === entry.config.id ? { boxShadow: 'var(--shadow-sm)' } : {}"
          @click="activeId = entry.config.id"
        >
          {{ entry.config.name }}
        </button>
      </div>

      <!-- 预览区 -->
      <div class="mt-12 flex flex-col items-center gap-8">
        <div ref="previewWrapperRef" class="relative w-full max-w-[820px]">
          <!-- 模板预览卡片 -->
          <div
            class="overflow-hidden rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-white"
            :style="{ height: previewHeight + 'px', boxShadow: 'var(--shadow-lg)' }"
          >
            <div
              class="template-scaling-inner"
              :style="{ transform: `scale(${scale})` }"
            >
              <ResumePreview :resume-data="previewResumeData" />
            </div>
          </div>
        </div>

        
        <t-button
          theme="primary"
          size="large"
          class="!h-12 !px-8 !text-[15px] !font-medium transition-all duration-200 hover:!scale-[1.02] active:!scale-[0.98]"
          @click="goCreate"
        >
          {{ t('landing.templatePreview.useThis') }}
          <ArrowRight class="ml-1.5 h-[18px] w-[18px]" />
        </t-button>

        <!-- 模板详情页链接（SEO 内部链接） -->
        <div class="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <NuxtLink
            v-for="entry in templates"
            :key="entry.config.id"
            :to="localePath('/templates/' + getTemplateSlug(entry.config.id))"
            class="text-[13px] text-[hsl(var(--text-secondary))] underline underline-offset-2 decoration-[hsl(var(--border-default))] transition-colors hover:text-[hsl(var(--brand))]"
          >
            {{ t('landing.templatePreview.learnMore', { name: entry.config.name }) }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { getTemplateSlug } from '~/components/templates/registry'
import type { ResumeData } from '#shared/types/resume'
import {
  initialResumeState,
  initialResumeStateEn,
} from '#shared/config/initialResumeData'
import { TEMPLATE_REGISTRY } from '~/components/templates/registry'
import { useResumeStore } from '~/stores/resume'

const { t, locale } = useI18n()
const router = useRouter()
const localePath = useLocalePath()
const resumeStore = useResumeStore()

// 模板列表（来自 registry）
const templates = TEMPLATE_REGISTRY

// 当前选中的模板 id，默认 professional
const activeId = ref<string>(templates[0]?.config.id ?? 'professional')

// 根据当前 locale 与选中模板构造预览数据
const previewResumeData = computed<ResumeData>(() => {
  const base =
    locale.value === 'zh' ? initialResumeState : initialResumeStateEn
  return {
    ...(base as ResumeData),
    id: 'preview-template',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    templateId: activeId.value,
  }
})

const goCreate = () => {
  const resume = resumeStore.createResumeFromTemplate(
    activeId.value,
    locale.value === 'zh' ? 'zh' : 'en'
  )
  router.push(localePath(`/workbench/${resume.id}`))
}

// 响应式缩放：根据容器宽度计算 A4 模板（794px）的缩放比例
const TEMPLATE_WIDTH = 794 // A4 @ 96dpi
const A4_RATIO = 1.414 // 高 / 宽
const previewWrapperRef = ref<HTMLElement | null>(null)
const scale = ref(1)
const previewHeight = ref(TEMPLATE_WIDTH * A4_RATIO)

const updateScale = () => {
  const el = previewWrapperRef.value
  if (!el) return
  const width = el.clientWidth
  if (width <= 0) return
  scale.value = width / TEMPLATE_WIDTH
  // 卡片高度 = 容器宽度 * A4 比例
  previewHeight.value = width * A4_RATIO
}

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

<style scoped>
.template-scaling-inner {
  /* 真实模板渲染宽度（A4 纸宽度，约 794px @ 96dpi） */
  width: 794px;
  transform-origin: top left;
}
</style>
