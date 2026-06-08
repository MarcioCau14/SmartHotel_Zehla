import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PLATFORM_META, URGENCY_COR } from '@/types/social'
import type { SocialInteractionView } from '@/types/social'

interface SocialInteractionListProps {
  readonly interactions: ReadonlyArray<SocialInteractionView>
  readonly onConvertToLead?: (interactionId: string) => void
  readonly isConverting?: boolean
}

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

function InteractionCard({
  interaction,
  onConvertToLead,
  isConverting,
}: {
  interaction: SocialInteractionView
  onConvertToLead?: (id: string) => void
  isConverting?: boolean
}) {
  const platformMeta = PLATFORM_META[interaction.platform]

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${platformMeta.cor}`}>
              {platformMeta.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(interaction.timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {interaction.hasBuyingIntent && (
              <Badge variant="default" className="text-[10px]">
                Compra
              </Badge>
            )}
            {interaction.isDirectMessage && (
              <Badge variant="secondary" className="text-[10px]">
                DM
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">{interaction.username}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {interaction.content}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-medium ${URGENCY_COR[interaction.urgencyLevel]}`}>
            Urgência: {interaction.urgencyLevel === 'HIGH' ? 'Alta' : interaction.urgencyLevel === 'MEDIUM' ? 'Média' : 'Baixa'}
          </span>

          {interaction.convertedToLead ? (
            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400">
              Convertido
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={() => onConvertToLead?.(interaction.id)}
              disabled={isConverting}
            >
              {isConverting ? 'Convertendo...' : 'Converter em Lead'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SocialInteractionList({
  interactions,
  onConvertToLead,
  isConverting,
}: SocialInteractionListProps) {
  if (interactions.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed p-12">
        <p className="text-sm text-muted-foreground">
          Nenhuma interação capturada ainda.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {interactions.map((interaction) => (
        <InteractionCard
          key={interaction.id}
          interaction={interaction}
          onConvertToLead={onConvertToLead}
          isConverting={isConverting}
        />
      ))}
    </div>
  )
}
