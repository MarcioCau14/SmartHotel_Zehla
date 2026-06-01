import { Result } from '../../../shared/Result'
import { CanalDistribuicao } from '../value-objects/CanalDistribuicao'

export type StatusPost = 'draft' | 'agendado' | 'publicado' | 'falhou' | 'arquivado'

const STATUS_TRANSICOES: Record<StatusPost, StatusPost[]> = {
  draft: ['agendado', 'arquivado'],
  agendado: ['publicado', 'falhou', 'arquivado'],
  publicado: ['arquivado'],
  falhou: ['agendado', 'arquivado'],
  arquivado: [],
}

export interface PostProps {
  id: string
  propriedadeId: string
  canal: CanalDistribuicao
  tipo: string
  conteudoId: string
  midias?: string[]
  dataAgendamento?: Date | null
  status?: StatusPost
  dataPublicacao?: Date | null
  dataCriacao?: Date
}

export class Post {
  public readonly id: string
  public readonly propriedadeId: string
  public readonly canal: CanalDistribuicao
  public readonly tipo: string
  public readonly conteudoId: string
  public readonly midias: string[]
  public readonly dataAgendamento: Date | null
  public readonly status: StatusPost
  public readonly dataPublicacao: Date | null
  public readonly dataCriacao: Date
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(props: PostProps, eventos: Array<{ type: string; payload: Record<string, unknown> }> = []) {
    this.id = props.id
    this.propriedadeId = props.propriedadeId
    this.canal = props.canal
    this.tipo = props.tipo
    this.conteudoId = props.conteudoId
    this.midias = props.midias ?? []
    this.dataAgendamento = props.dataAgendamento ?? null
    this.status = props.status ?? 'draft'
    this.dataPublicacao = props.dataPublicacao ?? null
    this.dataCriacao = props.dataCriacao ?? new Date()
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: PostProps): Result<Post, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do post é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.canal || !(props.canal instanceof CanalDistribuicao)) {
      return Result.fail(new Error('Canal é obrigatório'))
    }
    if (!props.canal.isSocial) {
      return Result.fail(new Error('Canal de publicação não suportado'))
    }
    if (!props.conteudoId || props.conteudoId.trim().length === 0) {
      return Result.fail(new Error('ID do conteúdo é obrigatório'))
    }
    if (!props.tipo || props.tipo.trim().length === 0) {
      return Result.fail(new Error('Tipo do post é obrigatório'))
    }
    if (props.tipo === 'promocional' && (!props.midias || props.midias.length === 0)) {
      return Result.fail(new Error('Post promocional exige ao menos uma mídia'))
    }

    const eventos: Array<{ type: string; payload: Record<string, unknown> }> = [
      {
        type: 'PostCriadoEvent',
        payload: {
          postId: props.id,
          canal: props.canal.value,
          tipo: props.tipo,
          propriedadeId: props.propriedadeId,
          dataAgendamento: props.dataAgendamento?.toISOString() || null,
        },
      },
    ]

    return Result.ok(new Post(props, eventos))
  }

  agendar(data: Date): Result<Post, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('agendado')) {
      return Result.fail(new Error(`Post ${this.status} não pode ser agendado`))
    }
    return Result.ok(new Post(
      { ...this, dataAgendamento: data, status: 'agendado' },
      [...this._eventos],
    ))
  }

  publicar(): Result<Post, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('publicado')) {
      return Result.fail(new Error(`Post ${this.status} não pode ser publicado`))
    }
    const novosEventos = [...this._eventos, {
      type: 'PostPublicadoEvent',
      payload: {
        postId: this.id,
        canal: this.canal.value,
        tipo: this.tipo,
        data: new Date().toISOString(),
        propriedadeId: this.propriedadeId,
      },
    }]
    return Result.ok(new Post(
      { ...this, status: 'publicado', dataPublicacao: new Date() },
      novosEventos,
    ))
  }

  falhar(): Result<Post, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('falhou')) {
      return Result.fail(new Error(`Post ${this.status} não pode falhar`))
    }
    return Result.ok(new Post({ ...this, status: 'falhou' }, [...this._eventos]))
  }

  arquivar(): Result<Post, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('arquivado')) {
      return Result.fail(new Error(`Post ${this.status} não pode ser arquivado`))
    }
    return Result.ok(new Post({ ...this, status: 'arquivado' }, [...this._eventos]))
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }
}
