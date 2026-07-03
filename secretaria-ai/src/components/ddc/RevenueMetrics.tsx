'use client';

import { motion } from 'framer-motion';
import { DollarSign, Calendar, MessageSquare, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/ddc/ddc-utils';

interface RevenueMetricsProps {
  metrics: {
    today: {
      generated: number;
      reservations: number;
      aiAttended: number;
      conversionRate: number;
    };
    week: {
      generated: number;
      reservations: number;
      growth: number;
    };
    month: {
      generated: number;
      reservations: number;
      growth: number;
      projected: number;
    };
  };
  isLoading?: boolean;
}

export function RevenueMetrics({ metrics }: RevenueMetricsProps) {
  const mainCards = [
    {
      id: 'today-revenue',
      title: 'Receita Hoje (IA)',
      value: metrics.today.generated,
      change: `${metrics.today.reservations} reservas via Pix`,
      icon: DollarSign,
      trend: '+24.5% vs ontem',
      badge: '100% IA',
      trendPositive: true
    },
    {
      id: 'ai-attended',
      title: 'Atendimentos IA Hoje',
      value: metrics.today.aiAttended,
      change: `Conversão de ${metrics.today.conversionRate}%`,
      icon: MessageSquare,
      trend: '+18.2% vs ontem',
      badge: 'Eficiente',
      trendPositive: true
    },
    {
      id: 'week-revenue',
      title: 'Receita Semanal',
      value: metrics.week.generated,
      change: `${metrics.week.reservations} reservas concluídas`,
      icon: Calendar,
      trend: `+${metrics.week.growth}% vs anterior`,
      badge: 'Semanal',
      trendPositive: true
    },
    {
      id: 'month-projection',
      title: 'Projeção Mensal',
      value: metrics.month.projected,
      change: `Meta de ${metrics.month.reservations} reservas`,
      icon: TrendingUp,
      trend: '+24.2% vs projetado',
      badge: 'Meta',
      trendPositive: true
    }
  ];

  return (
    <div className="space-y-4">
      {/* Grid de Métricas Principais - Versão Altamente Contida e Elegante */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {mainCards.map((card, index) => {
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className="bg-[#121216] border border-white/[0.04] rounded-xl overflow-hidden hover:border-zinc-800 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      {card.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold border border-white/[0.06] bg-white/[0.02] text-zinc-400">
                      {card.badge}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-white tracking-tight font-sans">
                      {card.id === 'ai-attended' ? card.value : formatCurrency(card.value)}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 mt-1 truncate">
                    {card.change}
                  </p>

                  <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-white/[0.03]">
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-[9px] text-emerald-400 font-semibold font-mono">
                      {card.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Métricas Secundárias em Linha Sutil */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Taxa de Resposta IA', value: '2.3s', sub: 'Média geral' },
          { label: 'Satisfação Hóspedes', value: '4.9/5', sub: '98.5% positivas' },
          { label: 'Taxa de Ocupação', value: '87%', sub: '+5% esta semana' },
          { label: 'Autonomia IA', value: '94%', sub: 'Sem intervenção' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="bg-[#121216]/50 border border-white/[0.03] rounded-lg p-2.5"
          >
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              {stat.label}
            </div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">{stat.value}</div>
            <div className="text-[8px] text-zinc-500 mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}