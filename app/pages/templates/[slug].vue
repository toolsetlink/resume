<template>
  <div v-if="templateConfig" class="template-page min-h-screen bg-[hsl(var(--bg-base))]">
    <LandingHeader />

    <main class="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <!-- 面包屑导航（SEO） -->
      <nav class="mb-8 flex items-center gap-2 text-[13px] text-[hsl(var(--text-secondary))]">
        <NuxtLink :to="localePath('/')" class="hover:text-[hsl(var(--text-primary))] transition-colors">
          {{ t('nav.home') }}
        </NuxtLink>
        <span>/</span>
        <span class="text-[hsl(var(--text-primary))]">{{ templateConfig.name }}</span>
      </nav>

      <!-- 标题区 -->
      <div class="text-center">
        <h1 class="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-[hsl(var(--text-primary))] sm:text-4xl">
          {{ t(`templatesPage.${templateConfig.id}.title`) }}
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-[hsl(var(--text-secondary))]">
          {{ t(`templatesPage.${templateConfig.id}.description`) }}
        </p>
      </div>

      <!-- 模板预览 -->
      <div ref="previewRef" class="mt-12 overflow-hidden rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-white shadow-lg">
        <div
          class="template-scaling-inner"
          :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }"
        >
          <ResumePreview :resume-data="previewResumeData" />
        </div>
      </div>

      <!-- 模板特色 -->
      <div class="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(feature, idx) in templateFeatures"
          :key="idx"
          class="rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] p-6"
        >
          <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))]">
            <component :is="feature.icon" class="h-5 w-5" />
          </div>
          <h3 class="text-[15px] font-semibold text-[hsl(var(--text-primary))]">
            {{ feature.title }}
          </h3>
          <p class="mt-1.5 text-[13px] leading-relaxed text-[hsl(var(--text-secondary))]">
            {{ feature.desc }}
          </p>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-16 text-center">
        <t-button
          theme="primary"
          size="large"
          class="!h-12 !px-8 !text-[15px] !font-medium transition-all duration-200 hover:!scale-[1.02]"
          @click="goCreate"
        >
          {{ t('templatesPage.useThis') }}
          <ArrowRight class="ml-1.5 h-[18px] w-[18px]" />
        </t-button>
      </div>

      <!-- 其他模板链接 -->
      <div class="mt-20 border-t border-[hsl(var(--border-default))]/60 pt-10">
        <h2 class="text-center text-[18px] font-semibold text-[hsl(var(--text-primary))]">
          {{ t('templatesPage.otherTemplates') }}
        </h2>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <NuxtLink
            v-for="tpl in otherTemplates"
            :key="tpl.id"
            :to="localePath('/templates/' + getTemplateSlug(tpl.id))"
            class="rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] px-5 py-2.5 text-[14px] font-medium text-[hsl(var(--text-secondary))] transition-all hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--border-default))]"
          >
            {{ tpl.name }} →
          </NuxtLink>
        </div>
      </div>
    </main>

    <Footer />
  </div>

  <!-- 模板未找到 -->
  <div v-else class="min-h-screen flex items-center justify-center bg-[hsl(var(--bg-base))]">
    <div class="text-center px-4">
      <h1 class="text-2xl font-bold text-[hsl(var(--text-primary))]">
        {{ t('templatesPage.notFound') }}
      </h1>
      <NuxtLink
        :to="localePath('/')"
        class="mt-4 inline-flex items-center text-[hsl(var(--brand))] hover:underline"
      >
        {{ t('error.backHome') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Palette, Layout, Eye } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { ResumeData } from '#shared/types/resume'
import { initialResumeState, initialResumeStateEn } from '#shared/config/initialResumeData'
import { TEMPLATE_REGISTRY, getTemplateIdBySlug, getTemplateSlug } from '~/components/templates/registry'
import LandingHeader from '~/components/home/LandingHeader.vue'
import Footer from '~/components/home/Footer.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const SITE_URL = 'https://resume.toolsetlink.com'

// 从 slug 获取模板 ID
const slug = computed(() => route.params.slug as string)
const templateId = computed(() => getTemplateIdBySlug(slug.value))
const templateConfig = computed(() =>
  TEMPLATE_REGISTRY.find((e) => e.config.id === templateId.value)?.config ?? null
)

// 其他模板（当前模板除外）
const otherTemplates = computed(() =>
  TEMPLATE_REGISTRY.filter((e) => e.config.id !== templateId.value).map((e) => e.config)
)

// 预览数据
const previewResumeData = computed<ResumeData>(() => {
  const base = locale.value === 'zh' ? initialResumeState : initialResumeStateEn
  return {
    ...(base as ResumeData),
    id: 'template-preview',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    templateId: templateId.value ?? 'professional',
  }
})

// 缩放到容器宽度
const TEMPLATE_WIDTH = 794
const A4_RATIO = 1.414
const previewRef = ref<HTMLElement | null>(null)
const scale = ref(1)

const updateScale = () => {
  const el = previewRef.value
  if (!el) return
  const width = el.clientWidth
  if (width <= 0) return
  scale.value = width / TEMPLATE_WIDTH
}

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScale)
})

