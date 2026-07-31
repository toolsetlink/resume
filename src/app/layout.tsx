import type { Metadata } from 'next'
import Script from 'next/script'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { htmlLang } from '@/i18n/config'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: '自由简历 - 在线简历编辑器',
    template: '%s | 自由简历',
  },
  description:
    '自由简历是免费、隐私优先的在线简历编辑器。多套专业模板、一键 PDF 导出，无需注册即可使用。',
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
  icons: {
    icon: [{ url: '/logo-mark.png', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang={htmlLang} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AntdRegistry>
          <ConfigProvider>
            {children}
          </ConfigProvider>
        </AntdRegistry>
        <Script id="baidu-tongji" strategy="afterInteractive">
          {`var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?17c0a6a7b2a014a8d72ecef455f02d89";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();`}
        </Script>
      </body>
    </html>
  )
}
