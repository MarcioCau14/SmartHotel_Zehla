import { useState, useCallback } from 'react'
import { Result } from '../shared/Result'
import { apiGet } from './apiClient'

export interface DashboardMetrics {
  receitaTotal: number
  taxaOcupacao: number
  leadsAtivos: number
  alertasOperacionais: number
  variacaoReceita: string
  variacaoOcupacao: string
}

interface ApiMetricsResponse {
  success: boolean
  data: DashboardMetrics
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await apiGet<ApiMetricsResponse>('/api/revenue/kpis')

    if (result.isFail) {
      setError(result.error.message)
      setIsLoading(false)
      return
    }

    setMetrics(result.value.data)
    setIsLoading(false)
  }, [])

  return {
    metrics,
    isLoading,
    error,
    refresh,
  }
}