// 模板特色
interface FeatureItem {
  icon: Component
  title: string
  desc: string
}

const templateFeatures = computed<FeatureItem[]>(() => {
  const prefix = `templatesPage.${templateConfig.value?.id}`
  return [
    {
      icon: Palette,
      title: t(`${prefix}.f1Title`),
      desc: t(`${prefix}.f1Desc`),
    },
    {
      icon: Layout,
      title: t(`${prefix}.f2Title`),
      desc: t(`${prefix}.f2Desc`),
    },
    {
      icon: Eye,
      title: t(`${prefix}.f3Title`),
      desc: t(`${prefix}.f3Desc`),
    },
  ]
})

// 创建简历并跳转到工作台（仅在用户点击时初始化 store，避免 SSR 时 localStorage 报错）
const goCreate = () => {
  if (!templateId.value) return
  const store = useResumeStore()
  const resume = store.createResumeFromTemplate(
    templateId.value,
    locale.value === 'zh' ? 'zh' : 'en'
  )
  router.push(localePath(`/workbench/${resume.id}`))
}

// ====== SEO ======

const fullUrl = computed(() => `${SITE_URL}${route.fullPath}`)

const shouldNoIndex = computed(() => !templateConfig.value)

useSeoMeta({
  title: () => templateConfig.value
    ? t(`templatesPage.${templateConfig.value.id}.seoTitle`)
    : '404',
  description: () => templateConfig.value
    ? t(`templatesPage.${templateConfig.value.id}.seoDescription`)
    : t('error.description'),
  ogTitle: () => templateConfig.value
    ? t(`templatesPage.${templateConfig.value.id}.seoTitle`)
    : undefined,
  ogDescription: () => templateConfig.value
    ? t(`templatesPage.${templateConfig.value.id}.seoDescription`)
    : undefined,
  ogUrl: () => fullUrl.value,
  robots: () => shouldNoIndex.value ? 'noindex, nofollow' : 'index, follow',
})

useHead(() => ({
  link: templateConfig.value ? [
    { rel: 'canonical', href: fullUrl.value },
    {
      rel: 'alternate',
      hreflang: 'zh-CN',
      href: `${SITE_URL}/templates/${slug.value}`,
    },
    {
      rel: 'alternate',
      hreflang: 'en-US',
      href: `${SITE_URL}/en/templates/${slug.value}`,
    },
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${SITE_URL}/templates/${slug.value}`,
    },
  ] : [],
  script: templateConfig.value ? [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: templateConfig.value.name,
        description: t(`templatesPage.${templateConfig.value.id}.seoDescription`),
        url: fullUrl.value,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
          availability: 'https://schema.org/InStock',
        },
      }),
    },
  ] : [],
}))
</script>

<style scoped>
.template-scaling-inner {
  width: 794px;
}
</style>
