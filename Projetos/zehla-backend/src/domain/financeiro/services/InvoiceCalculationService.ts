import { InvoiceItem } from '../entities/InvoiceItem'
import { Discount } from '../value-objects/Discount'
import { Money } from '../value-objects/Money'
import { DiscountType } from '../enums'

export class InvoiceCalculationService {
  static calculateTotal(items: InvoiceItem[]): Money {
    return items.reduce((acc, item) => {
      const sum = acc.add(item.totalPrice)
      return sum.isOk ? sum.value : acc
    }, Money.zero())
  }

  static applyDiscounts(total: Money, discounts: Discount[]): Money {
    return discounts.reduce((acc, d) => {
      if (d.type === DiscountType.FIXED) {
        const result = acc.subtract(d.value)
        return result.isOk ? result.value : acc
      }
      const pctAmt = acc.percentage(d.percentage ?? 0)
      const result = acc.subtract(pctAmt)
      return result.isOk ? result.value : acc
    }, total)
  }
}
