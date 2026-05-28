import { Result } from '../../../domain/shared/Result'
import { LeadEvent } from '../../../domain/lead/entities/LeadEvent'
import { LeadEventType } from '../../../domain/lead/LeadEventType'
import { ILeadRepository } from '../ports/ILeadRepository'
import { ILeadEventRepository } from '../ports/ILeadEventRepository'
import { IEventBus } from '../ports/IEventBus'

export interface TrackInteractionInput {
  leadId: string
  eventType: LeadEventType
  sessionId?: string
  fingerprint?: string
  metadata?: Record<string, unknown>
}

export class TrackInteractionUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private eventRepo: ILeadEventRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: TrackInteractionInput): Promise<Result<void, string>> {
    const lead = await this.leadRepo.findById(input.leadId)
    if (!lead) return Result.fail('Lead não encontrado')

    const eventResult = LeadEvent.create({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      leadId: input.leadId,
      type: input.eventType,
      sessionId: input.sessionId,
      fingerprint: input.fingerprint,
      metadata: input.metadata,
    })
    if (eventResult.isFail) return Result.fail(eventResult.error)

    const existing = await this.eventRepo.findByDedupHash(eventResult.value.dedupHash!)
    if (existing) {
      return Result.ok(undefined)
    }

    const addResult = lead.addEvent(eventResult.value)
    if (addResult.isFail) return Result.fail(addResult.error)

    await this.eventRepo.save(eventResult.value)
    await this.leadRepo.update(lead)
    await this.eventBus.publishMany(lead.events)
    lead.clearEvents()

    return Result.ok(undefined)
  }
}
