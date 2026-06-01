'use client'

import type { KanbanCardProps } from './KanbanCard'
import { KanbanCard } from './KanbanCard'

export interface KanbanColumnProps {
  titulo: string
  cor: string
  cards: KanbanCardProps[]
  onQualificar?: (leadId: string) => void
  onHandoff?: (leadId: string) => void
  onVerEscada?: (leadId: string) => void
}

export function KanbanColumn({
  titulo,
  cor,
  cards,
  onQualificar,
  onHandoff,
  onVerEscada,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[240px] bg-slate-900/50 border border-slate-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${cor}`} />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide">{titulo}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
          {cards.length}
        </span>
      </div>

      <div className="flex-1 space-y-3 min-h-[200px]">
        {cards.map((card) => (
          <KanbanCard
            key={card.leadName}
            {...card}
            onQualificar={card.onQualificar ?? (() => onQualificar?.(card.leadName))}
            onHandoff={card.onHandoff ?? (() => onHandoff?.(card.leadName))}
            onVerEscada={card.onVerEscada ?? (() => onVerEscada?.(card.leadName))}
          />
        ))}

        {cards.length === 0 && (
          <div className="flex items-center justify-center h-28 border border-dashed border-slate-800 rounded text-[11px] text-slate-600 text-center font-mono">
            Sem leads nesta etapa
          </div>
        )}
      </div>
    </div>
  )
}
