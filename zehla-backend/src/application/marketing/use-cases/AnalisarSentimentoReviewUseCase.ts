import { Result } from '../../../shared/Result'
import { Sentimento } from '../../../domain/marketing/value-objects/Sentimento'
import { Review } from '../../../domain/marketing/entities/Review'
import { IReviewPort } from '../ports/IReviewPort'

export class AnalisarSentimentoReviewUseCase {
  constructor(private readonly reviewPort: IReviewPort) {}

  async execute(dados: {
    reviewId: string
    propriedadeId: string
  }): Promise<Result<{ review: Review; sentimento: Sentimento } & { precisaHandoff: boolean; taskSugerida?: string }, Error>> {
    const reviewResult = await this.reviewPort.buscarReviewPorId(dados.reviewId, dados.propriedadeId)
    if (reviewResult.isFail) return Result.fail(reviewResult.error)
    const review = reviewResult.value
    if (!review) return Result.fail(new Error('REVIEW_NOT_FOUND'))

    const sentimentoResult = Sentimento.criar(review.nota)
    if (sentimentoResult.isFail) return Result.fail(sentimentoResult.error)

    const analisadoResult = review.analisar()
    if (analisadoResult.isFail) return Result.fail(analisadoResult.error)

    const atualizado = await this.reviewPort.atualizarStatus(dados.reviewId, dados.propriedadeId, 'analisado')
    if (atualizado.isFail) return Result.fail(atualizado.error)

    const precisaHandoff = review.sentimento.isCritico

    return Result.ok({
      review: atualizado.value,
      sentimento: sentimentoResult.value,
      precisaHandoff,
      taskSugerida: precisaHandoff ? `Abrir manutenção para revisão crítica - ${review.quartoId ? `quarto ${review.quartoId}` : 'área não especificada'}` : undefined,
    })
  }
}
