<template>
  <section id="templates" class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- 标题：苹果式居中、克制的字距 -->
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[hsl(var(--foreground))] sm:text-4xl">
          {{ t('landing.templatePreview.title') }}
        </h2>
        <p class="mx-auto mt-5 max-w-2xl text-[19px] leading-relaxed text-[hsl(var(--muted-foreground))]">
          {{ t('landing.templatePreview.subtitle') }}
        </p>
      </div>

      <!-- 模板切换 tab：苹果风格分段控件 -->
      <div class="mt-12 flex flex-wrap justify-center gap-2">
        <button
          v-for="entry in templates"
          :key="entry.config.id"
          class="rounded-full px-5 py-2 text-[14px] font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          :class="
            activeId === entry.config.id
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md'
              : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))]'
          "
          :style="activeId === entry.config.id ? { boxShadow: 'var(--shadow-sm)' } : {}"
          @click="activeId = entry.config.id"
        >
          {{ entry.config.name }}
        </button>
      </div>

      <!-- 预览区：苹果式浮动展示 -->
      <div class="mt-12 flex flex-col items-center gap-8">
        <div ref="previewWrapperRef" class="relative w-full max-w-[820px]">
          <!-- 装饰光晕：苹果式柔和模糊 -->
          <div
            class="absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-tr from-[hsl(var(--primary))]/12 via-transparent to-[hsl(var(--primary))]/6 blur-[80px]"
          />
          <!-- 模板预览卡片：A4 比例，缩放居中 -->
          <div
            class="overflow-hidden rounded-[20px] border border-[hsl(var(--border))]/60 bg-white"
            :style="{ height: previewHeight + 'px', boxShadow: 'var(--shadow-xl)' }"
          >
            <div
              class="template-scaling-inner"
              :style="{ transform: `scale(${scale})` }"
            >
              <ResumePreview :resume-data="previewResumeData" />
            </div>
          </div>
        </div>

        <!-- 使用此模板按钮：苹果风格胶囊形 -->
        <t-button
          theme="primary"
          size="large"
          class="!h-12 !rounded-full !px-8 !text-[15px] !font-medium !shadow-md transition-all duration-300 hover:!scale-[1.03] hover:!shadow-lg active:!scale-[0.98]"
          @click="goCreate"
        >
          {{ t('landing.templatePreview.useThis') }}
          <ArrowRight class="ml-1.5 h-[18px] w-[18px]" />
        </t-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
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
