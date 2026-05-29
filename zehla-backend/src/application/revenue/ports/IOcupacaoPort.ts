import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { Ocupacao } from '../../../domain/revenue/entities/Ocupacao'
import { Percentual } from '../../../domain/revenue/value-objects/Percentual'

export interface IOcupacaoPort {
  registrarSnapshot(dados: {
    propriedadeId: string
    data: Date
    tipo: string
    totalQuartosDisponiveis: number
    totalQuartosOcupados: number
    totalReservasConfirmadas: number
    totalReservasPendentes: number
    receitaEstimada: Money
  }): Promise<Result<Ocupacao, Error>>

  buscarPorData(propriedadeId: string, data: Date): Promise<Result<Ocupacao | null, Error>>

  listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Ocupacao[], Error>>

  mediaOcupacaoPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Percentual, Error>>
}
