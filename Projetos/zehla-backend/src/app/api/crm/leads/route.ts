import { NextRequest, NextResponse } from 'next/server'
import { withApiSecurity } from '@/lib/server/with-api-security'
import { authenticateRequest } from '@/infrastructure/http/auth/jwtAuth'
import { PrismaCRMRepository } from '@/infrastructure/persistence/crm/PrismaCRMRepository'
import { GetLeadsKanbanUseCase } from '@/application/crm/use-cases/GetLeadsKanbanUseCase'
import { UpdateLeadStageUseCase } from '@/application/crm/use-cases/UpdateLeadStageUseCase'
import { PIIScanner } from '@/domain/security/services/PIIScanner'

async function _GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 })
    }

    const propertyId = auth.value.pousadaId
    const repo = new PrismaCRMRepository()
    const useCase = new GetLeadsKanbanUseCase(repo)

    const result = await useCase.execute(propertyId)
    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    const sanitizedColumns = result.value.columns.map((col) => ({
      ...col,
      leads: col.leads.map((lead) => ({
        ...lead,
        telefone: PIIScanner.tokenize(lead.telefone).tokenized,
        email: lead.email ? PIIScanner.tokenize(lead.email).tokenized : undefined,
      })),
    }))

    return NextResponse.json({ columns: sanitizedColumns }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function _PATCH(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 })
    }

    const propertyId = auth.value.pousadaId
    const body = await req.json()
    const { leadId, stage } = body

    if (!leadId || !stage) {
      return NextResponse.json({ error: 'leadId e stage são obrigatórios' }, { status: 400 })
    }

    const repo = new PrismaCRMRepository()
    const useCase = new UpdateLeadStageUseCase(repo)

    const result = await useCase.execute(leadId, stage, propertyId)
    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json(result.value, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } })
export const PATCH = withApiSecurity(_PATCH, { rateLimit: { limit: 50, windowSeconds: 60 } })
