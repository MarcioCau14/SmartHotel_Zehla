import { Result } from '../../shared/Result'
import { Money } from '../value-objects/Money'
import { CategoriaServico } from './CategoriaServico'

export interface CriarServicoProps {
  id: string
  nome: string
  descricao?: string
  preco: Money
  categoria: CategoriaServico
}

export class Servico {
  private _descricao: string | undefined
  private _disponivel: boolean

  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly precoAtual: Money,
    public readonly categoria: CategoriaServico
  ) {
    this._disponivel = true
  }

  static create(props: CriarServicoProps): Result<Servico, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('SERVICE_ID_REQUIRED'))
    }
    if (!props.nome || props.nome.trim().length === 0) {
      return Result.fail(new Error('SERVICE_NAME_REQUIRED'))
    }
    if (props.preco.isZero()) {
      return Result.fail(new Error('SERVICE_PRICE_ZERO'))
    }
    const servico = new Servico(props.id.trim(), props.nome.trim(), props.preco, props.categoria)
    servico._descricao = props.descricao?.trim()
    return Result.ok(servico)
  }

  get descricao(): string | undefined {
    return this._descricao
  }

  get disponivel(): boolean {
    return this._disponivel
  }

  ativar(): void {
    this._disponivel = true
  }

  desativar(): void {
    this._disponivel = false
  }
}
