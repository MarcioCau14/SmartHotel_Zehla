'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Crown } from 'lucide-react';

interface PremiumUpsellProps {
  currentPlan: string;
  targetPlan: string;
  title: string;
  description: string;
  benefits: string[];
  onTargetClick?: () => void;
}

const planColors: Record<string, { from: string; to: string; accent: string; icon: 'sparkles' | 'zap' | 'crown' }> = {
  PRO: { from: 'from-orange-500', to: 'to-amber-600', accent: 'orange', icon: 'zap' },
  MAX: { from: 'from-orange-500', to: 'to-amber-600', accent: 'orange', icon: 'crown' },
  EXCLUSIVE: { from: 'from-purple-600', to: 'to-indigo-700', accent: 'purple', icon: 'sparkles' },
};

export function PremiumUpsell({ currentPlan, targetPlan, title, description, benefits, onTargetClick }: PremiumUpsellProps) {
  const colors = planColors[targetPlan] || planColors.PRO;

  return (
    <section className="max-w-6xl mx-auto my-24 px-4">
      <div className={`relative p-10 md:p-16 rounded-[3rem] bg-gradient-to-br ${colors.from} ${colors.to} overflow-hidden shadow-2xl`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px]" />

        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              UPGRADE DISPONÍVEL
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              {title}
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed">
              {description}
            </p>
            {onTargetClick ? (
              <button
                onClick={onTargetClick}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-neutral-100 transition-all text-sm shadow-xl active:scale-95"
              >
                Saber mais
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href={`/teste-gratis?plan=${targetPlan.toLowerCase()}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-neutral-100 transition-all text-sm shadow-xl active:scale-95"
              >
                Ativar {targetPlan}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              {colors.icon === 'crown' && <Crown className="w-4 h-4" />}
              {colors.icon === 'zap' && <Zap className="w-4 h-4" />}
              {colors.icon === 'sparkles' && <Sparkles className="w-4 h-4" />}
              O que você ganha no {targetPlan}:
            </h3>
            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                  <div className={`w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 shrink-0`} />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
