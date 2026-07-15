'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles, Crown, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  type PlanTier,
  type TabDef,
  PLAN_DISPLAY,
  PLAN_HIGHLIGHTS,
  getNextTier,
  hasAccess,
} from '@/lib/plan-features';

// ── Props ─────────────────────────────────────────────────────────────────────

interface PlanGateProps {
  /** Plano atual do tenant */
  currentPlan: PlanTier;
  /** Plano mínimo necessário para acessar o recurso */
  requiredPlan: PlanTier;
  /** Título do recurso bloqueado */
  title: string;
  /** Descrição do recurso bloqueado */
  description?: string;
  /** Lista de features incluídas no upgrade (mostra como bullets) */
  features?: string[];
  /** Variante visual: 'inline' (dentro de conteúdo) | 'full' (tela inteira) | 'compact' (banner pequeno) */
  variant?: 'inline' | 'full' | 'compact';
  /** Categoria do CTA: 'general' | 'crm' | 'analytics' | 'training' */
  category?: string;
  /** Callback quando clica em upgrade */
  onUpgrade?: () => void;
}

// ── Ícone do plano alvo ──────────────────────────────────────────────────────

const TIER_ICONS: Record<string, React.ElementType> = {
  lite: Rocket,
  pro: Sparkles,
  max: Crown,
};

// ── Componente Principal ──────────────────────────────────────────────────────

export function PlanGate({
  currentPlan,
  requiredPlan,
  title,
  description,
  features,
  variant = 'inline',
  category,
  onUpgrade,
}: PlanGateProps) {
  // Se já tem acesso, não renderiza nada
  if (hasAccess(currentPlan, requiredPlan)) return null;

  const nextTier = getNextTier(currentPlan);
  const targetTier = nextTier && !hasAccess(nextTier, requiredPlan) ? requiredPlan : (nextTier || requiredPlan);
  const targetDisplay = PLAN_DISPLAY[targetTier];
  const highlights = PLAN_HIGHLIGHTS[targetTier];
  const TargetIcon = TIER_ICONS[targetTier] || Sparkles;

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default: scroll to pricing on landing page
      window.location.href = '/#precos';
    }
  };

  // ── Variant: Compact (banner pequeno) ──
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/[0.06] flex items-center justify-center text-zinc-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{title}</p>
            <p className="text-[10px] text-zinc-500 truncate">Disponível a partir do plano {targetDisplay.name}</p>
          </div>
        </div>
        <Button
          onClick={handleUpgradeClick}
          className="shrink-0 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-lg transition-all cursor-pointer active:scale-[0.98]"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {targetDisplay.name}
        </Button>
      </motion.div>
    );
  }

  // ── Variant: Full (tela inteira) ──
  if (variant === 'full') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[500px] bg-black/40 rounded-xl border border-white/[0.06] p-8 text-center"
      >
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${targetTier === 'max' ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'} flex items-center justify-center mb-6`}>
          <TargetIcon className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-white/60 max-w-md mb-6">{description}</p>
        )}

        {highlights && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 w-full max-w-lg">
            {highlights.features.slice(0, 6).map((feat) => (
              <div
                key={feat}
                className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-3"
              >
                <span className="text-[11px] text-white/70">{feat}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="border-white/20 text-white/50 text-[10px]">
            Plano atual: {PLAN_DISPLAY[currentPlan].label}
          </Badge>
          <ArrowRight className="w-3 h-3 text-white/30" />
          <Badge className={`${targetDisplay.badgeBg} ${targetDisplay.badgeText} border ${targetDisplay.badgeBorder} text-[10px]`}>
            {targetDisplay.label} — {targetDisplay.priceLabel}
          </Badge>
        </div>

        <Button
          onClick={handleUpgradeClick}
          className={`font-semibold px-8 py-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
            targetTier === 'max'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white'
          }`}
        >
          <TargetIcon className="w-4 h-4 mr-2" />
          Fazer Upgrade para {targetDisplay.name}
        </Button>

        <p className="text-[10px] text-white/30 mt-3">
          Cancele a qualquer momento · Sem multa
        </p>
      </motion.div>
    );
  }

  // ── Variant: Inline (dentro de conteúdo) ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121216] border border-white/[0.04] rounded-lg p-6 space-y-5"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/[0.06] flex items-center justify-center text-zinc-400 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-white">{title}</h4>
            <Badge className={`${targetDisplay.badgeBg} ${targetDisplay.badgeText} border ${targetDisplay.badgeBorder} text-[8px] font-bold`}>
              {targetDisplay.label}
            </Badge>
          </div>
          {description && (
            <p className="text-zinc-400 text-[11px] leading-relaxed mt-1">{description}</p>
          )}
        </div>
      </div>

      {features && features.length > 0 && (
        <div className="space-y-1.5 pl-14">
          {features.map((feat) => (
            <div key={feat} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500/50 shrink-0" />
              <span className="text-[10px] text-zinc-400">{feat}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.04]">
        <p className="text-[10px] text-zinc-500 leading-normal max-w-sm">
          Disponível a partir do plano {targetDisplay.name} ({targetDisplay.priceLabel}).
          {PLAN_DISPLAY[currentPlan].price > 0 && (
            <> Diferença de <strong className="text-emerald-400">R${targetDisplay.price - PLAN_DISPLAY[currentPlan].price},00/mês</strong>.</>
          )}
        </p>
        <Button
          onClick={handleUpgradeClick}
          className={`w-full sm:w-auto px-4 py-2 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all ${
            targetTier === 'max'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20'
              : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-lg shadow-emerald-500/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Upgrade para {targetDisplay.name}
        </Button>
      </div>
    </motion.div>
  );
}

// ── Banner de Upgrade no topo (para quando usuário está em plano baixo) ────────

interface PlanUpgradeBannerProps {
  currentPlan: PlanTier;
  onUpgrade?: () => void;
}

export function PlanUpgradeBanner({ currentPlan, onUpgrade }: PlanUpgradeBannerProps) {
  const next = getNextTier(currentPlan);
  if (!next) return null;

  const targetDisplay = PLAN_DISPLAY[next];
  const highlights = PLAN_HIGHLIGHTS[next];
  const TargetIcon = TIER_ICONS[next] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-b px-6 py-3 flex items-center justify-between gap-4 flex-wrap select-none ${
        next === 'max'
          ? 'bg-gradient-to-r from-amber-950/30 via-zinc-900 to-[#0a0a0f] border-amber-500/10'
          : 'bg-gradient-to-r from-emerald-950/30 via-zinc-900 to-[#0a0a0f] border-emerald-500/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          next === 'max' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
        }`}>
          <TargetIcon className={`w-4 h-4 ${next === 'max' ? 'text-amber-400' : 'text-emerald-400'}`} />
        </div>
        <div>
          <p className="text-[11px] text-zinc-300">
            <strong className="text-white">{highlights?.headline}</strong>
            <span className="text-zinc-500 ml-2">· Plano {targetDisplay.name} a partir de {targetDisplay.priceLabel}</span>
          </p>
        </div>
      </div>
      <button
        onClick={onUpgrade || (() => { window.location.href = '/#precos'; })}
        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
          next === 'max'
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
        }`}
      >
        Fazer Upgrade para {targetDisplay.name}
      </button>
    </motion.div>
  );
}