import type { Metadata } from 'next'
import messages from '@/messages/zh.json'
import { JsonLd } from '@/components/home/JsonLd'
import { LandingPageClient } from '@/components/home/LandingPageClient'

const SITE_URL = 'https://resume.toolsetlink.com'

const m = messages

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${m.common.appName} - ${m.common.tagline}`,
    description: m.landing.hero.subtitle,
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      title: `${m.common.appName} - ${m.common.tagline}`,
      description: m.landing.hero.subtitle,
      url: SITE_URL,
      siteName: m.common.appName,
      locale: 'zh_CN',
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${m.common.appName} - ${m.common.tagline}`,
      description: m.landing.hero.subtitle,
      images: ['/og-image.png'],
    },
    other: {
      'application-name': m.common.appName,
      'apple-mobile-web-app-title': m.common.appName,
    },
  }
}

export default function LandingPage() {
  return (
    <>
      <JsonLd />
      <LandingPageClient />
    </>
  )
}