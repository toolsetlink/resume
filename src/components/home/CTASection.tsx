'use client'

import { Button } from 'antd'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import messages from '@/messages/zh.json'

export function CTASection() {
  const t = messages
  const router = useRouter()

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-[12px] bg-[hsl(var(--brand))] px-8 py-20 text-center sm:px-16 sm:py-24"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="fade-in relative">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-white sm:text-4xl">
              {t.landing.cta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[18px] leading-relaxed text-white/85 sm:text-[19px]">
              {t.landing.cta.subtitle}
            </p>
            <div className="mt-10 flex justify-center">
              <Button
                size="large"
                className="!h-12 !bg-white !px-8 !text-[15px] !font-semibold !text-[hsl(var(--brand))]"
                onClick={() => router.push('/dashboard')}
              >
                {t.landing.cta.button}
                <ArrowRight className="ml-1.5 h-[18px] w-[18px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
