import { Result } from '../../../shared/Result'
import { Money } from '../../comercial/value-objects/Money'
import { Percentual } from '../value-objects/Percentual'

export type TipoOcupacao = 'realizada' | 'projetada'

export interface OcupacaoProps {
  id: string
  propriedadeId: string
  data: Date
  tipo: string
  totalQuartosDisponiveis: number
  totalQuartosOcupados: number
  totalReservasConfirmadas: number
  totalReservasPendentes: number
  receitaEstimada: Money
  dataCriacao?: Date
}

export class Ocupacao {
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(
    public readonly id: string,
    public readonly propriedadeId: string,
    public readonly data: Date,
    public readonly tipo: TipoOcupacao,
    public readonly totalQuartosDisponiveis: number,
    public readonly totalQuartosOcupados: number,
    public readonly totalReservasConfirmadas: number,
    public readonly totalReservasPendentes: number,
    public readonly receitaEstimada: Money,
    public readonly dataCriacao: Date,
    eventos: Array<{ type: string; payload: Record<string, unknown> }> = [],
  ) {
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: OcupacaoProps): Result<Ocupacao, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da ocupação é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.data || !(props.data instanceof Date) || isNaN(props.data.getTime())) {
      return Result.fail(new Error('Data é obrigatória'))
    }
    if (!['realizada', 'projetada'].includes(props.tipo)) {
      return Result.fail(new Error('Tipo de ocupação deve ser realizada ou projetada'))
    }
    if (props.totalQuartosDisponiveis <= 0) {
      return Result.fail(new Error('Total de quartos disponíveis deve ser positivo'))
    }
    if (props.totalQuartosOcupados < 0) {
      return Result.fail(new Error('Total de quartos ocupados não pode ser negativo'))
    }
    if (props.totalQuartosOcupados > props.totalQuartosDisponiveis) {
      return Result.fail(new Error('Ocupação não pode exceder capacidade total da propriedade'))
    }
    if (props.totalReservasConfirmadas < 0) {
      return Result.fail(new Error('Total de reservas confirmadas não pode ser negativo'))
    }
    if (props.totalReservasPendentes < 0) {
      return Result.fail(new Error('Total de reservas pendentes não pode ser negativo'))
    }
    if (!props.receitaEstimada || !(props.receitaEstimada instanceof Money)) {
      return Result.fail(new Error('Receita estimada é obrigatória'))
    }

    const tipo = props.tipo as TipoOcupacao
    const taxa = Math.round((props.totalQuartosOcupados / props.totalQuartosDisponiveis) * 100)

    const eventos: Array<{ type: string; payload: Record<string, unknown> }> = [
      {
        type: 'OcupacaoRegistradaEvent',
        payload: {
          ocupacaoId: props.id.trim(),
          propriedadeId: props.propriedadeId,
          data: props.data.toISOString(),
          tipo,
          taxa,
          receitaEstimada: props.receitaEstimada.centavos,
        },
      },
    ]

    return Result.ok(new Ocupacao(
      props.id.trim(),
      props.propriedadeId,
      props.data,
      tipo,
      props.totalQuartosDisponiveis,
      props.totalQuartosOcupados,
      props.totalReservasConfirmadas,
      props.totalReservasPendentes,
      props.receitaEstimada,
      props.dataCriacao || new Date(),
      eventos,
    ))
  }

  get taxaOcupacao(): number {
    return Math.round((this.totalQuartosOcupados / this.totalQuartosDisponiveis) * 100)
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }
}
