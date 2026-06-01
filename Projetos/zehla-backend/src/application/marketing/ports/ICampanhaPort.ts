import { Result } from '../../../shared/Result'
import { Campanha, StatusCampanha } from '../../../domain/marketing/entities/Campanha'

export interface ICampanhaPort {
  criarCampanha(dados: {
    propriedadeId: string
    nome: string
    publicoAlvo: string
    tipo: string
    conteudo?: string
    dataInicio: Date
    dataFim: Date
    possuiPromiseFinanceira?: boolean
    promiseFinanceiraValidada?: boolean
  }): Promise<Result<Campanha, Error>>

  buscarPorId(id: string, propriedadeId: string): Promise<Result<Campanha | null, Error>>

  listarAtivas(propriedadeId: string): Promise<Result<Campanha[], Error>>

  atualizarStatus(id: string, propriedadeId: string, status: StatusCampanha): Promise<Result<Campanha, Error>>

  cancelarCampanha(id: string, propriedadeId: string): Promise<Result<Campanha, Error>>

  listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Campanha[], Error>>
}
