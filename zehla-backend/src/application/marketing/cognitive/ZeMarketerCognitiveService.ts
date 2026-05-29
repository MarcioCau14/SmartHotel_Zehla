import { Result } from '../../../shared/Result'
import {
  ZeMarketerIntent,
  ZcpHandoffPackage,
  ReviewAnalisada,
  ReviewRespondida,
  CampanhaCriada,
  PostAgendado,
  MetricasCalculadas,
  WebhookProcessado,
  buildHandoff,
  translateError,
} from './ZeMarketerCognitiveTypes'
import { Sentimento } from '../../../domain/marketing/value-objects/Sentimento'
import { AnalisarSentimentoReviewUseCase } from '../use-cases/AnalisarSentimentoReviewUseCase'
import { ResponderReviewPortalUseCase } from '../use-cases/ResponderReviewPortalUseCase'
import { CriarCampanhaRemarketingUseCase } from '../use-cases/CriarCampanhaRemarketingUseCase'
import { AgendarPostUseCase } from '../use-cases/AgendarPostUseCase'
import { CalcularMetricasMarketingUseCase } from '../use-cases/CalcularMetricasMarketingUseCase'
import { ProcessarWebhookReviewUseCase } from '../use-cases/ProcessarWebhookReviewUseCase'

export class ZeMarketerCognitiveService {
  constructor(
    private readonly analisarSentimentoUC: AnalisarSentimentoReviewUseCase,
    private readonly responderReviewUC: ResponderReviewPortalUseCase,
    private readonly criarCampanhaUC: CriarCampanhaRemarketingUseCase,
    private readonly agendarPostUC: AgendarPostUseCase,
    private readonly calcularMetricasUC: CalcularMetricasMarketingUseCase,
    private readonly processarWebhookUC: ProcessarWebhookReviewUseCase,
  ) {}

