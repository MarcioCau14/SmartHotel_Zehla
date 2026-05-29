import { Result } from '../../../shared/Result'
import { Sentimento } from '../../../domain/marketing/value-objects/Sentimento'
import { CanalDistribuicao } from '../../../domain/marketing/value-objects/CanalDistribuicao'
import { Review } from '../../../domain/marketing/entities/Review'
import { IReviewPort } from '../ports/IReviewPort'

export interface ZcpHandoffPackage {
  tipo: string
  needsEscalation: boolean
  payload: Record<string, unknown>
}

export class ProcessarWebhookReviewUseCase {
  constructor(private readonly reviewPort: IReviewPort) {}

  async execute(dados: {
    propriedadeId: string
    portal: string
    hospedeNome: string
    nota: number
    texto: string
    dataEstadia: Date
    quartoId?: string
  }): Promise<Result<{
    review: Review
    sentimento: Sentimento
    handoff?: ZcpHandoffPackage
  }, Error>> {
    const portalResult = CanalDistribuicao.criar(dados.portal)
    if (portalResult.isFail) return Result.fail(portalResult.error)
    if (!portalResult.value.isReadOnly) {
      return Result.fail(new Error('Apenas portais externos podem enviar webhook de review'))
    }

    const sentimentoResult = Sentimento.criar(dados.nota)
    if (sentimentoResult.isFail) return Result.fail(sentimentoResult.error)

    const reviewResult = await this.reviewPort.receberReview({
      propriedadeId: dados.propriedadeId,
      hospedeNome: dados.hospedeNome,
      portal: dados.portal,
      nota: dados.nota,
      texto: dados.texto,
      dataEstadia: dados.dataEstadia,
      quartoId: dados.quartoId,
    })
    if (reviewResult.isFail) return Result.fail(reviewResult.error)

    const review = reviewResult.value

    let handoff: ZcpHandoffPackage | undefined
    if (review.sentimento.isCritico) {
      handoff = {
        tipo: 'abrir_tarefa',
        needsEscalation: true,
        payload: {
          reviewId: review.id,
          problemaRelatado: review.texto,
          quartoId: review.quartoId,
          dataEstadia: review.dataEstadia.toISOString(),
          portal: dados.portal,
        },
      }
    }

    return Result.ok({ review, sentimento: sentimentoResult.value, handoff })
  }
}
