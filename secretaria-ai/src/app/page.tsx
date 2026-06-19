'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { TrustBadgesSection } from '@/components/landing/TrustBadgesSection';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { SavingsCalculator } from '@/components/landing/SavingsCalculator';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';

import BookingPlatformsMarquee from '@/components/landing/BookingPlatformsMarquee';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { IntegrationsSection } from '@/components/landing/IntegrationsSection';
import { BetaFounderSection } from '@/components/landing/BetaFounderSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <HeroSection />
      <TrustBadgesSection />
      <PainPointsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SavingsCalculator />
      <TestimonialsSection />

      <BookingPlatformsMarquee />
      <SecuritySection />
      <IntegrationsSection />
      <BetaFounderSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}