import { describe, it, expect, beforeEach } from 'vitest'
import { MoveFunnelUseCase } from '../../../../src/application/lead/use-cases/MoveFunnelUseCase'
import { CaptureLeadUseCase } from '../../../../src/application/lead/use-cases/CaptureLeadUseCase'
import { InMemoryLeadRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadRepository'
import { FakeDuplicateDetectionService } from '../../../../src/infrastructure/persistence/lead/FakeDuplicateDetectionService'
import { FakeEventBus } from '../../../../src/infrastructure/persistence/lead/FakeEventBus'
import { LeadStatus } from '../../../../src/domain/lead/LeadStatus'

describe('MoveFunnelUseCase', () => {
  let leadRepo: InMemoryLeadRepository
  let eventBus: FakeEventBus
  let useCase: MoveFunnelUseCase
  let captureUseCase: CaptureLeadUseCase
  let capturedId: string

  beforeEach(async () => {
    leadRepo = new InMemoryLeadRepository()
    eventBus = new FakeEventBus()
    const duplicateService = new FakeDuplicateDetectionService(leadRepo)
    captureUseCase = new CaptureLeadUseCase(leadRepo, duplicateService, eventBus)
    useCase = new MoveFunnelUseCase(leadRepo, eventBus)

    const result = await captureUseCase.execute({
      name: 'Pousada Funil',
      phone: '5511999999999',
    })
    capturedId = result.value.id
    eventBus.clear()
  })

  it('should move funnel stage forward', async () => {
    const result = await useCase.execute({
      leadId: capturedId,
      targetStage: 'AWARE',
    })
    expect(result.isOk).toBe(true)
    const lead = await leadRepo.findById(capturedId)
    expect(lead!.funnel.funnelStage).toBe('AWARE')
  })

  it('should transition status forward', async () => {
    const result = await useCase.execute({
      leadId: capturedId,
      targetStatus: LeadStatus.QUALIFIED,
    })
    expect(result.isOk).toBe(true)
    const lead = await leadRepo.findById(capturedId)
    expect(lead!.funnel.status).toBe(LeadStatus.QUALIFIED)
  })

  it('should reject funnel regression', async () => {
    await useCase.execute({ leadId: capturedId, targetStage: 'AWARE' })
    eventBus.clear()
    const result = await useCase.execute({ leadId: capturedId, targetStage: 'NEUTRAL' })
    expect(result.isFail).toBe(true)
  })

  it('should reject invalid status transition', async () => {
    const result = await useCase.execute({
      leadId: capturedId,
      targetStatus: LeadStatus.CONVERTED,
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail for non-existent lead', async () => {
    const result = await useCase.execute({
      leadId: 'nonexistent',
      targetStage: 'AWARE',
    })
    expect(result.isFail).toBe(true)
  })
})
