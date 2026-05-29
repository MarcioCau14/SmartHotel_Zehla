import { NextRequest, NextResponse } from 'next/server'
import { getBasePrisma } from '../../../../lib/prisma'
import { authenticateRequest } from '../../../../infrastructure/http/auth/jwtAuth'
import { PrismaLeadRepository } from '../../../../infrastructure/persistence/comercial/PrismaLeadRepository'
import { PrismaPropostaRepository } from '../../../../infrastructure/persistence/comercial/PrismaPropostaRepository'
import { PrismaPacoteRepository } from '../../../../infrastructure/persistence/comercial/PrismaPacoteRepository'
import { PrismaPagamentoRepository } from '../../../../infrastructure/persistence/comercial/PrismaPagamentoRepository'
import { PrismaConversaoRepository } from '../../../../infrastructure/persistence/comercial/PrismaConversaoRepository'
import { CapturarLeadUseCase } from '../../../../application/comercial/use-cases/CapturarLeadUseCase'
import { QualificarLeadUseCase } from '../../../../application/comercial/use-cases/QualificarLeadUseCase'
import { CriarPropostaUseCase } from '../../../../application/comercial/use-cases/CriarPropostaUseCase'
import { AceitarPropostaUseCase } from '../../../../application/comercial/use-cases/AceitarPropostaUseCase'
import { SugerirDescontoUseCase } from '../../../../application/comercial/use-cases/SugerirDescontoUseCase'
import { ConfirmarPagamentoUseCase } from '../../../../application/comercial/use-cases/ConfirmarPagamentoUseCase'
import { ZeSalesCognitiveService } from '../../../../application/comercial/cognitive/ZeSalesCognitiveService'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const session = authResult.value
    const propertyId = session.pousadaId

    const body = await request.json()
    const { intent, messageId, payload } = body || {}

    if (!intent) {
      return NextResponse.json({ error: 'Missing intent parameter' }, { status: 400 })
    }

    // Instanciação manual de dependências com isolamento de tenant usando basePrisma
    const basePrisma = getBasePrisma()
    const leadRepo = new PrismaLeadRepository(basePrisma, propertyId)
    const propostaRepo = new PrismaPropostaRepository(basePrisma, propertyId)
    const pacoteRepo = new PrismaPacoteRepository(basePrisma, propertyId)
    const pagamentoRepo = new PrismaPagamentoRepository(basePrisma, propertyId)
    const conversaoRepo = new PrismaConversaoRepository(basePrisma, propertyId)

    const capturarLeadUC = new CapturarLeadUseCase(leadRepo)
    const qualificarLeadUC = new QualificarLeadUseCase(leadRepo)
    const criarPropostaUC = new CriarPropostaUseCase(propostaRepo, leadRepo, pacoteRepo)
    const aceitarPropostaUC = new AceitarPropostaUseCase(propostaRepo, pagamentoRepo)
    const sugerirDescontoUC = new SugerirDescontoUseCase(propostaRepo, pacoteRepo, leadRepo)
    const confirmarPagamentoUC = new ConfirmarPagamentoUseCase(pagamentoRepo, propostaRepo, leadRepo, conversaoRepo)

    const salesService = new ZeSalesCognitiveService(
      leadRepo,
      propostaRepo,
      pagamentoRepo,
      conversaoRepo,
      capturarLeadUC,
      qualificarLeadUC,
      criarPropostaUC,
      aceitarPropostaUC,
      sugerirDescontoUC,
      confirmarPagamentoUC,
      process.env.ZCP_SECRET ?? 'zehla_secret_zcp_2026'
    )

    const output = await salesService.processIntent({
      intent,
      messageId: messageId || `api-${Date.now()}`,
      propriedadeId: propertyId,
      payload: payload || {}
    })

    if (!output.success) {
      return NextResponse.json(output, { status: 400 })
    }

    return NextResponse.json(output, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
