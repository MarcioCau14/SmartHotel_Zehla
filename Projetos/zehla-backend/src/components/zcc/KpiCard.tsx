'use client'

import { cn } from '@/lib/utils'

export interface KpiCardProps {
  titulo: string
  valor: string
  trend?: string
  trendPositiva?: boolean
  icone: string
}

export function KpiCard({ titulo, valor, trend, trendPositiva = true, icone }: KpiCardProps) {
  return (
    <div className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between min-w-[160px] transition-all hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">
          {titulo}
        </span>
        <span className="text-sm">{icone}</span>
      </div>

      <div className="flex items-end justify-between mt-2">
        <span className="text-xl font-bold font-mono text-slate-100">
          {valor}
        </span>

        {trend && (
          <span
            className={cn(
              'text-[10px] font-bold font-mono px-1.5 py-0.5 rounded',
              trendPositiva
                ? 'text-emerald-400 bg-emerald-950/40'
                : 'text-red-400 bg-red-950/40',
            )}
          >
            {trendPositiva ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
    </div>
  )
}
