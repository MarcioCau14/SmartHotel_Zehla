import { Result } from '../../../shared/Result'
import { Sazonalidade } from '../../../domain/revenue/entities/Sazonalidade'

export interface ISazonalidadePort {
  criarRegraSazonal(dados: {
    propriedadeId: string
    nome: string
    tipo: string
    multiplicadorPreco: number
    dataInicio: Date
    dataFim: Date
    recorrente?: boolean
    diasMinimosEstadia?: number
    regrasEspeciais?: string[]
  }): Promise<Result<Sazonalidade, Error>>

  buscarPorData(propriedadeId: string, data: Date): Promise<Result<Sazonalidade | null, Error>>

  listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Sazonalidade[], Error>>

  listarProximosFeriados(propriedadeId: string, dias: number): Promise<Result<Sazonalidade[], Error>>
}
