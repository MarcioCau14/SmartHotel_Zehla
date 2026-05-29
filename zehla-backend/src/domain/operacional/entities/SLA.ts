import { Result } from '../../../shared/Result'
import { Prioridade } from '../value-objects/Prioridade'
import { TipoTarefa } from './Tarefa'

const PRAZOS_POR_PRIORIDADE: Record<string, { maxMinutos?: number; maxHoras: number }> = {
  urgente: { maxMinutos: 120, maxHoras: 2 },
  alta: { maxHoras: 24 },
  media: { maxHoras: 72 },
  baixa: { maxHoras: 168 },
}

export class SLA {
  private constructor(
    public readonly id: string,
    public readonly tipoTarefa: TipoTarefa,
    public readonly prioridade: Prioridade,
    public readonly prazoHoras: number,
    public readonly prazoMinutos: number | undefined,
    public readonly regraEscalacao: string | undefined,
    public readonly notificarEm: number,
    public readonly ativo: boolean,
  ) {
    Object.freeze(this)
  }

  static create(props: {
    id: string
    tipoTarefa: string
    prioridade: Prioridade
    prazoHoras?: number
    prazoMinutos?: number
    regraEscalacao?: string
    notificarEm?: number
    ativo?: boolean
  }): Result<SLA, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do SLA é obrigatório'))
    }
    if (!props.prioridade || !(props.prioridade instanceof Prioridade)) {
      return Result.fail(new Error('Prioridade é obrigatória'))
    }

    const limites = PRAZOS_POR_PRIORIDADE[props.prioridade.value]
    if (!limites) {
      return Result.fail(new Error(`Prioridade inválida: ${props.prioridade.value}`))
    }

    const prazoHoras = props.prazoHoras || limites.maxHoras
    if (prazoHoras > limites.maxHoras) {
      return Result.fail(new Error(`SLA ${props.prioridade.value} deve ter prazoHoras ≤ ${limites.maxHoras}`))
    }

    if (props.prazoMinutos !== undefined) {
      if (limites.maxMinutos !== undefined && props.prazoMinutos > limites.maxMinutos) {
        return Result.fail(new Error(`SLA ${props.prioridade.value} deve ter prazoMinutos ≤ ${limites.maxMinutos}`))
      }
      if (props.prazoMinutos < 0) {
        return Result.fail(new Error('Prazo em minutos não pode ser negativo'))
      }
    }

    const notificarEm = props.notificarEm || 0.8
    if (notificarEm <= 0 || notificarEm > 1) {
      return Result.fail(new Error('NotificarEm deve estar entre 0 e 1'))
    }

    if (prazoHoras < 0) {
      return Result.fail(new Error('Prazo em horas não pode ser negativo'))
    }

    const typeMap: Record<string, TipoTarefa> = {
      limpeza: 'limpeza', manutencao: 'manutencao', vistoria: 'vistoria',
      entrega: 'entrega', inspecao: 'inspecao',
    }
    const tipoTarefa = typeMap[props.tipoTarefa]
    if (!tipoTarefa) {
      return Result.fail(new Error(`Tipo de tarefa inválido: ${props.tipoTarefa}`))
    }

    return Result.ok(new SLA(
      props.id.trim(),
      tipoTarefa,
      props.prioridade,
      prazoHoras,
      props.prazoMinutos || (props.prioridade.value === 'urgente' ? 120 : undefined),
      props.regraEscalacao?.trim() || undefined,
      notificarEm,
      props.ativo !== undefined ? props.ativo : true,
    ))
  }

  calcularDataLimite(partida: Date): Date {
    const ms = this.prazoMinutos
      ? this.prazoMinutos * 60 * 1000
      : this.prazoHoras * 60 * 60 * 1000
    return new Date(partida.getTime() + ms)
  }

  get prazoEmMinutos(): number {
    return this.prazoMinutos || this.prazoHoras * 60
  }

  estaDentroDoPrazo(dataCriacao: Date, dataConclusao: Date): boolean {
    const diffMs = dataConclusao.getTime() - dataCriacao.getTime()
    const limiteMs = this.prazoMinutos
      ? this.prazoMinutos * 60 * 1000
      : this.prazoHoras * 60 * 60 * 1000
    return diffMs <= limiteMs
  }

  get limiteDeAlerta(): number {
    return this.prazoEmMinutos * this.notificarEm
  }

  desativar(): SLA {
    return new SLA(
      this.id, this.tipoTarefa, this.prioridade, this.prazoHoras, this.prazoMinutos,
      this.regraEscalacao, this.notificarEm, false,
    )
  }

  ativar(): SLA {
    return new SLA(
      this.id, this.tipoTarefa, this.prioridade, this.prazoHoras, this.prazoMinutos,
      this.regraEscalacao, this.notificarEm, true,
    )
  }
}
