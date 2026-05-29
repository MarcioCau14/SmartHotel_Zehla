import { Result } from '../../shared/Result'

export class Email {
  private constructor(public readonly valor: string) {
    Object.freeze(this)
  }

  static create(valor: string): Result<Email, Error> {
    if (!valor || valor.trim().length === 0) {
      return Result.fail(new Error('Email cannot be empty'))
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(valor.trim())) {
      return Result.fail(new Error('Invalid email format'))
    }
    return Result.ok(new Email(valor.trim().toLowerCase()))
  }

  equals(other: Email): boolean {
    return this.valor === other.valor
  }
}
