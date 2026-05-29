import { Result } from '../../shared/Result'
import { Money } from './Money'

export class Installment {
  private constructor(
    public readonly quantity: number,
    public readonly value: Money,
    public readonly interestRate: number,
    public readonly dueDate: Date
  ) {
    Object.freeze(this)
  }

  static create(props: {
    quantity: number
    value: Money
    interestRate: number
    dueDate: Date
  }): Result<Installment, string> {
    if (!Number.isInteger(props.quantity) || props.quantity < 1 || props.quantity > 12) {
      return Result.fail('Installment quantity must be an integer between 1 and 12')
    }

    if (props.interestRate < 0 || props.interestRate > 100) {
      return Result.fail('Interest rate must be between 0 and 100')
    }

    if (isNaN(props.dueDate.getTime())) {
      return Result.fail('Invalid due date')
    }

    return Result.ok(new Installment(props.quantity, props.value, props.interestRate, props.dueDate))
  }
}
