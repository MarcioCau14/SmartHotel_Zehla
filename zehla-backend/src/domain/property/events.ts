import { DomainEvent } from '../shared/DomainEvent'
import { Plan, PropertyStatus } from './enums'

export class PropertyCreatedEvent implements DomainEvent {
  public readonly eventName = 'PropertyCreated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      name: string
      slug: string
      registrationNumber: string
      plan: Plan
      uf: string
    }
  ) {}
}

export class PropertyActivatedEvent implements DomainEvent {
  public readonly eventName = 'PropertyActivated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      previousStatus: PropertyStatus
      newStatus: PropertyStatus.ACTIVE
      activationType: 'TRIAL_START' | 'REACTIVATION' | 'NEW_SUBSCRIPTION'
    }
  ) {}
}

export class PropertySuspendedEvent implements DomainEvent {
  public readonly eventName = 'PropertySuspended'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      reason: string
    }
  ) {}
}

export class PropertyReactivatedEvent implements DomainEvent {
  public readonly eventName = 'PropertyReactivated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, never>
  ) {}
}

export class PropertyChurnedEvent implements DomainEvent {
  public readonly eventName = 'PropertyChurned'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      previousPlan: Plan
      reason: string
    }
  ) {}
}

export class PropertyPlanChangedEvent implements DomainEvent {
  public readonly eventName = 'PropertyPlanChanged'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      previousPlan: Plan
      newPlan: Plan
    }
  ) {}
}

export class TrialStartedEvent implements DomainEvent {
  public readonly eventName = 'TrialStarted'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      trialEndDate: Date
      durationDays: number
    }
  ) {}
}

export class TrialExpiringEvent implements DomainEvent {
  public readonly eventName = 'TrialExpiring'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      daysRemaining: number
      trialEndDate: Date
    }
  ) {}
}

export class TrialExpiredEvent implements DomainEvent {
  public readonly eventName = 'TrialExpired'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      trialEndDate: Date
    }
  ) {}
}

export class VoiceTokensExhaustedEvent implements DomainEvent {
  public readonly eventName = 'VoiceTokensExhausted'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      used: number
      limit: number
    }
  ) {}
}

export class CadasturExpiringEvent implements DomainEvent {
  public readonly eventName = 'CadasturExpiring'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      cadasturNumber: string
      daysUntilExpiry: number
      expiryDate: Date
    }
  ) {}
}

export class PropertyConfigurationUpdatedEvent implements DomainEvent {
  public readonly eventName = 'PropertyConfigurationUpdated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      changedFields: string[]
    }
  ) {}
}
