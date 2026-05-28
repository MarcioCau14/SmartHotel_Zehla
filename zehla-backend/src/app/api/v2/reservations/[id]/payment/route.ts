import { NextRequest, NextResponse } from 'next/server'
import { ReservationControllerFactory } from '@/infrastructure/http/reservation/ReservationControllerFactory'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const useCase = ReservationControllerFactory.makeLinkPaymentUseCase()

    const result = await useCase.execute({
      reservationId: params.id,
      propertyId: body.propertyId,
      amount: body.amount,
      method: body.method,
      externalId: body.externalId,
    })

    if (result.isFail) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 201 })
  } catch (error: any) {
    console.error('[v2/reservations/:id/payment POST]', error)
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 })
  }
}
