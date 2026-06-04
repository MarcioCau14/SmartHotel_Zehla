import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ltvColor, ltvLabel } from '@/types/lead'
import type { LeadCardView } from '@/types/lead'

interface LeadCardProps {
  readonly lead: LeadCardView
  readonly onMove?: (leadId: string, destino: string) => void
  readonly onQualify?: (leadId: string) => void
  readonly onEdit?: (leadId: string) => void
  readonly isDraggable?: boolean
}

export function LeadCard({ lead, onMove, onQualify, onEdit, isDraggable = true }: LeadCardProps) {
  const canQualify = lead.stage === 'ENTRADA'
  const canAdvance = lead.stage === 'QUALIFICACAO' || lead.stage === 'PROPOSTA'

  return (
    <Card
      data-slot="lead-card"
      data-draggable={isDraggable}
      className="group/card cursor-pointer transition-shadow hover:shadow-md"
      draggable={isDraggable}
      onDragStart={(e) => {
        if (isDraggable) e.dataTransfer.setData('text/lead-id', lead.id)
      }}
    >
      <CardContent className="space-y-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold">{lead.nome}</h4>
            <p className="truncate text-xs text-muted-foreground">{lead.telefone}</p>
          </div>
          <Badge variant="outline" className={ltvColor(lead.ltvScore)}>
            {ltvLabel(lead.ltvScore)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Badge variant="secondary" className="text-[10px]">
            {lead.canalOrigem}
          </Badge>
          {lead.daysSinceLastInteraction > 0 && (
            <span className="text-muted-foreground">
              {lead.daysSinceLastInteraction}d
            </span>
          )}
        </div>

        {lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="ghost" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {lead.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{lead.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {lead.isHighValue && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            US$ {lead.totalSpentUsd.toFixed(2)} gastos
          </p>
        )}

        <div className="flex gap-1.5 pt-1 opacity-0 transition-opacity group-hover/card:opacity-100">
          {canQualify && onQualify && (
            <button
              type="button"
              className="rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/80"
              onClick={() => onQualify(lead.id)}
            >
              Qualificar
            </button>
          )}
          {canAdvance && onMove && (
            <button
              type="button"
              className="rounded bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground hover:bg-secondary/80"
              onClick={() => onMove(lead.id, 'NEGOCIACAO')}
            >
              Avançar
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className="rounded bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted/80"
              onClick={() => onEdit(lead.id)}
            >
              Editar
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
