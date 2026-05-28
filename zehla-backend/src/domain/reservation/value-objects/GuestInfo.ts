import { Result } from '../../shared/Result'

export interface GuestInfoProps {
  name: string
  email?: string
  phone: string
  cpf?: string
}

export class GuestInfo {
  private constructor(
    public readonly name: string,
    public readonly phone: string,
    public readonly email?: string,
    public readonly cpf?: string
  ) {
    Object.freeze(this)
  }

  static create(props: GuestInfoProps): Result<GuestInfo, string> {
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail('Nome do hóspede deve ter no mínimo 2 caracteres')
    }
    if (!props.phone || props.phone.trim().length < 8) {
      return Result.fail('Telefone do hóspede deve ter no mínimo 8 caracteres')
    }
    if (props.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
      return Result.fail('Email inválido')
    }
    if (props.cpf && !/^\d{11}$/.test(props.cpf.replace(/\D/g, ''))) {
      return Result.fail('CPF deve conter 11 dígitos')
    }
    return Result.ok(
      new GuestInfo(
        props.name.trim(),
        props.phone.trim(),
        props.email?.trim(),
        props.cpf?.replace(/\D/g, '')
      )
    )
  }

  toJSON() {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      cpf: this.cpf ? '***' : undefined,
    }
  }
}
