import { NextRequest, NextResponse } from 'next/server'
import { getBasePrisma } from '../../../../lib/prisma'
import { verifyHmacSignature } from '../../../../infrastructure/http/auth/hmacAuth'
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
    const rawBody = await request.text()
    const signature = request.headers.get('X-Payment-Signature') || ''
    const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? 'zehla_payment_webhook_secret_2026'

    // Validação timing-safe de assinatura HMAC
    const verificationResult = verifyHmacSignature(rawBody, signature, secret)
    if (verificationResult.isFail) {
      return NextResponse.json({ error: verificationResult.error.message }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { pagamentoId, propriedadeId } = body || {}

    if (!pagamentoId || !propriedadeId) {
      return NextResponse.json({ error: 'Missing payment metadata' }, { status: 400 })
    }

    // Instanciação manual do Zé-Sales usando basePrisma
    const basePrisma = getBasePrisma()
    const leadRepo = new PrismaLeadRepository(basePrisma, propriedadeId)
    const propostaRepo = new PrismaPropostaRepository(basePrisma, propriedadeId)
    const pacoteRepo = new PrismaPacoteRepository(basePrisma, propriedadeId)
    const pagamentoRepo = new PrismaPagamentoRepository(basePrisma, propriedadeId)
    const conversaoRepo = new PrismaConversaoRepository(basePrisma, propriedadeId)

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
      intent: 'CONFIRMAR_PAGAMENTO',
      messageId: `wh-${Date.now()}`,
      propriedadeId,
      payload: { pagamentoId }
    })

    if (!output.success) {
      return NextResponse.json(output, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      status: 'confirmed',
      output
    }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
