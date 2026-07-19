'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, DollarSign, AlertTriangle, TrendingUp, TrendingDown,
  Users, MessageSquare, BarChart3, Zap, Shield,
  ChevronRight, ArrowUp, ArrowDown,
} from 'lucide-react';
import { tenClientFriends, airbnbHosts, parceirosZella, globalMetrics } from '@/lib/zcc-clients-data';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TenantCost {
  id: string;
  name: string;
  niche: 'pousadas' | 'anfitrioes' | 'parceiro';
  plan: string;
  monthlyPrice: number;
  whatsappCostWeek: number;
  whatsappCostMonth: number;
  messagesWeek: number;
  messagesMonth: number;
  costRatio: number; // whatsappCost / monthlyPrice
  anomaly: boolean;
  trend: 'up' | 'down' | 'stable';
  sparkline: number[];
}

interface CostBreakdown {
  category: string;
  cost: number;
  percentage: number;
}

// ── Generate Mock Cost Data ───────────────────────────────────────────────────

function generateSparkline(base: number, variance: number): number[] {
  return Array.from({ length: 14 }, () => base + (Math.random() - 0.4) * variance);
}

const tenantCosts: TenantCost[] = [
  // Pousadas
  ...tenClientFriends.map((c, i) => {
    const msgs = Math.floor(200 + Math.random() * 800);
    const costPerMsg = 0.025; // R$0.025 per service message
    const weekCost = msgs * costPerMsg;
    const monthCost = weekCost * 4.3;
    const planPrice = c.plan === 'fundador' ? 297 : c.plan === 'pro' ? 397 : 797;
    const ratio = monthCost / planPrice;
    return {
      id: c.id,
      name: c.name,
      niche: 'pousadas' as const,
      plan: c.plan.toUpperCase(),
      monthlyPrice: planPrice,
      whatsappCostWeek: Math.round(weekCost * 100) / 100,
      whatsappCostMonth: Math.round(monthCost * 100) / 100,
      messagesWeek: msgs,
      messagesMonth: Math.round(msgs * 4.3),
      costRatio: Math.round(ratio * 1000) / 1000,
      anomaly: ratio > 0.4,
      trend: (i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      sparkline: generateSparkline(weekCost, weekCost * 0.3),
    };
  }),
  // Airbnb
  ...airbnbHosts.map((h, i) => {
    const msgs = Math.floor(300 + Math.random() * 600);
    const costPerMsg = 0.025;
    const weekCost = msgs * costPerMsg;
    const monthCost = weekCost * 4.3;
    const planPrice = h.plan === 'pro' ? 397 : 797;
    const ratio = monthCost / planPrice;
    return {
      id: h.id,
      name: h.name,
      niche: 'anfitrioes' as const,
      plan: h.plan.toUpperCase(),
      monthlyPrice: planPrice,
      whatsappCostWeek: Math.round(weekCost * 100) / 100,
      whatsappCostMonth: Math.round(monthCost * 100) / 100,
      messagesWeek: msgs,
      messagesMonth: Math.round(msgs * 4.3),
      costRatio: Math.round(ratio * 1000) / 1000,
      anomaly: ratio > 0.4,
      trend: (i % 3 === 0 ? 'up' : i % 3 === 1 ? 'stable' : 'down') as 'up' | 'down' | 'stable',
      sparkline: generateSparkline(weekCost, weekCost * 0.25),
    };
  }),
];

// ── Mini Sparkline ─────────────────────────────────────────────────────────────

function MiniSparkline({ data, color, width = 80, height = 24 }: {
  data: number[]; color: string; width?: number; height?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`
  ).join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BurnRateCenter() {
  const [sortBy, setSortBy] = useState<'costRatio' | 'whatsappCostMonth' | 'messagesWeek'>('costRatio');
  const [filterAnomaly, setFilterAnomaly] = useState(false);

  const totalMonthlyWhatsApp = tenantCosts.reduce((s, t) => s + t.whatsappCostMonth, 0);
  const totalMRR = tenantCosts.reduce((s, t) => s + t.monthlyPrice, 0);
  const overallRatio = totalMRR > 0 ? totalMonthlyWhatsApp / totalMRR : 0;
  const anomalyCount = tenantCosts.filter(t => t.anomaly).length;
  const totalMessagesWeek = tenantCosts.reduce((s, t) => s + t.messagesWeek, 0);

  const sorted = [...tenantCosts]
    .filter(t => !filterAnomaly || t.anomaly)
    .sort((a, b) => {
      if (sortBy === 'costRatio') return b.costRatio - a.costRatio;
      if (sortBy === 'whatsappCostMonth') return b.whatsappCostMonth - a.whatsappCostMonth;
      return b.messagesWeek - a.messagesWeek;
    });

  const topSpenders = sorted.slice(0, 5);

  // Cost breakdown
  const breakdown: CostBreakdown[] = [
    { category: 'Mensagens de Serviço WhatsApp', cost: totalMonthlyWhatsApp * 0.65, percentage: 65 },
    { category: 'API Cloud (processamento)', cost: totalMonthlyWhatsApp * 0.2, percentage: 20 },
    { category: 'Armazenamento Mídia', cost: totalMonthlyWhatsApp * 0.1, percentage: 10 },
    { category: 'Outros (webhooks, retry)', cost: totalMonthlyWhatsApp * 0.05, percentage: 5 },
  ];

  const nicheConfig = {
    pousadas: { color: 'var(--zcc-kinpaku)', label: 'Pousadas', badge: 'zcc-badge-gold' },
    anfitrioes: { color: 'var(--zcc-patina)', label: 'Airbnb', badge: 'zcc-badge-patina' },
    parceiro: { color: '#c45454', label: 'Parceiro', badge: 'zcc-badge-danger' },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Flame className="w-5 h-5" style={{ color: overallRatio > 0.35 ? '#ef4444' : '#f59e0b' }} />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--zcc-champagne)' }}>Central de Custos — Burn Rate Global</h2>
            <p className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
              Gasto API WhatsApp (Meta) · Todos os Tenants · Custo por Mensagem de Serviço
            </p>
          </div>
          {anomalyCount > 0 && (
            <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1.5 px-2 py-1 rounded"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-mono text-amber-400">{anomalyCount} ANOMALIA{anomalyCount > 1 ? 'S' : ''}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Macro KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="zcc-panel p-4">
          <div className="zcc-eyebrow">GASTO TOTAL WHATSAPP/MÊS</div>
          <div className="text-xl font-bold font-mono" style={{ color: overallRatio > 0.35 ? '#ef4444' : '#f59e0b' }}>
            R$ {totalMonthlyWhatsApp.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
            Todos os {tenantCosts.length} tenants
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="zcc-panel p-4">
          <div className="zcc-eyebrow">MRR TOTAL</div>
          <div className="text-xl font-bold font-mono" style={{ color: 'var(--zcc-kinpaku)' }}>
            R$ {totalMRR.toLocaleString('pt-BR')}
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
            Receita SaaS mensal
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="zcc-panel p-4">
          <div className="zcc-eyebrow">BURN RATIO</div>
          <div className="text-xl font-bold font-mono" style={{ color: overallRatio > 0.35 ? '#ef4444' : overallRatio > 0.25 ? '#f59e0b' : '#10b981' }}>
            {(overallRatio * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
            Custo WA / MRR
          </div>
          <MiniSparkline data={generateSparkline(overallRatio * 100, 3)} color={overallRatio > 0.35 ? '#ef4444' : '#10b981'} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="zcc-panel p-4">
          <div className="zcc-eyebrow">MSGs SEMANA</div>
          <div className="text-xl font-bold font-mono" style={{ color: 'var(--zcc-patina)' }}>
            {totalMessagesWeek.toLocaleString('pt-BR')}
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
            ~R$0,025/msg serviço
          </div>
        </motion.div>
      </div>

      {/* Cost Breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="zcc-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4" style={{ color: 'var(--zcc-kinpaku)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Decomposição de Custos</h3>
        </div>
        <div className="space-y-3">
          {breakdown.map((item, i) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-secondary)' }}>{item.category}</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--zcc-kinpaku)' }}>
                  R$ {item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.percentage}%)
                </span>
              </div>
              <div className="zcc-progress-track">
                <motion.div className="zcc-progress-fill" style={{ background: 'var(--zcc-kinpaku)' }}
                  initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Gastadores (Anomaly Alerts) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="zcc-panel p-5" style={anomalyCount > 0 ? { borderColor: 'rgba(245,158,11,0.3)', borderWidth: 1 } : {}}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: anomalyCount > 0 ? '#f59e0b' : 'var(--zcc-text-muted)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>
              Top Gastadores — Alertas de Anomalia
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFilterAnomaly(!filterAnomaly)}
              className={`zcc-tab ${filterAnomaly ? 'zcc-tab-active' : ''}`}>
              {filterAnomaly ? 'Só Anomalias' : 'Todos'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {topSpenders.map((tenant, i) => {
            const niche = nicheConfig[tenant.niche];
            const ratioColor = tenant.costRatio > 0.4 ? '#ef4444' : tenant.costRatio > 0.3 ? '#f59e0b' : '#10b981';

            return (
              <motion.div key={tenant.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="p-3 rounded" style={{ background: 'var(--zcc-lacquer-sunken)', border: tenant.anomaly ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(212,168,67,0.06)' }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-6 text-center text-[10px] font-mono font-bold" style={{ color: 'var(--zcc-text-muted)' }}>
                    #{i + 1}
                  </div>
                  {/* Name + Niche */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold truncate" style={{ color: 'var(--zcc-champagne)' }}>
                        {tenant.name}
                      </span>
                      <span className={niche.badge}>{niche.label}</span>
                      <span className="zcc-badge-muted">{tenant.plan}</span>
                      {tenant.anomaly && <span className="zcc-badge-danger">ANOMALIA</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <MiniSparkline data={tenant.sparkline} color={ratioColor} width={60} height={16} />
                      <span className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
                        {tenant.messagesWeek} msgs/sem
                      </span>
                    </div>
                  </div>
                  {/* Cost Ratio */}
                  <div className="text-center">
                    <div className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>BURN</div>
                    <div className="text-sm font-mono font-bold" style={{ color: ratioColor }}>
                      {(tenant.costRatio * 100).toFixed(1)}%
                    </div>
                  </div>
                  {/* WhatsApp Cost */}
                  <div className="text-right">
                    <div className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>CUSTO WA/MÊS</div>
                    <div className="text-sm font-mono font-bold" style={{ color: 'var(--zcc-kinpaku)' }}>
                      R$ {tenant.whatsappCostMonth.toFixed(2)}
                    </div>
                  </div>
                  {/* Trend */}
                  <div className="text-center">
                    {tenant.trend === 'up' && <ArrowUp className="w-4 h-4 text-red-400" />}
                    {tenant.trend === 'down' && <ArrowDown className="w-4 h-4 text-emerald-400" />}
                    {tenant.trend === 'stable' && <div className="w-4 h-0.5 bg-neutral-500 mx-auto mt-2" />}
                  </div>
                </div>
                {tenant.anomaly && (
                  <div className="mt-2 p-2 rounded text-[9px] font-mono" style={{ background: 'rgba(245,158,11,0.06)', color: '#f59e0b' }}>
                    ⚠ Este tenant gasta {(tenant.costRatio * 100).toFixed(1)}% do plano em WhatsApp. Investigar possível loop de mensagens ou abuso do sistema.
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Alert Rules */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="zcc-panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Regras de Alerta de Custo</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <div className="text-[10px] font-mono font-bold text-amber-400 mb-1">🟡 LARANJA — Investigar</div>
            <div className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-secondary)' }}>
              Burn ratio &gt; 30% (custo WhatsApp &gt; 30% do valor do plano). Verificar volume de msgs e padrões de uso.
            </div>
          </div>
          <div className="p-3 rounded" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
            <div className="text-[10px] font-mono font-bold text-red-400 mb-1">🔴 VERMELHO — Ação Imediata</div>
            <div className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-secondary)' }}>
              Burn ratio &gt; 40%. Provável loop ou abuso. Ativar Kill Switch parcial e notificar tenant.
            </div>
          </div>
          <div className="p-3 rounded" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <div className="text-[10px] font-mono font-bold text-emerald-400 mb-1">🟢 VERDE — Normal</div>
            <div className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-secondary)' }}>
              Burn ratio &lt; 30%. Uso saudável da API. Meta cobra por mensagem de serviço (R$0,025/msg).
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
