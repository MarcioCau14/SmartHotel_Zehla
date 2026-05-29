import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { IReviewPort } from '../../../application/marketing/ports/IReviewPort'
import { Review, StatusReview } from '../../../domain/marketing/entities/Review'
import { CanalDistribuicao } from '../../../domain/marketing/value-objects/CanalDistribuicao'
import { Sentimento } from '../../../domain/marketing/value-objects/Sentimento'

export class PrismaReviewRepository implements IReviewPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toData(review: Review): any {
    return {
      id: review.id,
      pousadaId: review.propriedadeId,
      hospedeNome: review.hospedeNome,
      portal: review.portal.value,
      nota: review.nota,
      texto: review.texto,
      sentimento: review.sentimento.value,
      resposta: review.resposta,
      tom: review.tom,
      status: review.status,
      dataEstadia: review.dataEstadia,
      quartoId: review.quartoId,
      problemaRelatado: review.problemaRelatado,
      dataCriacao: review.dataCriacao,
    }
  }

  private async hydrate(row: any): Promise<Result<Review, Error>> {
    try {
      const portalResult = CanalDistribuicao.criar(row.portal)
      if (portalResult.isFail) return Result.fail(portalResult.error)

      const sentimentoResult = Sentimento.criar(row.nota)
      if (sentimentoResult.isFail) return Result.fail(sentimentoResult.error)

      const result = Review.create({
        id: row.id,
        propriedadeId: row.pousadaId,
        hospedeNome: row.hospedeNome,
        portal: portalResult.value,
        nota: row.nota,
        texto: row.texto,
        sentimento: sentimentoResult.value,
        resposta: row.resposta ?? null,
        tom: row.tom ?? null,
        status: row.status as StatusReview,
        dataEstadia: row.dataEstadia,
        quartoId: row.quartoId ?? null,
        problemaRelatado: row.problemaRelatado ?? null,
        dataCriacao: row.dataCriacao,
      })
      if (result.isFail) return Result.fail(result.error)
      return Result.ok(result.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar MarketingReview'))
    }
  }

  async receberReview(dados: {
    propriedadeId: string; hospedeNome: string; portal: string
    nota: number; texto: string; dataEstadia: Date; quartoId?: string
  }): Promise<Result<Review, Error>> {
    try {
      const portalResult = CanalDistribuicao.criar(dados.portal)
      if (portalResult.isFail) return Result.fail(portalResult.error)

      const sentimentoResult = Sentimento.criar(dados.nota)
      if (sentimentoResult.isFail) return Result.fail(sentimentoResult.error)

      const id = `mkt_rev_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const reviewResult = Review.create({
        id,
        propriedadeId: dados.propriedadeId,
        hospedeNome: dados.hospedeNome,
        portal: portalResult.value,
        nota: dados.nota,
        texto: dados.texto,
        sentimento: sentimentoResult.value,
        dataEstadia: dados.dataEstadia,
        quartoId: dados.quartoId,
      })
      if (reviewResult.isFail) return reviewResult

      const review = reviewResult.value
      await this.prisma.marketingReview.create({ data: this.toData(review) })
      return Result.ok(review)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao receber review'))
    }
  }

  async buscarReviewPorId(id: string, propriedadeId: string): Promise<Result<Review | null, Error>> {
    try {
      const row = await this.prisma.marketingReview.findFirst({
        where: { id, pousadaId: propriedadeId },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar review'))
    }
  }

  async listarPorSentimento(sentimento: Sentimento, propriedadeId: string): Promise<Result<Review[], Error>> {
    try {
      const rows = await this.prisma.marketingReview.findMany({
        where: { pousadaId: propriedadeId, sentimento: sentimento.value },
        orderBy: { dataCriacao: 'desc' },
      })
      const reviews: Review[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        reviews.push(result.value)
      }
      return Result.ok(reviews)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar reviews por sentimento'))
    }
  }

  async listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Review[], Error>> {
    try {
      const rows = await this.prisma.marketingReview.findMany({
        where: {
          pousadaId: propriedadeId,
          dataEstadia: { gte: dataInicio, lte: dataFim },
        },
        orderBy: { dataCriacao: 'desc' },
      })
      const reviews: Review[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        reviews.push(result.value)
      }
      return Result.ok(reviews)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar reviews por período'))
    }
  }

  async responderReview(id: string, propriedadeId: string, textoResposta: string, tom: string): Promise<Result<Review, Error>> {
    try {
      const row = await this.prisma.marketingReview.findFirst({
        where: { id, pousadaId: propriedadeId },
      })
      if (!row) return Result.fail(new Error('Review não encontrado'))

      const currentResult = await this.hydrate(row)
      if (currentResult.isFail) return currentResult

      const updated = currentResult.value.responder(textoResposta, tom)
      if (updated.isFail) return updated

      await this.prisma.marketingReview.update({
        where: { id },
        data: this.toData(updated.value),
      })
      return Result.ok(updated.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao responder review'))
    }
  }

  async calcularNotaMedia(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<number, Error>> {
    try {
      const aggr = await this.prisma.marketingReview.aggregate({
        where: { pousadaId: propriedadeId, dataEstadia: { gte: dataInicio, lte: dataFim } },
        _avg: { nota: true },
      })
      return Result.ok(aggr._avg.nota ? Math.round(aggr._avg.nota * 10) / 10 : 0)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao calcular nota média'))
    }
  }

  async listarPorStatus(status: StatusReview, propriedadeId: string): Promise<Result<Review[], Error>> {
    try {
      const rows = await this.prisma.marketingReview.findMany({
        where: { pousadaId: propriedadeId, status },
        orderBy: { dataCriacao: 'desc' },
      })
      const reviews: Review[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        reviews.push(result.value)
      }
      return Result.ok(reviews)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar reviews por status'))
    }
  }

  async atualizarStatus(id: string, propriedadeId: string, status: StatusReview): Promise<Result<Review, Error>> {
    try {
      const row = await this.prisma.marketingReview.findFirst({
        where: { id, pousadaId: propriedadeId },
      })
      if (!row) return Result.fail(new Error('Review não encontrado'))

      const currentResult = await this.hydrate(row)
      if (currentResult.isFail) return currentResult

      await this.prisma.marketingReview.update({
        where: { id },
        data: { status },
      })
      return Result.ok(currentResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao atualizar status do review'))
    }
  }
}
