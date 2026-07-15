'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { fadeIn } from '@/lib/animation-variants';

export interface StatusBarProps {
  systemLabel: string;
  stats?: string[];
  statusMessage?: string;
  variant?: 'ddc' | 'dashboard';
}

export function StatusBar({
  systemLabel,
  stats,
  statusMessage = 'Todos os sistemas operacionais',
  variant = 'dashboard',
}: StatusBarProps) {
  const isDDC = variant === 'ddc';
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={`rounded-xl p-3 ${
        isDDC
          ? 'bg-white/[0.02] border border-white/[0.06] mt-6'
          : 'bg-zinc-900/30 border border-zinc-900'
      }`}
    >
      <div className={`flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono ${isDDC ? 'text-white/40' : 'text-zinc-500'}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>{systemLabel}</span>
          </div>
          {stats?.map((stat, i) => (
            <div key={i} className="contents">
              <div className={`h-3 w-px ${isDDC ? 'bg-white/[0.06]' : 'bg-zinc-800'}`} />
              <span>{stat}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          {!isDDC && <TrendingUp className="w-3 h-3" />}
          {isDDC && <span className="text-[9px]">✓ </span>}
          <span>{statusMessage}</span>
        </div>
      </div>
    </motion.div>
  );
}
