import { Result } from '../../shared/Result'
import { Plan } from '../enums'
import { RegistrationNumber } from '../value-objects/RegistrationNumber'

export class RegistrationNumberGenerator {
  generate(propertyCount: number, plan: Plan, uf: string): Result<RegistrationNumber, string> {
    const sequential = propertyCount + 1
    return RegistrationNumber.generate(sequential, plan, uf)
  }
}
