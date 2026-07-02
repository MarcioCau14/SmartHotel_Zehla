'use client';

import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { SavingsCalculator } from '@/components/landing/SavingsCalculator';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import BookingPlatformsMarquee from '@/components/landing/BookingPlatformsMarquee';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { BetaFounderSection } from '@/components/landing/BetaFounderSection';
import { CTASection } from '@/components/landing/CTASection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <HeroSection />
      <PainPointsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <SavingsCalculator />
      <BookingPlatformsMarquee />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <BetaFounderSection />
      <CTASection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
