import { Result } from '../../../shared/Result'

export type TomConteudo = 'profissional' | 'acolhedor' | 'entusiasta' | 'neutro'

const TONS_VALIDOS: TomConteudo[] = ['profissional', 'acolhedor', 'entusiasta', 'neutro']

export interface ConteudoProps {
  id: string
  texto: string
  tom: string
  versao?: number
  conteudoAnteriorId?: string | null
  dataCriacao?: Date
}

export class Conteudo {
  public readonly id: string
  public readonly texto: string
  public readonly tom: TomConteudo
  public readonly versao: number
  public readonly conteudoAnteriorId: string | null
  public readonly dataCriacao: Date

  private constructor(props: ConteudoProps) {
    this.id = props.id
    this.texto = props.texto
    this.tom = props.tom as TomConteudo
    this.versao = props.versao ?? 1
    this.conteudoAnteriorId = props.conteudoAnteriorId ?? null
    this.dataCriacao = props.dataCriacao ?? new Date()
    Object.freeze(this)
  }

  static create(props: ConteudoProps): Result<Conteudo, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do conteúdo é obrigatório'))
    }
    if (!props.texto || props.texto.trim().length === 0) {
      return Result.fail(new Error('Texto do conteúdo é obrigatório'))
    }
    if (!props.tom || !TONS_VALIDOS.includes(props.tom as TomConteudo)) {
      return Result.fail(new Error(`Tom de conteúdo inválido: ${props.tom}`))
    }
    if (props.versao !== undefined && (typeof props.versao !== 'number' || props.versao < 1)) {
      return Result.fail(new Error('Versão deve ser um número positivo'))
    }
    return Result.ok(new Conteudo(props))
  }
}
