import { NextRequest, NextResponse } from 'next/server'
import { PropertyControllerFactory } from '../../../../../infrastructure/http/property/PropertyControllerFactory'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const useCase = PropertyControllerFactory.makeAtivarPropertyUseCase()
    const result = await useCase.execute({ propertyId: id })

    if (result.isFail) {
      const status = result.error.includes('não encontrada') || result.error.includes('não existe') ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.value })
  } catch (error) {
    console.error('Property activate error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
