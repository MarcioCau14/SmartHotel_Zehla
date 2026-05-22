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

const accentStyles: Record<string, { bg: string; icon: string; text: string; border: string; glow: string }> = {
  orange: {
    bg: 'bg-[#FF5500]/10',
    icon: 'text-[#FF5500]',
    text: 'text-[#FF5500]',
    border: 'border-[#FF5500]/20',
    glow: 'shadow-[0_0_15px_rgba(255,85,0,0.04)] hover:border-[#FF5500]/35 hover:shadow-[0_0_20px_rgba(255,85,0,0.08)]',
  },
  emerald: {
    bg: 'bg-[#00FF88]/10',
    icon: 'text-[#00FF88]',
    text: 'text-[#00FF88]',
    border: 'border-[#00FF88]/20',
    glow: 'shadow-[0_0_15px_rgba(0,255,136,0.04)] hover:border-[#00FF88]/35 hover:shadow-[0_0_20px_rgba(0,255,136,0.08)]',
  },
  rose: {
    bg: 'bg-[#FF3366]/10',
    icon: 'text-[#FF3366]',
    text: 'text-[#FF3366]',
    border: 'border-[#FF3366]/20',
    glow: 'shadow-[0_0_15px_rgba(255,51,102,0.04)] hover:border-[#FF3366]/35 hover:shadow-[0_0_20px_rgba(255,51,102,0.08)]',
  },
  blue: {
    bg: 'bg-[#00CCFF]/10',
    icon: 'text-[#00CCFF]',
    text: 'text-[#00CCFF]',
    border: 'border-[#00CCFF]/20',
    glow: 'shadow-[0_0_15px_rgba(0,204,255,0.04)] hover:border-[#00CCFF]/35 hover:shadow-[0_0_20px_rgba(0,204,255,0.08)]',
  },
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
      <div className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
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
        'bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 group',
        style.glow,
        'hover:bg-white/[0.02] hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-300', style.bg)}>
          <Icon className={cn('w-5 h-5 transition-colors duration-300', style.icon)} />
        </div>
        {change && (
          <span className={cn(
            'text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide shadow-sm',
            changeDirection === 'up' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          )}>
            {changeDirection === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white mb-0.5 tracking-tight">{value}</p>
      <p className="text-xs text-neutral-500 transition-colors group-hover:text-neutral-400">{label}</p>
    </motion.div>
  );
}

