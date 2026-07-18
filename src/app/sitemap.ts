import type { MetadataRoute } from 'next'
import { RESUME_CASES } from '@/data/cases'

const SITE_URL = 'https://resume.toolsetlink.com'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const caseUrls = RESUME_CASES.map(({ meta }) => ({
    url: `${SITE_URL}/cases/${meta.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${SITE_URL}/cases`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    ...caseUrls,
  ]
}
