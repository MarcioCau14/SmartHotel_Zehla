import { Result } from '../../../shared/Result'
import { Review } from '../../../domain/marketing/entities/Review'
import { Conteudo } from '../../../domain/marketing/entities/Conteudo'
import { IReviewPort } from '../ports/IReviewPort'
import { IConteudoPort } from '../ports/IConteudoPort'
import { IReservaReadOnlyPort } from '../ports/IReservaReadOnlyPort'

export class ResponderReviewPortalUseCase {
  constructor(
    private readonly reviewPort: IReviewPort,
    private readonly conteudoPort: IConteudoPort,
    private readonly reservaReadOnlyPort: IReservaReadOnlyPort,
  ) {}

  async execute(dados: {
    reviewId: string
    propriedadeId: string
    textoResposta: string
    tom: string
  }): Promise<Result<{ review: Review; conteudo: Conteudo }, Error>> {
    const reviewResult = await this.reviewPort.buscarReviewPorId(dados.reviewId, dados.propriedadeId)
    if (reviewResult.isFail) return Result.fail(reviewResult.error)
    const review = reviewResult.value
    if (!review) return Result.fail(new Error('REVIEW_NOT_FOUND'))

    if (review.status === 'respondido' || review.status === 'publicado') {
      return Result.fail(new Error('REVIEW_ALREADY_RESPONDED'))
    }

    const conteudoResult = await this.conteudoPort.criarConteudo({
      texto: dados.textoResposta,
      tom: dados.tom,
    })
    if (conteudoResult.isFail) return Result.fail(conteudoResult.error)

    const responderResult = review.responder(dados.textoResposta, dados.tom)
    if (responderResult.isFail) return Result.fail(responderResult.error)

    const atualizado = await this.reviewPort.responderReview(dados.reviewId, dados.propriedadeId, dados.textoResposta, dados.tom)
    if (atualizado.isFail) return Result.fail(atualizado.error)

    return Result.ok({ review: atualizado.value, conteudo: conteudoResult.value })
  }
}
