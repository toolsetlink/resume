import type { MetadataRoute } from 'next'

const SITE_URL = 'https://resume.toolsetlink.com'
const slugs = ['professional-resume', 'modern-resume', 'elegant-resume', 'creative-resume']

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const templateUrls = slugs.flatMap((slug) => [
    { url: `${SITE_URL}/templates/${slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${SITE_URL}/en/templates/${slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
  ])

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${SITE_URL}/en`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    ...templateUrls,
  ]
}
