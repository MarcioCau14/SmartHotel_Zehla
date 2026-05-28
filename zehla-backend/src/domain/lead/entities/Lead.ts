import { Result } from '../../shared/Result'
import { DomainEvent } from '../../shared/DomainEvent'
import { LeadContactInfo } from '../value-objects/LeadContactInfo'
import { BusinessProfile } from '../value-objects/BusinessProfile'
import { BehaviorSignals } from '../value-objects/BehaviorSignals'
import { LeadScore } from '../value-objects/LeadScore'
import { FunnelPosition } from '../value-objects/FunnelPosition'
import { SwipeTracking } from '../value-objects/SwipeTracking'
import { UTMParams } from '../value-objects/UTMParams'
import { LeadSource } from '../LeadSource'
import { LeadStatus, FunnelStage } from '../LeadStatus'
import { LeadEvent, LeadEventData } from './LeadEvent'

export interface LeadData {
  id: string
  contact: LeadContactInfo
  business: BusinessProfile
  behavior: BehaviorSignals
  score: LeadScore
  funnel: FunnelPosition
  swipe: SwipeTracking
  utm?: UTMParams
  propertyId?: string
  lastInteractionAt?: Date
  events: LeadEvent[]
  createdAt: Date
}

export class Lead {
  private _events: DomainEvent[] = []

  private constructor(private data: LeadData) {}

  static create(props: {
    id: string
    contact: LeadContactInfo
    business?: BusinessProfile
    behavior?: BehaviorSignals
    source?: LeadSource
    propertyId?: string
    utm?: UTMParams
  }): Result<Lead, string> {
    const score = LeadScore.create({ score: 0 })
    if (score.isFail) return Result.fail(score.error)

    const funnelResult = FunnelPosition.initial(props.source ?? 'SECRETARIA_AI')
    if (funnelResult.isFail) return Result.fail(funnelResult.error)

    const swipe = SwipeTracking.create()
    const business = props.business ?? BusinessProfile.create({ hasWebsite: false }).value
    const behavior = props.behavior ?? BehaviorSignals.create({}).value

    const lead = new Lead({
      id: props.id,
      contact: props.contact,
      business,
      behavior,
      score: score.value,
      funnel: funnelResult.value,
      swipe: swipe.value,
      utm: props.utm,
      propertyId: props.propertyId,
      events: [],
      createdAt: new Date(),
    })

    lead._events.push({
      aggregateId: props.id,
      eventName: 'LeadCaptured',
      occurredAt: new Date(),
      payload: {
        name: props.contact.name,
        source: props.source ?? 'SECRETARIA_AI',
        propertyId: props.propertyId,
      },
    })

    return Result.ok(lead)
  }

  // Getters
  get id(): string { return this.data.id }
  get contact(): LeadContactInfo { return this.data.contact }
  get business(): BusinessProfile { return this.data.business }
  get behavior(): BehaviorSignals { return this.data.behavior }
  get score(): LeadScore { return this.data.score }
  get funnel(): FunnelPosition { return this.data.funnel }
  get swipe(): SwipeTracking { return this.data.swipe }
  get utm(): UTMParams | undefined { return this.data.utm }
  get propertyId(): string | undefined { return this.data.propertyId }
  get lastInteractionAt(): Date | undefined { return this.data.lastInteractionAt }
  get events(): DomainEvent[] { return [...this._events] }
  get leadEvents(): LeadEvent[] { return [...this.data.events] }

  // Commands

  qualify(newScore: LeadScore): Result<void, string> {
    const prevCluster = this.data.score.cluster
    this.data.score = newScore
    const newCluster = newScore.cluster

    if (prevCluster !== newCluster) {
      const prevFunnel = this.data.funnel
      const updatedFunnel = FunnelPosition.create({
        ...prevFunnel,
        previousCluster: prevCluster,
      })
      if (updatedFunnel.isOk) this.data.funnel = updatedFunnel.value

      this._events.push({
        aggregateId: this.data.id,
        eventName: 'LeadQualified',
        occurredAt: new Date(),
        payload: {
          previousScore: this.data.score.score,
          newScore: newScore.score,
          previousCluster: prevCluster,
          newCluster,
        },
      })
    }
    return Result.ok(undefined)
  }

  moveToStage(target: FunnelStage): Result<void, string> {
    const result = this.data.funnel.transitionStage(target)
    if (result.isFail) return Result.fail(result.error)
    this.data.funnel = result.value
    return Result.ok(undefined)
  }

  transitionStatus(target: LeadStatus): Result<void, string> {
    const result = this.data.funnel.transitionStatus(target)
    if (result.isFail) return Result.fail(result.error)
    this.data.funnel = result.value

    if (target === LeadStatus.CONVERTED) {
      this._events.push({
        aggregateId: this.data.id,
        eventName: 'LeadConverted',
        occurredAt: new Date(),
        payload: {
          propertyId: this.data.propertyId,
          plan: 'LITE',
        },
      })
    }
    return Result.ok(undefined)
  }

  addEvent(event: LeadEvent): Result<void, string> {
    this.data.events.push(event)
    this.data.lastInteractionAt = new Date()

    const scoreDelta = event.scoreImpact
    const newScore = this.data.score.addScoreDelta(scoreDelta)
    if (newScore.isOk) {
      this.data.score = newScore.value
    }

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'InteractionAdded',
      occurredAt: new Date(),
      payload: {
        eventType: event.type,
        scoreImpact: event.scoreImpact,
      },
    })

    return Result.ok(undefined)
  }

  updateBehavior(behavior: BehaviorSignals): void {
    this.data.behavior = behavior
  }

  updateBusiness(business: BusinessProfile): void {
    this.data.business = business
  }

  updateContact(contact: LeadContactInfo): void {
    this.data.contact = contact
  }

  clearEvents(): void {
    this._events = []
  }

  toJSON() {
    return {
      id: this.data.id,
      contact: this.data.contact.toJSON(),
      business: this.data.business.toJSON(),
      behavior: this.data.behavior.toJSON(),
      score: this.data.score.toJSON(),
      funnel: this.data.funnel.toJSON(),
      swipe: this.data.swipe.toJSON(),
      propertyId: this.data.propertyId,
      lastInteractionAt: this.data.lastInteractionAt?.toISOString(),
      leadEvents: this.data.events.map((e) => e.toJSON()),
      createdAt: this.data.createdAt.toISOString(),
    }
  }
}
