import { Result } from '../../../shared/Result'
import { Metrica } from '../../../domain/marketing/entities/Metrica'
import { IReviewPort } from '../ports/IReviewPort'
import { IMetricaPort } from '../ports/IMetricaPort'

export class CalcularMetricasMarketingUseCase {
  constructor(
    private readonly reviewPort: IReviewPort,
    private readonly metricaPort: IMetricaPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    dataInicio: Date
    dataFim: Date
  }): Promise<Result<Metrica, Error>> {
    const reviewsResult = await this.reviewPort.listarPorPeriodo(dados.propriedadeId, dados.dataInicio, dados.dataFim)
    if (reviewsResult.isFail) return Result.fail(reviewsResult.error)
    const reviews = reviewsResult.value

    const totalReviews = reviews.length
    const totalRespondidos = reviews.filter(r => r.status === 'respondido' || r.status === 'publicado').length
    const taxaResposta = totalReviews > 0 ? Math.round((totalRespondidos / totalReviews) * 100) : 100

    const notaMedia = totalReviews > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.nota, 0) / totalReviews) * 10) / 10
      : null

    const sentimentoMedio = totalReviews > 0
      ? Math.round((reviews.reduce((acc, r) => acc + (r.nota * 10), 0) / totalReviews))
      : 0

    const metricaResult = await this.metricaPort.registrarMetrica({
      propriedadeId: dados.propriedadeId,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
      notaMedia,
      taxaResposta,
      sentimentoMedio,
      totalReviews,
      totalRespondidos,
    })
    if (metricaResult.isFail) return Result.fail(metricaResult.error)

    return Result.ok(metricaResult.value)
  }
}
