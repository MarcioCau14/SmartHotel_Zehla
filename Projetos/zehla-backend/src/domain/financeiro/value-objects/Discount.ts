import { Result } from '../../shared/Result'
import { DiscountType } from '../enums'
import { Money } from './Money'

export class Discount {
  private constructor(
    public readonly type: DiscountType,
    public readonly value: Money,
    public readonly percentage: number | undefined,
    public readonly reason: string
  ) {
    Object.freeze(this)
  }

  static create(props: {
    type: DiscountType
    value?: Money
    percentage?: number
    reason: string
  }): Result<Discount, string> {
    if (!props.reason || props.reason.trim().length < 3 || props.reason.trim().length > 200) {
      return Result.fail('Discount reason must be between 3 and 200 characters')
    }

    if (props.type === DiscountType.PERCENTAGE) {
      if (props.percentage === undefined || props.percentage < 0 || props.percentage > 100) {
        return Result.fail('Percentage discount must be between 0 and 100')
      }
      return Result.ok(new Discount(DiscountType.PERCENTAGE, Money.zero(), props.percentage, props.reason.trim()))
    }

    if (props.type === DiscountType.FIXED) {
      if (!props.value || props.value.isZero()) {
        return Result.fail('Fixed discount must have a positive value')
      }
      return Result.ok(new Discount(DiscountType.FIXED, props.value, undefined, props.reason.trim()))
    }

    return Result.fail('Invalid discount type')
  }
}
