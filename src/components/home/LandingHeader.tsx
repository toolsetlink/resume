'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from 'antd'
import { FileText, Sun, Moon, Menu, X } from 'lucide-react'
import messages from '@/messages/zh.json'
import { useTheme } from '@/components/theme/ThemeProvider'

const NAV_LINKS = [
  { href: '#features', label: messages.landing.nav.features },
  { href: '#cases', label: messages.landing.nav.templates },
  { href: '#faq', label: messages.landing.nav.faq },
]

interface LandingHeaderProps {
  showAnchorLinks?: boolean
}

export function LandingHeader({ showAnchorLinks = true }: LandingHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-base))]/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[hsl(var(--brand))] text-[hsl(var(--text-inverse))] shadow-sm transition-transform duration-300 group-hover:scale-105" style={{ boxShadow: '0 2px 8px -2px hsl(var(--brand) / 0.5)' }}>
            <FileText className="h-[18px] w-[18px]" />
          </span>
          <span className="flex h-8 items-center text-[17px] font-semibold leading-none text-[hsl(var(--text-primary))]">{messages.common.appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 text-[13px] font-medium text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]">
            {messages.nav.dashboard}
          </Link>
          {showAnchorLinks && NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-[13px] font-medium text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            type="text"
            shape="circle"
            aria-label={isDark ? messages.landing.nav.switchToLight : messages.landing.nav.switchToDark}
            className="!rounded-md hover:!bg-[hsl(var(--bg-subtle))]"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>

          <Button
            type="text"
            shape="circle"
            aria-label={mobileOpen ? messages.landing.nav.closeMenu : messages.landing.nav.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="!rounded-md hover:!bg-[hsl(var(--bg-subtle))] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-base))]/95 backdrop-blur-xl md:hidden">
          <nav id="mobile-navigation" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]" onClick={() => setMobileOpen(false)}>
              {messages.nav.dashboard}
            </Link>
            {showAnchorLinks && NAV_LINKS.map((link) => (
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
