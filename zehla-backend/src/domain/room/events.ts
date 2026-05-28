import { DomainEvent } from '../shared/DomainEvent'
import { RoomType, RoomStatus, PricingType } from './enums'

export class RoomCreatedEvent implements DomainEvent {
  public readonly eventName = 'RoomCreated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      number: string
      type: RoomType
      basePrice: number
      capacity: number
      propertyId: string
    }
  ) {}
}

export class RoomStatusChangedEvent implements DomainEvent {
  public readonly eventName = 'RoomStatusChanged'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      previousStatus: RoomStatus
      newStatus: RoomStatus
      reason?: string
    }
  ) {}
}

export class RoomPricingUpdatedEvent implements DomainEvent {
  public readonly eventName = 'RoomPricingUpdated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      previousBasePrice: number
      newBasePrice: number
      previousPricingType: PricingType
      newPricingType: PricingType
    }
  ) {}
}

export class RoomAvailabilityChangedEvent implements DomainEvent {
  public readonly eventName = 'RoomAvailabilityChanged'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      propertyId: string
      wasAvailable: boolean
      isAvailable: boolean
      reason: string
    }
  ) {}
}

export class PricingRuleCreatedEvent implements DomainEvent {
  public readonly eventName = 'PricingRuleCreated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      name: string
      roomType: RoomType | null
      startDate: string
      endDate: string
      multiplier: number
      propertyId: string
    }
  ) {}
}

export class PricingRuleDeactivatedEvent implements DomainEvent {
  public readonly eventName = 'PricingRuleDeactivated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      name: string
      propertyId: string
    }
  ) {}
}

export class RoomMaintenanceScheduledEvent implements DomainEvent {
  public readonly eventName = 'RoomMaintenanceScheduled'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      reason: string
      scheduledStart: string
      scheduledEnd: string
      propertyId: string
    }
  ) {}
}
