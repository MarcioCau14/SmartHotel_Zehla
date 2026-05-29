import { Result } from '../../../shared/Result'
import { Sentimento } from '../value-objects/Sentimento'
import { CanalDistribuicao } from '../value-objects/CanalDistribuicao'

export type StatusReview = 'recebido' | 'analisado' | 'respondido' | 'publicado' | 'escalado_zops'

const PALAVRAS_BLOQUEADAS: string[] = []
const STATUS_TRANSICOES: Record<StatusReview, StatusReview[]> = {
  recebido: ['analisado', 'escalado_zops'],
  analisado: ['respondido', 'escalado_zops'],
  respondido: ['publicado'],
  publicado: [],
  escalado_zops: ['respondido'],
}

export interface ReviewProps {
  id: string
  propriedadeId: string
  hospedeNome: string
  portal: CanalDistribuicao
  nota: number
  texto: string
  sentimento: Sentimento
  resposta?: string | null
  tom?: string | null
  status?: StatusReview
  dataEstadia: Date
  quartoId?: string | null
  problemaRelatado?: string | null
  dataCriacao?: Date
}

export class Review {
  public readonly id: string
  public readonly propriedadeId: string
  public readonly hospedeNome: string
  public readonly portal: CanalDistribuicao
  public readonly nota: number
  public readonly texto: string
  public readonly sentimento: Sentimento
  public readonly resposta: string | null
  public readonly tom: string | null
  public readonly status: StatusReview
  public readonly dataEstadia: Date
  public readonly quartoId: string | null
  public readonly problemaRelatado: string | null
  public readonly dataCriacao: Date
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(props: ReviewProps, eventos: Array<{ type: string; payload: Record<string, unknown> }> = []) {
    this.id = props.id
    this.propriedadeId = props.propriedadeId
    this.hospedeNome = props.hospedeNome
    this.portal = props.portal
    this.nota = props.nota
    this.texto = props.texto
    this.sentimento = props.sentimento
    this.resposta = props.resposta ?? null
    this.tom = props.tom ?? null
    this.status = props.status ?? 'recebido'
    this.dataEstadia = props.dataEstadia
    this.quartoId = props.quartoId ?? null
    this.problemaRelatado = props.problemaRelatado ?? null
    this.dataCriacao = props.dataCriacao ?? new Date()
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: ReviewProps): Result<Review, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do review é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.hospedeNome || props.hospedeNome.trim().length === 0) {
      return Result.fail(new Error('Nome do hóspede é obrigatório'))
    }
    if (!props.portal || !(props.portal instanceof CanalDistribuicao)) {
      return Result.fail(new Error('Portal de distribuição é obrigatório'))
    }
    if (typeof props.nota !== 'number' || props.nota < 1 || props.nota > 10) {
      return Result.fail(new Error('Nota deve estar entre 1 e 10'))
    }
    if (!props.texto || props.texto.trim().length === 0) {
      return Result.fail(new Error('Texto do review é obrigatório'))
    }
    if (!props.sentimento || !(props.sentimento instanceof Sentimento)) {
      return Result.fail(new Error('Sentimento é obrigatório'))
    }
    if (!props.dataEstadia || !(props.dataEstadia instanceof Date) || isNaN(props.dataEstadia.getTime())) {
      return Result.fail(new Error('Data da estadia é obrigatória'))
    }

    const eventos: Array<{ type: string; payload: Record<string, unknown> }> = [
      {
        type: 'ReviewRecebidoEvent',
        payload: {
          reviewId: props.id,
          portal: props.portal.value,
          nota: props.nota,
          sentimento: props.sentimento.value,
          propriedadeId: props.propriedadeId,
        },
      },
    ]

    if (props.sentimento.isCritico) {
      eventos.push({
        type: 'ReviewCriticoRegistradoEvent',
        payload: {
          reviewId: props.id,
          problemaRelatado: props.texto,
          quartoId: props.quartoId || null,
          dataEstadia: props.dataEstadia.toISOString(),
          portal: props.portal.value,
          propriedadeId: props.propriedadeId,
        },
      })
    }

    return Result.ok(new Review(props, eventos))
  }

  analisar(): Result<Review, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('analisado')) {
      return Result.fail(new Error(`Review ${this.status} não pode ser analisado`))
    }
    const novosEventos = [...this._eventos]
    return Result.ok(new Review(
      { ...this, status: 'analisado' as StatusReview },
      novosEventos,
    ))
  }

  responder(resposta: string, tom: string): Result<Review, Error> {
    if (this.status === 'respondido' || this.status === 'publicado') {
      return Result.fail(new Error('Review já foi respondido'))
    }
    if (!resposta || resposta.trim().length === 0) {
      return Result.fail(new Error('Texto da resposta é obrigatório'))
    }
    for (const palavra of PALAVRAS_BLOQUEADAS) {
      if (resposta.toLowerCase().includes(palavra.toLowerCase())) {
        return Result.fail(new Error('Resposta contém termos bloqueados'))
      }
    }
    if (resposta.length < 20) {
      return Result.fail(new Error('Resposta muito genérica — mínimo 20 caracteres para contextualizar a estadia'))
    }
    const novosEventos = [...this._eventos, {
      type: 'ReviewRespondidoEvent',
      payload: {
        reviewId: this.id,
        textoResposta: resposta,
        sentimento: this.sentimento.value,
        tom,
        propriedadeId: this.propriedadeId,
      },
    }]
    return Result.ok(new Review(
      { ...this, resposta, tom, status: 'respondido' as StatusReview },
      novosEventos,
    ))
  }

  escalarZops(taskId: string): Result<Review, Error> {
    if (this.status !== 'analisado' && this.status !== 'recebido') {
      return Result.fail(new Error('Review deve estar em análise para ser escalado'))
    }
    const novosEventos = [...this._eventos, {
      type: 'ReviewEscaladoZopsEvent',
      payload: {
        reviewId: this.id,
        taskId,
        timestamp: new Date().toISOString(),
        propriedadeId: this.propriedadeId,
      },
    }]
    return Result.ok(new Review(
      { ...this, status: 'escalado_zops' as StatusReview },
      novosEventos,
    ))
  }

  publicar(): Result<Review, Error> {
    if (this.status !== 'respondido') {
      return Result.fail(new Error('Apenas reviews respondidos podem ser publicados'))
    }
    return Result.ok(new Review(
      { ...this, status: 'publicado' as StatusReview },
      [...this._eventos],
    ))
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }
}
