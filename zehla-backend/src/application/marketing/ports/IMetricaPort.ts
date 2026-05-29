import { Result } from '../../../shared/Result'
import { Metrica } from '../../../domain/marketing/entities/Metrica'

export interface IMetricaPort {
  registrarMetrica(dados: {
    propriedadeId: string
    dataInicio: Date
    dataFim: Date
    notaMedia?: number
    taxaResposta?: number
    sentimentoMedio?: number
    totalReviews?: number
    totalRespondidos?: number
    totalCampanhas?: number
  }): Promise<Result<Metrica, Error>>

  buscarMetricaPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Metrica | null, Error>>

  listarHistorico(propriedadeId: string, limite?: number): Promise<Result<Metrica[], Error>>
}
