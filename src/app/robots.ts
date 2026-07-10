import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/workbench/'] },
    ],
    sitemap: 'https://resume.toolsetlink.com/sitemap.xml',
  }
}
