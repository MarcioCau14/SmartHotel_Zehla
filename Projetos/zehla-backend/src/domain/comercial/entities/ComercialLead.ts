import { Result } from '../../shared/Result'
import { DomainEvent } from '../../shared/DomainEvent'
import { Email } from '../value-objects/Email'
import { Documento } from '../value-objects/Documento'
import { LeadScore } from '../value-objects/LeadScore'
import { OrigemLead } from '../value-objects/OrigemLead'
import { ProductTier } from '../value-objects/ProductTier'
import {
  SummaryPackage,
  LeadCapturadoEvent,
  LeadPrimeiraInteracaoEvent,
  LeadFollowUpRealizadoEvent,
  LeadQualificadoEvent,
  LeadAgendadoEvent,
  LeadReagendadoEvent,
  LeadNoShowEvent,
  LeadEmNegociacaoEvent,
  LeadHandoffParaCloserEvent,
  LeadVendaSinalEvent,
  LeadVendaConcluidaEvent,
  LeadPerdidoEvent,
  LeadReativadoEvent,
  LeadOnboardingIniciadoEvent,
  LeadRenovacaoProximaEvent,
  LeadSalesFarmingEvent,
} from '../events/ComercialDomainEvents'

export type EstadoLead =
  | 'entrada'
  | 'primeira_interacao'
  | 'follow_up_1'
  | 'follow_up_2'
  | 'follow_up_3'
  | 'agendado'
  | 'reagendado'
  | 'no_show'
  | 'transferido_sdr'
  | 'em_negociacao'
  | 'venda_sinal'
  | 'venda_concluida'
  | 'perdido'
  | 'em_onboarding'
  | 'acompanhamento'
  | 'renovacao'
  | 'sales_farming'

export type Transicao =
  | 'primeiro_contato'
  | 'follow_up'
  | 'agendar'
  | 'reagendar'
  | 'no_show'
  | 'transferir_sdr'
  | 'iniciar_negociacao'
  | 'fechar_sinal'
  | 'concluir_pagamento'
  | 'iniciar_onboarding'
  | 'completar_onboarding'
  | 'proximo_renovacao'
  | 'renovar'
  | 'perder'
  | 'reativar'
  | 'entrar_sales_farming'

const TRANSICOES_VALIDAS: Record<EstadoLead, Transicao[]> = {
  entrada:             ['primeiro_contato', 'perder', 'entrar_sales_farming'],
  primeira_interacao:  ['follow_up', 'agendar', 'perder', 'entrar_sales_farming'],
  follow_up_1:         ['follow_up', 'agendar', 'perder', 'entrar_sales_farming'],
  follow_up_2:         ['follow_up', 'agendar', 'perder', 'entrar_sales_farming'],
  follow_up_3:         ['agendar', 'perder', 'entrar_sales_farming'],
  agendado:            ['reagendar', 'no_show', 'transferir_sdr', 'iniciar_negociacao', 'perder', 'entrar_sales_farming'],
  reagendado:          ['reagendar', 'no_show', 'transferir_sdr', 'iniciar_negociacao', 'perder', 'entrar_sales_farming'],
  no_show:             ['reagendar', 'perder', 'entrar_sales_farming'],
  transferido_sdr:     ['agendar', 'perder', 'entrar_sales_farming'],
  em_negociacao:       ['fechar_sinal', 'perder', 'entrar_sales_farming'],
  venda_sinal:         ['concluir_pagamento'],
  venda_concluida:     ['iniciar_onboarding', 'perder'],
  perdido:             ['reativar', 'entrar_sales_farming'],
  em_onboarding:       ['completar_onboarding', 'perder'],
  acompanhamento:      ['proximo_renovacao', 'perder'],
  renovacao:           ['renovar', 'perder'],
  sales_farming:       ['follow_up', 'perder'],
}

const MAPA_TRANSICAO: Record<string, EstadoLead> = {
  'entrada|primeiro_contato':           'primeira_interacao',
  'entrada|perder':                     'perdido',
  'entrada|entrar_sales_farming':       'sales_farming',
  'primeira_interacao|follow_up':       'follow_up_1',
  'primeira_interacao|agendar':         'agendado',
  'primeira_interacao|perder':          'perdido',
  'primeira_interacao|entrar_sales_farming': 'sales_farming',
  'follow_up_1|follow_up':              'follow_up_2',
  'follow_up_1|agendar':                'agendado',
  'follow_up_1|perder':                 'perdido',
  'follow_up_1|entrar_sales_farming':   'sales_farming',
  'follow_up_2|follow_up':              'follow_up_3',
  'follow_up_2|agendar':                'agendado',
  'follow_up_2|perder':                 'perdido',
  'follow_up_2|entrar_sales_farming':   'sales_farming',
  'follow_up_3|agendar':                'agendado',
  'follow_up_3|perder':                 'perdido',
  'follow_up_3|entrar_sales_farming':   'sales_farming',
  'agendado|reagendar':                 'reagendado',
  'agendado|no_show':                   'no_show',
  'agendado|transferir_sdr':            'transferido_sdr',
  'agendado|iniciar_negociacao':        'em_negociacao',
  'agendado|perder':                    'perdido',
  'agendado|entrar_sales_farming':      'sales_farming',
  'reagendado|reagendar':               'reagendado',
  'reagendado|no_show':                 'no_show',
  'reagendado|transferir_sdr':          'transferido_sdr',
  'reagendado|iniciar_negociacao':      'em_negociacao',
  'reagendado|perder':                  'perdido',
  'reagendado|entrar_sales_farming':    'sales_farming',
  'no_show|reagendar':                  'reagendado',
  'no_show|perder':                     'perdido',
  'no_show|entrar_sales_farming':       'sales_farming',
  'transferido_sdr|agendar':            'agendado',
  'transferido_sdr|perder':             'perdido',
  'transferido_sdr|entrar_sales_farming': 'sales_farming',
  'em_negociacao|fechar_sinal':         'venda_sinal',
  'em_negociacao|perder':               'perdido',
  'em_negociacao|entrar_sales_farming': 'sales_farming',
  'venda_sinal|concluir_pagamento':     'venda_concluida',
  'venda_concluida|iniciar_onboarding': 'em_onboarding',
  'venda_concluida|perder':             'perdido',
  'perdido|reativar':                   'entrada',
  'perdido|entrar_sales_farming':       'sales_farming',
  'em_onboarding|completar_onboarding': 'acompanhamento',
  'em_onboarding|perder':               'perdido',
  'acompanhamento|proximo_renovacao':   'renovacao',
  'acompanhamento|perder':              'perdido',
  'renovacao|renovar':                  'acompanhamento',
  'renovacao|perder':                   'perdido',
  'sales_farming|follow_up':            'primeira_interacao',
  'sales_farming|perder':               'perdido',
}

function transitar(estadoAtual: EstadoLead, transicao: Transicao): Result<EstadoLead, Error> {
  const permitidas = TRANSICOES_VALIDAS[estadoAtual]
  if (!permitidas || !permitidas.includes(transicao)) {
    return Result.fail(new Error(
      `TRANSICAO_INVALIDA: não é possível transitar de '${estadoAtual}' via '${transicao}'`
    ))
  }
  const chave = `${estadoAtual}|${transicao}`
  const proximoEstado = MAPA_TRANSICAO[chave]
  if (!proximoEstado) {
    return Result.fail(new Error(`TRANSICAO_NAO_MAPEADA: ${chave}`))
  }
  return Result.ok(proximoEstado)
}

export interface ComercialLeadProps {
  id: string
  origem: OrigemLead
  propriedadeId: string
  nome?: string
  email?: Email
  telefone?: string
  documento?: Documento
  score?: LeadScore
  estado?: EstadoLead
  empresa?: string
  cargo?: string
  faturamentoEstimado?: number
  sdrResponsavel?: string
  closerResponsavel?: string
  tags?: string[]
  observacoes?: string
  origemUrl?: string
  ultimaInteracao?: Date
  quantidadeInteracoes?: number
  dataAgendamento?: Date
  dataUltimoFollowUp?: Date
  productTier?: ProductTier
}

export class ComercialLead {
  public readonly id: string
  public readonly origem: OrigemLead
  public readonly propriedadeId: string
  public readonly nome: string | undefined
  public readonly email: Email | undefined
  public readonly telefone: string | undefined
  public readonly documento: Documento | undefined
  public readonly score: LeadScore | undefined
  public readonly estado: EstadoLead
  public readonly empresa: string | undefined
  public readonly cargo: string | undefined
  public readonly faturamentoEstimado: number | undefined
  public readonly sdrResponsavel: string | undefined
  public readonly closerResponsavel: string | undefined
  public readonly tags: string[] | undefined
  public readonly observacoes: string | undefined
  public readonly origemUrl: string | undefined
  public readonly ultimaInteracao: Date | undefined
  public readonly quantidadeInteracoes: number
  public readonly dataAgendamento: Date | undefined
  public readonly dataUltimoFollowUp: Date | undefined
  public readonly productTier: ProductTier | undefined
  private _domainEvents: DomainEvent[] = []

  private constructor(props: ComercialLeadProps) {
    this.id = props.id
    this.origem = props.origem
    this.propriedadeId = props.propriedadeId
    this.nome = props.nome
    this.email = props.email
    this.telefone = props.telefone
    this.documento = props.documento
    this.score = props.score
    this.estado = props.estado ?? 'entrada'
    this.empresa = props.empresa
    this.cargo = props.cargo
    this.faturamentoEstimado = props.faturamentoEstimado
    this.sdrResponsavel = props.sdrResponsavel
    this.closerResponsavel = props.closerResponsavel
    this.tags = props.tags
    this.observacoes = props.observacoes
    this.origemUrl = props.origemUrl
    this.ultimaInteracao = props.ultimaInteracao
    this.quantidadeInteracoes = props.quantidadeInteracoes ?? 0
    this.dataAgendamento = props.dataAgendamento
    this.dataUltimoFollowUp = props.dataUltimoFollowUp
    this.productTier = props.productTier
    Object.freeze(this)
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents]
  }

  clearEvents(): ComercialLead {
    this._domainEvents.length = 0
    return this
  }

  static create(props: ComercialLeadProps): Result<ComercialLead, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('LEAD_ID_REQUIRED'))
    }
    if (!props.origem) {
      return Result.fail(new Error('ORIGEM_REQUIRED'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('PROPRIEDADE_ID_REQUIRED'))
    }
    if (props.estado && props.estado !== 'entrada') {
      return Result.fail(new Error('LEAD_NOVO_DEVE_SER_ENTRADA'))
    }
    const lead = new ComercialLead(props)
    lead._domainEvents.push(LeadCapturadoEvent(lead.id, {
      nome: lead.nome,
      email: lead.email?.valor,
      canal: lead.origem.canal,
      score: lead.score?.valor ?? 0,
      icpFit: lead.score?.icpFit ?? 'fora_icp',
    }))
    return Result.ok(lead)
  }

  static restore(props: ComercialLeadProps): ComercialLead {
    return new ComercialLead(props)
  }

  private clone(novasProps: Partial<ComercialLeadProps>): ComercialLead {
    const novo = new ComercialLead({
      id: this.id,
      origem: this.origem,
      propriedadeId: this.propriedadeId,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      documento: this.documento,
      score: this.score,
      estado: this.estado,
      empresa: this.empresa,
      cargo: this.cargo,
      faturamentoEstimado: this.faturamentoEstimado,
      sdrResponsavel: this.sdrResponsavel,
      closerResponsavel: this.closerResponsavel,
      tags: this.tags,
      observacoes: this.observacoes,
      origemUrl: this.origemUrl,
      ultimaInteracao: this.ultimaInteracao,
      quantidadeInteracoes: this.quantidadeInteracoes,
      dataAgendamento: this.dataAgendamento,
      dataUltimoFollowUp: this.dataUltimoFollowUp,
      productTier: this.productTier,
      ...novasProps,
    })
    novo._domainEvents.push(...this._domainEvents)
    return novo
  }

  private tocar(): Date {
    return new Date()
  }

  // ─── Comportamentos Ricos (Transições FSM) ───

  primeiroContato(): Result<ComercialLead, Error> {
    return transitar(this.estado, 'primeiro_contato')
      .map(() => {
        const novo = this.clone({
          estado: 'primeira_interacao',
          ultimaInteracao: this.tocar(),
          quantidadeInteracoes: this.quantidadeInteracoes + 1,
        })
        novo._domainEvents.push(LeadPrimeiraInteracaoEvent(this.id, {
          canal: this.origem.canal,
          mensagemTipo: 'primeiro_contato',
        }))
        return novo
      })
  }

  realizarFollowUp(): Result<ComercialLead, Error> {
    return transitar(this.estado, 'follow_up')
      .map((proximoEstado) => {
        const novaQtd = this.quantidadeInteracoes + 1
        const novo = this.clone({
          estado: proximoEstado,
          ultimaInteracao: this.tocar(),
          quantidadeInteracoes: novaQtd,
          dataUltimoFollowUp: this.tocar(),
        })
        novo._domainEvents.push(LeadFollowUpRealizadoEvent(this.id, {
          numeroFollowUp: novo.numeroFollowUpAtual,
          canal: this.origem.canal,
        }))
        return novo
      })
  }

  agendar(dataAgendamento: Date, closerId?: string): Result<ComercialLead, Error> {
    return transitar(this.estado, 'agendar')
      .map(() => {
        const novo = this.clone({
          estado: 'agendado',
          dataAgendamento,
          closerResponsavel: closerId,
          ultimaInteracao: this.tocar(),
        })
        novo._domainEvents.push(LeadAgendadoEvent(this.id, {
          dataAgendamento: dataAgendamento.toISOString(),
          closerId,
        }))
        return novo
      })
  }

  reagendar(novaData: Date): Result<ComercialLead, Error> {
    return transitar(this.estado, 'reagendar')
      .map(() => {
        const dataOriginal = this.dataAgendamento
        const novo = this.clone({
          estado: 'reagendado',
          dataAgendamento: novaData,
          ultimaInteracao: this.tocar(),
        })
        novo._domainEvents.push(LeadReagendadoEvent(this.id, {
          dataAgendamentoOriginal: dataOriginal?.toISOString() ?? '',
          dataAgendamentoNovo: novaData.toISOString(),
        }))
        return novo
      })
  }

  marcarNoShow(): Result<ComercialLead, Error> {
    if (!this.dataAgendamento) {
      return Result.fail(new Error('NO_SHOW_SEM_AGENDAMENTO'))
    }
    return transitar(this.estado, 'no_show')
      .map(() => {
        const dataOriginal = this.dataAgendamento
        const novo = this.clone({
          estado: 'no_show',
          ultimaInteracao: this.tocar(),
        })
        novo._domainEvents.push(LeadNoShowEvent(this.id, {
          dataAgendamentoOriginal: dataOriginal!.toISOString(),
        }))
        return novo
      })
  }

  transferirSdr(novoSdrId: string): Result<ComercialLead, Error> {
    return transitar(this.estado, 'transferir_sdr')
      .map(() => this.clone({
        estado: 'transferido_sdr',
        sdrResponsavel: novoSdrId,
        ultimaInteracao: this.tocar(),
      }))
  }

  iniciarNegociacao(closerId: string): Result<ComercialLead, Error> {
    return transitar(this.estado, 'iniciar_negociacao')
      .map(() => {
        const novo = this.clone({
          estado: 'em_negociacao',
          closerResponsavel: closerId,
          ultimaInteracao: this.tocar(),
        })
        novo._domainEvents.push(LeadEmNegociacaoEvent(this.id, {
          closerId,
        }))
        return novo
      })
  }

  realizarHandoff(closerId: string, summaryPackage: SummaryPackage): Result<ComercialLead, Error> {
    const estadosHandoff: EstadoLead[] = ['agendado', 'reagendado']
    if (!estadosHandoff.includes(this.estado)) {
      return Result.fail(new Error('HANDOFF_NAO_PERMITIDO'))
    }
    if (!summaryPackage || !summaryPackage.score) {
      return Result.fail(new Error('HANDOFF_EXIGE_SUMMARY_PACKAGE'))
    }
    const novo = this.clone({
      estado: 'em_negociacao',
      closerResponsavel: closerId,
      ultimaInteracao: this.tocar(),
      observacoes: `Handoff via ${summaryPackage.gatilho || 'default'} | Score: ${summaryPackage.score}`,
    })
    novo._domainEvents.push(LeadHandoffParaCloserEvent(this.id, {
      closerId,
      summaryPackage,
      gatilho: summaryPackage.gatilho ?? 'default',
    }))
    return Result.ok(novo)
  }

  fecharVendaSinal(propostaId: string, valorSinal: number, plano: string): Result<ComercialLead, Error> {
    if (valorSinal <= 0) {
      return Result.fail(new Error('SINAL_DEVE_SER_POSITIVO'))
    }
    const transicao = transitar(this.estado, 'fechar_sinal')
    if (transicao.isFail) return transicao as unknown as Result<ComercialLead, Error>
    if (!this.closerResponsavel) {
      return Result.fail(new Error('VENDA_SINAL_SEM_CLOSER'))
    }
    const novo = this.clone({
      estado: 'venda_sinal',
      ultimaInteracao: this.tocar(),
    })
    novo._domainEvents.push(LeadVendaSinalEvent(this.id, {
      propostaId,
      valorSinal,
      plano,
    }))
    return Result.ok(novo)
  }

  concluirVenda(): Result<ComercialLead, Error> {
    const transicao = transitar(this.estado, 'concluir_pagamento')
    if (transicao.isFail) return transicao as unknown as Result<ComercialLead, Error>
    if (!this.documento) {
      return Result.fail(new Error('DOCUMENTO_OBRIGATORIO_CONVERSAO'))
    }
    const novo = this.clone({
      estado: 'venda_concluida',
      ultimaInteracao: this.tocar(),
    })
    novo._domainEvents.push(LeadVendaConcluidaEvent(this.id, {
      conversaoId: `${this.id}_conversao`,
      valorTotal: 0,
      plano: '',
    }))
    return Result.ok(novo)
  }

  iniciarOnboarding(): Result<ComercialLead, Error> {
    return transitar(this.estado, 'iniciar_onboarding')
      .map(() => {
        const novo = this.clone({
          estado: 'em_onboarding',
          ultimaInteracao: this.tocar(),
        })
        novo._domainEvents.push(LeadOnboardingIniciadoEvent(this.id, {
          plano: '',
          dataInicio: new Date().toISOString(),
        }))
        return novo
      })
  }

  completarOnboarding(): Result<ComercialLead, Error> {
    return transitar(this.estado, 'completar_onboarding')
      .map(() => this.clone({
        estado: 'acompanhamento',
        ultimaInteracao: this.tocar(),
      }))
  }

  proximoRenovacao(): Result<ComercialLead, Error> {
    return transitar(this.estado, 'proximo_renovacao')
      .map(() => {
        const novo = this.clone({
          estado: 'renovacao',
          ultimaInteracao: this.tocar(),
        })
        novo._domainEvents.push(LeadRenovacaoProximaEvent(this.id, {
          planoAtual: '',
          diasParaVencimento: 0,
        }))
        return novo
      })
  }

  renovar(): Result<ComercialLead, Error> {
    return transitar(this.estado, 'renovar')
      .map(() => this.clone({
        estado: 'acompanhamento',
        ultimaInteracao: this.tocar(),
      }))
  }

  perder(motivo?: string): Result<ComercialLead, Error> {
    return transitar(this.estado, 'perder')
      .map(() => {
        const novo = this.clone({
          estado: 'perdido',
          observacoes: motivo ? `${this.observacoes || ''} | Perdido: ${motivo}`.trim() : undefined,
          ultimaInteracao: this.tocar(),
        })
        novo._domainEvents.push(LeadPerdidoEvent(this.id, {
          motivo,
          diasNoFunil: 0,
          ultimoEstado: this.estado,
        }))
        return novo
      })
  }

  reativar(motivoReativacao?: string): Result<ComercialLead, Error> {
    return transitar(this.estado, 'reativar')
      .map(() => {
        const novo = this.clone({
          estado: 'entrada',
          observacoes: motivoReativacao ? `${this.observacoes || ''} | Reativado: ${motivoReativacao}`.trim() : undefined,
          ultimaInteracao: this.tocar(),
          closerResponsavel: undefined,
          quantidadeInteracoes: 0,
        })
        novo._domainEvents.push(LeadReativadoEvent(this.id, {
          motivoReativacao,
          diasPerdido: this.diasSemInteracao,
        }))
        return novo
      })
  }

  entrarSalesFarming(): Result<ComercialLead, Error> {
    return transitar(this.estado, 'entrar_sales_farming')
      .map(() => {
        const novo = this.clone({
          estado: 'sales_farming',
          ultimaInteracao: this.tocar(),
        })
        novo._domainEvents.push(LeadSalesFarmingEvent(this.id, {
          diasDesdeUltimaInteracao: this.diasSemInteracao,
          ultimoEstado: this.estado,
        }))
        return novo
      })
  }

  qualificar(): Result<ComercialLead, Error> {
    if (!this.score) {
      return Result.fail(new Error('LEAD_SEM_SCORE_NAO_PODE_QUALIFICAR'))
    }
    if (!this.score.isQualificado()) {
      return Result.fail(new Error('SCORE_INSUFICIENTE_PARA_QUALIFICACAO'))
    }
    const novo = this.clone({})
    novo._domainEvents.push(LeadQualificadoEvent(this.id, {
      score: this.score.valor,
      icpFit: this.score.icpFit,
      bantBudget: this.score.bant.budget,
      bantAuthority: this.score.bant.authority,
      bantNeed: this.score.bant.need,
      bantTimeline: this.score.bant.timeline,
    }))
    return Result.ok(novo)
  }

  // ─── Getters de Estado ───

  get ehQualificado(): boolean {
    return this.score ? this.score.isQualificado() : false
  }

  get ehAtivo(): boolean {
    return !['perdido', 'sales_farming'].includes(this.estado)
  }

  get ehCliente(): boolean {
    return ['venda_sinal', 'venda_concluida', 'em_onboarding', 'acompanhamento', 'renovacao'].includes(this.estado)
  }

  get estaEmFollowUp(): boolean {
    return ['follow_up_1', 'follow_up_2', 'follow_up_3'].includes(this.estado)
  }

  get numeroFollowUpAtual(): number {
    switch (this.estado) {
      case 'follow_up_1': return 1
      case 'follow_up_2': return 2
      case 'follow_up_3': return 3
      default: return 0
    }
  }

  get estaDisponivelParaHandoff(): boolean {
    return ['agendado', 'reagendado'].includes(this.estado)
  }

  get diasSemInteracao(): number {
    if (!this.ultimaInteracao) return 0
    const diff = Date.now() - this.ultimaInteracao.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
}
