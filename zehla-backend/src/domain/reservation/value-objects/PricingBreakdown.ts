import { Money } from './Money'
import { Result } from '../../shared/Result'

interface PricingRuleApplied {
  ruleId: string
  name: string
  type: 'multiplier' | 'fixed'
  value: number
}

export class PricingBreakdown {
  private constructor(
    public readonly roomPrice: Money,
    public readonly nights: number,
    public readonly subtotal: Money,
    public readonly discount: Money,
    public readonly total: Money,
    public readonly pricingRulesApplied: PricingRuleApplied[]
  ) {
    Object.freeze(this)
  }

  static create(props: {
    roomPrice: Money
    nights: number
    discount: Money
    pricingRulesApplied?: PricingRuleApplied[]
  }): Result<PricingBreakdown, string> {
    if (props.nights < 1) {
      return Result.fail('Mínimo de 1 noite')
    }
    const subtotal = props.roomPrice.multiply(props.nights)
    const totalResult = subtotal.subtract(props.discount)
    if (totalResult.isFail) {
      return Result.fail('Desconto não pode exceder o valor total')
    }
    return Result.ok(
      new PricingBreakdown(
        props.roomPrice,
        props.nights,
        subtotal,
        props.discount,
        totalResult.value,
        props.pricingRulesApplied ?? []
      )
    )
  }

  toJSON() {
    return {
      roomPrice: this.roomPrice.toJSON(),
      nights: this.nights,
      subtotal: this.subtotal.toJSON(),
      discount: this.discount.toJSON(),
      total: this.total.toJSON(),
      pricingRulesApplied: this.pricingRulesApplied,
    }
  }
}
