'use client'

import { useState, useMemo } from 'react'
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { FileText, Languages, Sun, Moon, Menu, X } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname, Link } from '@/i18n/navigation'
import { useTheme } from '@/components/theme/ThemeProvider'

export function LandingHeader() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [mobileOpen, setMobileOpen] = useState(false)
  const isDark = theme === 'dark'

  const navLinks = useMemo(
    () => [
      { href: '#features', label: t('landing.nav.features') },
      { href: '#templates', label: t('landing.nav.templates') },
      { href: '#faq', label: t('landing.nav.faq') },
    ],
    [t]
  )

  const localeMenuItems: MenuProps['items'] = [
    { key: 'zh', label: locale === 'zh' ? '中文 ✓' : '中文', onClick: () => router.replace(pathname, { locale: 'zh' }) },
    { key: 'en', label: locale === 'en' ? 'English ✓' : 'English', onClick: () => router.replace(pathname, { locale: 'en' }) },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-base))]/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[hsl(var(--brand))] text-[hsl(var(--text-inverse))] shadow-sm transition-transform duration-300 group-hover:scale-105" style={{ boxShadow: '0 2px 8px -2px hsl(var(--brand) / 0.5)' }}>
            <FileText className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[17px] font-semibold text-[hsl(var(--text-primary))]">{t('common.appName')}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 text-[13px] font-medium text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]">
            {t('nav.dashboard')}
          </Link>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-[13px] font-medium text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Dropdown menu={{ items: localeMenuItems }} placement="bottomRight">
            <Button type="text" shape="circle" className="!rounded-md hover:!bg-[hsl(var(--bg-subtle))]">
              <Languages className="h-[18px] w-[18px]" />
            </Button>
          </Dropdown>

          <Button type="text" shape="circle" className="!rounded-md hover:!bg-[hsl(var(--bg-subtle))]" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>

          <Button type="text" shape="circle" className="!rounded-md hover:!bg-[hsl(var(--bg-subtle))] md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-base))]/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]" onClick={() => setMobileOpen(false)}>
              {t('nav.dashboard')}
            </Link>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]" onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
