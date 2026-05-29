import { Result } from '../../shared/Result'
import { InvoiceItemType } from '../enums'
import { Money } from '../value-objects/Money'

export interface InvoiceItemData {
  id: string
  description: string
  type: InvoiceItemType
  unitPrice: Money
  quantity: number
  totalPrice: Money
}

export class InvoiceItem {
  private constructor(private data: InvoiceItemData) {
    Object.freeze(this)
  }

  static create(props: {
    id: string
    description: string
    type: InvoiceItemType
    unitPrice: Money
    quantity: number
  }): Result<InvoiceItem, string> {
    if (!props.id) return Result.fail('Item ID is required')
    if (!props.description || props.description.trim().length === 0) {
      return Result.fail('Item description is required')
    }
    if (props.quantity < 1) {
      return Result.fail('Quantity must be at least 1')
    }
    if (props.unitPrice.isZero() && props.type !== InvoiceItemType.DISCOUNT) {
      return Result.fail('Unit price must be greater than zero')
    }

    const totalPrice = props.unitPrice.multiply(props.quantity)

    return Result.ok(new InvoiceItem({
      id: props.id,
      description: props.description.trim(),
      type: props.type,
      unitPrice: props.unitPrice,
      quantity: props.quantity,
      totalPrice,
    }))
  }

  get id(): string { return this.data.id }
  get description(): string { return this.data.description }
  get type(): InvoiceItemType { return this.data.type }
  get unitPrice(): Money { return this.data.unitPrice }
  get quantity(): number { return this.data.quantity }
  get totalPrice(): Money { return this.data.totalPrice }
}
