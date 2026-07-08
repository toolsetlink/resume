<template>
  <div class="landing-page min-h-screen bg-[hsl(var(--bg-base))]">
    <JsonLd />
    <LandingHeader />
    <main>
      <HeroSection />
      <TemplatePreviewSection />
      <FeaturesSection />
      <TrustSection />
      <CTASection />
      <FAQSection />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
// 落地页：默认布局（不使用 app layout），i18n prefix_except_default 策略下
// / 即中文落地页，/en 即英文落地页，无需 [locale]/index.vue 动态路由。
const { t, locale } = useI18n()
const route = useRoute()

// 站点地址常量
const SITE_URL = 'https://resume.toolsetlink.com'

// 当前页面完整 URL
const fullUrl = computed(() => `${SITE_URL}${route.fullPath}`)

// 落地页 SEO
useSeoMeta({
  title: () => `${t('common.appName')} - ${t('common.tagline')}`,
  description: () => t('landing.hero.subtitle'),
  ogTitle: () => `${t('common.appName')} - ${t('common.tagline')}`,
  ogDescription: () => t('landing.hero.subtitle'),
  ogType: 'website',
  ogUrl: () => fullUrl.value,
  ogSiteName: () => t('common.appName'),
  ogLocale: () => (locale.value === 'zh' ? 'zh_CN' : 'en_US'),
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${t('common.appName')} - ${t('common.tagline')}`,
  twitterDescription: () => t('landing.hero.subtitle'),
})

// canonical 与 hreflang
useHead(() => ({
  link: [
    { rel: 'canonical', href: fullUrl.value },
    {
      rel: 'alternate',
      hreflang: 'zh-CN',
      href: SITE_URL,
    },
    {
      rel: 'alternate',
      hreflang: 'en-US',
      href: `${SITE_URL}/en`,
    },
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: SITE_URL,
    },
  ],
}))
</script>
