'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

interface PremiumUpsellProps {
  currentPlan: string;
  targetPlan: string;
  title: string;
  description: string;
  benefits: string[];
  onTargetClick?: () => void;
}

const TIER_STYLES: Record<string, { gradient: string; glow: string; accent: string; icon: typeof Zap }> = {
  PRO: {
    gradient: 'from-orange-500 to-amber-600',
    glow: 'bg-orange-500/10',
    accent: 'text-orange-500',
    icon: Zap,
  },
  MAX: {
    gradient: 'from-emerald-400 to-teal-500',
    glow: 'bg-emerald-400/10',
    accent: 'text-emerald-400',
    icon: Crown,
  },
  EXCLUSIVE: {
    gradient: 'from-purple-500 to-indigo-600',
    glow: 'bg-purple-500/10',
    accent: 'text-purple-400',
    icon: Sparkles,
  },
};

export function PremiumUpsell({
  currentPlan,
  targetPlan,
  title,
  description,
  benefits,
  onTargetClick,
}: PremiumUpsellProps) {
  const style = TIER_STYLES[targetPlan] || TIER_STYLES.MAX;
  const Icon = style.icon;
  const isExclusive = targetPlan === 'EXCLUSIVE';

  const content = (
    <div className="relative p-10 md:p-14 rounded-[2.5rem] bg-neutral-900/80 border border-white/5 overflow-hidden shadow-2xl group">
      <div className={`absolute -top-32 -right-32 w-80 h-80 ${style.glow} rounded-full blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000`} />
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/[0.04] to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 grid md:grid-cols-5 gap-10 items-center">
        <div className="md:col-span-3">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${style.glow} border border-white/5 text-[10px] font-black tracking-[0.2em] ${style.accent} uppercase mb-5`}>
            <Icon className="w-3.5 h-3.5" />
            UPGRADE DISPONÍVEL — PLANO {targetPlan}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{title}</h3>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-lg">{description}</p>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className={`rounded-2xl ${style.glow} border border-white/5 p-5`}>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${style.accent} bg-current`} />
              BENEFÍCIOS EXCLUSIVOS
            </h4>
            <ul className="space-y-3">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                  <div className={`w-1.5 h-1.5 rounded-full ${style.accent} bg-current mt-1.5 shrink-0`} />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {isExclusive ? (
            <button
              onClick={onTargetClick}
              className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${style.gradient} text-white font-bold text-sm shadow-2xl transition-all active:scale-[0.97] hover:shadow-[0_0_30px_-5px] hover:shadow-current flex items-center justify-center gap-2 group/btn`}
            >
              Falar com Consultoria ZEHLA
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          ) : (
            <Link href={`/teste-gratis?plan=${targetPlan.toLowerCase()}`} className="block">
              <button className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${style.gradient} text-white font-bold text-sm shadow-2xl transition-all active:scale-[0.97] hover:shadow-[0_0_30px_-5px] hover:shadow-current flex items-center justify-center gap-2 group/btn`}>
                Ativar Plano {targetPlan}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </Link>
          )}
          <p className="text-[10px] text-neutral-600 text-center font-bold uppercase tracking-widest">
            Upgrade imediato • Sem burocracia • Diferença proporcional
          </p>
        </div>
      </div>
    </div>
  );

  if (isExclusive) {
    return <div className="max-w-5xl mx-auto my-24 px-4">{content}</div>;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      className="max-w-5xl mx-auto my-24 px-4"
    >
      {content}
    </motion.section>
  );
}
