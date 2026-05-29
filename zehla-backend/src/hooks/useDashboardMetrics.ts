import { useState, useCallback, useEffect } from 'react'
import { Result } from '../shared/Result'
import { RevenueServiceAdapter } from '../services/adapters/RevenueServiceAdapter'

export interface YieldMetrics {
  faturamentoTotal: number
  taxaOcupacao: number
  revPar: number
  breakEvenStatus: 'safe' | 'warning' | 'danger'
}

export function useDashboardMetrics(periodo: { inicio: string; fim: string }) {
  const [metrics, setMetrics] = useState<YieldMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    const adapter = new RevenueServiceAdapter()
    const result = await adapter.consultarMetricas(periodo.inicio, periodo.fim)
    setLoading(false)

    if (result.isFail) {
      setError(result.error.message)
      // Fallback a dados padrão de UI se a API ainda não tiver métricas no período
      setMetrics({
        faturamentoTotal: 125000,
        taxaOcupacao: 72,
        revPar: 180,
        breakEvenStatus: 'safe',
      })
      return
    }

    const data = result.value.data || {}
    setMetrics({
      faturamentoTotal: data.faturamentoTotal ?? 0,
      taxaOcupacao: data.taxaOcupacao ?? 0,
      revPar: data.revPar ?? 0,
      breakEvenStatus: data.breakEvenStatus ?? 'safe',
    })
  }, [periodo.inicio, periodo.fim])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const recalcularBreakEven = useCallback(
    async (valorPretendido: number): Promise<Result<boolean, Error>> => {
      const adapter = new RevenueServiceAdapter()
      const result = await adapter.validarBreakEven('regra-principal-2026', valorPretendido)
      if (result.isFail) {
        return Result.fail(result.error)
      }
      const isSafe = result.value.success
      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              breakEvenStatus: isSafe ? 'safe' : 'danger',
            }
          : null
      )
      return Result.ok(isSafe)
    },
    []
  )

  return {
    metrics,
    loading,
    error,
    recalcularBreakEven,
    refresh: fetchMetrics,
  }
}
