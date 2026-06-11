import { NextRequest, NextResponse } from 'next/server'
import { ReservationControllerFactory } from '@/infrastructure/http/reservation/ReservationControllerFactory'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { action } = body

    const reservationId = id

    switch (action) {
      case 'CANCEL': {
        const useCase = ReservationControllerFactory.makeCancelUseCase()
        const result = await useCase.execute({ reservationId })
        if (result.isFail) {
          return NextResponse.json({ error: result.error }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }

      case 'CHECK_IN': {
        const useCase = ReservationControllerFactory.makeCheckInUseCase()
        const result = await useCase.execute({ reservationId })
        if (result.isFail) {
          return NextResponse.json({ error: result.error }, { status: 400 })
        }
        return NextResponse.json({ success: true, data: result.value })
      }

      case 'CHECK_OUT': {
        const useCase = ReservationControllerFactory.makeCheckOutUseCase()
        const result = await useCase.execute({ reservationId })
        if (result.isFail) {
          return NextResponse.json({ error: result.error }, { status: 400 })
        }
        return NextResponse.json({ success: true, data: result.value })
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('[v2/reservations/:id PATCH]', error)
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 })
  }
}
