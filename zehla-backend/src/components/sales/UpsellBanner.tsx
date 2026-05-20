'use client';

import { Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UpsellBannerProps {
  currentTier: 'LITE' | 'PRO' | 'MAX';
  upsellTier: 'PRO' | 'MAX' | 'ENTERPRISE';
  priceDiff: string;
  benefits: string[];
  ctaText: string;
  onCtaClick: () => void;
}

export const UpsellBanner = ({ 
  currentTier, 
  upsellTier, 
  priceDiff, 
  benefits, 
  ctaText, 
  onCtaClick 
}: UpsellBannerProps) => {
  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto my-20 px-4"
    >
      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-black border border-white/10 overflow-hidden shadow-2xl">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px]" />
        
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-4">
              <Zap className="w-3 h-3 fill-current" />
              UPSELL DISPONÍVEL
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              Seu negócio está crescendo? Ative o <span className="text-orange-500">Plano {upsellTier}</span>
            </h2>
            <p className="text-neutral-400 mb-6 text-sm md:text-base">
              Por apenas <span className="text-white font-bold">+{priceDiff}/mês</span>, você desbloqueia o motor completo de rentabilidade do ZEHLA.
            </p>
            
            <button
              onClick={onCtaClick}
              className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2 text-sm"
            >
              {ctaText}
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" />
              O que você ganha no {upsellTier}:
            </h3>
            <ul className="space-y-3">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
