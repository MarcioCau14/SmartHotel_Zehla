import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { IMetricaPort } from '../../../application/marketing/ports/IMetricaPort'
import { Metrica } from '../../../domain/marketing/entities/Metrica'

export class PrismaMetricaRepository implements IMetricaPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(metrica: Metrica): any {
    return {
      id: metrica.id,
      pousadaId: metrica.propriedadeId,
      dataInicio: metrica.dataInicio,
      dataFim: metrica.dataFim,
      notaMedia: metrica.notaMedia,
      taxaResposta: metrica.taxaResposta,
      sentimentoMedio: metrica.sentimentoMedio,
      totalReviews: metrica.totalReviews,
      totalRespondidos: metrica.totalRespondidos,
      totalCampanhas: metrica.totalCampanhas,
      dataCriacao: metrica.dataCriacao,
    }
  }

  private async hydrate(row: any): Promise<Result<Metrica, Error>> {
    try {
      const result = Metrica.create({
        id: row.id,
        propriedadeId: row.pousadaId,
        dataInicio: row.dataInicio,
        dataFim: row.dataFim,
        notaMedia: row.notaMedia ?? null,
        taxaResposta: row.taxaResposta ?? null,
        sentimentoMedio: row.sentimentoMedio ?? null,
        totalReviews: row.totalReviews ?? 0,
        totalRespondidos: row.totalRespondidos ?? 0,
        totalCampanhas: row.totalCampanhas ?? 0,
        dataCriacao: row.dataCriacao,
      })
      if (result.isFail) return Result.fail(result.error)
      return Result.ok(result.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar MarketingMetrica'))
    }
  }

  async registrarMetrica(dados: {
    propriedadeId: string; dataInicio: Date; dataFim: Date
    notaMedia?: number; taxaResposta?: number; sentimentoMedio?: number
    totalReviews?: number; totalRespondidos?: number; totalCampanhas?: number
  }): Promise<Result<Metrica, Error>> {
    try {
      const id = `mkt_met_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const metricaResult = Metrica.create({
        id,
        propriedadeId: dados.propriedadeId,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
        notaMedia: dados.notaMedia,
        taxaResposta: dados.taxaResposta,
        sentimentoMedio: dados.sentimentoMedio,
        totalReviews: dados.totalReviews,
        totalRespondidos: dados.totalRespondidos,
        totalCampanhas: dados.totalCampanhas,
      })
      if (metricaResult.isFail) return metricaResult

      const metrica = metricaResult.value
      await this.prisma.marketingMetrica.create({ data: this.toData(metrica) })
      return Result.ok(metrica)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao registrar métrica'))
    }
  }

  async buscarMetricaPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Metrica | null, Error>> {
    try {
      const row = await this.prisma.marketingMetrica.findFirst({
        where: {
          pousadaId: propriedadeId,
          dataInicio: { lte: dataInicio },
          dataFim: { gte: dataFim },
        },
        orderBy: { dataCriacao: 'desc' },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar métrica por período'))
    }
  }

  async listarHistorico(propriedadeId: string, limite?: number): Promise<Result<Metrica[], Error>> {
    try {
      const rows = await this.prisma.marketingMetrica.findMany({
        where: { pousadaId: propriedadeId },
        orderBy: { dataCriacao: 'desc' },
        take: limite ?? 10,
      })
      const metricas: Metrica[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        metricas.push(result.value)
      }
      return Result.ok(metricas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar histórico de métricas'))
    }
  }
}
