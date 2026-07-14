'use client'

import { LandingHeader } from './LandingHeader'
import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { CasesSection } from './CasesSection'
import { TrustSection } from './TrustSection'
import { CTASection } from './CTASection'
import { FAQSection } from './FAQSection'
import { Footer } from './Footer'

export function LandingPageClient() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CasesSection />
        <TrustSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}
