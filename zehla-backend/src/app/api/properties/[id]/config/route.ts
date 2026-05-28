import { NextRequest, NextResponse } from 'next/server'
import { PropertyControllerFactory } from '../../../../../infrastructure/http/property/PropertyControllerFactory'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { address, contactInfo, operationalWindow, capacity } = body

    const useCase = PropertyControllerFactory.makeAtualizarConfiguracaoUseCase()
    const result = await useCase.execute({
      propertyId: id,
      address,
      contactInfo,
      operationalWindow,
      capacity: capacity ? parseInt(capacity) : undefined,
    })

    if (result.isFail) {
      const status = result.error.includes('não encontrada') || result.error.includes('não existe') ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.value })
  } catch (error) {
    console.error('Property config update error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
