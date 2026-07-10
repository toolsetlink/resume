import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: '自由简历 - 在线简历编辑器',
    template: '%s | 自由简历',
  },
  description:
    '自由简历 — 免费、隐私优先的在线简历编辑器。多套专业模板、一键 PDF 导出，无需注册即可使用。',
  metadataBase: new URL('https://resume.toolsetlink.com'),
  openGraph: {
    siteName: '自由简历',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  applicationName: '自由简历',
  appleWebApp: { capable: true, title: '自由简历' },
  formatDetection: { telephone: false },
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
