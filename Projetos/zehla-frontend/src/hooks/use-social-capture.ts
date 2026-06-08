import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api/api-client'
import { API } from '@/lib/api/api-routes'
import type { SocialInteractionView } from '@/types/social'

const SOCIAL_KEY = ['social', 'captured'] as const

export function useSocialCapture() {
  const query = useQuery({
    queryKey: SOCIAL_KEY,
    queryFn: async () => {
      const result = await apiGet<SocialInteractionView[]>(API.SOCIAL.CAPTURED)
      if (result.isFail) throw result.error
      return Object.freeze(result.getOrThrow())
    },
    staleTime: 1000 * 60 * 2,
    retry: 2,
  })

  return {
    interactions: query.data ?? Object.freeze([]),
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  }
}

export function useConvertToLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (interactionId: string) => {
      const result = await apiPost<{ leadId: string }>(`${API.SOCIAL.CAPTURED}/${interactionId}/convert`, {})
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_KEY })
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] })
    },
  })
}
