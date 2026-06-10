import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '../../../../../infrastructure/http/auth/jwtAuth'
import { ExecutarCampanhaMassaUseCase } from '../../../../../application/marketing/use-cases/ExecutarCampanhaMassaUseCase'
import { CampaignOrchestrator } from '../../../../../domain/marketing/services/CampaignOrchestrator'
import { PrismaCampanhaRepository } from '../../../../../infrastructure/persistence/marketing/PrismaCampanhaRepository'
import { getBasePrisma } from '../../../../../lib/prisma'
import { campaignOutboundQueue } from '../../../../../lib/queues'
import { rateLimit } from '../../../../../lib/security/rate-limit'

const DISPATCH_WINDOW_SECONDS = 600
const DISPATCH_MAX_PER_WINDOW = 1

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const session = authResult.value
    const propertyId = session.pousadaId

    const rlResult = await rateLimit(`dispatch:${propertyId}`, DISPATCH_MAX_PER_WINDOW, DISPATCH_WINDOW_SECONDS)
    if (!rlResult.success) {
      return NextResponse.json({
        error: 'Muitas requisições. Limite de 1 disparo a cada 10 minutos por propriedade.',
        code: 'RATE_LIMITED',
        retryAfter: rlResult.reset - Math.floor(Date.now() / 1000),
      }, {
        status: 429,
        headers: { 'Retry-After': String(rlResult.reset - Math.floor(Date.now() / 1000)) },
      })
    }

    const body = await request.json()
    const { campanhaId, segmentFilter, templateId, templateVariables, schedule, recipients } = body || {}

    if (!campanhaId) {
      return NextResponse.json({ error: 'campanhaId é obrigatório' }, { status: 400 })
    }
    if (!templateId) {
      return NextResponse.json({ error: 'templateId é obrigatório' }, { status: 400 })
    }
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'recipients é obrigatório' }, { status: 400 })
    }

    const campanhaRepo = new PrismaCampanhaRepository(getBasePrisma())
    const orchestrator = new CampaignOrchestrator()
    const useCase = new ExecutarCampanhaMassaUseCase(
      campanhaRepo,
      orchestrator,
      campaignOutboundQueue,
    )

    const result = await useCase.execute({
      propriedadeId: propertyId,
      campanhaId,
      segmentFilter: segmentFilter || { type: 'todos' },
      templateId,
      templateVariables: templateVariables || {},
      schedule: schedule || {
        startAt: new Date(Date.now() + 3600000),
        timezone: 'America/Sao_Paulo',
        sendWindowStart: '09:00',
        sendWindowEnd: '18:00',
      },
      recipients,
    })

    if (result.isFail) {
      const status = result.error.message.includes('CAMPANHA_NAO_ENCONTRADA') ? 404 : 400
      return NextResponse.json({ error: result.error.message }, { status })
    }

    return NextResponse.json(result.value, { status: 202 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
