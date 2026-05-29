import { Result } from '../../../shared/Result'
import { Forecast } from '../../../domain/revenue/entities/Forecast'

export interface IForecastPort {
  salvarForecast(dados: {
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
  }): Promise<Result<Forecast, Error>>

  buscarUltimoForecast(propriedadeId: string, horizonte: number): Promise<Result<Forecast | null, Error>>

  listarHistoricoForecasts(propriedadeId: string, limite?: number): Promise<Result<Forecast[], Error>>
}
