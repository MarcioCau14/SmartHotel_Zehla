import { NextRequest, NextResponse } from 'next/server'
import { PropertyControllerFactory } from '../../../infrastructure/http/property/PropertyControllerFactory'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug, description, capacity, state, address, contactInfo, isCanary, refSource, utmTracking } = body

    if (!id || !name || !slug || !capacity || !state || !address || !contactInfo) {
      return NextResponse.json({
        success: false,
        error: 'id, name, slug, capacity, state, address e contactInfo são obrigatórios',
      }, { status: 400 })
    }

    const useCase = PropertyControllerFactory.makeCriarPropertyUseCase()
    const result = await useCase.execute({
      id,
      name,
      slug,
      description,
      capacity: parseInt(capacity),
      state,
      address,
      contactInfo,
      isCanary,
      refSource,
      utmTracking,
    })

    if (result.isFail) {
      const status = result.error.includes('já existe') || result.error.includes('duplicado') ? 409 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 201 })
  } catch (error) {
    console.error('Property create error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
