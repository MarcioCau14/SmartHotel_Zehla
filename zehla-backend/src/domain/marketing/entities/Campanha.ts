import { Result } from '../../../shared/Result'

export type StatusCampanha = 'draft' | 'aprovada' | 'agendada' | 'em_execucao' | 'concluida' | 'cancelada'

const STATUS_TRANSICOES: Record<StatusCampanha, StatusCampanha[]> = {
  draft: ['aprovada', 'cancelada'],
  aprovada: ['agendada', 'cancelada'],
  agendada: ['em_execucao', 'cancelada'],
  em_execucao: ['concluida', 'cancelada'],
  concluida: [],
  cancelada: [],
}

const PUBLICS_ALVO_VALIDOS = ['hospedes_satisfeitos', 'leads_frios', 'todos']

export interface CampanhaProps {
  id: string
  propriedadeId: string
  nome: string
  publicoAlvo: string
  tipo: string
  conteudo?: string | null
  dataInicio: Date
  dataFim: Date
  status?: StatusCampanha
  possuiPromiseFinanceira?: boolean
  promiseFinanceiraValidada?: boolean
  dataCriacao?: Date
}

export class Campanha {
  public readonly id: string
  public readonly propriedadeId: string
  public readonly nome: string
  public readonly publicoAlvo: string
  public readonly tipo: string
  public readonly conteudo: string | null
  public readonly dataInicio: Date
  public readonly dataFim: Date
  public readonly status: StatusCampanha
  public readonly possuiPromiseFinanceira: boolean
  public readonly promiseFinanceiraValidada: boolean
  public readonly dataCriacao: Date
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(props: CampanhaProps, eventos: Array<{ type: string; payload: Record<string, unknown> }> = []) {
    this.id = props.id
    this.propriedadeId = props.propriedadeId
    this.nome = props.nome
    this.publicoAlvo = props.publicoAlvo
    this.tipo = props.tipo
    this.conteudo = props.conteudo ?? null
    this.dataInicio = props.dataInicio
    this.dataFim = props.dataFim
    this.status = props.status ?? 'draft'
    this.possuiPromiseFinanceira = props.possuiPromiseFinanceira ?? false
    this.promiseFinanceiraValidada = props.promiseFinanceiraValidada ?? false
    this.dataCriacao = props.dataCriacao ?? new Date()
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: CampanhaProps): Result<Campanha, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da campanha é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.nome || props.nome.trim().length === 0) {
      return Result.fail(new Error('Nome da campanha é obrigatório'))
    }
    if (!props.publicoAlvo || props.publicoAlvo.trim().length === 0) {
      return Result.fail(new Error('Campanha sem público-alvo definido'))
    }
    if (!PUBLICS_ALVO_VALIDOS.includes(props.publicoAlvo)) {
      return Result.fail(new Error(`Público-alvo inválido: ${props.publicoAlvo}`))
    }
    if (!props.dataInicio || !(props.dataInicio instanceof Date) || isNaN(props.dataInicio.getTime())) {
      return Result.fail(new Error('Data início é obrigatória'))
    }
    if (!props.dataFim || !(props.dataFim instanceof Date) || isNaN(props.dataFim.getTime())) {
      return Result.fail(new Error('Data fim é obrigatória'))
    }
    if (props.dataFim <= props.dataInicio) {
      return Result.fail(new Error('Data fim deve ser posterior à data início'))
    }

    if (props.possuiPromiseFinanceira && !props.promiseFinanceiraValidada) {
      return Result.fail(new Error('Conteúdo com promise financeira não validada pelo Zé-Analyst'))
    }

    const eventos: Array<{ type: string; payload: Record<string, unknown> }> = [
      {
        type: 'CampanhaCriadaEvent',
        payload: {
          campanhaId: props.id,
          nome: props.nome,
          publicoAlvo: props.publicoAlvo,
          dataInicio: props.dataInicio.toISOString(),
          propriedadeId: props.propriedadeId,
        },
      },
    ]

    return Result.ok(new Campanha(props, eventos))
  }

  aprovar(): Result<Campanha, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('aprovada')) {
      return Result.fail(new Error(`Campanha ${this.status} não pode ser aprovada`))
    }
    return Result.ok(new Campanha({ ...this, status: 'aprovada' }, [...this._eventos]))
  }

  agendar(): Result<Campanha, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('agendada')) {
      return Result.fail(new Error(`Campanha ${this.status} não pode ser agendada`))
    }
    return Result.ok(new Campanha({ ...this, status: 'agendada' }, [...this._eventos]))
  }

  executar(): Result<Campanha, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('em_execucao')) {
      return Result.fail(new Error(`Campanha ${this.status} não pode ser executada`))
    }
    return Result.ok(new Campanha({ ...this, status: 'em_execucao' }, [...this._eventos]))
  }

  concluir(): Result<Campanha, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('concluida')) {
      return Result.fail(new Error(`Campanha ${this.status} não pode ser concluída`))
    }
    const novosEventos = [...this._eventos, {
      type: 'CampanhaConcluidaEvent',
      payload: {
        campanhaId: this.id,
        nome: this.nome,
        propriedadeId: this.propriedadeId,
      },
    }]
    return Result.ok(new Campanha({ ...this, status: 'concluida' }, novosEventos))
  }

  cancelar(): Result<Campanha, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('cancelada')) {
      return Result.fail(new Error(`Campanha ${this.status} não pode ser cancelada`))
    }
    return Result.ok(new Campanha({ ...this, status: 'cancelada' }, [...this._eventos]))
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }
}
