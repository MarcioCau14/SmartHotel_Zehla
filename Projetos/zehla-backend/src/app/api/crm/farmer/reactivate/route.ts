import { NextRequest, NextResponse } from 'next/server'
import { withApiSecurity } from '@/lib/server/with-api-security'
import { authenticateRequest } from '@/infrastructure/http/auth/jwtAuth'
import { InMemoryCRMAdapter } from '@/infrastructure/persistence/memory/InMemoryCRMAdapter'
import { ReactivateColdLeadUseCase } from '@/application/crm/use-cases/ReactivateColdLeadUseCase'

async function _POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 })
    }

    const propertyId = auth.value.pousadaId
    const body = await req.json()
    const { leadId } = body

    if (!leadId) {
      return NextResponse.json({ error: 'leadId é obrigatório' }, { status: 400 })
    }

    const repo = new InMemoryCRMAdapter()

    const leadResult = await repo.buscarLeadPorId(leadId)
    if (leadResult.isFail) return NextResponse.json({ error: leadResult.error.message }, { status: 400 })
    if (!leadResult.value) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })

    if (leadResult.value.propriedadeId !== propertyId) {
      return NextResponse.json({ error: 'Acesso negado a este lead' }, { status: 403 })
    }

    const useCase = new ReactivateColdLeadUseCase(repo, async () => {})
    const result = await useCase.execute(leadId, new Date())

    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ messageId: `reactivate_${leadId}_${Date.now()}` }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } })
