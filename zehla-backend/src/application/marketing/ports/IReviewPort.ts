import { Result } from '../../../shared/Result'
import { Review, StatusReview } from '../../../domain/marketing/entities/Review'
import { Sentimento } from '../../../domain/marketing/value-objects/Sentimento'

export interface IReviewPort {
  receberReview(dados: {
    propriedadeId: string
    hospedeNome: string
    portal: string
    nota: number
    texto: string
    dataEstadia: Date
    quartoId?: string
  }): Promise<Result<Review, Error>>

  buscarReviewPorId(id: string, propriedadeId: string): Promise<Result<Review | null, Error>>

  listarPorSentimento(sentimento: Sentimento, propriedadeId: string): Promise<Result<Review[], Error>>

  listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Review[], Error>>

  responderReview(id: string, propriedadeId: string, textoResposta: string, tom: string): Promise<Result<Review, Error>>

  calcularNotaMedia(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<number, Error>>

  listarPorStatus(status: StatusReview, propriedadeId: string): Promise<Result<Review[], Error>>

  atualizarStatus(id: string, propriedadeId: string, status: StatusReview): Promise<Result<Review, Error>>
}
