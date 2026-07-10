import { getTranslations } from 'next-intl/server'

const SITE_URL = 'https://resume.toolsetlink.com'
const faqKeys = ['free', 'privacy', 'export']

export async function JsonLd({ locale }: { locale: string }) {
  const t = await getTranslations({ locale })

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '自由简历',
    alternateName: 'ZiYou Resume',
    url: SITE_URL,
    description: '隐私优先的在线简历编辑器，支持多模板、AI 辅助写作、PDF 导出',
    logo: `${SITE_URL}/icon.svg`,
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '自由简历',
    url: SITE_URL,
    description: 'Privacy-first online resume editor',
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en-US',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav.home') || '首页', item: SITE_URL },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqKeys.map((key) => ({
      '@type': 'Question',
      name: t(`landing.faq.items.${key}.q`),
      acceptedAnswer: { '@type': 'Answer', text: t(`landing.faq.items.${key}.a`) },
    })),
  }

  return (
    <>
      <script type="application/ld+json" id="organization-schema" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" id="website-schema" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" id="breadcrumb-schema" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" id="faq-schema" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  )
}
