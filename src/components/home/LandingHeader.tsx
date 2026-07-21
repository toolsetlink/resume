'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from 'antd'
import { Menu, X } from 'lucide-react'
import messages from '@/messages/zh.json'

const NAV_LINKS = [
  { href: '/#features', label: messages.landing.nav.features },
  { href: '/cases', label: '案例库' },
  { href: '/#career-coaching', label: '求职陪跑' },
  { href: '/#faq', label: messages.landing.nav.faq },
]

interface LandingHeaderProps {
  showAnchorLinks?: boolean
}

export function LandingHeader({ showAnchorLinks = true }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-base))]/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label={messages.common.appName}>
          <Image
            src="/logo-lockup.png"
            alt={messages.common.appName}
            width={139}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {showAnchorLinks && NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-[13px] font-medium text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center whitespace-nowrap rounded-[8px] bg-[hsl(var(--brand))] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[hsl(var(--brand-hover))] active:translate-y-px"
          >
            我的简历
          </Link>

          {showAnchorLinks && (
            <Button
              type="text"
              shape="circle"
              aria-label={mobileOpen ? messages.landing.nav.closeMenu : messages.landing.nav.openMenu}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              className="!rounded-md hover:!bg-[hsl(var(--bg-subtle))] md:!hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </Button>
          )}
        </div>
      </div>

      {showAnchorLinks && mobileOpen && (
        <div className="border-t border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-base))]/95 backdrop-blur-xl md:hidden">
          <nav id="mobile-navigation" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {showAnchorLinks && NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
