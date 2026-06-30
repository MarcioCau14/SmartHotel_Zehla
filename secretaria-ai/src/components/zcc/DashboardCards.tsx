'use client';

import { motion } from 'framer-motion';
import { Users, CheckCircle, Send, Megaphone, TrendingUp, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { DashboardStats } from '@/lib/leads-types';

interface DashboardCardsProps {
  stats?: DashboardStats;
}

const cards = [
  {
    key: 'totalLeads' as const,
    label: 'Total de Leads',
    icon: Users,
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
    format: (v: number) => v.toString(),
  },
  {
    key: 'verifiedLeads' as const,
    label: 'Leads Verificados',
    icon: CheckCircle,
    gradient: 'from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-400',
    format: (v: number) => v.toString(),
  },
  {
    key: 'messagesSent' as const,
    label: 'Mensagens Enviadas',
    icon: Send,
    gradient: 'from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-400',
    format: (v: number) => v.toLocaleString('pt-BR'),
  },
  {
    key: 'activeCampaigns' as const,
    label: 'Campanhas Ativas',
    icon: Megaphone,
    gradient: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-400',
    format: (v: number) => v.toString(),
  },
  {
    key: 'conversionRate' as const,
    label: 'Taxa de Conversão',
    icon: TrendingUp,
    gradient: 'from-rose-500/20 to-rose-600/10',
    iconColor: 'text-rose-400',
    format: (v: string) => `${v}%`,
  },
  {
    key: 'monthlyAICost' as const,
    label: 'Custo IA Mensal',
    icon: DollarSign,
    gradient: 'from-teal-500/20 to-teal-600/10',
    iconColor: 'text-teal-400',
    format: (v: number) => `$${v.toFixed(2)}`,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
} as const;

export function DashboardCards({ stats }: DashboardCardsProps) {
  const { data: apiStats } = useQuery<DashboardStats>({
    queryKey: ['zcc', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/zcc/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    staleTime: 30_000,
  });
  const data = stats ?? apiStats ?? {
    totalLeads: 0, verifiedLeads: 0, messagesSent: 0,
    activeCampaigns: 0, conversionRate: '0.0', monthlyAICost: 0,
  };

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const value = data[card.key];

        return (
          <motion.div
            key={card.key}
            variants={cardVariants}
            className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 flex flex-col items-center text-center gap-3 hover:bg-white/8 transition-colors group cursor-default"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold text-white tracking-tight">
                {card.format(value as string & number)}
              </span>
              <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium">
                {card.label}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}