import { NextRequest, NextResponse } from 'next/server'
import { getBasePrisma } from '../../../../lib/prisma'
import { authenticateRequest } from '../../../../infrastructure/http/auth/jwtAuth'
import { PrismaReviewRepository } from '../../../../infrastructure/persistence/marketing/PrismaReviewRepository'
import { PrismaConteudoRepository } from '../../../../infrastructure/persistence/marketing/PrismaConteudoRepository'
import { PrismaMetricaRepository } from '../../../../infrastructure/persistence/marketing/PrismaMetricaRepository'
import { PrismaPostRepository } from '../../../../infrastructure/persistence/marketing/PrismaPostRepository'
import { PrismaCampanhaRepository } from '../../../../infrastructure/persistence/marketing/PrismaCampanhaRepository'
import { PrismaReservaRepository } from '../../../../infrastructure/persistence/hospitalidade/PrismaReservaRepository'
import { AnalisarSentimentoReviewUseCase } from '../../../../application/marketing/use-cases/AnalisarSentimentoReviewUseCase'
import { ResponderReviewPortalUseCase } from '../../../../application/marketing/use-cases/ResponderReviewPortalUseCase'
import { CriarCampanhaRemarketingUseCase } from '../../../../application/marketing/use-cases/CriarCampanhaRemarketingUseCase'
import { AgendarPostUseCase } from '../../../../application/marketing/use-cases/AgendarPostUseCase'
import { CalcularMetricasMarketingUseCase } from '../../../../application/marketing/use-cases/CalcularMetricasMarketingUseCase'
import { ProcessarWebhookReviewUseCase } from '../../../../application/marketing/use-cases/ProcessarWebhookReviewUseCase'
import { ZeMarketerCognitiveService } from '../../../../application/marketing/cognitive/ZeMarketerCognitiveService'
import { ZeMarketerIntent } from '../../../../application/marketing/cognitive/ZeMarketerCognitiveTypes'
import { Result } from '../../../../domain/shared/Result'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const session = authResult.value
    const propertyId = session.pousadaId

    const body = await request.json()
    const { intent, params } = body || {}

    if (!intent) {
      return NextResponse.json({ error: 'Missing intent parameter' }, { status: 400 })
    }

    // Instanciação manual de dependências com isolamento de tenant usando basePrisma
    const basePrisma = getBasePrisma()
    const reviewRepo = new PrismaReviewRepository(basePrisma)
    const conteudoRepo = new PrismaConteudoRepository(basePrisma)
    const postRepo = new PrismaPostRepository(basePrisma)
    const metricaRepo = new PrismaMetricaRepository(basePrisma)
    const campanhaRepo = new PrismaCampanhaRepository(basePrisma)

    // Repositório de reserva real adaptado para a leitura cross-context
    const reservaRepo = new PrismaReservaRepository(basePrisma, propertyId)
    const readOnlyReservaPort = {
      buscarPorId: async (id: string) => {
        const result = await reservaRepo.getById(id)
        if (result.isFail) return null
        const res = result.value
        return {
          id: res.id,
          hospedeNome: 'Hóspede',
          dataCheckIn: res.periodo.dataInicio,
          dataCheckOut: res.periodo.dataFim,
          quartoId: res.roomId
        }
      }
    }

    const analisarSentimentoUC = new AnalisarSentimentoReviewUseCase(reviewRepo)
    const responderReviewUC = new ResponderReviewPortalUseCase(reviewRepo, conteudoRepo, readOnlyReservaPort)
    const criarCampanhaUC = new CriarCampanhaRemarketingUseCase(campanhaRepo, conteudoRepo)
    const agendarPostUC = new AgendarPostUseCase(postRepo, conteudoRepo)
    const calcularMetricasUC = new CalcularMetricasMarketingUseCase(reviewRepo, metricaRepo)
    const processarWebhookUC = new ProcessarWebhookReviewUseCase(reviewRepo)

    const marketerService = new ZeMarketerCognitiveService(
      analisarSentimentoUC,
      responderReviewUC,
      criarCampanhaUC,
      agendarPostUC,
      calcularMetricasUC,
      processarWebhookUC
    )

    // Ajuste de parâmetros padrão injetando propriedadeId silenciosamente para RLS
    const finalParams = {
      ...params,
      propriedadeId: propertyId
    }

    // ZeMarketerIntent do Next.js
    const mappedIntent = intent as ZeMarketerIntent

    const result = await marketerService.processarIntencao(mappedIntent, finalParams)

    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json(result.value, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
