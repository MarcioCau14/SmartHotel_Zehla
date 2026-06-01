import { useState, useCallback, useEffect } from 'react'
import { Result } from '../shared/Result'

export interface Reservation {
  id: string
  hospedeNome: string
  status: 'reservado' | 'checkin_mobile' | 'in_house' | 'checkout'
  govBrVerified: boolean
  roomNumber?: string
  checkInDate: Date
  checkOutDate: Date
}

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    // Simula carregamento de dados integrados de hospitalidade
    setTimeout(() => {
      setReservations([
        {
          id: 'res-01',
          hospedeNome: 'Carlos Eduardo Santos',
          status: 'checkin_mobile',
          govBrVerified: false,
          roomNumber: '101',
          checkInDate: new Date(),
          checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'res-02',
          hospedeNome: 'Mariana Azevedo Costa',
          status: 'reservado',
          govBrVerified: false,
          checkInDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'res-03',
          hospedeNome: 'Juliana Vasconcelos',
          status: 'in_house',
          govBrVerified: true,
          roomNumber: '104',
          checkInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ])
      setLoading(false)
    }, 200)
  }, [])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const realizarCheckInMobile = useCallback(
    async (id: string, qrCodeData: string): Promise<Result<void, Error>> => {
      try {
        setReservations((prev) =>
          prev.map((res) =>
            res.id === id
              ? { ...res, status: 'in_house', govBrVerified: true, roomNumber: res.roomNumber || '101' }
              : res
          )
        )
        return Result.ok(undefined)
      } catch (error) {
        return Result.fail(error instanceof Error ? error : new Error('Check-in failed'))
      }
    },
    []
  )

  const alocarQuarto = useCallback(async (id: string, quartoId: string): Promise<Result<void, Error>> => {
    try {
      setReservations((prev) =>
        prev.map((res) => (res.id === id ? { ...res, roomNumber: quartoId } : res))
      )
      return Result.ok(undefined)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Room allocation failed'))
    }
  }, [])

  return {
    reservations,
    loading,
    realizarCheckInMobile,
    alocarQuarto,
    refresh: fetchReservations,
  }
}
