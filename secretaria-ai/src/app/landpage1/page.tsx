'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Monitor,
  LayoutDashboard,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';

// Landing Sections
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustBadgesSection } from '@/components/landing/TrustBadgesSection';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { SavingsCalculator } from '@/components/landing/SavingsCalculator';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { BetaFounderSection } from '@/components/landing/BetaFounderSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Recursos', href: '#funcionalidades' },
  { label: 'Economia', href: '#calculadora' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Preços', href: '#precos' },
  { label: 'Fundador', href: '#oferta-fundador' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandPage1() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ===== NAVIGATION — mysmarthotel style ===== */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/[0.04]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">ZEHLA</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="px-3.5 py-2 text-[13px] font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="/zcc" className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all">
              <Monitor className="w-4 h-4" />
              ZCC
            </a>
            <a href="/dashboard" className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </a>
            <button
              onClick={() => scrollTo('#precos')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0a0a0a] text-[13px] font-bold rounded-lg hover:bg-neutral-100 transition-all duration-200 cursor-pointer"
            >
              Começar Grátis
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-white/[0.04]"
            >
              <div className="px-6 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(link.href)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="h-px bg-white/[0.04] my-3" />
                <div className="flex gap-2">
                  <a href="/zcc" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm text-neutral-300 border border-white/[0.06] rounded-lg">
                    <Monitor className="w-4 h-4" /> ZCC
                  </a>
                  <a href="/dashboard" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm text-neutral-300 border border-white/[0.06] rounded-lg">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </a>
                </div>
                <button
                  onClick={() => scrollTo('#precos')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white text-[#0a0a0a] text-sm font-bold rounded-lg cursor-pointer"
                >
                  Começar Grátis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ===== PAGE SECTIONS ===== */}
      <main>
        <div id="inicio"><HeroSection /></div>

        <TrustBadgesSection />

        <PainPointsSection />

        <FeaturesSection />

        <div id="calculadora"><SavingsCalculator /></div>

        <div id="como-funciona"><HowItWorksSection /></div>

        <div className="max-w-7xl mx-auto px-6"><div className="h-px bg-white/[0.04]" /></div>

        <div id="precos"><PricingSection /></div>

        <div className="max-w-7xl mx-auto px-6"><div className="h-px bg-white/[0.04]" /></div>

        <div id="oferta-fundador"><BetaFounderSection /></div>

        <TestimonialsSection />

        <FAQSection />

        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}
