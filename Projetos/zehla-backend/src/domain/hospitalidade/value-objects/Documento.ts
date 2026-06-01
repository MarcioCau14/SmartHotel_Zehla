import { Result } from '../../shared/Result'

export type TipoDocumento = 'cpf' | 'passaporte'

export class Documento {
  private constructor(
    public readonly valor: string,
    public readonly tipo: TipoDocumento
  ) {
    Object.freeze(this)
  }

  static create(valor: string, tipo: TipoDocumento): Result<Documento, Error> {
    if (!valor || valor.trim().length === 0) {
      return Result.fail(new Error('Documento cannot be empty'))
    }
    if (tipo === 'cpf') {
      const cpf = valor.replace(/\D/g, '')
      if (cpf.length !== 11) {
        return Result.fail(new Error('CPF must have 11 digits'))
      }
      return Result.ok(new Documento(cpf, 'cpf'))
    }
    if (tipo === 'passaporte') {
      if (valor.trim().length < 5) {
        return Result.fail(new Error('Passport must have at least 5 characters'))
      }
      return Result.ok(new Documento(valor.trim(), 'passaporte'))
    }
    return Result.fail(new Error('Invalid document type'))
  }

  equals(other: Documento): boolean {
    return this.valor === other.valor && this.tipo === other.tipo
  }
}
