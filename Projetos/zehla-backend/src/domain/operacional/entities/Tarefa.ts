import { Result } from '../../../shared/Result'
import { Prioridade } from '../value-objects/Prioridade'

export type TipoTarefa = 'limpeza' | 'manutencao' | 'vistoria' | 'entrega' | 'inspecao'

export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada' | 'bloqueada'

const TIPOS_VALIDOS: TipoTarefa[] = ['limpeza', 'manutencao', 'vistoria', 'entrega', 'inspecao']
const STATUS_VALIDOS: StatusTarefa[] = ['pendente', 'em_andamento', 'concluida', 'cancelada', 'bloqueada']
const TRANSICOES_VALIDAS: Record<StatusTarefa, StatusTarefa[]> = {
  pendente: ['em_andamento', 'cancelada'],
  em_andamento: ['concluida', 'bloqueada', 'cancelada'],
  bloqueada: ['em_andamento'],
  concluida: [],
  cancelada: [],
}

export interface TarefaItemChecklist {
  itemId: string
  descricao: string
  obrigatorio: boolean
  concluido: boolean
}

export interface TarefaProps {
  id: string
  propriedadeId: string
  dataCriacao: Date
  tipo: TipoTarefa
  titulo: string
  descricao?: string
  prioridade: Prioridade
  status?: StatusTarefa
  responsavelId?: string
  tipoResponsavel?: 'staff' | 'fornecedor'
  ativoId?: string
  tipoAtivo?: string
  dataLimite?: Date
  dataConclusao?: Date
  observacoes?: string
}

