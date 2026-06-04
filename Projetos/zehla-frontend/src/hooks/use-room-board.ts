import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch } from '@/lib/api/api-client'
import { API } from '@/lib/api/api-routes'
import type { RoomView, RoomStatus } from '@/types/reservation'

const ROOMS_KEY = ['reservations', 'rooms'] as const

export function useRoomBoard(staleTimeMs: number = 30_000) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ROOMS_KEY,
    queryFn: async () => {
      const result = await apiGet<RoomView[]>(API.RESERVATIONS.BASE)
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    staleTime: staleTimeMs,
    retry: 2,
    refetchOnWindowFocus: true,
  })

  const changeRoomStatus = useMutation({
    mutationFn: async ({ roomId, newStatus }: { roomId: string; newStatus: RoomStatus }) => {
      const result = await apiPatch<RoomView>(`${API.RESERVATIONS.BASE}/${roomId}/status`, { status: newStatus })
      if (result.isFail) throw result.error
      return result.value
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY })
    },
  })

  return {
    rooms: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
    changeRoomStatus: changeRoomStatus.mutate,
    isChangingStatus: changeRoomStatus.isPending,
    lastUpdated: query.dataUpdatedAt,
  }
}
