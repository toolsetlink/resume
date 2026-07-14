import messages from '@/messages/zh.json'

const SITE_URL = 'https://resume.toolsetlink.com'
const FAQ_KEYS = ['free', 'privacy', 'export'] as const

export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '自由简历',
    alternateName: 'ZiYou Resume',
    url: SITE_URL,
    description: '隐私优先的在线简历编辑器，支持多模板与 PDF 导出',
    logo: `${SITE_URL}/icon.svg`,
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '自由简历',
    url: SITE_URL,
    description: '隐私优先的在线简历编辑器',
    inLanguage: 'zh-CN',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: messages.nav.home, item: SITE_URL },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_KEYS.map((key) => ({
      '@type': 'Question',
      name: messages.landing.faq.items[key].q,
      acceptedAnswer: { '@type': 'Answer', text: messages.landing.faq.items[key].a },
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
