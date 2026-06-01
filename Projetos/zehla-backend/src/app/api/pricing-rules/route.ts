import { NextRequest, NextResponse } from 'next/server'
import { RoomControllerFactory } from '../../../infrastructure/http/room/RoomControllerFactory'
import { RoomType } from '../../../domain/room/enums'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId é obrigatório' }, { status: 400 })
    }

    const useCase = RoomControllerFactory.makeListPricingRulesUseCase()
    const result = await useCase.execute({ propertyId })

    if (result.isFail) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.value })
  } catch (error) {
    console.error('Pricing rules list error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, roomType, startDate, endDate, multiplier, fixedAmount, propertyId } = body

    if (!name || !propertyId || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'name, propertyId, startDate e endDate são obrigatórios' }, { status: 400 })
    }

    const useCase = RoomControllerFactory.makeCreatePricingRuleUseCase()
    const result = await useCase.execute({
      name,
      description,
      roomType: roomType as RoomType ?? undefined,
      startDate,
      endDate,
      multiplier,
      fixedAmount,
      propertyId,
    })

    if (result.isFail) {
      const status = result.error.includes('existe') ? 409 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 201 })
  } catch (error) {
    console.error('Pricing rule create error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
