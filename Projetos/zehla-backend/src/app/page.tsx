'use client'

import { useRouter } from 'next/navigation'
import { HeroSection } from '@/components/public/HeroSection'
import { FeaturesSection } from '@/components/public/FeaturesSection'
import { PricingSection } from '@/components/public/PricingSection'
import { CTASection } from '@/components/public/CTASection'

export default function Home() {
  const router = useRouter()

  const goToTrial = () => router.push('/teste-gratis')

  return (
    <div className="min-h-screen bg-[#000000]">
      <HeroSection onNavigateToTrial={goToTrial} />
      <FeaturesSection onNavigateToTrial={goToTrial} />
      <PricingSection onNavigateToTrial={goToTrial} />
      <CTASection onNavigateToTrial={goToTrial} />
    </div>
  )
}
