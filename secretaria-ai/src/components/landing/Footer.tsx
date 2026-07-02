'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Zap, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const navigationLinks = [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Recursos', href: '#features' },
    { label: 'Planos', href: '#precos' },
    { label: 'Dúvidas Frequentes', href: '#faq' },
  ];

  const legalLinks = [
    { label: 'Central de Privacidade', href: '#' },
    { label: 'Termos de Uso', href: '#' },
    { label: 'Política de Privacidade', href: '#' },
    { label: 'Política de Cobrança', href: '#' },
    { label: 'Contrato SaaS', href: '#' },
  ];

  return (
    <footer ref={ref} className="border-t border-white/[0.04] bg-[#080808] pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Main Grid: Logo + Description (2 cols), Navigation (1 col), Legal (1 col) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Logo & Description (spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo Wrapper (includes SVG placeholder ready for user logo) */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                {/* Placeholder SVG - can be easily swapped out by the user */}
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-white text-lg block leading-none tracking-tight">
                  Seu Zélla
                </span>
                <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">
                  Cognitive OS for Hospitality
                </span>
              </div>
            </div>
            
            <p className="text-neutral-500 text-xs leading-relaxed max-w-sm">
              Plataforma inteligente de automação de reservas e atendimento 24/7 com inteligência artificial para o seu hotel ou pousada. Converta mais hóspedes e impulsione seu negócio sem complicação.
            </p>

            <div className="flex items-center gap-4 text-neutral-600 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ativação rápida</span>
              </div>
              <span className="text-neutral-800">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sem fidelidade</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-4">
              Navegação
            </h3>
            <ul className="space-y-2.5">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-500 hover:text-emerald-400 text-xs transition-colors duration-200 block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Links */}
          <div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-4">
              Jurídico
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-500 hover:text-emerald-400 text-xs transition-colors duration-200 block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.04] pt-6 mt-10" />

        {/* Footer Bottom: Copyright & Gateways */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-600 text-[11px]">
              &copy; {new Date().getFullYear()} Seu Zélla. Todos os direitos reservados.
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-600 text-[11px]">
            <div className="flex items-center gap-1">
              <span>Pagamentos via</span>
              <span className="text-neutral-400 font-semibold">Mercado Pago</span>
            </div>
            <span className="text-neutral-800">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Todos os sistemas operacionais online</span>
            </div>
          </div>
        </div>

      </motion.div>
    </footer>
  );
}