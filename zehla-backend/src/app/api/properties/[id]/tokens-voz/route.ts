import { NextRequest, NextResponse } from 'next/server'
import { PropertyControllerFactory } from '../../../../../infrastructure/http/property/PropertyControllerFactory'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { count } = body

    if (!count || parseInt(count) <= 0) {
      return NextResponse.json({
        success: false,
        error: 'count deve ser um número positivo',
      }, { status: 400 })
    }

    const useCase = PropertyControllerFactory.makeConsumirTokenVozUseCase()
    const result = await useCase.execute({ propertyId: id, count: parseInt(count) })

    if (result.isFail) {
      const status = result.error.includes('não encontrada') || result.error.includes('não existe') ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.value })
  } catch (error) {
    console.error('Property consume tokens error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
