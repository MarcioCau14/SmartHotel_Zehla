import { useState, useCallback } from 'react'
import { Result } from '../shared/Result'
import { apiGet, apiPatch } from './apiClient'

export type RoomOperationalStatus = 'LIVRE' | 'OCUPADO' | 'AGUARDANDO_LIMPEZA' | 'EM_MANUTENCAO'

const STATUS_MAP: Record<string, RoomOperationalStatus> = {
  AVAILABLE: 'LIVRE',
  OCCUPIED: 'OCUPADO',
  CLEANING: 'AGUARDANDO_LIMPEZA',
  MAINTENANCE: 'EM_MANUTENCAO',
  BLOCKED: 'EM_MANUTENCAO',
}

const STATUS_REVERSE: Record<RoomOperationalStatus, string> = {
  LIVRE: 'AVAILABLE',
  OCUPADO: 'OCCUPIED',
  AGUARDANDO_LIMPEZA: 'CLEANING',
  EM_MANUTENCAO: 'MAINTENANCE',
}

export interface RoomData {
  id: string
  number: string
  name?: string
  type: string
  status: RoomOperationalStatus
  basePrice: number
  guestName?: string
  cleaningTimer?: number
}

interface ApiRoom {
  id: string
  number: string
  name?: string
  type: string
  status: string
  basePrice: number
}

interface ApiResponse {
  success: boolean
  data: ApiRoom[]
}

export function useRoomsGrid(propertyId: string) {
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!propertyId) return
    setIsLoading(true)
    setError(null)

    const result = await apiGet<ApiResponse>(
      `/api/rooms?propertyId=${encodeURIComponent(propertyId)}`,
    )

    if (result.isFail) {
      setError(result.error.message)
      setIsLoading(false)
      return
    }

    const mapped: RoomData[] = (result.value.data ?? []).map((r) => ({
      id: r.id,
      number: r.number,
      name: r.name,
      type: r.type,
      status: STATUS_MAP[r.status] ?? 'LIVRE',
      basePrice: r.basePrice,
    }))

    setRooms(mapped)
    setIsLoading(false)
  }, [propertyId])

  const alterarStatusQuarto = useCallback(
    async (roomId: string, novoStatus: RoomOperationalStatus): Promise<Result<RoomData, Error>> => {
      const apiStatus = STATUS_REVERSE[novoStatus] ?? novoStatus

      const result = await apiPatch<{ success: boolean; data: ApiRoom }>(
        `/api/rooms/${roomId}`,
        { status: apiStatus },
      )

      if (result.isFail) return Result.fail(result.error)

      let updatedRoom: RoomData | undefined
      setRooms((prev) => {
        const next = prev.map((r) =>
          r.id === roomId ? { ...r, status: novoStatus } : r,
        )
        updatedRoom = next.find((r) => r.id === roomId)
        return next
      })

      return Result.ok(updatedRoom!)
    },
    [],
  )

  const registrarLimpeza = useCallback(
    async (roomId: string): Promise<Result<RoomData, Error>> => {
      return alterarStatusQuarto(roomId, 'LIVRE')
    },
    [alterarStatusQuarto],
  )

  return {
    rooms,
    isLoading,
    error,
    alterarStatusQuarto,
    registrarLimpeza,
    refresh,
  }
}
