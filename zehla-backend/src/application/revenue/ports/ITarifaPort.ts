import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { RegraTarifaria } from '../../../domain/revenue/entities/RegraTarifaria'

export interface ITarifaPort {
  criarRegra(dados: {
    propriedadeId: string
    tipoQuarto: string
    tipo: string
    valorDiaria: Money
    breakEvenPoint: { valor: Money; tipoCusto: string }
    canal: string
    dataInicio: Date
    dataFim: Date
    regraReajuste: string
    parametrosReajuste: { percentualMax: number; gatilhoOcupacao: number }
  }): Promise<Result<RegraTarifaria, Error>>

  buscarPorId(id: string, propriedadeId: string): Promise<Result<RegraTarifaria | null, Error>>

  listarAtivas(propriedadeId: string, data: Date): Promise<Result<RegraTarifaria[], Error>>

  listarPorTipoQuarto(propriedadeId: string, tipoQuarto: string, data: Date): Promise<Result<RegraTarifaria[], Error>>

  atualizarValorDiaria(id: string, propriedadeId: string, novoValor: Money, valorAnterior: Money): Promise<Result<RegraTarifaria, Error>>

  listarHistoricoReajustes(regraId: string, propriedadeId: string): Promise<Result<Array<{ data: Date; valorAnterior: Money; valorNovo: Money; justificativa: string }>, Error>>
}
