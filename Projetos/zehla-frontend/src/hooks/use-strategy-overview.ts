import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api/api-client'
import { API } from '@/lib/api/api-routes'
import type { PlanoPreco, MarketConversionRate, RegiaoBrasil, CanalAbordagem } from '@/types/commercial'

export interface EstrategiaRegionalView {
  readonly regiao: RegiaoBrasil
  readonly altaTemporada: ReadonlyArray<string>
  readonly momentoAbordagem: ReadonlyArray<string>
  readonly dorPrincipal: string
  readonly canalPreferencial: CanalAbordagem
}

export interface LGPDClassificacaoView {
  readonly tipoContato: string
  readonly baseLegal: string
  readonly podeDisparar: boolean
  readonly regras: string
}

export interface BenchmarkConcorrenteView {
  readonly nome: string
  readonly precoBrl: number
  readonly temWhatsAppNativo: boolean
  readonly temIaNativa: boolean
  readonly notas: string
}

export interface StrategyOverview {
  readonly planos: ReadonlyArray<PlanoPreco>
  readonly conversao: ReadonlyArray<MarketConversionRate>
  readonly estrategiasRegionais: ReadonlyArray<EstrategiaRegionalView>
  readonly lgpd: ReadonlyArray<LGPDClassificacaoView>
  readonly benchmark: ReadonlyArray<BenchmarkConcorrenteView>
  readonly diferencialCompetitivo: ReadonlyArray<string>
}

const OVERVIEW_KEY = ['revenue', 'strategy', 'overview'] as const

export function useStrategyOverview() {
  const query = useQuery({
    queryKey: OVERVIEW_KEY,
    queryFn: async () => {
      const result = await apiGet<StrategyOverview>(API.STRATEGY.BASE)
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  }
}
