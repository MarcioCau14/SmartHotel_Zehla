import { NextRequest, NextResponse } from 'next/server'
import { withApiSecurity } from '@/lib/server/with-api-security'
import { authenticateRequest } from '@/infrastructure/http/auth/jwtAuth'
import { CommercialStrategyService } from '@/domain/crm/services/CommercialStrategyService'
import { LeadProfile } from '@/domain/crm/models/LeadProfile'
import {
  PLANOS,
  CONVERSION_RATES,
  ESTRATEGIAS_REGIONAIS,
  LGPD_CLASSIFICACOES,
  BENCHMARK_CONCORRENTES,
  MarketIntelligence,
} from '@/domain/crm/models/MarketIntelligence'
import { CRMPipelineStage, ICPersona } from '@/domain/crm/models/CRMPipelineStage'

const strategyService = new CommercialStrategyService()

async function _GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 })
    }

    return NextResponse.json({
      planos: PLANOS,
      conversao: CONVERSION_RATES,
      estrategiasRegionais: ESTRATEGIAS_REGIONAIS,
      lgpd: LGPD_CLASSIFICACOES,
      benchmark: BENCHMARK_CONCORRENTES,
      diferencialCompetitivo: MarketIntelligence.diferencialCompetitivo(),
    }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function _POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 })
    }

    const body = await req.json()
    const isBatch = Array.isArray(body.leads)

    if (isBatch) {
      if (!body.leads?.length) {
        return NextResponse.json({ error: 'leads é obrigatório' }, { status: 400 })
      }

      const recommendations = body.leads.map((lead: Record<string, unknown>) => {
        const profileResult = LeadProfile.create({
          id: lead.id as string,
          nome: (lead.nome as string) ?? '',
          telefone: (lead.telefone as string) ?? '',
          canalOrigem: (lead.canalOrigem as string) ?? 'ligacao_fria',
          ltvScore: (lead.ltvScore as number) ?? 0,
          stage: CRMPipelineStage.ENTRADA,
          createdAt: new Date(),
          propriedadeId: auth.value.pousadaId,
          persona: ICPersona.DESCONHECIDO,
          tags: (lead.tags as string[]) ?? [],
          email: lead.email as string | undefined,
          totalSpentUsd: (lead.totalSpentUsd as number) ?? 0,
          staysCount: (lead.staysCount as number) ?? 0,
          updatedAt: new Date(),
        })

        if (profileResult.isFail) return null
        return strategyService.recomendarPlano(profileResult.value)
      })

      const valid = recommendations.filter((r: unknown) => r !== null && r !== undefined)
      return NextResponse.json(valid, { status: 200 })
    }

    if (!body.nome) {
      return NextResponse.json({ error: 'nome é obrigatório' }, { status: 400 })
    }

      const profileResult = LeadProfile.create({
        id: body.leadId ?? `temp_${Date.now()}`,
        nome: body.nome,
        telefone: body.telefone ?? '',
        canalOrigem: body.canalOrigem ?? 'ligacao_fria',
        ltvScore: body.ltvScore ?? 0,
        stage: CRMPipelineStage.ENTRADA,
        createdAt: new Date(),
        propriedadeId: auth.value.pousadaId,
        persona: ICPersona.DESCONHECIDO,
        tags: body.tags ?? [],
        email: body.email,
        totalSpentUsd: body.totalSpentUsd ?? 0,
        staysCount: body.staysCount ?? 0,
        updatedAt: new Date(),
      })

    if (profileResult.isFail) {
      return NextResponse.json({ error: profileResult.error.message }, { status: 400 })
    }

    const result = strategyService.recomendarPlano(profileResult.value)
    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json(result.value, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 50, windowSeconds: 60 } })
export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } })
