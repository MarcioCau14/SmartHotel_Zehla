import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api/api-client'
import { API } from '@/lib/api/api-routes'
import type { PainVariant } from '@/types/commercial'

export interface OutboundVariantConfig {
  readonly variant: PainVariant
  readonly emailSubject: string
  readonly pitchMessage: string
  readonly expectedOpenRate: number
  readonly expectedClickRate: number
}

export interface OutboundDispatchResult {
  readonly dispatched: number
  readonly errors: ReadonlyArray<{ leadId: string; error: string }>
  readonly warmingRemaining: number
}

export interface OutboundBatchPayload {
  readonly leadIds: ReadonlyArray<string>
  readonly variant: PainVariant
  readonly canal: 'email_corporativo' | 'whatsapp_optin'
}

const VARIANTS_KEY = ['outbound', 'variants'] as const

export function useOutboundEngine() {
  const queryClient = useQueryClient()

  const variantsQuery = useQuery({
    queryKey: VARIANTS_KEY,
    queryFn: async () => {
      const result = await apiGet<OutboundVariantConfig[]>(API.OUTBOUND.VARIANTS)
      if (result.isFail) throw result.error
      return Object.freeze(result.getOrThrow())
    },
    staleTime: 1000 * 60 * 60,
    retry: 2,
  })

  const dispatchMutation = useMutation({
    mutationFn: async ({ leadId, variant }: { leadId: string; variant: PainVariant }) => {
      const result = await apiPost<OutboundDispatchResult>(API.OUTBOUND.DISPATCH, { leadId, variant })
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VARIANTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] })
    },
  })

  const batchDispatchMutation = useMutation({
    mutationFn: async (payload: OutboundBatchPayload) => {
      const result = await apiPost<OutboundDispatchResult>(API.OUTBOUND.BATCH_DISPATCH, payload)
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VARIANTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] })
      queryClient.invalidateQueries({ queryKey: ['commercial', 'strategy'] })
    },
  })

  return {
    variants: variantsQuery.data ?? Object.freeze([]),
    isLoadingVariants: variantsQuery.isLoading,
    error: variantsQuery.error?.message ?? dispatchMutation.error?.message ?? null,

    dispatch: dispatchMutation.mutate,
    dispatchAsync: dispatchMutation.mutateAsync,
    isDispatching: dispatchMutation.isPending,
    lastDispatchResult: dispatchMutation.data,

    batchDispatch: batchDispatchMutation.mutate,
    batchDispatchAsync: batchDispatchMutation.mutateAsync,
    isBatchDispatching: batchDispatchMutation.isPending,
    lastBatchResult: batchDispatchMutation.data,

    refreshVariants: variantsQuery.refetch,
  }
}
