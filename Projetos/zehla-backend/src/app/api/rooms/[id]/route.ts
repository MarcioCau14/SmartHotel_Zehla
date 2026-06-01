import { NextRequest, NextResponse } from 'next/server'
import { RoomControllerFactory } from '../../../../infrastructure/http/room/RoomControllerFactory'
import { PricingType } from '../../../../domain/room/enums'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.status) {
      const statusUC = RoomControllerFactory.makeUpdateRoomStatusUseCase()
      const statusResult = await statusUC.execute({
        roomId: id,
        status: body.status,
        reason: body.statusReason,
        changedBy: body.changedBy ?? 'api',
      })
      if (statusResult.isFail) {
        return NextResponse.json({ success: false, error: statusResult.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, data: statusResult.value })
    }

    if (body.basePrice !== undefined || body.pricingType) {
      const pricingUC = RoomControllerFactory.makeUpdateRoomPricingUseCase()
      const pricingResult = await pricingUC.execute({
        roomId: id,
        basePrice: body.basePrice ?? 0,
        pricingType: body.pricingType ?? PricingType.PER_ROOM,
      })
      if (pricingResult.isFail) {
        return NextResponse.json({ success: false, error: pricingResult.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, data: pricingResult.value })
    }

    return NextResponse.json({ success: false, error: 'Nenhum campo válido para atualização' }, { status: 400 })
  } catch (error) {
    console.error('Room update error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
