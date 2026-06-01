import { NextRequest, NextResponse } from 'next/server'
import { PropertyControllerFactory } from '../../../../../infrastructure/http/property/PropertyControllerFactory'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { plan, subscription } = body

    if (!plan || !subscription) {
      return NextResponse.json({
        success: false,
        error: 'plan e subscription são obrigatórios',
      }, { status: 400 })
    }

    const useCase = PropertyControllerFactory.makeAlterarPlanoUseCase()
    const result = await useCase.execute({
      propertyId: id,
      plan,
      subscription,
    })

    if (result.isFail) {
      const status = result.error.includes('não encontrada') || result.error.includes('não existe') ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.value })
  } catch (error) {
    console.error('Property plan change error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
