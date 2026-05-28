import { Result } from '../../shared/Result'
import { DomainEvent } from '../../shared/DomainEvent'
import { RoomType, RoomStatus, PricingType, canTransitionRoomStatus, isRoomAvailableForBooking } from '../enums'
import { MonetaryValue } from '../value-objects/MonetaryValue'
import { Capacity } from '../value-objects/Capacity'
import { Amenities } from '../value-objects/Amenities'
import { PricingRule } from './PricingRule'
import {
  RoomCreatedEvent,
  RoomStatusChangedEvent,
  RoomPricingUpdatedEvent,
} from '../events'

export interface RoomData {
  id: string
  number: string
  name?: string
  type: RoomType
  capacity: Capacity
  basePrice: MonetaryValue
  pricingType: PricingType
  amenities: Amenities
  status: RoomStatus
  description?: string
  images: string[]
  propertyId: string
  createdAt: Date
}

export class Room {
  private _events: DomainEvent[] = []

  private constructor(private data: RoomData) {}

  static create(props: {
    id: string
    number: string
    name?: string
    type?: RoomType
    capacity: Capacity
    basePrice: MonetaryValue
    pricingType?: PricingType
    amenities?: Amenities
    description?: string
    images?: string[]
    propertyId: string
  }): Result<Room, string> {
    if (!props.id) return Result.fail('ID do quarto é obrigatório')
    if (!props.number || props.number.trim().length < 1) {
      return Result.fail('Número do quarto é obrigatório')
    }
    if (!props.propertyId) return Result.fail('propertyId é obrigatório')
    if (props.basePrice.isZero()) {
      return Result.fail('Preço base deve ser maior que zero')
    }

    const room = new Room({
      id: props.id,
      number: props.number.trim(),
      name: props.name,
      type: props.type ?? RoomType.STANDARD,
      capacity: props.capacity,
      basePrice: props.basePrice,
      pricingType: props.pricingType ?? PricingType.PER_ROOM,
      amenities: props.amenities ?? Amenities.EMPTY,
      status: RoomStatus.AVAILABLE,
      description: props.description,
      images: props.images ?? [],
      propertyId: props.propertyId,
      createdAt: new Date(),
    })

    room._events.push({
      aggregateId: props.id,
      eventName: 'RoomCreated',
      occurredAt: new Date(),
      payload: {
        number: room.data.number,
        type: room.data.type,
        basePrice: room.data.basePrice.amount,
        capacity: room.data.capacity.maxTotal,
        propertyId: room.data.propertyId,
      },
    } as RoomCreatedEvent)

    return Result.ok(room)
  }

  // --- Getters ---
  get id(): string { return this.data.id }
  get number(): string { return this.data.number }
  get name(): string | undefined { return this.data.name }
  get type(): RoomType { return this.data.type }
  get capacity(): Capacity { return this.data.capacity }
  get basePrice(): MonetaryValue { return this.data.basePrice }
  get pricingType(): PricingType { return this.data.pricingType }
  get amenities(): Amenities { return this.data.amenities }
  get status(): RoomStatus { return this.data.status }
  get description(): string | undefined { return this.data.description }
  get images(): string[] { return [...this.data.images] }
  get propertyId(): string { return this.data.propertyId }
  get createdAt(): Date { return this.data.createdAt }
  get events(): DomainEvent[] { return [...this._events] }

  get isAvailable(): boolean {
    return isRoomAvailableForBooking(this.data.status)
  }

  // --- Commands ---

  changeStatus(newStatus: RoomStatus, reason?: string): Result<void, string> {
    const previousStatus = this.data.status

    if (previousStatus === newStatus) {
      return Result.fail(`Quarto já está com status ${newStatus}`)
    }

    if (!canTransitionRoomStatus(previousStatus, newStatus)) {
      return Result.fail(
        `Não é possível mudar status de ${previousStatus} para ${newStatus}`
      )
    }

    this.data.status = newStatus
    this._events.push({
      aggregateId: this.data.id,
      eventName: 'RoomStatusChanged',
      occurredAt: new Date(),
      payload: {
        previousStatus,
        newStatus,
        reason,
      },
    } as RoomStatusChangedEvent)

    return Result.ok(undefined)
  }

  markOccupied(): Result<void, string> {
    return this.changeStatus(RoomStatus.OCCUPIED)
  }

  markCleaning(): Result<void, string> {
    return this.changeStatus(RoomStatus.CLEANING)
  }

  markAvailable(): Result<void, string> {
    return this.changeStatus(RoomStatus.AVAILABLE)
  }

  markMaintenance(reason?: string): Result<void, string> {
    return this.changeStatus(RoomStatus.MAINTENANCE, reason)
  }

  markBlocked(reason?: string): Result<void, string> {
    return this.changeStatus(RoomStatus.BLOCKED, reason)
  }

  updatePricing(basePrice: MonetaryValue, pricingType: PricingType): Result<void, string> {
    if (basePrice.isZero()) {
      return Result.fail('Preço base deve ser maior que zero')
    }

    const previousBasePrice = this.data.basePrice.amount
    const previousPricingType = this.data.pricingType

    this.data.basePrice = basePrice
    this.data.pricingType = pricingType

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'RoomPricingUpdated',
      occurredAt: new Date(),
      payload: {
        previousBasePrice,
        newBasePrice: basePrice.amount,
        previousPricingType,
        newPricingType: pricingType,
      },
    } as RoomPricingUpdatedEvent)

    return Result.ok(undefined)
  }

  updateInfo(props: {
    name?: string
    type?: RoomType
    description?: string
    images?: string[]
  }): void {
    if (props.name !== undefined) this.data.name = props.name
    if (props.type !== undefined) this.data.type = props.type
    if (props.description !== undefined) this.data.description = props.description
    if (props.images !== undefined) this.data.images = props.images
  }

  clearEvents(): void {
    this._events = []
  }

  toJSON() {
    return {
      id: this.data.id,
      number: this.data.number,
      name: this.data.name,
      type: this.data.type,
      capacity: this.data.capacity.toJSON(),
      basePrice: this.data.basePrice.toJSON(),
      pricingType: this.data.pricingType,
      amenities: this.data.amenities.toJSON(),
      status: this.data.status,
      description: this.data.description,
      images: [...this.data.images],
      propertyId: this.data.propertyId,
      createdAt: this.data.createdAt.toISOString(),
    }
  }
}
