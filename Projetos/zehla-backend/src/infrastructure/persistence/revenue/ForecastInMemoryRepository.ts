import { Result } from '../../../shared/Result'
import { Forecast } from '../../../domain/revenue/entities/Forecast'
import { IForecastPort } from '../../../application/revenue/ports/IForecastPort'

export class ForecastInMemoryRepository implements IForecastPort {
  private forecasts: Map<string, Forecast> = new Map()

  async salvarForecast(dados: {
    propriedadeId: string; horizonte: number
    previsaoOcupacao: number[]; previsaoReceita: number[]
    previsaoADR: number[]; previsaoRevPAR: number[]
    confiancaMedia: number; variancia: number
    dadosHistoricoInicio: Date; dadosHistoricoFim: Date
    assinaturaModelo: string
  }): Promise<Result<Forecast, Error>> {
    const forecastResult = Forecast.create({
      id: `forecast_${this.forecasts.size + 1}_${Date.now()}`,
      ...dados,
    })
    if (forecastResult.isFail) return forecastResult
    this.forecasts.set(forecastResult.value.id, forecastResult.value)
    return Result.ok(forecastResult.value)
  }

  async buscarUltimoForecast(propriedadeId: string, horizonte: number): Promise<Result<Forecast | null, Error>> {
    const filtrados = Array.from(this.forecasts.values()).filter(
      f => f.propriedadeId === propriedadeId && f.horizonte === horizonte,
    )
    if (filtrados.length === 0) return Result.ok(null)
    filtrados.sort((a, b) => b.dataGeracao.getTime() - a.dataGeracao.getTime())
    return Result.ok(filtrados[0])
  }

  async listarHistoricoForecasts(propriedadeId: string, limite?: number): Promise<Result<Forecast[], Error>> {
    let lista = Array.from(this.forecasts.values()).filter(f => f.propriedadeId === propriedadeId)
    lista.sort((a, b) => b.dataGeracao.getTime() - a.dataGeracao.getTime())
    if (limite) lista = lista.slice(0, limite)
    return Result.ok(lista)
  }
}
