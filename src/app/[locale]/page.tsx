import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { JsonLd } from '@/components/home/JsonLd'
import { LandingPageClient } from '@/components/home/LandingPageClient'

const SITE_URL = 'https://resume.toolsetlink.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const ogLocale = locale === 'zh' ? 'zh_CN' : 'en_US'
  const lang = locale === 'zh' ? 'zh-CN' : 'en-US'

  return {
    title: `${t('common.appName')} - ${t('common.tagline')}`,
    description: t('landing.hero.subtitle'),
    alternates: {
      canonical: `${SITE_URL}${locale === routing.defaultLocale ? '' : `/${locale}`}`,
      languages: {
        'zh-CN': SITE_URL,
        'en-US': `${SITE_URL}/en`,
        'x-default': SITE_URL,
      },
    },
    openGraph: {
      title: `${t('common.appName')} - ${t('common.tagline')}`,
      description: t('landing.hero.subtitle'),
      url: `${SITE_URL}${locale === routing.defaultLocale ? '' : `/${locale}`}`,
      siteName: t('common.appName'),
      locale: ogLocale,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('common.appName')} - ${t('common.tagline')}`,
      description: t('landing.hero.subtitle'),
      images: ['/og-image.png'],
    },
    other: {
      'application-name': t('common.appName'),
      'apple-mobile-web-app-title': t('common.appName'),
    },
  }
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <>
      <JsonLd locale={locale} />
      <LandingPageClient />
    </>
  )
}
