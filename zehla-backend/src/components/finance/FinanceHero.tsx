'use client';

import { Sparkles, AlertTriangle, TrendingUp, DollarSign, Percent, Users } from 'lucide-react';

export interface FinanceHeroProps {
  summary: {
    totalRevenue: number;
    totalCosts: number;
    profit: number;
    profitMargin: number;
    avgOccupancy: number;
    avgADR: number;
  };
  aiInsight: string;
  healthScore: number;
  alertCount: number;
}

export function FinanceHero({ summary, aiInsight, healthScore, alertCount }: FinanceHeroProps) {
  const isHealthy = healthScore >= 70;
  const isWarning = healthScore >= 40 && healthScore < 70;

  const healthColor = isHealthy 
    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
    : isWarning 
    ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' 
    : 'text-red-400 border-red-500/20 bg-red-500/5';

  const healthBadgeColor = isHealthy 
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
    : isWarning 
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
    : 'bg-red-500/10 text-red-400 border-red-500/20';

  const healthLabel = isHealthy ? 'Saudável' : isWarning ? 'Atenção' : 'Crítico';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AI Insight Card */}
      <div className={`lg:col-span-2 border rounded-2xl p-6 flex flex-col justify-between ${healthColor}`}>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase">ZEHLA Finance — Analistas Cognitivos</span>
          </div>
          <p className="text-[#f3f3f3] text-lg font-medium leading-relaxed tracking-wide font-sans">
            "{aiInsight}"
          </p>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <span className="text-xs text-neutral-500 font-mono">AGENTES INVOLVIDOS: JONY, MARIA & TEDD</span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-mono font-bold tracking-wider ${healthBadgeColor}`}>
            STATUS: {healthLabel.toUpperCase()} ({healthScore}/100)
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="border border-neutral-800 bg-[#0c0c0c] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <span className="text-xs font-mono font-bold text-neutral-400 uppercase">Resumo de Performance</span>
          {alertCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{alertCount} ALERTA{alertCount > 1 ? 'S' : ''} PENDENTE{alertCount > 1 ? 'S' : ''}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Receita Líquida</span>
            </div>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <DollarSign className="w-4 h-4 text-red-400" />
              <span>Custos Totais</span>
            </div>
            <span className="text-base font-bold text-red-400 font-mono">
              R$ {summary.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span>Lucro Projetado</span>
            </div>
            <span className={`text-base font-bold font-mono ${summary.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {summary.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-[10px] ml-1 text-neutral-500 font-mono">({summary.profitMargin.toFixed(1)}%)</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Ocupação Média</span>
            </div>
            <span className="text-base font-bold text-neutral-200 font-mono">
              {summary.avgOccupancy.toFixed(1)}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <Percent className="w-4 h-4 text-purple-400" />
              <span>ADR Médio</span>
            </div>
            <span className="text-base font-bold text-neutral-200 font-mono">
              R$ {summary.avgADR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