  async processarIntencao(
    intent: ZeMarketerIntent,
    params: Record<string, unknown>,
  ): Promise<Result<
    { dados: ReviewAnalisada | ReviewRespondida | CampanhaCriada | PostAgendado | MetricasCalculadas | WebhookProcessado; handoff?: ZcpHandoffPackage },
    Error
  >> {
    try {
      switch (intent) {
        case ZeMarketerIntent.ANALISAR_SENTIMENTO_REVIEW:
          return await this.handleAnalisarSentimento(params as any)
        case ZeMarketerIntent.RESPONDER_REVIEW:
          return await this.handleResponderReview(params as any)
        case ZeMarketerIntent.CRIAR_CAMPANHA_REMARKETING:
          return await this.handleCriarCampanha(params as any)
        case ZeMarketerIntent.AGENDAR_POST:
          return await this.handleAgendarPost(params as any)
        case ZeMarketerIntent.CALCULAR_METRICAS_MARKETING:
          return await this.handleCalcularMetricas(params as any)
        case ZeMarketerIntent.PROCESSAR_WEBHOOK_REVIEW:
          return await this.handleProcessarWebhook(params as any)
        default:
          return Result.fail(new Error('INTENT_NOT_RECOGNIZED'))
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro inesperado no Zé-Marketer'
      return Result.fail(new Error(msg))
    }
  }

  private async handleAnalisarSentimento(params: {
    reviewId: string
    propriedadeId: string
  }): Promise<Result<{ dados: ReviewAnalisada; handoff?: ZcpHandoffPackage }, Error>> {
    const result = await this.analisarSentimentoUC.execute({
      reviewId: params.reviewId,
      propriedadeId: params.propriedadeId,
    })
    if (result.isFail) return Result.fail(new Error(translateError(result.error)))

    const { review, sentimento, precisaHandoff, taskSugerida } = result.value

    let handoff: ZcpHandoffPackage | undefined
    if (precisaHandoff) {
      handoff = buildHandoff('abrir_tarefa', 'ZeOps', {
        reviewId: review.id,
        problemaRelatado: review.texto,
        quartoId: review.quartoId,
        dataEstadia: review.dataEstadia.toISOString(),
        taskSugerida: taskSugerida,
      })
    }

    return Result.ok({
      dados: {
        reviewId: review.id,
        sentimento: sentimento.value,
        nota: review.nota,
        precisaHandoff,
        taskSugerida,
      },
      handoff,
    })
  }

  private async handleResponderReview(params: {
    reviewId: string
    propriedadeId: string
    textoResposta: string
    tom: string
  }): Promise<Result<{ dados: ReviewRespondida }, Error>> {
    const result = await this.responderReviewUC.execute({
      reviewId: params.reviewId,
      propriedadeId: params.propriedadeId,
      textoResposta: params.textoResposta,
      tom: params.tom,
    })
    if (result.isFail) return Result.fail(new Error(translateError(result.error)))

    return Result.ok({
      dados: {
        reviewId: result.value.review.id,
        conteudoId: result.value.conteudo.id,
        tom: result.value.conteudo.tom,
      },
    })
  }

  private async handleCriarCampanha(params: {
    propriedadeId: string
    nome: string
    publicoAlvo: string
    tipo: string
    textoConteudo: string
    tom: string
    dataInicio: Date
    dataFim: Date
    possuiPromiseFinanceira?: boolean
    promiseFinanceiraValidada?: boolean
  }): Promise<Result<{ dados: CampanhaCriada; handoff?: ZcpHandoffPackage }, Error>> {
    if (params.possuiPromiseFinanceira && !params.promiseFinanceiraValidada) {
      const handoff = buildHandoff('validar_desconto', 'ZeAnalyst', {
        nomeCampanha: params.nome,
        publicoAlvo: params.publicoAlvo,
        textoConteudo: params.textoConteudo,
        valorSugerido: null,
      })

      return Result.ok({
        dados: {
          campanhaId: '',
          conteudoId: '',
          possuiPromiseFinanceira: true,
          precisaHandoffAnalyst: true,
        },
        handoff,
      })
    }

    const result = await this.criarCampanhaUC.execute({
      propriedadeId: params.propriedadeId,
      nome: params.nome,
      publicoAlvo: params.publicoAlvo,
      tipo: params.tipo,
      textoConteudo: params.textoConteudo,
      tom: params.tom,
      dataInicio: params.dataInicio,
      dataFim: params.dataFim,
      possuiPromiseFinanceira: params.possuiPromiseFinanceira,
      promiseFinanceiraValidada: params.promiseFinanceiraValidada,
    })
    if (result.isFail) return Result.fail(new Error(translateError(result.error)))

    return Result.ok({
      dados: {
        campanhaId: result.value.campanha.id,
        conteudoId: result.value.conteudo.id,
        possuiPromiseFinanceira: false,
        precisaHandoffAnalyst: false,
      },
    })
  }

  private async handleAgendarPost(params: {
    propriedadeId: string
    canal: string
    tipo: string
    texto: string
    tom: string
    midias?: string[]
    dataAgendamento?: Date
  }): Promise<Result<{ dados: PostAgendado }, Error>> {
    const result = await this.agendarPostUC.execute({
      propriedadeId: params.propriedadeId,
      canal: params.canal,
      tipo: params.tipo,
      texto: params.texto,
      tom: params.tom,
      midias: params.midias,
      dataAgendamento: params.dataAgendamento,
    })
    if (result.isFail) return Result.fail(new Error(translateError(result.error)))

    return Result.ok({
      dados: {
        postId: result.value.post.id,
        canal: result.value.post.canal.value,
        dataAgendamento: result.value.post.dataAgendamento,
      },
    })
  }

  private async handleCalcularMetricas(params: {
    propriedadeId: string
    dataInicio: Date
    dataFim: Date
  }): Promise<Result<{ dados: MetricasCalculadas }, Error>> {
    const result = await this.calcularMetricasUC.execute({
      propriedadeId: params.propriedadeId,
      dataInicio: params.dataInicio,
      dataFim: params.dataFim,
    })
    if (result.isFail) return Result.fail(new Error(translateError(result.error)))

    return Result.ok({
      dados: {
        metricaId: result.value.id,
        totalReviews: result.value.totalReviews,
        notaMedia: result.value.notaMedia,
      },
    })
  }

  private async handleProcessarWebhook(params: {
    propriedadeId: string
    portal: string
    hospedeNome: string
    nota: number
    texto: string
    dataEstadia: Date
    quartoId?: string
  }): Promise<Result<{ dados: WebhookProcessado; handoff?: ZcpHandoffPackage }, Error>> {
    const sentimentoCheck = Sentimento.criar(params.nota)
    if (sentimentoCheck.isFail) return Result.fail(new Error(translateError(sentimentoCheck.error)))

    const result = await this.processarWebhookUC.execute({
      propriedadeId: params.propriedadeId,
      portal: params.portal,
      hospedeNome: params.hospedeNome,
      nota: params.nota,
      texto: params.texto,
      dataEstadia: params.dataEstadia,
      quartoId: params.quartoId,
    })
    if (result.isFail) return Result.fail(new Error(translateError(result.error)))

    return Result.ok({
      dados: {
        reviewId: result.value.review.id,
        sentimento: result.value.sentimento.value,
        portal: params.portal,
        handoff: result.value.handoff
          ? { ...result.value.handoff, destino: 'ZeOps', needsEscalation: true }
          : undefined,
      },
      handoff: result.value.handoff
        ? { ...result.value.handoff, destino: 'ZeOps', needsEscalation: true }
        : undefined,
    })
  }
}
