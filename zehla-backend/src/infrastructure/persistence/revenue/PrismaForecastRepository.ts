import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { Forecast } from '../../../domain/revenue/entities/Forecast'
import { IForecastPort } from '../../../application/revenue/ports/IForecastPort'

export class PrismaForecastRepository implements IForecastPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(forecast: Forecast): any {
    return {
      id: forecast.id,
      propriedadeId: forecast.propriedadeId,
      horizonte: forecast.horizonte,
      previsaoOcupacao: forecast.previsaoOcupacao,
      previsaoReceita: forecast.previsaoReceita,
      previsaoADR: forecast.previsaoADR,
      previsaoRevPAR: forecast.previsaoRevPAR,
      confiancaMedia: forecast.confiancaMedia,
      variancia: forecast.variancia,
      dadosHistoricoInicio: forecast.dadosHistoricoInicio,
      dadosHistoricoFim: forecast.dadosHistoricoFim,
      assinaturaModelo: forecast.assinaturaModelo,
      dataGeracao: forecast.dataGeracao,
    }
  }

  private async hydrate(row: any): Promise<Result<Forecast, Error>> {
    try {
      const parseJson = (val: any): number[] => {
        if (Array.isArray(val)) return val
        if (typeof val === 'string') return JSON.parse(val)
        return []
      }

      return Forecast.create({
        id: row.id,
        propriedadeId: row.propriedadeId,
        horizonte: row.horizonte,
        previsaoOcupacao: parseJson(row.previsaoOcupacao),
        previsaoReceita: parseJson(row.previsaoReceita),
        previsaoADR: parseJson(row.previsaoADR),
        previsaoRevPAR: parseJson(row.previsaoRevPAR),
        confiancaMedia: row.confiancaMedia,
        variancia: row.variancia,
        dadosHistoricoInicio: row.dadosHistoricoInicio,
        dadosHistoricoFim: row.dadosHistoricoFim,
        assinaturaModelo: row.assinaturaModelo,
        dataGeracao: row.dataGeracao,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar forecast'))
    }
  }

  async salvarForecast(dados: {
    propriedadeId: string
    horizonte: number
    previsaoOcupacao: number[]
    previsaoReceita: number[]
    previsaoADR: number[]
    previsaoRevPAR: number[]
    confiancaMedia: number
    variancia: number
    dadosHistoricoInicio: Date
    dadosHistoricoFim: Date
    assinaturaModelo: string
  }): Promise<Result<Forecast, Error>> {
    try {
      const forecastResult = Forecast.create({
        id: `fc_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        propriedadeId: dados.propriedadeId,
        horizonte: dados.horizonte,
        previsaoOcupacao: dados.previsaoOcupacao,
        previsaoReceita: dados.previsaoReceita,
        previsaoADR: dados.previsaoADR,
        previsaoRevPAR: dados.previsaoRevPAR,
        confiancaMedia: dados.confiancaMedia,
        variancia: dados.variancia,
        dadosHistoricoInicio: dados.dadosHistoricoInicio,
        dadosHistoricoFim: dados.dadosHistoricoFim,
        assinaturaModelo: dados.assinaturaModelo,
      })
      if (forecastResult.isFail) return forecastResult

      const forecast = forecastResult.value
      await this.prisma.revenueForecast.create({ data: this.toData(forecast) })
      return Result.ok(forecast)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao salvar forecast'))
    }
  }

  async buscarUltimoForecast(propriedadeId: string, horizonte: number): Promise<Result<Forecast | null, Error>> {
    try {
      const row = await this.prisma.revenueForecast.findFirst({
        where: { propriedadeId, horizonte },
        orderBy: { dataGeracao: 'desc' },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar último forecast'))
    }
  }

  async listarHistoricoForecasts(propriedadeId: string, limite?: number): Promise<Result<Forecast[], Error>> {
    try {
      const rows = await this.prisma.revenueForecast.findMany({
        where: { propriedadeId },
        orderBy: { dataGeracao: 'desc' },
        take: limite,
      })
      const forecasts: Forecast[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        forecasts.push(result.value)
      }
      return Result.ok(forecasts)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar histórico de forecasts'))
    }
  }
}
