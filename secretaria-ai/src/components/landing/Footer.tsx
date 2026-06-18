'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Zap } from 'lucide-react';

const links = [
  { label: 'Página de Vendas', href: '/' },
  { label: 'Termos de Uso', href: '#' },
  { label: 'Política de Privacidade', href: '#' },
  { label: 'LGPD', href: '#' },
];

export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <footer ref={ref} className="border-t border-white/[0.04] pt-16 pb-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg block leading-none">ZÉLLA</span>
                <span className="text-[10px] text-neutral-600 font-mono">SmartHotel Cognitive OS</span>
              </div>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
              Sistema Operacional Cognitivo para Pousadas. IA que transforma hotelaria brasileira com automação inteligente e WhatsApp 24/7.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Links</h4>
            <div className="space-y-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-neutral-500 text-xs hover:text-emerald-400 transition-colors py-1"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-500/50" />
            <span className="text-neutral-600 text-xs">&copy; 2026 ZÉLLA Technologies. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-neutral-600 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-zehla-pulse" />
              <span>Todos os sistemas operacionais</span>
            </div>
            <span className="text-neutral-700 text-xs">|</span>
            <span className="text-neutral-600 text-xs">
              Gateway: Mercado Pago
            </span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}