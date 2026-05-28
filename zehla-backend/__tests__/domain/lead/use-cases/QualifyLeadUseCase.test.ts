import { describe, it, expect, beforeEach } from 'vitest'
import { QualifyLeadUseCase } from '../../../../src/application/lead/use-cases/QualifyLeadUseCase'
import { CaptureLeadUseCase } from '../../../../src/application/lead/use-cases/CaptureLeadUseCase'
import { InMemoryLeadRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadRepository'
import { FakeDuplicateDetectionService } from '../../../../src/infrastructure/persistence/lead/FakeDuplicateDetectionService'
import { FakeClusterActionService } from '../../../../src/infrastructure/persistence/lead/FakeClusterActionService'
import { FakeEventBus } from '../../../../src/infrastructure/persistence/lead/FakeEventBus'

describe('QualifyLeadUseCase', () => {
  let leadRepo: InMemoryLeadRepository
  let clusterActions: FakeClusterActionService
  let eventBus: FakeEventBus
  let useCase: QualifyLeadUseCase
  let captureUseCase: CaptureLeadUseCase

  beforeEach(() => {
    leadRepo = new InMemoryLeadRepository()
    clusterActions = new FakeClusterActionService()
    eventBus = new FakeEventBus()
    const duplicateService = new FakeDuplicateDetectionService(leadRepo)
    captureUseCase = new CaptureLeadUseCase(leadRepo, duplicateService, eventBus)
    useCase = new QualifyLeadUseCase(leadRepo, clusterActions, eventBus)
  })

  it('should qualify a lead with new score', async () => {
    const captured = await captureUseCase.execute({
      name: 'Pousada Qualificada',
      phone: '5511999999999',
    })
    eventBus.clear()

    const result = await useCase.execute({
      leadId: captured.value.id,
      newScore: 70,
    })
    expect(result.isOk).toBe(true)

    const lead = await leadRepo.findById(captured.value.id)
    expect(lead!.score.score).toBe(70)
    expect(lead!.score.cluster).toBe('HOT')
  })

  it('should trigger cluster actions on COLD -> HOT transition', async () => {
    const captured = await captureUseCase.execute({
      name: 'Pousada Hot Lead',
      phone: '5511999999999',
    })
    eventBus.clear()

    await useCase.execute({
      leadId: captured.value.id,
      newScore: 70,
    })

    expect(clusterActions.executedActions.length).toBe(1)
    expect(clusterActions.executedActions[0].actions).toContain('send_sales_alert')
  })

  it('should NOT trigger actions when cluster stays the same', async () => {
    const captured = await captureUseCase.execute({
      name: 'Pousada Fria',
      phone: '5511999999999',
    })
    eventBus.clear()
    clusterActions.clear()

    await useCase.execute({
      leadId: captured.value.id,
      newScore: 10,
    })

    expect(clusterActions.executedActions.length).toBe(0)
  })

  it('should fail for non-existent lead', async () => {
    const result = await useCase.execute({
      leadId: 'nonexistent',
      newScore: 50,
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with invalid score', async () => {
    const captured = await captureUseCase.execute({
      name: 'Teste',
      phone: '5511999999999',
    })
    const result = await useCase.execute({
      leadId: captured.value.id,
      newScore: 999,
    })
    expect(result.isFail).toBe(true)
  })

  it('should emit LeadQualified event on cluster change', async () => {
    const captured = await captureUseCase.execute({
      name: 'Pousada Evento',
      phone: '5511999999999',
    })
    eventBus.clear()

    await useCase.execute({
      leadId: captured.value.id,
      newScore: 65,
    })

    const hasEvent = eventBus.events.some((e) => e.eventName === 'LeadQualified')
    expect(hasEvent).toBe(true)
  })
})
