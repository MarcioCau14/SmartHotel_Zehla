import { NextRequest, NextResponse } from 'next/server'
import { ReservationControllerFactory } from '@/infrastructure/http/reservation/ReservationControllerFactory'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, propertyId, data } = body

    switch (action) {
      case 'CREATE': {
        const useCase = ReservationControllerFactory.makeCreateUseCase()
        const result = await useCase.execute({
          propertyId,
          roomId: data.roomId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          guestCpf: data.guestCpf,
          guestCount: data.guestCount || 1,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          source: data.source,
          notes: data.notes,
        })
        if (result.isFail) {
          const status = result.error.includes('não disponível') ? 409 : 422
          return NextResponse.json({ success: false, error: result.error }, { status })
        }
        return NextResponse.json({ success: true, data: result.value }, { status: 201 })
      }

      case 'UPDATE': {
        const useCase = ReservationControllerFactory.makeUpdateUseCase()
        const result = await useCase.execute({
          reservationId: data.id,
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          guestEmail: data.guestEmail,
          guestCpf: data.guestCpf,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          notes: data.notes,
        })
        if (result.isFail) {
          return NextResponse.json({ success: false, error: result.error }, { status: 422 })
        }
        return NextResponse.json({ success: true, data: result.value })
      }

      case 'CANCEL': {
        const useCase = ReservationControllerFactory.makeCancelUseCase()
        const result = await useCase.execute({ reservationId: data.id })
        if (result.isFail) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }

      case 'CHECK_IN': {
        const useCase = ReservationControllerFactory.makeCheckInUseCase()
        const result = await useCase.execute({ reservationId: data.id })
        if (result.isFail) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 })
        }
        return NextResponse.json({ success: true, data: result.value })
      }

      case 'CHECK_OUT': {
        const useCase = ReservationControllerFactory.makeCheckOutUseCase()
        const result = await useCase.execute({ reservationId: data.id })
        if (result.isFail) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 })
        }
        return NextResponse.json({ success: true, data: result.value })
      }

      case 'LIST': {
        const useCase = ReservationControllerFactory.makeListUseCase()
        const result = await useCase.execute({
          propertyId,
          status: data?.status,
          startDate: data?.startDate,
          endDate: data?.endDate,
        })
        if (result.isFail) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 })
        }
        return NextResponse.json({ success: true, data: result.value.reservations })
      }

      default:
        return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ Erro em Reservas:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    agent: 'RESERVATIONS',
    status: 'online',
    description: 'Gestão de reservas, check-in e check-out'
  })
}
