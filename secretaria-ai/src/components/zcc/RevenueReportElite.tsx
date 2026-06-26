'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Building2,
  User,
  Mail,
  Phone,
  BarChart3,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Lead } from '@/lib/types';

interface RevenueReportEliteProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function CircularGauge({ value, max = 100, size = 100, strokeWidth = 6 }: { value: number; max?: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  const color =
    value >= 80 ? '#10b981' :
    value >= 60 ? '#f59e0b' :
    '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
           transition={{ duration: 1.2, ease: 'easeOut' as const }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white" style={{ color }}>{value}</span>
        <span className="text-[9px] text-white/40 uppercase tracking-widest">IDP Score</span>
      </div>
    </div>
  );
}

function PriceGapIndicator({ gapPercent }: { gapPercent: number }) {
  let level: 'CRITICAL' | 'WARNING' | 'OPTIMAL';
  let label: string;
  let color: string;
  let bgColor: string;
  let Icon: typeof TrendingUp;

  if (gapPercent >= 40) {
    level = 'CRITICAL';
    label = 'Gap Crítico';
    color = 'text-red-400';
    bgColor = 'bg-red-500/10 border-red-500/20';
    Icon = AlertTriangle;
  } else if (gapPercent >= 25) {
    level = 'WARNING';
    label = 'Gap Moderado';
    color = 'text-amber-400';
    bgColor = 'bg-amber-500/10 border-amber-500/20';
    Icon = TrendingDown;
  } else {
    level = 'OPTIMAL';
    label = 'Gap Otimizado';
    color = 'text-emerald-400';
    bgColor = 'bg-emerald-500/10 border-emerald-500/20';
    Icon = TrendingUp;
  }

  return (
    <div className={`border rounded-lg p-3 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{label}</span>
      </div>
      <div className={`text-3xl font-bold ${color}`}>+{gapPercent}%</div>
      <div className="text-[10px] text-white/30 mt-0.5">Potencial de aumento de receita</div>
    </div>
  );
}

function RevenueComparison({ current, potential }: { current: number; potential: number }) {
  const diff = potential - current;
  const pct = ((diff / current) * 100).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Comparativo de Receita</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">Receita Atual</div>
          <div className="text-lg font-bold text-white/70">{formatCurrency(current)}</div>
          <div className="text-[10px] text-white/25">/ano</div>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
          <div className="text-[10px] text-emerald-400/60 mb-1">Receita Potencial</div>
          <div className="text-lg font-bold text-emerald-400">{formatCurrency(potential)}</div>
          <div className="text-[10px] text-emerald-400/40">/ano</div>
        </div>
      </div>
      <div className="bg-white/[0.03] rounded-lg p-3 flex items-center justify-between">
        <span className="text-xs text-white/50">Oportunidade</span>
        <span className="text-sm font-bold text-emerald-400">+{formatCurrency(diff)} ({pct}%)</span>
      </div>
    </div>
  );
}

export function RevenueReportElite({ lead, open, onClose }: RevenueReportEliteProps) {
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const handleCopy = async () => {
    if (lead.whatsappScript) {
      await navigator.clipboard.writeText(lead.whatsappScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto zehla-scroll-modal p-0">
        <div className="relative">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative p-6">
            {/* Header */}
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <DialogTitle className="text-white/90 text-lg">{lead.empresa}</DialogTitle>
                  </div>
                  <p className="text-xs text-white/40">
                    Diagnóstico de Receita · IDP Elite
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/30 hover:text-white/60 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </DialogHeader>

            {/* Contact info bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <User className="w-3.5 h-3.5" />
                <span>{lead.decisor}</span>
                <span className="text-white/25">·</span>
                <span className="text-white/35">{lead.cargo}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Mail className="w-3.5 h-3.5" />
                <span className="font-mono">{lead.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Phone className="w-3.5 h-3.5" />
                <span className="font-mono">{lead.whatsapp}</span>
              </div>
            </div>

            {/* Top metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* IDP Score */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col items-center">
                <CircularGauge value={lead.idpScore ?? 0} />
                <div className="mt-2 text-center">
                  <div className="text-[10px] text-white/30">Índice de Potencial Digital</div>
                </div>
              </div>

              {/* Price Gap */}
              <div className="flex flex-col gap-4">
                <PriceGapIndicator gapPercent={lead.gapPercent ?? 0} />
                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">Diária Média</span>
                    <span className="text-sm font-bold text-white/80">R$ {lead.diariaMedia}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-white/30">Ocupação Média</span>
                    <span className="text-sm font-bold text-white/80">{lead.ocupacaoMedia}%</span>
                  </div>
                </div>
              </div>

              {/* Revenue comparison */}
              <RevenueComparison
                current={lead.receitaAtual ?? 0}
                potential={lead.receitaPotencial ?? 0}
              />
            </div>

            {/* Audit Report */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-white/40" />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Relatório de Auditoria</span>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  {lead.auditText}
                </p>
              </div>
            </div>

            {/* WhatsApp Script */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Script WhatsApp</span>
              </div>
              <div className="bg-[#0d1117] border border-white/5 rounded-lg p-4 relative group">
                <pre
                  className="text-sm text-emerald-400/80 whitespace-pre-wrap leading-relaxed font-[var(--font-geist-mono)]"
                  style={{ fontFamily: 'var(--font-geist-mono), "Fira Code", monospace' }}
                >
                  {lead.whatsappScript}
                </pre>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-7 px-2 text-white/30 hover:text-white/60 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}