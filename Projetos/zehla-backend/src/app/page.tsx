'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Zap,
  Menu,
  X,
  LogIn,
} from 'lucide-react';

// Landing Sections
import { HeroSection } from '@/components/landing/HeroSection';
import { PainPointsSection } from '@/components/landing/PainPointsSection';
import { PainPoints } from '@/components/landing/PainPoints';
import { RaioXForm } from '@/components/landing/RaioXForm';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';

const navLinks = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Preços', href: '#precos' },
  { label: 'Depoimentos', href: '#depoimentos' },
];

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [styleOption, setStyleOption] = useState('2');
  const [hideConversionBar, setHideConversionBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const footer = document.querySelector('footer');
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (footerTop < windowHeight) {
          setHideConversionBar(true);
        } else {
          setHideConversionBar(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToTesteGratis = () => {
    setMobileMenuOpen(false);
    router.push('/teste-gratis');
  };

  const goToLogin = () => {
    setMobileMenuOpen(false);
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== NAVIGATION BAR ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-strong border-b border-white/5 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Brain className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-neutral-100 leading-none">
                ZEHLA
              </span>
              <span className="text-[10px] text-neutral-500 leading-none">
                SmartHotel
              </span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={goToLogin}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors rounded-lg hover:bg-white/5"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
            <button
              onClick={goToTesteGratis}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Testar Grátis
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-strong border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <button
                  onClick={goToLogin}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-300 hover:text-white rounded-lg transition-colors w-full text-left"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </button>
                <button
                  onClick={goToTesteGratis}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors w-full cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  Testar Grátis
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Style Tweak Switcher */}
      <div className="fixed top-24 right-4 z-[60] glass-strong flex flex-col p-3 gap-2 border border-orange-500/30 rounded-2xl shadow-xl shadow-black/50 animate-fade-in max-w-[180px]">
        <div className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-1">
          Estilo Visual
        </div>
        <button
          onClick={() => setStyleOption('1')}
          className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all ${
            styleOption === '1' 
              ? 'bg-orange-500 text-white' 
              : 'bg-white/5 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          1. Autoridade
        </button>
        <button
          onClick={() => setStyleOption('2')}
          className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all ${
            styleOption === '2' 
              ? 'bg-orange-500 text-white' 
              : 'bg-white/5 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          2. Experiência (Default)
        </button>
        <button
          onClick={() => setStyleOption('3')}
          className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all ${
            styleOption === '3' 
              ? 'bg-orange-500 text-white' 
              : 'bg-white/5 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          3. Tranquilidade Zen
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Style Option 1: Pentagram (Authority) */
        .theme-1 {
          background-color: #000000 !important;
        }
        .theme-1 section {
          background-color: #000000 !important;
          border-bottom: 1px solid #1e1e1e !important;
        }
        .theme-1 h1, .theme-1 h2, .theme-1 h3 {
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          font-weight: 800 !important;
          letter-spacing: -0.05em !important;
          text-transform: uppercase !important;
          color: #ffffff !important;
        }
        .theme-1 p, .theme-1 span {
          color: #a3a3a3 !important;
        }
        .theme-1 .glass-card, .theme-1 .glass-strong {
          background: #000000 !important;
          border: 1px solid #262626 !important;
          border-radius: 0px !important;
          box-shadow: none !important;
        }
        .theme-1 button, .theme-1 a {
          border-radius: 0px !important;
        }

        /* Style Option 3: Kenya Hara (Zen) */
        .theme-3 {
          background-color: #F9F6F0 !important;
        }
        .theme-3 section {
          background-color: #F9F6F0 !important;
        }
        .theme-3 h1, .theme-3 h2, .theme-3 h3 {
          font-family: ui-serif, Georgia, serif !important;
          font-weight: 300 !important;
          letter-spacing: 0.05em !important;
          color: #171717 !important;
        }
        .theme-3 p, .theme-3 span, .theme-3 div {
          color: #525252 !important;
        }
        .theme-3 .glass-card, .theme-3 .glass-strong {
          background: #ffffff !important;
          border: 1px solid #e5e5e5 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
        }
        .theme-3 button, .theme-3 a {
          border-radius: 9999px !important;
        }
        .theme-3 .text-[#F97316], .theme-3 .text-rose-400 {
          color: #d97706 !important;
        }
        .theme-3 .bg-[#F97316], .theme-3 .bg-orange-500 {
          background-color: #171717 !important;
          color: #F9F6F0 !important;
        }
        .theme-3 .bg-[#F97316]:hover, .theme-3 .bg-orange-500:hover {
          background-color: #262626 !important;
        }
      `}} />

      {/* ===== MAIN CONTENT ===== */}
      <main className={`flex-1 transition-all duration-500 theme-${styleOption} ${
        styleOption === '3' ? 'bg-[#F9F6F0]' : 'bg-[#000000]'
      }`}>
        <HeroSection styleOption={styleOption} onNavigate={goToTesteGratis} />
        <RaioXForm />
        <PainPoints />
        <PainPointsSection />
        <FeaturesSection />
        <HowItWorksSection />

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div id="depoimentos">
          <TestimonialsSection />
        </div>

        <PricingSection onNavigate={goToTesteGratis} />
        <CTASection onNavigate={goToTesteGratis} />
      </main>

      {/* Persistent Sticky Conversion Bar */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg glass-strong border border-[#F97316]/30 rounded-2xl p-4 shadow-[0_10px_30px_rgba(249,115,22,0.2)] flex items-center justify-between gap-4 transition-all duration-500 ${
        hideConversionBar ? 'opacity-0 pointer-events-none translate-y-20' : 'opacity-100 translate-y-0'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
          <p className="text-xs sm:text-sm text-neutral-200 font-medium">
            Atenda no WhatsApp 24/7 sem taxas da Booking
          </p>
        </div>
        <button
          onClick={goToTesteGratis}
          className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-md shadow-[#F97316]/20"
        >
          Testar Grátis
        </button>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Logo & description */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-neutral-100">ZEHLA</span>
                <span className="text-xs text-neutral-500">SmartHotel</span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs" style={{ textWrap: 'pretty' }}>
                ZEHLA, o Zelador da sua pousada — Sistema Operacional Cognitivo para pousadas brasileiras.
                Automação inteligente, deixa com o ZEHLA!
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-300 mb-4">
                Produto
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleNavClick('#funcionalidades')}
                    className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('#precos')}
                    className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Preços
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('#depoimentos')}
                    className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Depoimentos
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-300 mb-4">
                Suporte
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => window.open('/ajuda', '_blank')} className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer">
                    Central de Ajuda
                  </button>
                </li>
                <li>
                  <span className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer">
                    Contato
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-300 mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => window.open('/termos', '_blank')} className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer">
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button onClick={() => window.open('/privacidade', '_blank')} className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer">
                    LGPD
                  </button>
                </li>
                <li>
                  <button onClick={() => window.open('https://antigo.turismo.gov.br', '_blank')} className="text-sm text-orange-500 hover:text-orange-400 transition-colors cursor-pointer">
                    Regras MTur (FNRH/24h)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-px bg-white/5 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-600">
              © 2026 SMARTHOTEL / ZEHLA Technologies. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-zehla-pulse" />
              <span>Todos os sistemas operacionais</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
