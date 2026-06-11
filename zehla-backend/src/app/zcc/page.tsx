'use client'

import React, { useState } from 'react'
import { CognitiveTerminal } from '../../components/zcc/CognitiveTerminal'
import { LeadKanban } from '../../components/zcc/LeadKanban'
import { RoomsGrid } from '../../components/zcc/RoomsGrid'
import { CampaignMetricsCard } from '../../components/zcc/marketing/CampaignMetricsCard'
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics'

export default function ZCCDashboardPage() {
  const [periodo] = useState({
    inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    fim: new Date().toISOString(),
  })

  const { metrics, loading, recalcularBreakEven } = useDashboardMetrics(periodo)
  const [breakEvenInput, setBreakEvenInput] = useState('')

  const handleBreakEvenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(breakEvenInput)
    if (isNaN(val) || val <= 0) return
    await recalcularBreakEven(val)
    setBreakEvenInput('')
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50 font-sans p-6 space-y-6">
      {/* Premium Dashboard Header & KPIs */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-50 font-display">
              Zehla Control Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Sincronização Mestra: Cognição, CRM e Hospitalidade Conectados
          </p>
        </div>

        {/* Real-time Yield Metrics Cards (0% mocks / fetched from useDashboardMetrics) */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {loading ? (
            <div className="text-slate-500 font-mono text-xs animate-pulse">Sincronizando Yield KPIs...</div>
          ) : (
            <>
              {/* Card 1: Faturamento */}
              <div className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between min-w-[150px]">
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">FATURAMENTO</span>
                <span className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  R$ {metrics?.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Card 2: Ocupação */}
              <div className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between min-w-[120px]">
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">TAXA OCUPAÇÃO</span>
                <span className="text-lg font-bold font-mono text-orange-400 mt-1">
                  {metrics?.taxaOcupacao}%
                </span>
              </div>

              {/* Card 3: Break-Even Status */}
              <div className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between min-w-[140px]">
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">BREAK-EVEN YIELD</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      metrics?.breakEvenStatus === 'safe'
                        ? 'bg-emerald-500'
                        : metrics?.breakEvenStatus === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-red-500 animate-pulse'
                    }`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">
                    {metrics?.breakEvenStatus}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Form to manual adjust yield rules (confirming standard error-handling Result) */}
          <form onSubmit={handleBreakEvenSubmit} className="flex gap-2 items-center">
            <input
              type="number"
              value={breakEvenInput}
              onChange={(e) => setBreakEvenInput(e.target.value)}
              placeholder="Break-Even (R$)"
              className="w-28 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 outline-none focus:border-orange-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-800 hover:bg-orange-500 text-white hover:text-white font-bold text-xs rounded border border-slate-700 hover:border-orange-500 transition-colors"
            >
              Ajustar
            </button>
          </form>
        </div>
      </header>

      {/* Campaign Metrics */}
      <CampaignMetricsCard />

      {/* Main Grid Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Rooms and CRM Kanban */}
        <section className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          {/* Rooms Grid Module */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-md font-bold tracking-wide font-display text-slate-100 flex items-center gap-2">
              <span>🏨</span> Painel de Disponibilidade e Higienização
            </h2>
            <RoomsGrid />
          </div>

          {/* CRM Leads Kanban Module */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex-1">
            <h2 className="text-md font-bold tracking-wide font-display text-slate-100 flex items-center gap-2">
              <span>💼</span> Funil de Negociação de Vendas (CRM)
            </h2>
            <LeadKanban />
          </div>
        </section>

        {/* Right Col: Intelligent Terminal Swarm Radar */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <h2 className="text-md font-bold tracking-wide font-display text-slate-100 flex items-center gap-2 mb-4">
            <span>⚡</span> Swarm Cognitivo & Escalabilidade
          </h2>
          <CognitiveTerminal />
        </section>
      </main>
    </div>
  )
}
