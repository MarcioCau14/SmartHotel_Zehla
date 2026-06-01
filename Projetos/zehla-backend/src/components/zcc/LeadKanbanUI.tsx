'use client'

import { KanbanColumn } from '../ui/KanbanColumn'
import type { KanbanCardProps } from '../ui/KanbanCard'

export interface ColunaLead {
  id: string
  titulo: string
  cor: string
  cards: KanbanCardProps[]
}

export interface LeadKanbanUIProps {
  colunas: ColunaLead[]
  isLoading: boolean
  error: string | null
  onQualificar: (leadId: string) => void
  onHandoff: (leadId: string) => void
  onVerEscada: (leadId: string) => void
}

const GRUPO_CORES: Record<string, string> = {
  topo: 'bg-slate-500',
  qualificacao: 'bg-blue-500',
  agendamento: 'bg-violet-500',
  negociacao: 'bg-orange-500',
  fechado: 'bg-emerald-500',
  perdido: 'bg-red-500',
  farming: 'bg-amber-500',
}

const GRUPO_TITULOS: Record<string, string> = {
  topo: 'Topo de Funil',
  qualificacao: 'Qualificação',
  agendamento: 'Agendamento',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
  farming: 'Sales Farming',
}

export function montarColunas(
  leads: Record<string, KanbanCardProps[]>,
): ColunaLead[] {
  return Object.entries(GRUPO_TITULOS).map(([id, titulo]) => ({
    id,
    titulo,
    cor: GRUPO_CORES[id] ?? 'bg-slate-500',
    cards: leads[id] ?? [],
  }))
}

export function LeadKanbanUI({
  colunas,
  isLoading,
  error,
  onQualificar,
  onHandoff,
  onVerEscada,
}: LeadKanbanUIProps) {
  if (isLoading) {
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
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {colunas.map((col) => (
          <KanbanColumn
            key={col.id}
            titulo={col.titulo}
            cor={col.cor}
            cards={col.cards}
            onQualificar={onQualificar}
            onHandoff={onHandoff}
            onVerEscada={onVerEscada}
          />
        ))}
      </div>
    </div>
  )
}
