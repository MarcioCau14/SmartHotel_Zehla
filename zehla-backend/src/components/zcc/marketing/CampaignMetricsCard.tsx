'use client'

import React, { useEffect, useState } from 'react'
import type { CampaignStats } from '../../../app/api/marketing/campaigns/stats/route'

interface CampaignMetricsCardProps {
  className?: string
}

export function CampaignMetricsCard({ className = '' }: CampaignMetricsCardProps) {
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/marketing/campaigns/stats')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg ${className}`}>
        <div className="text-slate-500 font-mono text-xs animate-pulse">Carregando campanhas...</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg ${className}`}>
        <p className="text-red-400 font-mono text-xs">Erro ao carregar: {error}</p>
      </div>
    )
  }

  const totalSent = stats.sentCount || 0
  const totalDelivered = stats.deliveredCount || 0
  const totalFailed = stats.failedCount || 0
  const totalOptedOut = stats.optedOutCount || 0
  const totalRead = stats.readCount || 0
  const totalReplied = stats.repliedCount || 0

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 ${className}`}>
      <h2 className="text-md font-bold tracking-wide font-display text-slate-100 flex items-center gap-2">
        <span>📊</span> Campanhas ZCC
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Enviadas" value={totalSent} color="text-blue-400" />
        <MetricCard label="Entregues" value={totalDelivered} color="text-emerald-400" />
        <MetricCard label="Lidas" value={totalRead} color="text-violet-400" />
        <MetricCard label="Respondidas" value={totalReplied} color="text-amber-400" />
        <MetricCard label="Falhas" value={totalFailed} color="text-red-400" />
        <MetricCard label="Opt-Out" value={totalOptedOut} color="text-orange-400" />
        <MetricCard label="Campanhas" value={stats.total} color="text-slate-300" />
        <MetricCard label="Ativas" value={stats.active} color="text-green-400" />
      </div>

      {stats.campaigns.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 mb-2">ÚLTIMAS CAMPANHAS</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {stats.campaigns.slice(0, 10).map(c => (
              <div key={c.id} className="flex items-center justify-between text-xs font-mono px-2 py-1 rounded bg-slate-950/50">
                <span className="text-slate-300 truncate max-w-[160px]">{c.name}</span>
                <div className="flex gap-2 text-slate-500">
                  <span className="text-blue-400">{c.sentCount}</span>
                  <span className="text-emerald-400">{c.deliveredCount}</span>
                  <span className="text-red-400">{c.failedCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
      <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">{label}</span>
      <span className={`text-lg font-bold font-mono mt-0.5 ${color}`}>
        {value.toLocaleString('pt-BR')}
      </span>
    </div>
  )
}
