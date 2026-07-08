<template>
  <!-- JSON-LD via useHead -->
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()

const SITE_URL = 'https://resume.toolsetlink.com'
const fullUrl = computed(() => `${SITE_URL}${route.fullPath}`)

// FAQ 条目 key 列表（与 i18n 结构一致）
const faqKeys = ['free', 'privacy', 'export']

// 当前语言的 FAQ 结构化数据
const faqSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqKeys.map((key) => ({
    '@type': 'Question',
    name: t(`landing.faq.items.${key}.q`),
    acceptedAnswer: {
      '@type': 'Answer',
      text: t(`landing.faq.items.${key}.a`),
    },
  })),
}))

// Organization Schema
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '自由简历',
  alternateName: 'ZiYou Resume',
  url: SITE_URL,
  description: '隐私优先的在线简历编辑器，支持多模板、AI 辅助写作、PDF 导出',
  logo: `${SITE_URL}/icon.svg`,
}

// WebSite Schema
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '自由简历',
  url: SITE_URL,
  description: 'Privacy-first online resume editor',
  inLanguage: [locale.value === 'zh' ? 'zh-CN' : 'en-US'],
}

// BreadcrumbList Schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: t('nav.home') || '首页',
      item: SITE_URL,
    },
  ],
}

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(organizationSchema),
      id: 'organization-schema',
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(websiteSchema),
      id: 'website-schema',
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
      id: 'breadcrumb-schema',
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(faqSchema.value),
      id: 'faq-schema',
      key: 'faq-schema',
    },
  ],
})
</script>
