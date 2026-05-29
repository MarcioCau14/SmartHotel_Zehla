import { describe, it, expect, beforeEach } from 'vitest'
import { ProcessWebhookUseCase } from '../../../../src/application/lead/use-cases/ProcessWebhookUseCase'
import { CaptureLeadUseCase } from '../../../../src/application/lead/use-cases/CaptureLeadUseCase'
import { TrackInteractionUseCase } from '../../../../src/application/lead/use-cases/TrackInteractionUseCase'
import { InMemoryLeadRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadRepository'
import { InMemoryLeadEventRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadEventRepository'
import { FakeDuplicateDetectionService } from '../../../../src/infrastructure/persistence/lead/FakeDuplicateDetectionService'
import { FakeEventBus } from '../../../../src/infrastructure/persistence/lead/FakeEventBus'

describe('ProcessWebhookUseCase', () => {
  let leadRepo: InMemoryLeadRepository
  let eventRepo: InMemoryLeadEventRepository
  let eventBus: FakeEventBus
  let useCase: ProcessWebhookUseCase

  beforeEach(async () => {
    leadRepo = new InMemoryLeadRepository()
    eventRepo = new InMemoryLeadEventRepository()
    eventBus = new FakeEventBus()
    const duplicateService = new FakeDuplicateDetectionService(leadRepo)
    const capture = new CaptureLeadUseCase(leadRepo, duplicateService, eventBus)
    useCase = new ProcessWebhookUseCase(leadRepo, eventRepo, eventBus)

    await capture.execute({
      name: 'Pousada Webhook',
      email: 'webhook@pousada.com',
      phone: '5511999999999',
    })
    eventBus.clear()
  })

  it('should fail without email', async () => {
    const result = await useCase.execute({ eventType: 'email_opened' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Email')
  })

  it('should fail for unknown email', async () => {
    const result = await useCase.execute({
      email: 'unknown@test.com',
      eventType: 'email_opened',
    })
    expect(result.isFail).toBe(true)
  })

  it('should ignore unmapped event types', async () => {
    const result = await useCase.execute({
      email: 'webhook@pousada.com',
      eventType: 'some_random_event',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('ignored')
  })
})
