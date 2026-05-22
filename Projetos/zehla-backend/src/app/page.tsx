'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Zap, Menu, X, LogIn, Phone, Mail } from 'lucide-react';

import { HeroSection } from '@/components/landing/HeroSection';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { useUTMParams, getUTMQueryString } from '@/hooks/useUTMParams';
import { getDynamicHeadline } from '@/lib/landing/dynamicHeadlines';

const navLinks = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Preços', href: '#precos' },
];

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const utm = useUTMParams();
  const dynamicHeadline = getDynamicHeadline(utm.utm_campaign);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const goToTesteGratis = () => {
    setMobileMenuOpen(false);
    const utmQuery = getUTMQueryString();
    router.push(`/teste-gratis${utmQuery}`);
  };

  const goToLogin = () => {
    setMobileMenuOpen(false);
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== TOP BAR ===== */}
      <div className="hidden sm:block" style={{ backgroundColor: '#075E54', height: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="https://wa.me/5511999990000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors" style={{ fontSize: '12px' }}>
              <Phone className="w-3 h-3" />
              <span>(11) 99999-0000</span>
            </a>
            <a href="mailto:contato@zehla.com.br" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors" style={{ fontSize: '12px' }}>
              <Mail className="w-3 h-3" />
              <span>contato@zehla.com.br</span>
            </a>
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
        style={{ backgroundColor: '#25D366', top: '0' }}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: '64px' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base leading-none" style={{ letterSpacing: '1px' }}>ZEHLA</span>
              <span className="text-white/70 text-[10px] leading-none">SmartHotel</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-white/90 hover:text-white transition-colors px-4 py-2"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={goToLogin} className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '14px', fontWeight: 500 }}>
              Entrar
            </button>
            <button onClick={goToTesteGratis} className="flex items-center gap-1.5 bg-white text-[#25D366] font-semibold px-5 rounded-full hover:bg-white/90 transition-all shadow-sm" style={{ height: '38px', fontSize: '13px' }}>
              <Zap className="w-3.5 h-3.5" />
              Testar Grátis
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden" style={{ backgroundColor: '#128C7E' }}>
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <button key={link.href} onClick={() => handleNavClick(link.href)} className="block w-full text-left text-white py-2.5 px-3 rounded-lg hover:bg-white/10 transition-colors" style={{ fontSize: '14px' }}>
                  {link.label}
                </button>
              ))}
              <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
                <button onClick={goToLogin} className="block w-full text-left text-white py-2.5 px-3 rounded-lg hover:bg-white/10 transition-colors" style={{ fontSize: '14px' }}>
                  Entrar
                </button>
                <button onClick={goToTesteGratis} className="flex items-center justify-center gap-2 w-full bg-white text-[#25D366] font-medium py-2.5 rounded-full" style={{ fontSize: '14px' }}>
                  <Zap className="w-4 h-4" />
                  Testar Grátis
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1" style={{ paddingTop: '64px' }}>
        <HeroSection
          onNavigate={goToTesteGratis}
          headline={dynamicHeadline.h1}
          highlight={dynamicHeadline.h1Highlight}
          subtitle={dynamicHeadline.subtitle}
        />

        {/* Social proof strip */}
        <section style={{ backgroundColor: '#F0F2F5', padding: '40px 0' }}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { number: '150+', label: 'Pousadas Atendidas' },
                { number: '98.7%', label: 'Satisfação' },
                { number: '50.000+', label: 'Reservas Processadas' },
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#25D366' }}>{stat.number}</div>
                  <div style={{ fontSize: '13px', color: '#667781', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PainPointsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection onNavigate={goToTesteGratis} />
        <CTASection onNavigate={goToTesteGratis} />
      </main>

      {/* ===== FOOTER ===== */}
      <footer style={{ backgroundColor: '#2f2f3b', padding: '56px 0 0' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-base" style={{ letterSpacing: '1px' }}>ZEHLA</span>
                <span className="text-white/40 text-xs">SmartHotel</span>
              </div>
              <p style={{ color: '#98a6ad', fontSize: '13px', lineHeight: 1.7, maxWidth: '280px' }}>
                Sistema Operacional Cognitivo para pousadas e hotéis brasileiros.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Produto</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => handleNavClick('#funcionalidades')} className="text-sm hover:text-white transition-colors cursor-pointer" style={{ color: '#98a6ad' }}>Funcionalidades</button></li>
                <li><button onClick={() => handleNavClick('#precos')} className="text-sm hover:text-white transition-colors cursor-pointer" style={{ color: '#98a6ad' }}>Preços</button></li>
                <li><button onClick={() => handleNavClick('#depoimentos')} className="text-sm hover:text-white transition-colors cursor-pointer" style={{ color: '#98a6ad' }}>Depoimentos</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suporte</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm hover:text-white transition-colors cursor-pointer" style={{ color: '#98a6ad' }}>Central de Ajuda</span></li>
                <li><span className="text-sm hover:text-white transition-colors cursor-pointer" style={{ color: '#98a6ad' }}>Contato</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Legal</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm hover:text-white transition-colors cursor-pointer" style={{ color: '#98a6ad' }}>Termos de Uso</span></li>
                <li><span className="text-sm hover:text-white transition-colors cursor-pointer" style={{ color: '#98a6ad' }}>LGPD</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p style={{ color: '#59667a', fontSize: '12px' }}>
              © 2026 ZEHLA Technologies. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2" style={{ color: '#59667a', fontSize: '12px' }}>
              <span className="w-2 h-2 rounded-full bg-[#65c15c] animate-zehla-pulse" />
              <span>Todos os sistemas operacionais</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
