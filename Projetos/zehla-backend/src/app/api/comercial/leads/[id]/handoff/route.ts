import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '../../../../../../infrastructure/http/auth/jwtAuth'
import { ComercialControllerFactory } from '../../../../../../infrastructure/http/comercial/ComercialControllerFactory'
import type { SummaryPackage } from '../../../../../../domain/comercial/events/ComercialDomainEvents'

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
    const body = await request.json()
    const { closerId, summaryPackage } = body as {
      closerId: string
      summaryPackage: SummaryPackage
    }

    if (!closerId) {
      return NextResponse.json({ error: 'CLOSER_ID_REQUIRED' }, { status: 400 })
    }
    if (!summaryPackage) {
      return NextResponse.json({ error: 'SUMMARY_PACKAGE_REQUIRED' }, { status: 400 })
    }

    const useCase = ComercialControllerFactory.makeRealizarHandoffUseCase()
    const result = await useCase.execute({ leadId: id, closerId, summaryPackage })

    if (result.isFail) {
      const mensagem = result.error.message
      if (mensagem.includes('TRANSICAO_INVALIDA') || mensagem.includes('TRANSICAO_NAO_MAPEADA')) {
        return NextResponse.json({ error: mensagem }, { status: 422 })
      }
      return NextResponse.json({ error: mensagem }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: { id: result.value.id, estado: result.value.estado, closerResponsavel: result.value.closerResponsavel } }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
