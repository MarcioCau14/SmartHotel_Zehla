import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '../../../../../../infrastructure/http/auth/jwtAuth'
import { ComercialControllerFactory } from '../../../../../../infrastructure/http/comercial/ComercialControllerFactory'
import type { TierType } from '../../../../../../domain/comercial/value-objects/ProductTier'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const tierAtual = searchParams.get('tierAtual') as TierType | null

    if (!tierAtual) {
      return NextResponse.json({ error: 'TIER_ATUAL_REQUIRED' }, { status: 400 })
    }

    const useCase = ComercialControllerFactory.makeCalcularEscadaDeValorUseCase()
    const result = await useCase.execute(id, tierAtual)

    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
