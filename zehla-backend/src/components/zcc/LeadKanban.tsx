'use client'

import React from 'react'
import { useLeadsKanban, LeadCard } from '../../hooks/useLeadsKanban'

const COLUMNS = [
  { id: 'prospect', title: 'Novos Leads', color: 'bg-blue-500' },
  { id: 'qualified', title: 'Qualificados', color: 'bg-orange-500' },
  { id: 'negotiation', title: 'Propostados', color: 'bg-amber-500' },
  { id: 'converted', title: 'Convertidos', color: 'bg-emerald-500' },
  { id: 'churned', title: 'Perdidos', color: 'bg-red-500' },
]

export function LeadKanban() {
  const { leads, loading, error, moverLead, qualificarLead } = useLeadsKanban()

  const getBorderColor = (score: number) => {
    if (score >= 70) return 'border-l-4 border-l-emerald-500 border-slate-700'
    if (score >= 40) return 'border-l-4 border-l-orange-500 border-slate-700'
    return 'border-l-4 border-l-slate-600 border-slate-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 w-full text-slate-400 font-mono">
        <span className="animate-spin mr-2">⚙️</span> Carregando Leads do Zé-Sales...
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900 rounded text-red-400 text-xs font-mono">
          Aviso da Borda: {error} (Carregando dados estruturados fallback)
        </div>
      )}

      {/* Grid of Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const cards = leads[col.id] || []
          return (
            <div key={col.id} className="flex flex-col min-w-[220px] bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              {/* Column Title */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                  <h3 className="font-semibold text-slate-100 text-sm tracking-wide">{col.title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
                  {cards.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3 min-h-[300px]">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-3 bg-slate-800 rounded border shadow-md flex flex-col gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg ${getBorderColor(
                      card.score
                    )}`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold text-slate-100 text-xs truncate max-w-[120px]">{card.nome}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                        Score: {card.score}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Origem: {card.canal}</span>
                    </div>

                    {/* Quick CRM Actions */}
                    <div className="flex gap-1.5 mt-2 border-t border-slate-700/60 pt-2 text-[10px]">
                      {card.status === 'prospect' && (
                        <button
                          onClick={() => qualificarLead(card.id)}
                          className="flex-1 py-1 bg-slate-700 hover:bg-orange-600 hover:text-white text-slate-300 font-bold rounded transition-colors"
                        >
                          Qualificar
                        </button>
                      )}
                      
                      {card.status !== 'converted' && card.status !== 'churned' && (
                        <select
                          onChange={(e) => moverLead(card.id, e.target.value as any)}
                          defaultValue={card.status}
                          className="w-full bg-slate-900 border border-slate-700 rounded text-slate-300 px-1 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="prospect">Novo</option>
                          <option value="qualified">Qualificado</option>
                          <option value="negotiation">Propostado</option>
                          <option value="converted">Convertido</option>
                          <option value="churned">Perdido</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}

                {cards.length === 0 && (
                  <div className="flex items-center justify-center h-28 border border-dashed border-slate-800 rounded text-[11px] text-slate-600 text-center font-mono">
                    Sem leads nesta etapa
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
