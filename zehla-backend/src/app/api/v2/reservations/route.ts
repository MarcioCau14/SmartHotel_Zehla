import { NextRequest, NextResponse } from 'next/server'
import { ReservationControllerFactory } from '@/infrastructure/http/reservation/ReservationControllerFactory'

export async function POST(request: NextRequest) {
  const controller = ReservationControllerFactory.makeCreateReservationController()
  return controller.handle(request)
}

export async function GET(request: NextRequest) {
  try {
    const useCase = ReservationControllerFactory.makeListUseCase()
    const { searchParams } = new URL(request.url)

    const result = await useCase.execute({
      propertyId: searchParams.get('propertyId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
    })

    if (result.isFail) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, ...result.value })
  } catch (error: any) {
    console.error('[v2/reservations GET]', error)
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 })
  }
}
