import { NextRequest, NextResponse } from 'next/server'
import { RoomControllerFactory } from '../../../infrastructure/http/room/RoomControllerFactory'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const minCapacity = searchParams.get('minCapacity')
    const search = searchParams.get('search')

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId é obrigatório' }, { status: 400 })
    }

    const useCase = RoomControllerFactory.makeListRoomsUseCase()
    const result = await useCase.execute({
      propertyId,
      type: type ?? undefined,
      status: status ?? undefined,
      minCapacity: minCapacity ? parseInt(minCapacity) : undefined,
      search: search ?? undefined,
      includeStats: true,
    })

    if (result.isFail) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.value.rooms, stats: result.value.stats })
  } catch (error) {
    console.error('Room list error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { number, name, type, maxAdults, maxChildren, basePrice, pricingType, amenities, description, images, propertyId } = body

    if (!number || !propertyId) {
      return NextResponse.json({ success: false, error: 'number e propertyId são obrigatórios' }, { status: 400 })
    }

    const useCase = RoomControllerFactory.makeCreateRoomUseCase()
    const result = await useCase.execute({
      number,
      name,
      type,
      maxAdults: maxAdults ?? 2,
      maxChildren,
      basePrice: basePrice ?? 0,
      pricingType,
      amenities,
      description,
      images,
      propertyId,
    })

    if (result.isFail) {
      const status = result.error.includes('existe') ? 409 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 201 })
  } catch (error) {
    console.error('Room create error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
