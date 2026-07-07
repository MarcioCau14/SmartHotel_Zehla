'use client'

import { useState, useCallback } from 'react'
import { LeadCard } from './LeadCard'
import { GRUPO_META } from '@/types/lead'
import type { GrupoFunil, KanbanColumnView, KanbanBoardView } from '@/types/lead'

interface KanbanBoardProps {
  readonly board: KanbanBoardView
  readonly onLeadDrop?: (leadId: string, grupoDestino: GrupoFunil) => void
  readonly onQualifyLead?: (leadId: string) => void
  readonly onEditLead?: (leadId: string) => void
}

function KanbanColumn({
  column,
  onLeadDrop,
  onQualifyLead,
  onEditLead,
  isOver,
  onSetDragOver,
}: {
  column: KanbanColumnView
  onLeadDrop?: (leadId: string, grupo: GrupoFunil) => void
  onQualifyLead?: (leadId: string) => void
  onEditLead?: (leadId: string) => void
  isOver: boolean
  onSetDragOver?: (grupo: GrupoFunil | null) => void
}) {
  const meta = GRUPO_META[column.grupo]

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      onSetDragOver?.(column.grupo)
    },
    [column.grupo, onSetDragOver],
  )

  const handleDragLeave = useCallback(() => {
    onSetDragOver?.(null)
  }, [onSetDragOver])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const leadId = e.dataTransfer.getData('text/lead-id')
      if (leadId) onLeadDrop?.(leadId, column.grupo)
      onSetDragOver?.(null)
    },
    [column.grupo, onLeadDrop, onSetDragOver],
  )

  return (
    <div
      data-slot="kanban-column"
      data-column={column.grupo}
      className={`flex w-72 shrink-0 flex-col gap-3 rounded-xl border bg-card p-3 transition-shadow ${
        isOver ? 'shadow-lg ring-2 ring-primary/30' : ''
      }`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`flex items-center justify-between border-l-4 ${meta.cor} pl-2`}>
        <span className="text-sm font-semibold">{meta.titulo}</span>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
          {column.leads.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {column.leads.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Nenhum lead nesta coluna
          </p>
        )}
        {column.leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onMove={(id) => onLeadDrop?.(id, column.grupo)}
            onQualify={onQualifyLead}
            onEdit={onEditLead}
          />
        ))}
      </div>
    </div>
  )
}

export function KanbanBoard({
  board,
  onLeadDrop,
  onQualifyLead,
  onEditLead,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  return (
    <div
      data-slot="kanban-board"
      className="flex gap-4 overflow-x-auto pb-4"
    >
      {board.columns.map((column) => (
        <KanbanColumn
          key={column.grupo}
          column={column}
          onLeadDrop={onLeadDrop}
          onQualifyLead={onQualifyLead}
          onEditLead={onEditLead}
          isOver={dragOverColumn === column.grupo}
          onSetDragOver={setDragOverColumn}
        />
      ))}
    </div>
  )
}
