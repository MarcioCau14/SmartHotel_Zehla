import { NextRequest, NextResponse } from 'next/server'
import { withApiSecurity } from '@/lib/server/with-api-security'
import { authenticateRequest } from '@/infrastructure/http/auth/jwtAuth'
import { PrismaCRMRepository } from '@/infrastructure/persistence/crm/PrismaCRMRepository'
import { FarmerReactivationService } from '@/domain/crm/services/FarmerReactivationService'
import { PIIScanner } from '@/domain/security/services/PIIScanner'
import { CRMPipelineStage } from '@/domain/crm/models/CRMPipelineStage'

async function _GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 })
    }

    const propertyId = auth.value.pousadaId
    const repo = new PrismaCRMRepository()
    const farmerService = new FarmerReactivationService()

    const allStages = Object.values(CRMPipelineStage)
    const candidates: Array<{
      leadId: string
      guestName: string
      daysSinceCheckout: number
      expectedValueUsd: number
      telefone: string
    }> = []

    for (const stage of allStages) {
      const leadsResult = await repo.listarLeadsPorStage(stage)
      if (leadsResult.isFail) continue

      for (const lead of leadsResult.value) {
        if (lead.propriedadeId !== propertyId) continue

        const result = farmerService.execute(lead, [], new Date())
        if (result.isFail || !result.value) continue

        candidates.push({
          leadId: lead.id,
          guestName: lead.nome,
          daysSinceCheckout: result.value.daysSinceCheckout,
          expectedValueUsd: lead.totalSpentUsd,
          telefone: PIIScanner.tokenize(lead.telefone).tokenized,
        })
      }
    }

    return NextResponse.json(candidates, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 60, windowSeconds: 60 } })
