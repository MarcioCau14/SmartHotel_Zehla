import { Result } from '../../shared/Result'
import { Money } from '../value-objects/Money'

interface ReservationItemProps {
  id: string
  reservationId: string
  serviceItemId: string
  quantity: number
  unitPrice: Money
  notes?: string
  deliveredAt?: Date
  createdAt: Date
}

export class ReservationItem {
  private _status: 'pending' | 'delivered' = 'pending'

  private constructor(private props: ReservationItemProps) {}

  static create(props: {
    id: string
    reservationId: string
    serviceItemId: string
    quantity: number
    unitPrice: Money
    notes?: string
  }): Result<ReservationItem, string> {
    if (props.quantity < 1) {
      return Result.fail('Quantidade deve ser no mínimo 1')
    }
    return Result.ok(
      new ReservationItem({
        ...props,
        createdAt: new Date(),
      })
    )
  }

  get id(): string { return this.props.id }
  get reservationId(): string { return this.props.reservationId }
  get serviceItemId(): string { return this.props.serviceItemId }
  get quantity(): number { return this.props.quantity }
  get unitPrice(): Money { return this.props.unitPrice }
  get totalPrice(): Money { return this.props.unitPrice.multiply(this.props.quantity) }
  get status(): string { return this._status }
  get notes(): string | undefined { return this.props.notes }
  get deliveredAt(): Date | undefined { return this.props.deliveredAt }

  deliver(): Result<void, string> {
    if (this._status === 'delivered') {
      return Result.fail('Item já foi entregue')
    }
    this._status = 'delivered'
    this.props.deliveredAt = new Date()
    return Result.ok(undefined)
  }

  toJSON() {
    return {
      id: this.props.id,
      reservationId: this.props.reservationId,
      serviceItemId: this.props.serviceItemId,
      quantity: this.props.quantity,
      unitPrice: this.props.unitPrice.toJSON(),
      totalPrice: this.totalPrice.toJSON(),
      status: this._status,
      notes: this.props.notes,
      deliveredAt: this.props.deliveredAt?.toISOString(),
    }
  }
}
