'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TrialBannerProps {
  daysLeft: number;
}

export function TrialBanner({ daysLeft }: TrialBannerProps) {
  if (daysLeft <= 0) return null;

  const isWarning = daysLeft <= 3;
  const isUrgent = daysLeft <= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        isUrgent
          ? 'bg-red-500/15 border-b border-red-500/30'
          : isWarning
          ? 'bg-orange-500/10 border-b border-orange-500/20'
          : 'bg-neutral-900 border-b border-white/5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isWarning ? (
            <AlertTriangle className={cn('w-4 h-4 shrink-0', isUrgent ? 'text-red-400' : 'text-orange-400')} />
          ) : (
            <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
          )}
          <p className={cn(
            'text-xs font-medium',
            isUrgent ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-neutral-500'
          )}>
            {daysLeft === 1
              ? '⚠️ Seu período de teste termina amanhã!'
              : daysLeft <= 3
              ? `⚠️ Seu teste termina em ${daysLeft} dias.`
              : `🔍 Período de teste — ${daysLeft} dias restantes`
            }
          </p>
        </div>
        <Link
          href="/dashboard/upgrade"
          className={cn(
            'flex items-center gap-1.5 text-xs font-bold transition-all',
            isUrgent ? 'text-red-400 hover:text-red-300' : 'text-orange-400 hover:text-orange-300'
          )}
        >
          {isWarning ? 'Fazer Upgrade' : 'Ver Planos'}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}
