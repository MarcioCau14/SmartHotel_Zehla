'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="glass-card p-5 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24 bg-[rgba(255,255,255,0.06)]" />
            <Skeleton className="h-8 w-8 rounded-xl bg-[rgba(255,255,255,0.06)]" />
          </div>
          <Skeleton className="h-10 w-28 mb-2 bg-[rgba(255,255,255,0.06)]" />
          <Skeleton className="h-3 w-36 bg-[rgba(255,255,255,0.04)]" />
        </div>
      ))}
    </div>
  );
}

export function LeadsTableSkeleton() {
  return (
    <div className="glass-card p-5 lg:p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-8 w-8 rounded-xl bg-[rgba(255,255,255,0.06)]" />
        <div>
          <Skeleton className="h-5 w-36 mb-1 bg-[rgba(255,255,255,0.06)]" />
          <Skeleton className="h-3 w-28 bg-[rgba(255,255,255,0.04)]" />
        </div>
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"
          >
            <Skeleton className="h-4 w-4 rounded bg-[rgba(255,255,255,0.06)] shrink-0" />
            <Skeleton className="h-4 w-32 bg-[rgba(255,255,255,0.06)] shrink-0" />
            <Skeleton className="h-4 w-20 bg-[rgba(255,255,255,0.06)] shrink-0" />
            <Skeleton className="h-4 w-40 bg-[rgba(255,255,255,0.04)] flex-1" />
            <Skeleton className="h-5 w-16 rounded-md bg-[rgba(255,255,255,0.06)] shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function TargetsPanelSkeleton() {
  return (
    <div className="glass-card p-5 lg:p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-8 w-8 rounded-xl bg-[rgba(255,255,255,0.06)]" />
        <div>
          <Skeleton className="h-5 w-36 mb-1 bg-[rgba(255,255,255,0.06)]" />
          <Skeleton className="h-3 w-28 bg-[rgba(255,255,255,0.04)]" />
        </div>
      </div>
      <div className="space-y-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"
          >
            <Skeleton className="h-2 w-2 rounded-full bg-[rgba(255,255,255,0.08)] shrink-0" />
            <Skeleton className="h-4 w-24 bg-[rgba(255,255,255,0.06)] shrink-0" />
            <Skeleton className="h-3 w-32 bg-[rgba(255,255,255,0.04)] flex-1" />
            <Skeleton className="h-4 w-14 rounded-md bg-[rgba(255,255,255,0.06)] shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
