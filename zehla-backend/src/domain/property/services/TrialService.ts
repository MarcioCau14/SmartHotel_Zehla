import { Result } from '../../shared/Result'
import { Property } from '../entities/Property'
import { TrialPeriod } from '../value-objects/TrialPeriod'
import { DomainEvent } from '../../shared/DomainEvent'

export interface TrialCheckResult {
  property: Property
  events: DomainEvent[]
}

export class TrialService {
  startTrial(property: Property, days: number = 7): Result<Property, string> {
    const trialResult = TrialPeriod.create(new Date(), days)
    if (trialResult.isFail) return Result.fail(trialResult.error)
    return Result.ok(property)
  }

  checkExpiration(property: Property): Result<TrialCheckResult, string> {
    const eventsBefore = property.events.length
    const result = property.checkTrial()
    if (result.isFail) return Result.fail(result.error)

    const newEvents = property.events.slice(eventsBefore)
    return Result.ok({ property, events: newEvents })
  }

  sendExpiryNotification(property: Property): Result<Property, string> {
    if (!property.trialPeriod) return Result.ok(property)
    if (property.trialPeriod.notificationSent) return Result.ok(property)

    property.checkTrial()
    return Result.ok(property)
  }

  findExpiringTrials(repo: { findExpiringTrials: () => Promise<Property[]> }): Promise<Property[]> {
    return repo.findExpiringTrials()
  }

  findExpiredTrials(repo: { findExpiredTrials: () => Promise<Property[]> }): Promise<Property[]> {
    return repo.findExpiredTrials()
  }
}
