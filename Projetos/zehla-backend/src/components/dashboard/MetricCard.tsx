'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color?: string;
  accent?: 'orange' | 'emerald' | 'rose' | 'blue';
  change?: string;
  changeDirection?: 'up' | 'down';
  loading?: boolean;
  delay?: number;
}

const accentStyles: Record<string, { bg: string; icon: string; text: string; border: string }> = {
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', text: 'text-orange-400', border: 'border-orange-500/20' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  rose: { bg: 'bg-rose-500/10', icon: 'text-rose-400', text: 'text-rose-400', border: 'border-rose-500/20' },
  blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', text: 'text-blue-400', border: 'border-blue-500/20' },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  accent = 'orange',
  change,
  changeDirection = 'up',
  loading = false,
  delay = 0,
}: MetricCardProps) {
  const style = accentStyles[accent];

  if (loading) {
    return (
      <div className="glass-strong border border-white/5 rounded-2xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white/5" />
          <div className="h-4 w-20 bg-white/5 rounded" />
          <div className="h-8 w-16 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'glass-strong border border-white/5 rounded-2xl p-5',
        'hover:bg-white/[0.03] transition-all group'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', style.bg)}>
          <Icon className={cn('w-5 h-5', style.icon)} />
        </div>
        {change && (
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full',
            changeDirection === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          )}>
            {changeDirection === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white mb-0.5 tracking-tight">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </motion.div>
  );
}
