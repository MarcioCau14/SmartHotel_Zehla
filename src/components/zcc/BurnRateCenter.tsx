'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, DollarSign, AlertTriangle,
  MessageSquare, BarChart3, Shield,
  ChevronRight, ArrowUp, ArrowDown, CheckCircle2, Loader2,
  Clock, Merge, Sparkles,
} from 'lucide-react';
import { tenClientFriends, airbnbHosts } from '@/lib/zcc-clients-data';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TenantCost {
  id: string;
  name: string;
  niche: 'pousada' | 'airbnb' | 'airbnb';
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

// SimulateResult type is used by the API consumer implicitly

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
      niche: 'pousada' as const,
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
      niche: 'airbnb' as const,
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
  const [sortBy] = useState<'costRatio' | 'whatsappCostMonth' | 'messagesWeek'>('costRatio');
  const [filterAnomaly, setFilterAnomaly] = useState(false);

  // ── WhatsApp Cost Meter State ────────────────────────────────────────
  const [simulating, setSimulating] = useState(false);
  const [simulateError, setSimulateError] = useState<string | null>(null);
  const [totalSimulatedCost, setTotalSimulatedCost] = useState(0);
  const [simulateCount, setSimulateCount] = useState(0);
  const [costFlash, setCostFlash] = useState(false);

  // ── Bundling Demo State ──────────────────────────────────────────────
  const [bundlingActive, setBundlingActive] = useState(false);
  const [bundleCountdown, setBundleCountdown] = useState(3);
  const [bundleComplete, setBundleComplete] = useState(false);
  const [bundleMsgs, setBundleMsgs] = useState<{ id: number; merged: boolean }[]>([]);

  // ── One-Shot State ──────────────────────────────────────────────────
  const [oneShotSimulating, setOneShotSimulating] = useState(false);
  const [oneShotActive, setOneShotActive] = useState(false);
  const [oneShotError, setOneShotError] = useState<string | null>(null);

  const MOCK_TENANT_ID = 'demo-tenant-id';

  // ── Auto-dismiss flash ───────────────────────────────────────────────
  useEffect(() => {
    if (costFlash) {
      const t = setTimeout(() => setCostFlash(false), 800);
      return () => clearTimeout(t);
    }
  }, [costFlash]);

  // ── Simulate Single Message ──────────────────────────────────────────
  const handleSimulate = async () => {
    setSimulating(true);
    setSimulateError(null);
    try {
      const res = await fetch('/api/zcc/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: MOCK_TENANT_ID,
          direction: 'outbound',
          intent: 'check_availability',
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setSimulateError(data.error || 'Erro na simulação');
        return;
      }
      const costUsd = data.data.costRecord.costUsd;
      setTotalSimulatedCost(prev => Math.round((prev + costUsd) * 10000) / 10000);
      setSimulateCount(prev => prev + 1);
      setCostFlash(true);
    } catch {
      setSimulateError('Falha na conexão com o servidor');
    } finally {
      setSimulating(false);
    }
  };

  // ── Simulate 3 Quick Messages (Bundling) ─────────────────────────────
  const handleBundlingDemo = async () => {
    if (bundlingActive) return;
    setBundlingActive(true);
    setBundleComplete(false);
    setBundleMsgs([
      { id: 1, merged: false },
      { id: 2, merged: false },
      { id: 3, merged: false },
    ]);

    // Simulate sending 3 messages with a countdown
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setBundleCountdown(3 - i);
      try {
        await fetch('/api/zcc/whatsapp/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: MOCK_TENANT_ID,
            direction: 'outbound',
            intent: `bundle_msg_${i + 1}`,
          }),
        });
      } catch {
        // Continue even if one fails
      }
    }

    // Merge animation
    await new Promise(resolve => setTimeout(resolve, 300));
    setBundleMsgs([
      { id: 1, merged: true },
      { id: 2, merged: true },
      { id: 3, merged: true },
    ]);

    // Complete
    await new Promise(resolve => setTimeout(resolve, 600));
    // 3 msgs → 1 tariff: savings = US$0.0068 × 2 = US$0.0136
    setTotalSimulatedCost(prev => Math.round((prev + 0.0068) * 10000) / 10000);
    setSimulateCount(prev => prev + 3);
    setCostFlash(true);
    setBundleComplete(true);

    // Reset after display
    setTimeout(() => {
      setBundlingActive(false);
      setBundleCountdown(3);
      setBundleMsgs([]);
      setBundleComplete(false);
    }, 4000);
  };

  // ── Simulate One-Shot ────────────────────────────────────────────────
  const handleOneShot = async () => {
    setOneShotSimulating(true);
    setOneShotError(null);
    setOneShotActive(false);
    try {
      const res = await fetch('/api/zcc/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: MOCK_TENANT_ID,
          direction: 'outbound',
          intent: 'complete_answer',
          oneShot: true,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setOneShotError(data.error || 'Erro na simulação one-shot');
        return;
      }
      setOneShotActive(true);
      const costUsd = data.data.costRecord.costUsd;
      setTotalSimulatedCost(prev => Math.round((prev + costUsd) * 10000) / 10000);
      setSimulateCount(prev => prev + 1);
      setCostFlash(true);
      // Auto-dismiss after 6 seconds
      setTimeout(() => setOneShotActive(false), 6000);
    } catch {
      setOneShotError('Falha na conexão com o servidor');
    } finally {
      setOneShotSimulating(false);
    }
  };

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

      {/* ═══════════════════════════════════════════════════════════════════
          TAXÍMETRO DE CUSTOS — Meta 2026 Tariff
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="zcc-panel p-5" style={{ borderColor: 'rgba(212,168,67,0.3)', borderWidth: 1 }}>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4" style={{ color: '#d4a843' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Taxímetro de Custos — Tarifa Meta 2026</h3>
          <span className="zcc-badge-gold">PREVIEW</span>
        </div>

        {/* Tariff Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)' }}>
            <div className="zcc-eyebrow">TARIFA META 2026</div>
            <div className="text-lg font-bold font-mono" style={{ color: '#d4a843' }}>US$0,0068/msg</div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--zcc-text-muted)' }}>≈ R$0,035/msg</div>
          </div>
          <div className="p-3 rounded" style={{ background: 'rgba(74,154,154,0.06)', border: '1px solid rgba(74,154,154,0.12)' }}>
            <div className="zcc-eyebrow">VIGÊNCIA</div>
            <div className="text-lg font-bold font-mono" style={{ color: 'var(--zcc-patina)' }}>1º out 2026</div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--zcc-text-muted)' }}>Tarifa confirmada pelo Meta</div>
          </div>
          <div className="p-3 rounded" style={{
            background: costFlash ? 'rgba(212,168,67,0.15)' : 'rgba(16,185,129,0.06)',
            border: costFlash ? '1px solid rgba(212,168,67,0.35)' : '1px solid rgba(16,185,129,0.12)',
            transition: 'all 0.3s ease',
          }}>
            <div className="zcc-eyebrow">CUSTO SIMULADO ACUMULADO</div>
            <motion.div
              key={totalSimulatedCost}
              initial={costFlash ? { scale: 1.15, textShadow: '0 0 12px rgba(212,168,67,0.5)' } : {}}
              animate={{ scale: 1, textShadow: 'none' }}
              transition={{ duration: 0.4 }}
              className="text-lg font-bold font-mono"
              style={{ color: costFlash ? '#d4a843' : '#4ade80' }}
            >
              US${totalSimulatedCost.toFixed(4)}
            </motion.div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--zcc-text-muted)' }}>
              {simulateCount} mensagens simuladas
            </div>
          </div>
        </div>

        {/* Simulate Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="zcc-btn-gold flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold"
            style={{ opacity: simulating ? 0.7 : 1 }}
          >
            {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
            Simular Mensagem
          </button>
          <span className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
            POST /api/zcc/whatsapp/simulate — direction: outbound
          </span>
        </div>

        {/* Simulate Error */}
        {simulateError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 p-2.5 rounded flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
            <span className="text-xs font-mono" style={{ color: '#f87171' }}>{simulateError}</span>
          </motion.div>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          MESSAGE BUNDLING DEMO
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="zcc-panel p-5" style={{ borderColor: 'rgba(74,154,154,0.25)', borderWidth: 1 }}>
        <div className="flex items-center gap-2 mb-4">
          <Merge className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Message Bundling — Demo</h3>
          <span className="zcc-badge-patina">3s BUFFER</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bundling Visualization */}
          <div className="p-3 rounded-lg" style={{ background: 'var(--zcc-lacquer-sunken)', border: '1px solid rgba(74,154,154,0.1)' }}>
            <div className="text-[10px] font-mono mb-3" style={{ color: 'var(--zcc-text-muted)' }}>
              Visualização de Bundling (3 mensagens → 1 tarifa Meta)
            </div>

            {/* Messages Visual */}
            <div className="flex items-center gap-3 mb-3">
              {/* 3 separate messages */}
              <div className="flex flex-col gap-1.5">
                {bundleMsgs.length > 0 ? bundleMsgs.map((msg) => (
                  <motion.div key={msg.id}
                    initial={{ opacity: 1, x: 0 }}
                    animate={msg.merged ? { opacity: 0.3, scale: 0.9 } : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="px-3 py-1.5 rounded text-[10px] font-mono"
                    style={{
                      background: 'rgba(74,154,154,0.1)',
                      border: '1px solid rgba(74,154,154,0.2)',
                      color: 'var(--zcc-patina)',
                    }}
                  >
                    MSG #{msg.id}
                  </motion.div>
                )) : (
                  <>
                    <div className="px-3 py-1.5 rounded text-[10px] font-mono"
                      style={{ background: 'rgba(74,154,154,0.1)', border: '1px solid rgba(74,154,154,0.2)', color: 'var(--zcc-patina)', opacity: 0.4 }}>
                      MSG #1
                    </div>
                    <div className="px-3 py-1.5 rounded text-[10px] font-mono"
                      style={{ background: 'rgba(74,154,154,0.1)', border: '1px solid rgba(74,154,154,0.2)', color: 'var(--zcc-patina)', opacity: 0.4 }}>
                      MSG #2
                    </div>
                    <div className="px-3 py-1.5 rounded text-[10px] font-mono"
                      style={{ background: 'rgba(74,154,154,0.1)', border: '1px solid rgba(74,154,154,0.2)', color: 'var(--zcc-patina)', opacity: 0.4 }}>
                      MSG #3
                    </div>
                  </>
                )}
              </div>

              {/* Arrow */}
              <motion.div animate={bundlingActive ? { x: [0, 4, 0] } : {}} transition={{ duration: 0.6, repeat: bundlingActive ? Infinity : 0 }}>
                <ChevronRight className="w-5 h-5" style={{ color: 'var(--zcc-text-muted)' }} />
              </motion.div>

              {/* Merged message */}
              <motion.div
                animate={bundleComplete ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5 }}
                className="px-4 py-3 rounded text-xs font-mono font-bold"
                style={{
                  background: bundleComplete ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.04)',
                  border: bundleComplete ? '1px solid rgba(16,185,129,0.3)' : '1px dashed rgba(16,185,129,0.2)',
                  color: bundleComplete ? '#4ade80' : 'var(--zcc-text-muted)',
                }}
              >
                {bundleComplete ? '✓ 1 TARIFA' : '1 TARIFA'}
              </motion.div>
            </div>

            {/* Countdown */}
            {bundlingActive && (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" style={{ color: '#d4a843' }} />
                <span className="text-[10px] font-mono" style={{ color: '#d4a843' }}>
                  Buffer: {bundleCountdown}s
                </span>
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(212,168,67,0.15)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: '#d4a843' }}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }} />
                </div>
              </div>
            )}

            {bundleComplete && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-2 p-2 rounded flex items-center gap-2"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <CheckCircle2 className="w-3 h-3" style={{ color: '#4ade80' }} />
                <span className="text-[10px] font-mono" style={{ color: '#4ade80' }}>
                  3 mensagens → 1 tarifa Meta (economia: US$0,0136)
                </span>
              </motion.div>
            )}
          </div>

          {/* Bundling Info + Button */}
          <div className="space-y-3">
            <div className="p-3 rounded" style={{ background: 'rgba(74,154,154,0.06)', border: '1px solid rgba(74,154,154,0.12)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--zcc-champagne)' }}>Como funciona?</div>
              <div className="text-[10px] font-mono space-y-1" style={{ color: 'var(--zcc-text-secondary)' }}>
                <div>1. Chegam 3 mensagens do hóspede em sequência</div>
                <div>2. Zélla aguarda 3 segundos (buffer window)</div>
                <div>3. Combina as 3 em 1 resposta única</div>
                <div>4. Envia 1 outbound → paga 1 tarifa Meta</div>
              </div>
            </div>
            <div className="p-3 rounded" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: '#d4a843' }}>Economia</div>
              <div className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-secondary)' }}>
                3 msgs separadas = US$0,0204 (3 × US$0,0068)<br />
                1 msg bundled = US$0,0068<br />
                <span style={{ color: '#4ade80' }}>Economia: US$0,0136 (66%)</span>
              </div>
            </div>
            <button
              onClick={handleBundlingDemo}
              disabled={bundlingActive}
              className="zcc-btn flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold"
              style={{
                background: 'rgba(74,154,154,0.12)',
                color: 'var(--zcc-patina)',
                border: '1px solid rgba(74,154,154,0.25)',
                opacity: bundlingActive ? 0.6 : 1,
              }}
            >
              {bundlingActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Merge className="w-3.5 h-3.5" />}
              Enviar 3 msgs rápidas
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          ONE-SHOT RESOLUTION BADGE
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="zcc-panel p-5" style={{ borderColor: 'rgba(16,185,129,0.25)', borderWidth: 1 }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: '#4ade80' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>One-Shot Resolution</h3>
          <span className="zcc-badge-success">EFICIÊNCIA</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={handleOneShot}
            disabled={oneShotSimulating}
            className="zcc-btn flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold"
            style={{
              background: 'rgba(16,185,129,0.12)',
              color: '#4ade80',
              border: '1px solid rgba(16,185,129,0.25)',
              opacity: oneShotSimulating ? 0.7 : 1,
            }}
          >
            {oneShotSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Simular One-Shot
          </button>

          <span className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
            POST /api/zcc/whatsapp/simulate — oneShot: true, intent: complete_answer
          </span>
        </div>

        {/* One-Shot Badge */}
        <AnimatePresence>
          {oneShotActive && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="mt-4 p-4 rounded-lg"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.25)' }}>
              <div className="flex items-center gap-3">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6, delay: 0.2 }}>
                  <CheckCircle2 className="w-6 h-6" style={{ color: '#4ade80' }} />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono" style={{ color: '#4ade80' }}>One-Shot ✓</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#4ade80', border: '1px solid rgba(16,185,129,0.3)' }}>
                      66% ECONOMIA
                    </span>
                  </div>
                  <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--zcc-text-secondary)' }}>
                    Resposta completa em 1 mensagem. Economia: 66% vs 3 mensagens separadas.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {oneShotError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 p-2.5 rounded flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
            <span className="text-xs font-mono" style={{ color: '#f87171' }}>{oneShotError}</span>
          </motion.div>
        )}

        {/* One-Shot Explanation */}
        <div className="mt-3 p-3 rounded" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.08)' }}>
          <div className="text-[10px] font-mono space-y-1" style={{ color: 'var(--zcc-text-secondary)' }}>
            <div><span style={{ color: '#4ade80' }}>One-Shot</span> = o Cérebro Zélla responde tudo em 1 mensagem outbound.</div>
            <div>Em vez de 3 mensagens (R$0,035/msg × 3 = R$0,105), gasta R$0,035.</div>
            <div><span style={{ color: '#4ade80' }}>Economia real: 66%</span> por conversa completa.</div>
          </div>
        </div>
      </motion.div>

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
