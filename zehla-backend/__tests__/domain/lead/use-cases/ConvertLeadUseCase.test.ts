import { describe, it, expect, beforeEach } from 'vitest'
import { ConvertLeadUseCase } from '../../../../src/application/lead/use-cases/ConvertLeadUseCase'
import { CaptureLeadUseCase } from '../../../../src/application/lead/use-cases/CaptureLeadUseCase'
import { InMemoryLeadRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadRepository'
import { FakeDuplicateDetectionService } from '../../../../src/infrastructure/persistence/lead/FakeDuplicateDetectionService'
import { FakeEventBus } from '../../../../src/infrastructure/persistence/lead/FakeEventBus'
import { LeadStatus } from '../../../../src/domain/lead/LeadStatus'

describe('ConvertLeadUseCase', () => {
  let leadRepo: InMemoryLeadRepository
  let eventBus: FakeEventBus
  let useCase: ConvertLeadUseCase
  let capturedId: string

  beforeEach(async () => {
    leadRepo = new InMemoryLeadRepository()
    eventBus = new FakeEventBus()
    const duplicateService = new FakeDuplicateDetectionService(leadRepo)
    const capture = new CaptureLeadUseCase(leadRepo, duplicateService, eventBus)
    useCase = new ConvertLeadUseCase(leadRepo, eventBus)

    const r = await capture.execute({
      name: 'Pousada Converter',
      phone: '5511999999999',
    })
    capturedId = r.value.id
    eventBus.clear()
  })

  it('should convert a qualified lead through full path', async () => {
    const lead = await leadRepo.findById(capturedId)
    lead!.transitionStatus(LeadStatus.QUALIFIED)
    await leadRepo.update(lead!)
    eventBus.clear()

    const l2 = await leadRepo.findById(capturedId)
    l2!.transitionStatus(LeadStatus.TRIAL_STARTED)
    await leadRepo.update(l2!)
    eventBus.clear()

    const l3 = await leadRepo.findById(capturedId)
    l3!.transitionStatus(LeadStatus.CONVERTED)
    await leadRepo.update(l3!)
    eventBus.clear()

    const leadFinal = await leadRepo.findById(capturedId)
    expect(leadFinal!.funnel.status).toBe(LeadStatus.CONVERTED)
  })

  it('should reject direct conversion from PROSPECT', async () => {
    const result = await useCase.execute({ leadId: capturedId })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('transicionar')
  })

  it('should fail for non-existent lead', async () => {
    const result = await useCase.execute({ leadId: 'nonexistent' })
    expect(result.isFail).toBe(true)
  })
})
