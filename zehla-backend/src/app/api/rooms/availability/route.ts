import { NextRequest, NextResponse } from 'next/server'
import { RoomControllerFactory } from '../../../../infrastructure/http/room/RoomControllerFactory'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guestCount = searchParams.get('guestCount')

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId é obrigatório' }, { status: 400 })
    }

    const useCase = RoomControllerFactory.makeCheckAvailabilityUseCase()
    const result = await useCase.execute({
      propertyId,
      checkIn: checkIn ?? undefined,
      checkOut: checkOut ?? undefined,
      guestCount: guestCount ? parseInt(guestCount) : undefined,
    })

    if (result.isFail) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.value.rooms, stats: result.value.stats })
  } catch (error) {
    console.error('Room availability error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
