'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Users, Crown,
  Building2, Home, Shield, PieChart, BarChart3, ArrowUpRight,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface FinancialData {
  totalMRR: number;
  arpu: number;
  churnRate: number;
  planBreakdown: Record<string, { count: number; mrr: number }>;
  nicheComparison: {
    pousadas: { clients: number; mrr: number };
    airbnb: { clients: number; mrr: number };
    parceiro: { clients: number; mrr: number };
  };
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const mockFinancialData: FinancialData = {
  totalMRR: 0,
  arpu: 0,
  churnRate: 0,
  planBreakdown: {
    TRIAL: { count: 0, mrr: 0 },
    LITE: { count: 0, mrr: 0 },
    PRO: { count: 0, mrr: 0 },
    MAX: { count: 0, mrr: 0 },
    PARCEIRO: { count: 0, mrr: 0 },
  },
  nicheComparison: {
    pousadas: { clients: 0, mrr: 0 },
    airbnb: { clients: 0, mrr: 0 },
    parceiro: { clients: 0, mrr: 0 },
  },
};

// ── Plan config ────────────────────────────────────────────────────────────────

const planConfig: Record<string, { icon: React.ElementType; color: string; badgeClass: string; price: number }> = {
  TRIAL: { icon: PieChart, color: 'var(--zcc-text-muted)', badgeClass: 'zcc-badge-muted', price: 0 },
  LITE: { icon: Building2, color: 'var(--zcc-kinpaku)', badgeClass: 'zcc-badge', price: 197 },
  PRO: { icon: TrendingUp, color: 'var(--zcc-patina)', badgeClass: 'zcc-badge-patina', price: 397 },
  MAX: { icon: Crown, color: 'var(--zcc-kinpaku)', badgeClass: 'zcc-badge-gold', price: 797 },
  PARCEIRO: { icon: Shield, color: '#d4a843', badgeClass: 'zcc-badge-gold', price: 247 },
};

const nicheConfig = {
  pousadas: { icon: Building2, color: 'var(--zcc-kinpaku)', label: 'Pousadas' },
  airbnb: { icon: Home, color: 'var(--zcc-patina)', label: 'Airbnb' },
  parceiro: { icon: Shield, color: '#d4a843', label: 'Parceiro' },
};

// ── Component ──────────────────────────────────────────────────────────────────

export function FinancialBreakdownPanel() {
  const [data, setData] = useState<FinancialData>(mockFinancialData);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'demo'>('demo');

  useEffect(() => {
    async function fetchFinancial() {
      try {
        const res = await fetch('/api/zcc/metrics/financial');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setData(json.data);
            setSource(json.meta?.source === 'demo' ? 'demo' : 'api');
          }
        }
      } catch {
        /* keep mock */
      } finally {
        setLoading(false);
      }
    }
    fetchFinancial();
    const interval = setInterval(fetchFinancial, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalClients = Object.values(data.planBreakdown).reduce((s, p) => s + p.count, 0);
  const activeClients = totalClients; // for now, same as total
  const churnedClients = Math.round(totalClients * (data.churnRate / 100));

  return (
    <div className="space-y-5">
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)' }}>
          <div className="w-3 h-3 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-[10px] font-mono" style={{ color: 'var(--zcc-kinpaku)' }}>Carregando métricas financeiras...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5" style={{ color: 'var(--zcc-kinpaku)' }} />
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--zcc-champagne)' }}>Financeiro Detalhado</h2>
            <p className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
              Breakdown por plano · ARPU · Churn · Comparação de nichos
            </p>
          </div>
        </div>
        {source === 'demo' && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)' }}>
            <span className="text-[9px] font-mono" style={{ color: 'var(--zcc-kinpaku)' }}>DEMO DATA</span>
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'MRR TOTAL', value: `R$ ${data.totalMRR.toLocaleString('pt-BR')}`, color: 'var(--zcc-kinpaku)', icon: DollarSign },
          { label: 'ARPU', value: `R$ ${data.arpu.toLocaleString('pt-BR')}`, color: 'var(--zcc-champagne)', icon: BarChart3 },
          { label: 'CHURN', value: `${data.churnRate.toFixed(1)}%`, color: data.churnRate > 10 ? '#ef4444' : '#10b981', icon: TrendingDown },
          { label: 'ATIVOS', value: activeClients, color: '#10b981', icon: Users },
          { label: 'CHURNED', value: churnedClients, color: churnedClients > 0 ? '#ef4444' : 'var(--zcc-text-muted)', icon: TrendingDown },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="zcc-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                <div className="zcc-eyebrow">{stat.label}</div>
              </div>
              <div className="text-lg font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Plan Breakdown Cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4" style={{ color: 'var(--zcc-kinpaku)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>MRR por Plano</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(data.planBreakdown).map(([planKey, planData], i) => {
            const config = planConfig[planKey] || planConfig.TRIAL;
            const Icon = config.icon;
            const mrrPct = data.totalMRR > 0 ? (planData.mrr / data.totalMRR) * 100 : 0;
            return (
              <motion.div key={planKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="zcc-panel p-4" style={{ borderColor: `${config.color}22`, borderWidth: 1 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                  <span className="text-xs font-bold" style={{ color: config.color }}>{planKey}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="zcc-eyebrow">ASSINANTES</div>
                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--zcc-champagne)' }}>{planData.count}</div>
                  </div>
                  <div>
                    <div className="zcc-eyebrow">MRR</div>
                    <div className="text-lg font-bold font-mono" style={{ color: config.color }}>
                      R$ {planData.mrr.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  {data.totalMRR > 0 && (
                    <div>
                      <div className="zcc-progress-track" style={{ height: 4 }}>
                        <div className="zcc-progress-fill" style={{ width: `${mrrPct}%`, background: config.color }} />
                      </div>
                      <div className="text-[9px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
                        {mrrPct.toFixed(1)}% do total
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Niche Comparison Side-by-Side */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="zcc-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--zcc-kinpaku)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Comparação por Nicho</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['pousada', 'airbnb', 'airbnb'] as const).map((nicheKey, i) => {
            const config = nicheConfig[nicheKey];
            const nicheData = data.nicheComparison[nicheKey];
            const Icon = config.icon;
            const mrrPct = data.totalMRR > 0 ? (nicheData.mrr / data.totalMRR) * 100 : 0;

            return (
              <motion.div key={nicheKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="zcc-panel p-4" style={{ borderColor: `${config.color}22`, borderWidth: 1 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                  <span className="text-xs font-bold" style={{ color: config.color }}>{config.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="zcc-eyebrow">CLIENTES</div>
                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--zcc-champagne)' }}>
                      {nicheData.clients}
                    </div>
                  </div>
                  <div>
                    <div className="zcc-eyebrow">MRR</div>
                    <div className="text-lg font-bold font-mono" style={{ color: config.color }}>
                      R$ {nicheData.mrr.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                {data.totalMRR > 0 && (
                  <div className="mt-3">
                    <div className="zcc-progress-track" style={{ height: 4 }}>
                      <div className="zcc-progress-fill" style={{ width: `${mrrPct}%`, background: config.color }} />
                    </div>
                    <div className="text-[9px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
                      {mrrPct.toFixed(1)}% do MRR total
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Churn Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="zcc-panel p-5" style={{ borderColor: data.churnRate > 10 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.15)', borderWidth: 1 }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4" style={{ color: data.churnRate > 10 ? '#ef4444' : '#10b981' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Churn Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <div className="zcc-eyebrow">CHURN RATE</div>
            <div className="text-lg font-bold font-mono" style={{ color: data.churnRate > 10 ? '#ef4444' : '#10b981' }}>
              {data.churnRate.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="zcc-eyebrow">ATIVOS</div>
            <div className="text-lg font-bold font-mono" style={{ color: '#10b981' }}>{activeClients}</div>
          </div>
          <div>
            <div className="zcc-eyebrow">CHURNED</div>
            <div className="text-lg font-bold font-mono" style={{ color: churnedClients > 0 ? '#ef4444' : 'var(--zcc-text-muted)' }}>
              {churnedClients}
            </div>
          </div>
          <div>
            <div className="zcc-eyebrow">MRR LOST</div>
            <div className="text-lg font-bold font-mono" style={{ color: churnedClients > 0 ? '#ef4444' : 'var(--zcc-text-muted)' }}>
              R$ {Math.round(churnedClients * data.arpu).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
        <div className="mt-3 text-[10px]" style={{ color: 'var(--zcc-text-muted)' }}>
          * Churn rate = clientes congelados / total de clientes. MRR Lost = churned × ARPU estimado.
        </div>
      </motion.div>
    </div>
  );
}
