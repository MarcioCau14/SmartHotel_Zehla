import { Result } from '../../shared/Result'
import { Plan, UF_LIST } from '../enums'

const REGEX = /^\d{4}\/(LITE|PRO|MAX|BETA_TESTER|EARLY_ADOPTER)\/(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/

export class RegistrationNumber {
  private constructor(public readonly value: string) {
    Object.freeze(this)
  }

  static create(value: string): Result<RegistrationNumber, string> {
    if (!value || !REGEX.test(value)) {
      return Result.fail('Registration number must follow format NNNN/PLAN/UF')
    }
    return Result.ok(new RegistrationNumber(value))
  }

  static generate(sequential: number, plan: Plan, uf: string): Result<RegistrationNumber, string> {
    if (sequential < 1 || sequential > 9999) {
      return Result.fail('Sequential number must be between 1 and 9999')
    }
    if (!UF_LIST.includes(uf.toUpperCase())) {
      return Result.fail('Invalid UF')
    }

    const padded = sequential.toString().padStart(4, '0')
    return Result.ok(new RegistrationNumber(`${padded}/${plan}/${uf.toUpperCase()}`))
  }

  static restore(value: string): RegistrationNumber {
    return new RegistrationNumber(value)
  }

  getSequential(): number {
    return parseInt(this.value.split('/')[0], 10)
  }

  getPlan(): string {
    return this.value.split('/')[1]
  }

  getUf(): string {
    return this.value.split('/')[2]
  }

  equals(other: RegistrationNumber): boolean {
    return this.value === other.value
  }
}
