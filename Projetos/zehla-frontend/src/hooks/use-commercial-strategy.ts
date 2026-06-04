import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api/api-client'
import { API } from '@/lib/api/api-routes'
import { CONVERSION_RATES, PLANOS, LGPD_CLASSIFICACOES } from '@/types/commercial'
import type { PlanoPreco, LGPDClassificacao, PainVariant } from '@/types/commercial'

export interface LeadStrategyRecommendation {
  readonly leadId: string
  readonly nome: string
  readonly planoRecomendado: PlanoPreco
  readonly canalPrioritario: string
  readonly painVariant: PainVariant
  readonly conversaoEstimada: number
  readonly lgpdClassificacao: LGPDClassificacao | undefined
  readonly justificativa: string
}

export interface DashboardForecast {
  readonly leadsQualificados: number
  readonly conversaoMedia: number
  readonly receitaProjetada3Meses: number
  readonly custoAquisicaoEstimado: number
  readonly planosRecomendados: ReadonlyArray<{
    nome: string
    valor: number
    clientesEstimados: number
  }>
}

const STRATEGY_KEY = ['commercial', 'strategy'] as const
const FORECAST_KEY = ['commercial', 'forecast'] as const

export function useCommercialStrategy(leadId?: string) {
  const strategyQuery = useQuery({
    queryKey: [...STRATEGY_KEY, leadId],
    queryFn: async (): Promise<LeadStrategyRecommendation | null> => {
      if (!leadId) return null
      const result = await apiGet<LeadStrategyRecommendation>(`${API.STRATEGY.RECOMMEND}/${leadId}`)
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
    enabled: !!leadId,
  })

  const batchQuery = useQuery({
    queryKey: STRATEGY_KEY,
    queryFn: async () => {
      const result = await apiGet<LeadStrategyRecommendation[]>(API.STRATEGY.BATCH_RECOMMEND)
      if (result.isFail) throw result.error
      return Object.freeze(result.getOrThrow())
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  })

  const forecastQuery = useQuery({
    queryKey: FORECAST_KEY,
    queryFn: async () => {
      const result = await apiGet<DashboardForecast>(API.DASHBOARD.FORECAST)
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  })

  return {
    recommendation: strategyQuery.data,
    batchRecommendations: batchQuery.data ?? Object.freeze([]),
    forecast: forecastQuery.data,
    isLoading: strategyQuery.isLoading || batchQuery.isLoading || forecastQuery.isLoading,
    error: strategyQuery.error?.message ?? batchQuery.error?.message ?? forecastQuery.error?.message ?? null,
    refresh: () => {
      strategyQuery.refetch()
      batchQuery.refetch()
      forecastQuery.refetch()
    },
    conversionRates: CONVERSION_RATES,
    planos: PLANOS,
    lgpdRules: LGPD_CLASSIFICACOES,
  }
}
