'use client'

import { useLeadsKanban } from '@/hooks/use-leads-kanban'
import { KanbanBoard } from '@/components/features/crm/KanbanBoard'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorMessage } from '@/components/ui/error-message'

export default function CRMPage() {
  const { board, isLoading, error, refresh, moveLead, qualifyLead } = useLeadsKanban()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">CRM</h1>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border bg-card p-3">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 2 }).map((_, j) => (
                <Skeleton key={j} className="h-32 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">CRM</h1>
        <ErrorMessage message={error} onRetry={refresh} />
      </div>
    )
  }

  if (!board) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">CRM</h1>
        <p className="text-muted-foreground">Nenhum lead encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CRM — Pipeline de Leads</h1>
      <KanbanBoard
        board={board}
        onLeadDrop={moveLead}
        onQualifyLead={qualifyLead}
      />
    </div>
  )
}
