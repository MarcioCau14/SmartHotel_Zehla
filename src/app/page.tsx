'use client';

import { NicheProvider } from '@/contexts/NicheContext';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { NicheSwitcherSection } from '@/components/landing/NicheSwitcherSection';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { SuccessCasesSection } from '@/components/landing/SuccessCasesSection';
import { SavingsCalculator } from '@/components/landing/SavingsCalculator';
import { WhyZehlaSection } from '@/components/landing/WhyZehlaSection';
import { ChannelManagerSection } from '@/components/landing/ChannelManagerSection';
import { IntegrationsSection } from '@/components/landing/IntegrationsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';
import { FloatingCTA } from '@/components/landing/FloatingCTA';

export default function LandingPage() {
  return (
    <NicheProvider>
      <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-clip">
        <Header />
        <HeroSection />
        <NicheSwitcherSection />
        <SocialProofSection />
        <PainPointsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <SuccessCasesSection />
        <SavingsCalculator />
        <WhyZehlaSection />
        <ChannelManagerSection />
        <IntegrationsSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <ContactSection />
        <FinalCTASection />
        <Footer />
        <FloatingCTA />
      </main>
    </NicheProvider>
  );
}