export class Tarefa {
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }> = []

  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(
    public readonly id: string,
    public readonly propriedadeId: string,
    public readonly dataCriacao: Date,
    public readonly tipo: TipoTarefa,
    public readonly titulo: string,
    public readonly descricao: string | undefined,
    public readonly prioridade: Prioridade,
    public readonly status: StatusTarefa,
    public readonly responsavelId: string | undefined,
    public readonly tipoResponsavel: 'staff' | 'fornecedor' | undefined,
    public readonly ativoId: string | undefined,
    public readonly tipoAtivo: string | undefined,
    public readonly dataLimite: Date | undefined,
    public readonly dataConclusao: Date | undefined,
    public readonly observacoes: string | undefined,
    eventos: Array<{ type: string; payload: Record<string, unknown> }> = [],
  ) {
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: TarefaProps): Result<Tarefa, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da tarefa é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.dataCriacao || !(props.dataCriacao instanceof Date) || isNaN(props.dataCriacao.getTime())) {
      return Result.fail(new Error('Data de criação é obrigatória'))
    }
    if (!props.tipo || !TIPOS_VALIDOS.includes(props.tipo)) {
      return Result.fail(new Error(`Tipo de tarefa inválido: ${props.tipo}`))
    }
    if (!props.titulo || props.titulo.trim().length === 0) {
      return Result.fail(new Error('Título da tarefa é obrigatório'))
    }
    if (props.titulo.length > 200) {
      return Result.fail(new Error('Título deve ter no máximo 200 caracteres'))
    }
    if (props.descricao && props.descricao.length > 1000) {
      return Result.fail(new Error('Descrição deve ter no máximo 1000 caracteres'))
    }
    if (!props.prioridade || !(props.prioridade instanceof Prioridade)) {
      return Result.fail(new Error('Prioridade é obrigatória'))
    }
    if (props.status && !STATUS_VALIDOS.includes(props.status)) {
      return Result.fail(new Error(`Status inválido: ${props.status}`))
    }
    if (props.dataLimite && props.dataLimite <= props.dataCriacao) {
      return Result.fail(new Error('Data limite deve ser futura em relação à criação'))
    }
    if (props.dataConclusao && props.status !== 'concluida') {
      return Result.fail(new Error('Data de conclusão só pode ser definida no status concluida'))
    }
    if (props.observacoes && props.observacoes.length > 500) {
      return Result.fail(new Error('Observações deve ter no máximo 500 caracteres'))
    }

    const tarefa = new Tarefa(
      props.id.trim(),
      props.propriedadeId,
      props.dataCriacao,
      props.tipo,
      props.titulo.trim(),
      props.descricao?.trim() || undefined,
      props.prioridade,
      props.status || 'pendente',
      props.responsavelId?.trim() || undefined,
      props.tipoResponsavel || undefined,
      props.ativoId?.trim() || undefined,
      props.tipoAtivo?.trim() || undefined,
      props.dataLimite || undefined,
      props.dataConclusao || undefined,
      props.observacoes?.trim() || undefined,
      [{
        type: 'TarefaCriadaEvent',
        payload: {
          tarefaId: props.id.trim(),
          tipo: props.tipo,
          prioridade: props.prioridade.toString(),
          propriedadeId: props.propriedadeId,
        },
      }],
    )

    return Result.ok(tarefa)
  }

  iniciar(responsavelId: string, tipoResponsavel: 'staff' | 'fornecedor'): Result<Tarefa, Error> {
    if (this.status !== 'pendente') {
      return Result.fail(new Error(`Tarefa não pode ser iniciada no status ${this.status}`))
    }
    if (!responsavelId || responsavelId.trim().length === 0) {
      return Result.fail(new Error('Responsável é obrigatório para iniciar tarefa'))
    }

    const tarefa = new Tarefa(
      this.id, this.propriedadeId, this.dataCriacao, this.tipo, this.titulo,
      this.descricao, this.prioridade, 'em_andamento',
      responsavelId.trim(), tipoResponsavel,
      this.ativoId, this.tipoAtivo, this.dataLimite, undefined, this.observacoes,
      [{
        type: 'TarefaIniciadaEvent',
        payload: {
          tarefaId: this.id,
          responsavelId: responsavelId.trim(),
          tipoResponsavel: tipoResponsavel,
        },
      }],
    )

    return Result.ok(tarefa)
  }

  concluir(observacoes?: string): Result<Tarefa, Error> {
    if (this.status !== 'em_andamento') {
      return Result.fail(new Error(`Tarefa não pode ser concluída no status ${this.status}`))
    }
    if (observacoes && observacoes.length > 500) {
      return Result.fail(new Error('Observações deve ter no máximo 500 caracteres'))
    }

    const tarefa = new Tarefa(
      this.id, this.propriedadeId, this.dataCriacao, this.tipo, this.titulo,
      this.descricao, this.prioridade, 'concluida',
      this.responsavelId, this.tipoResponsavel,
      this.ativoId, this.tipoAtivo, this.dataLimite, new Date(),
      observacoes?.trim() || this.observacoes,
      [{
        type: 'TarefaConcluidaEvent',
        payload: {
          tarefaId: this.id,
          tipo: this.tipo,
          dataConclusao: new Date().toISOString(),
        },
      }],
    )

    return Result.ok(tarefa)
  }

  cancelar(): Result<Tarefa, Error> {
    if (this.status === 'concluida' || this.status === 'cancelada') {
      return Result.fail(new Error(`Tarefa ${this.status} não pode ser cancelada`))
    }

    const tarefa = new Tarefa(
      this.id, this.propriedadeId, this.dataCriacao, this.tipo, this.titulo,
      this.descricao, this.prioridade, 'cancelada',
      this.responsavelId, this.tipoResponsavel,
      this.ativoId, this.tipoAtivo, this.dataLimite, undefined, this.observacoes,
    )

    return Result.ok(tarefa)
  }

  bloquear(): Result<Tarefa, Error> {
    if (this.status !== 'em_andamento') {
      return Result.fail(new Error(`Tarefa não pode ser bloqueada no status ${this.status}`))
    }

    const tarefa = new Tarefa(
      this.id, this.propriedadeId, this.dataCriacao, this.tipo, this.titulo,
      this.descricao, this.prioridade, 'bloqueada',
      this.responsavelId, this.tipoResponsavel,
      this.ativoId, this.tipoAtivo, this.dataLimite, undefined, this.observacoes,
    )

    return Result.ok(tarefa)
  }

  desbloquear(): Result<Tarefa, Error> {
    if (this.status !== 'bloqueada') {
      return Result.fail(new Error(`Tarefa não pode ser desbloqueada no status ${this.status}`))
    }

    const tarefa = new Tarefa(
      this.id, this.propriedadeId, this.dataCriacao, this.tipo, this.titulo,
      this.descricao, this.prioridade, 'em_andamento',
      this.responsavelId, this.tipoResponsavel,
      this.ativoId, this.tipoAtivo, this.dataLimite, undefined, this.observacoes,
    )

    return Result.ok(tarefa)
  }

  get estaAtrasada(): boolean {
    if (this.status === 'concluida' || this.status === 'cancelada') return false
    if (!this.dataLimite) return false
    return new Date() > this.dataLimite
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }

  static get TRANSICOES_VALIDAS(): Record<StatusTarefa, StatusTarefa[]> {
    return TRANSICOES_VALIDAS
  }
}
