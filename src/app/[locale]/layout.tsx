import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

export const metadata: Metadata = {
  metadataBase: new URL('https://resume.toolsetlink.com'),
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'zh' | 'en')) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages({ locale })

  return (
    <html
      lang={locale === 'zh' ? 'zh-CN' : 'en'}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="ziyou-resume-theme"
        >
          <AntdRegistry>
            <ConfigProvider>
              <NextIntlClientProvider locale={locale} messages={messages}>
                {children}
              </NextIntlClientProvider>
            </ConfigProvider>
          </AntdRegistry>
        </NextThemeProvider>
      </body>
    </html>
  )
}
