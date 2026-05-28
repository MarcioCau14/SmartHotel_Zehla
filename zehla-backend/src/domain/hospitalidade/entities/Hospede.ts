import { Result } from '../../shared/Result'
import { Documento } from '../value-objects/Documento'
import { Email } from '../value-objects/Email'

export interface CriarHospedeProps {
  id: string
  nomeCompleto: string
  documento: Documento
  dataNascimento: Date
  email?: Email
  telefone?: string
  preferencias?: Record<string, string>
}

export interface AtualizarHospedeProps {
  email?: Email
  telefone?: string
  preferencias?: Record<string, string>
  observacoes?: string
}

export class Hospede {
  private _observacoes: string | undefined
  private _preferencias: Record<string, string> | undefined
  private _email: Email | undefined
  private _telefone: string | undefined

  private constructor(
    public readonly id: string,
    public readonly nomeCompleto: string,
    public readonly documento: Documento,
    public readonly dataNascimento: Date,
    public readonly dataCriacao: Date
  ) {}

  static create(props: CriarHospedeProps): Result<Hospede, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('GUEST_ID_REQUIRED'))
    }
    if (!props.nomeCompleto || props.nomeCompleto.trim().length < 2) {
      return Result.fail(new Error('GUEST_NAME_TOO_SHORT'))
    }
    if (isNaN(props.dataNascimento.getTime())) {
      return Result.fail(new Error('GUEST_INVALID_BIRTH_DATE'))
    }
    const idade = new Date().getFullYear() - props.dataNascimento.getFullYear()
    if (idade < 18) {
      return Result.fail(new Error('GUEST_UNDERAGE'))
    }
    const hospede = new Hospede(
      props.id.trim(),
      props.nomeCompleto.trim(),
      props.documento,
      props.dataNascimento,
      new Date()
    )
    hospede._email = props.email
    hospede._telefone = props.telefone?.trim()
    hospede._preferencias = props.preferencias
    return Result.ok(hospede)
  }

  get email(): Email | undefined {
    return this._email
  }

  get telefone(): string | undefined {
    return this._telefone
  }

  get preferencias(): Record<string, string> | undefined {
    return this._preferencias ? { ...this._preferencias } : undefined
  }

  get observacoes(): string | undefined {
    return this._observacoes
  }

  atualizar(props: AtualizarHospedeProps): Result<Hospede, Error> {
    if (props.email) this._email = props.email
    if (props.telefone !== undefined) this._telefone = props.telefone.trim()
    if (props.preferencias) this._preferencias = { ...props.preferencias }
    if (props.observacoes !== undefined) {
      if (props.observacoes.length > 500) {
        return Result.fail(new Error('GUEST_OBSERVATIONS_TOO_LONG'))
      }
      this._observacoes = props.observacoes.trim()
    }
    return Result.ok(this)
  }
}
