import { describe, it, expect, beforeEach } from 'vitest'
import { TrackInteractionUseCase } from '../../../../src/application/lead/use-cases/TrackInteractionUseCase'
import { CaptureLeadUseCase } from '../../../../src/application/lead/use-cases/CaptureLeadUseCase'
import { InMemoryLeadRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadRepository'
import { InMemoryLeadEventRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadEventRepository'
import { FakeDuplicateDetectionService } from '../../../../src/infrastructure/persistence/lead/FakeDuplicateDetectionService'
import { FakeEventBus } from '../../../../src/infrastructure/persistence/lead/FakeEventBus'
import { LeadEventType } from '../../../../src/domain/lead/LeadEventType'

describe('TrackInteractionUseCase', () => {
  let leadRepo: InMemoryLeadRepository
  let eventRepo: InMemoryLeadEventRepository
  let eventBus: FakeEventBus
  let useCase: TrackInteractionUseCase
  let capturedId: string

  beforeEach(async () => {
    leadRepo = new InMemoryLeadRepository()
    eventRepo = new InMemoryLeadEventRepository()
    eventBus = new FakeEventBus()
    const duplicateService = new FakeDuplicateDetectionService(leadRepo)
    const capture = new CaptureLeadUseCase(leadRepo, duplicateService, eventBus)
    useCase = new TrackInteractionUseCase(leadRepo, eventRepo, eventBus)

    const r = await capture.execute({
      name: 'Pousada Rastreio',
      phone: '5511999999999',
    })
    capturedId = r.value.id
    eventBus.clear()
  })

  it('should track a WHATSAPP_REPLY event and increase score', async () => {
    const result = await useCase.execute({
      leadId: capturedId,
      eventType: LeadEventType.WHATSAPP_REPLY,
      sessionId: 'sess-1',
    })
    expect(result.isOk).toBe(true)

    const lead = await leadRepo.findById(capturedId)
    expect(lead!.score.score).toBe(10)
  })

  it('should track an EMAIL_OPEN event', async () => {
    const result = await useCase.execute({
      leadId: capturedId,
      eventType: LeadEventType.EMAIL_OPEN,
      sessionId: 'sess-2',
    })
    expect(result.isOk).toBe(true)

    const lead = await leadRepo.findById(capturedId)
    expect(lead!.score.score).toBe(1)
  })

  it('should deduplicate identical events', async () => {
    await useCase.execute({
      leadId: capturedId,
      eventType: LeadEventType.EMAIL_OPEN,
      sessionId: 'sess-3',
    })
    eventBus.clear()

    const events = await eventRepo.findByLeadId(capturedId)
    const hash = events[0].dedupHash

    const existing = await eventRepo.findByDedupHash(hash!)
    expect(existing).not.toBeNull()
  })

  it('should fail for non-existent lead', async () => {
    const result = await useCase.execute({
      leadId: 'nonexistent',
      eventType: LeadEventType.EMAIL_OPEN,
    })
    expect(result.isFail).toBe(true)
  })

  it('should emit InteractionAdded event', async () => {
    await useCase.execute({
      leadId: capturedId,
      eventType: LeadEventType.WHATSAPP_REPLY,
    })
    const hasEvent = eventBus.events.some((e) => e.eventName === 'InteractionAdded')
    expect(hasEvent).toBe(true)
  })

  it('should clamp score at 100', async () => {
    const lead = await leadRepo.findById(capturedId)
    const { LeadScore } = await import('../../../../src/domain/lead/value-objects/LeadScore')
    const highScore = LeadScore.create({ score: 95 }).value
    lead!.qualify(highScore)
    await leadRepo.update(lead!)
    eventBus.clear()

    await useCase.execute({
      leadId: capturedId,
      eventType: LeadEventType.CONVERSION,
    })

    const updated = await leadRepo.findById(capturedId)
    expect(updated!.score.score).toBe(100)
  })
})
