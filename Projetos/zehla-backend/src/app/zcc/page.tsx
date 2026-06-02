'use client'

import React, { useEffect } from 'react'
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics'
import { KpiCard } from '../../components/zcc/KpiCard'

export default function ZCCDashboardPage() {
  const { metrics, isLoading, error, refresh } = useDashboardMetrics()

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Métricas consolidadas do Zehla Control Center
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg border border-slate-700 transition-colors"
        >
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </header>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg">
          <p className="text-xs font-mono text-red-400">{error}</p>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && !metrics ? (
          <>
            <div className="h-24 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
            <div className="h-24 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
            <div className="h-24 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
            <div className="h-24 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
          </>
        ) : metrics ? (
          <>
            <KpiCard
              titulo="Receita Total"
              valor={`R$ ${metrics.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              trend={metrics.variacaoReceita}
              trendPositiva={!metrics.variacaoReceita.startsWith('-')}
              icone="R$"
            />
            <KpiCard
              titulo="Taxa de Ocupação"
              valor={`${metrics.taxaOcupacao}%`}
              trend={metrics.variacaoOcupacao}
              trendPositiva={!metrics.variacaoOcupacao.startsWith('-')}
              icone="%"
            />
            <KpiCard
              titulo="Leads Ativos"
              valor={String(metrics.leadsAtivos)}
              icone="L"
            />
            <KpiCard
              titulo="Alertas Operacionais"
              valor={String(metrics.alertasOperacionais)}
              trend={metrics.alertasOperacionais > 0 ? `${metrics.alertasOperacionais} pendente(s)` : undefined}
              trendPositiva={metrics.alertasOperacionais === 0}
              icone="!"
            />
          </>
        ) : (
          <p className="text-xs text-slate-500 font-mono col-span-full">
            Nenhum dado disponível.
          </p>
        )}
      </section>
    </div>
  )
}
