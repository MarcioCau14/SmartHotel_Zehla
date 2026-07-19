'use client';

import { NicheProvider } from '@/contexts/NicheContext';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { DashboardPreviewSection } from '@/components/landing/DashboardPreviewSection';
import { NicheSwitcherSection } from '@/components/landing/NicheSwitcherSection';
import BookingPlatformsMarquee from '@/components/landing/BookingPlatformsMarquee';
import { SavingsCalculator } from '@/components/landing/SavingsCalculator';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { ContactSection } from '@/components/landing/ContactSection';
import { TrustBadgesSection } from '@/components/landing/TrustBadgesSection';
import { Footer } from '@/components/landing/Footer';
import { FloatingCTA } from '@/components/landing/FloatingCTA';

export default function HomePage() {
  return (
    <NicheProvider>
      <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white scroll-smooth">
        <Header />

        <main className="flex-1">
          <HeroSection />
          <PainPointsSection />
          <HowItWorksSection />
          <FeaturesSection />
          <DashboardPreviewSection />
          <NicheSwitcherSection />
          <BookingPlatformsMarquee />
          <section id="calculadora">
            <SavingsCalculator />
          </section>
          <section id="precos">
            <PricingSection />
          </section>
          <TestimonialsSection />
          <section id="faq">
            <FAQSection />
          </section>
          <CTASection onNavigate={() => {
            const el = document.querySelector('#precos');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} />
          <FinalCTASection />
          <section id="contato">
            <ContactSection />
          </section>
          <TrustBadgesSection />
        </main>

        <footer className="mt-auto">
          <Footer />
        </footer>

        <FloatingCTA />
      </div>
    </NicheProvider>
  );
}
