import { NextRequest, NextResponse } from 'next/server'
import { getBasePrisma } from '../../../../lib/prisma'
import { authenticateRequest } from '../../../../infrastructure/http/auth/jwtAuth'
import { PrismaFeedbackRepository } from '../../../../infrastructure/persistence/hospitalidade/PrismaFeedbackRepository'
import { PrismaHospedeRepository } from '../../../../infrastructure/persistence/hospitalidade/PrismaHospedeRepository'
import { PrismaQuartoRepository } from '../../../../infrastructure/persistence/hospitalidade/PrismaQuartoRepository'
import { PrismaReservaRepository } from '../../../../infrastructure/persistence/hospitalidade/PrismaReservaRepository'
import { PrismaServicoRepository } from '../../../../infrastructure/persistence/hospitalidade/PrismaServicoRepository'
import { CreateReservaUseCase } from '../../../../application/hospitalidade/use-cases/CreateReservaUseCase'
import { ConfirmarReservaUseCase } from '../../../../application/hospitalidade/use-cases/ConfirmarReservaUseCase'
import { CancelarReservaUseCase } from '../../../../application/hospitalidade/use-cases/CancelarReservaUseCase'
import { EscalacaoUseCase } from '../../../../application/hospitalidade/ze-concierge/EscalacaoUseCase'
import { HMACValidator } from '../../../../infrastructure/hardening/HMACValidator'
import { ZeConcierge } from '../../../../application/hospitalidade/ze-concierge/ZeConcierge'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const session = authResult.value
    const propertyId = session.pousadaId

    const body = await request.json()
    const { intent, messageId, guestId, channel, payload } = body || {}

    if (!intent) {
      return NextResponse.json({ error: 'Missing intent parameter' }, { status: 400 })
    }

    // Instanciação manual de dependências com isolamento de tenant
    const basePrisma = getBasePrisma()
    const hospedeRepo = new PrismaHospedeRepository(basePrisma, propertyId)
    const reservaRepo = new PrismaReservaRepository(basePrisma, propertyId)
    const quartoRepo = new PrismaQuartoRepository(basePrisma, propertyId)
    const servicoRepo = new PrismaServicoRepository(basePrisma, propertyId)
    const feedbackRepo = new PrismaFeedbackRepository(basePrisma, propertyId)

    const createUC = new CreateReservaUseCase(reservaRepo, hospedeRepo, quartoRepo)
    const confirmarUC = new ConfirmarReservaUseCase(reservaRepo)
    const cancelarUC = new CancelarReservaUseCase(reservaRepo)
    const escalacaoUC = new EscalacaoUseCase(new HMACValidator(), process.env.ZCP_SECRET ?? 'zehla_secret_zcp_2026')

    const concierge = new ZeConcierge(
      hospedeRepo,
      reservaRepo,
      quartoRepo,
      servicoRepo,
      feedbackRepo,
      createUC,
      confirmarUC,
      cancelarUC,
      escalacaoUC
    )

    const output = await concierge.processIntent({
      intent,
      messageId: messageId || `api-${Date.now()}`,
      guestId,
      channel: channel || 'api',
      payload: payload || {}
    })

    return NextResponse.json(output, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
