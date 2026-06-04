import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api/api-client'
import { API } from '@/lib/api/api-routes'
import type { Result } from '@/types/result'

export interface ReactivationCandidate {
  leadId: string
  guestName: string
  daysSinceCheckout: number
  expectedValueUsd: number
  telefone: string
}

const FARMER_KEY = ['farmer', 'candidates'] as const

export function useFarmerCandidates() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: FARMER_KEY,
    queryFn: () => apiGet<ReactivationCandidate[]>(API.FARMER.CANDIDATES),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  })

  return {
    candidates: data?.value ?? [],
    isLoading,
    error: error ? (error as Error).message : (data?.isFail ? data.error?.message ?? null : null),
    refresh: refetch,
  }
}

export function useReactivateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (leadId: string): Promise<Result<{ messageId: string }, Error>> => {
      return apiPost<{ messageId: string }>(API.FARMER.REACTIVATE, { leadId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FARMER_KEY })
    },
  })
}
