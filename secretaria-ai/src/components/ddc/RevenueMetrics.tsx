'use client';

import { motion } from 'framer-motion';
import { DollarSign, Calendar, MessageSquare, TrendingUp, Sparkles, ArrowUpRight, Zap } from 'lucide-react';
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
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut' as const
      }
    })
  } as const;

  const mainCards = [
    {
      id: 'today-revenue',
      title: 'Receita Hoje (IA)',
      value: metrics.today.generated,
      change: `+${metrics.today.reservations} reservas`,
      icon: DollarSign,
      color: 'from-emerald-500 to-cyan-500',
      textColor: 'text-emerald-400',
      badge: '🤖 100% IA',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      trend: '+24.5% vs ontem',
      trendPositive: true
    },
    {
      id: 'ai-attended',
      title: 'Atendimentos IA Hoje',
      value: metrics.today.aiAttended,
      change: `${metrics.today.conversionRate}% conversão`,
      icon: MessageSquare,
      color: 'from-blue-500 to-purple-500',
      textColor: 'text-blue-400',
      badge: '🚀 Recorde',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      trend: '+18.2% vs semana passada',
      trendPositive: true
    },
    {
      id: 'week-revenue',
      title: 'Receita Semanal',
      value: metrics.week.generated,
      change: `${metrics.week.reservations} reservas`,
      icon: Calendar,
      color: 'from-violet-500 to-pink-500',
      textColor: 'text-violet-400',
      badge: `+${metrics.week.growth}%`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      trend: '+12.3% vs semana anterior',
      trendPositive: true
    },
    {
      id: 'month-projection',
      title: 'Projeção Mensal',
      value: metrics.month.projected,
      change: `${metrics.month.reservations} reservas`,
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
      badge: '🎯 Meta',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      trend: '+24.2% vs mês anterior',
      trendPositive: true
    }
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Receita em Tempo Real</h2>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
              IA Autônoma • Fechando vendas 24/7
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">Ao Vivo</span>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {mainCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              custom={index}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <Card className="bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 overflow-hidden relative group">
                <CardContent className="p-4">
                  {/* Subtle color glow on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      {card.badge && (
                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${card.badgeColor}`}>
                          {card.badge}
                        </div>
                      )}
                    </div>

                    {/* Value */}
                    <div className="mb-2">
                      <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                        {card.id === 'ai-attended' ? card.value : formatCurrency(card.value)}
                      </div>
                      <div className={`text-[10px] ${card.textColor} font-medium mt-0.5`}>
                        {card.change}
                      </div>
                    </div>

                    {/* Trend */}
                    <div className="flex items-center gap-1.5">
                      {card.trendPositive ? (
                        <ArrowUpRight className={`w-3 h-3 ${card.textColor}`} />
                      ) : (
                        <ArrowUpRight className={`w-3 h-3 ${card.textColor} rotate-180`} />
                      )}
                      <span className="text-[9px] text-white/50 font-medium">
                        {card.trend}
                      </span>
                    </div>

                    {/* Bottom Progress Bar */}
                    <div className="mt-3 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${card.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${((card.id.length * 11 + 7) % 30) + 70}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3"
        >
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
            Taxa de Resposta IA
          </div>
          <div className="text-lg font-bold text-white">2.3s</div>
          <div className="text-[9px] text-emerald-400"> média</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3"
        >
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
            Satisfação Hóspedes
          </div>
          <div className="text-lg font-bold text-white">4.7/5</div>
          <div className="text-[9px] text-emerald-400"> ★★★★★</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3"
        >
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
            Taxa de Ocupação
          </div>
          <div className="text-lg font-bold text-white">87%</div>
          <div className="text-[9px] text-emerald-400"> +5% esta semana</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3"
        >
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
            Autonomia IA
          </div>
          <div className="text-lg font-bold text-white">94%</div>
          <div className="text-[9px] text-purple-400"> sem intervenção</div>
        </motion.div>
      </div>
    </div>
  );
}