import { Result } from '../../../shared/Result'
import { Review, StatusReview } from '../../../domain/marketing/entities/Review'
import { Sentimento } from '../../../domain/marketing/value-objects/Sentimento'
import { CanalDistribuicao } from '../../../domain/marketing/value-objects/CanalDistribuicao'
import { IReviewPort } from '../../../application/marketing/ports/IReviewPort'

export class ReviewInMemoryRepository implements IReviewPort {
  private reviews: Map<string, Review> = new Map()

  async receberReview(dados: {
    propriedadeId: string; hospedeNome: string; portal: string
    nota: number; texto: string; dataEstadia: Date; quartoId?: string
  }): Promise<Result<Review, Error>> {
    const canalResult = CanalDistribuicao.criar(dados.portal)
    if (canalResult.isFail) return canalResult

    const sentimentoResult = Sentimento.criar(dados.nota)
    if (sentimentoResult.isFail) return sentimentoResult

    const reviewResult = Review.create({
      id: `rev_${this.reviews.size + 1}_${Date.now()}`,
      propriedadeId: dados.propriedadeId,
      hospedeNome: dados.hospedeNome,
      portal: canalResult.value,
      nota: dados.nota,
      texto: dados.texto,
      sentimento: sentimentoResult.value,
      dataEstadia: dados.dataEstadia,
      quartoId: dados.quartoId,
    })
    if (reviewResult.isFail) return reviewResult
    this.reviews.set(reviewResult.value.id, reviewResult.value)
    return Result.ok(reviewResult.value)
  }

  async buscarReviewPorId(id: string, propriedadeId: string): Promise<Result<Review | null, Error>> {
    const review = this.reviews.get(id)
    if (!review || review.propriedadeId !== propriedadeId) return Result.ok(null)
    return Result.ok(review)
  }

  async listarPorSentimento(sentimento: Sentimento, propriedadeId: string): Promise<Result<Review[], Error>> {
    const lista = Array.from(this.reviews.values()).filter(
      r => r.propriedadeId === propriedadeId && r.sentimento.value === sentimento.value,
    )
    return Result.ok(lista)
  }

  async listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Review[], Error>> {
    const lista = Array.from(this.reviews.values()).filter(
      r => r.propriedadeId === propriedadeId && r.dataEstadia >= dataInicio && r.dataEstadia <= dataFim,
    )
    return Result.ok(lista)
  }

  async responderReview(id: string, propriedadeId: string, textoResposta: string, tom: string): Promise<Result<Review, Error>> {
    const review = this.reviews.get(id)
    if (!review || review.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('REVIEW_NOT_FOUND'))
    }
    const updated = review.responder(textoResposta, tom)
    if (updated.isFail) return updated
    this.reviews.set(id, updated.value)
    return Result.ok(updated.value)
  }

  async calcularNotaMedia(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<number, Error>> {
    const lista = Array.from(this.reviews.values()).filter(
      r => r.propriedadeId === propriedadeId && r.dataEstadia >= dataInicio && r.dataEstadia <= dataFim,
    )
    if (lista.length === 0) return Result.ok(0)
    const soma = lista.reduce((acc, r) => acc + r.nota, 0)
    return Result.ok(Math.round((soma / lista.length) * 10) / 10)
  }

  async listarPorStatus(status: StatusReview, propriedadeId: string): Promise<Result<Review[], Error>> {
    const lista = Array.from(this.reviews.values()).filter(
      r => r.propriedadeId === propriedadeId && r.status === status,
    )
    return Result.ok(lista)
  }

  async atualizarStatus(id: string, propriedadeId: string, status: StatusReview): Promise<Result<Review, Error>> {
    const review = this.reviews.get(id)
    if (!review || review.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('REVIEW_NOT_FOUND'))
    }
    const updated = Review.create({
      id: review.id, propriedadeId: review.propriedadeId,
      hospedeNome: review.hospedeNome, portal: review.portal,
      nota: review.nota, texto: review.texto, sentimento: review.sentimento,
      status, dataEstadia: review.dataEstadia,
      resposta: review.resposta, tom: review.tom,
      quartoId: review.quartoId,
      dataCriacao: review.dataCriacao,
    })
    if (updated.isFail) return updated
    this.reviews.set(id, updated.value)
    return Result.ok(updated.value)
  }
}
