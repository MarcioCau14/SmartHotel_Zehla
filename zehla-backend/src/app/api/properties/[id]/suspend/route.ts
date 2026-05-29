import { NextRequest, NextResponse } from 'next/server'
import { PropertyControllerFactory } from '../../../../../infrastructure/http/property/PropertyControllerFactory'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason || reason.trim().length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Motivo da suspensão deve ter pelo menos 3 caracteres',
      }, { status: 400 })
    }

    const useCase = PropertyControllerFactory.makeSuspenderReativarUseCase()
    const result = await useCase.suspend({ propertyId: id, reason })

    if (result.isFail) {
      const status = result.error.includes('não encontrada') || result.error.includes('não existe') ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.value })
  } catch (error) {
    console.error('Property suspend error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
