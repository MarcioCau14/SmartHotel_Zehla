'use client'

import { useStrategyOverview } from '@/hooks/use-strategy-overview'
import { useCommercialStrategy } from '@/hooks/use-commercial-strategy'
import { ForecastMetricsBoard } from '@/components/features/revenue/ForecastMetricsBoard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorMessage } from '@/components/ui/error-message'

export default function RevenuePage() {
  const { data, isLoading, error, refresh } = useStrategyOverview()
  const { forecast } = useCommercialStrategy()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Inteligência de Mercado</h1>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Inteligência de Mercado</h1>
        <ErrorMessage message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inteligência de Mercado</h1>
          <p className="text-sm text-muted-foreground">
            Estratégia comercial, precificação e forecasting
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          onClick={() => refresh()}
        >
          Atualizar
        </button>
      </div>

      {forecast && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Leads Qualificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{forecast.leadsQualificados}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversão Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {(forecast.conversaoMedia * 100).toFixed(1)}%
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Projetada (3m)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                R$ {forecast.receitaProjetada3Meses.toLocaleString('pt-BR')}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custo Aquisição Est.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                R$ {forecast.custoAquisicaoEstimado.toLocaleString('pt-BR')}
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {data && (
        <ForecastMetricsBoard
          planos={data.planos}
          conversao={data.conversao}
          estrategiasRegionais={data.estrategiasRegionais}
          lgpd={data.lgpd}
          benchmark={data.benchmark}
          diferencialCompetitivo={data.diferencialCompetitivo}
        />
      )}
    </div>
  )
}
