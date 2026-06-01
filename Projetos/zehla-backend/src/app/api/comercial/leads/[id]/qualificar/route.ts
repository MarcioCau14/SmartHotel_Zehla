import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '../../../../../../infrastructure/http/auth/jwtAuth'
import { ComercialControllerFactory } from '../../../../../../infrastructure/http/comercial/ComercialControllerFactory'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const { id } = await params
    const useCase = ComercialControllerFactory.makeQualificarLeadUseCase()
    const result = await useCase.execute(id)

    if (result.isFail) {
      const mensagem = result.error.message
      if (mensagem.includes('TRANSICAO_INVALIDA') || mensagem.includes('TRANSICAO_NAO_MAPEADA')) {
        return NextResponse.json({ error: mensagem }, { status: 422 })
      }
      return NextResponse.json({ error: mensagem }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: { id: result.value.id, estado: result.value.estado } }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
