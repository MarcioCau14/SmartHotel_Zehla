import { describe, it, expect, beforeEach } from 'vitest'
import { IdentifyDuplicateUseCase } from '../../../../src/application/lead/use-cases/IdentifyDuplicateUseCase'
import { CaptureLeadUseCase } from '../../../../src/application/lead/use-cases/CaptureLeadUseCase'
import { InMemoryLeadRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadRepository'
import { FakeDuplicateDetectionService } from '../../../../src/infrastructure/persistence/lead/FakeDuplicateDetectionService'
import { FakeEventBus } from '../../../../src/infrastructure/persistence/lead/FakeEventBus'

describe('IdentifyDuplicateUseCase', () => {
  let leadRepo: InMemoryLeadRepository
  let useCase: IdentifyDuplicateUseCase

  beforeEach(async () => {
    leadRepo = new InMemoryLeadRepository()
    const duplicateService = new FakeDuplicateDetectionService(leadRepo)
    const eventBus = new FakeEventBus()
    const capture = new CaptureLeadUseCase(leadRepo, duplicateService, eventBus)
    useCase = new IdentifyDuplicateUseCase(leadRepo, duplicateService)

    await capture.execute({
      name: 'Pousada Existente',
      email: 'existente@pousada.com',
      phone: '5511999999999',
    })
  })

  it('should detect duplicate by email', async () => {
    const result = await useCase.execute({ email: 'existente@pousada.com' })
    expect(result.isOk).toBe(true)
    expect(result.value.isDuplicate).toBe(true)
    expect(result.value.existingLeadId).toBeDefined()
  })

  it('should detect duplicate by phone', async () => {
    const result = await useCase.execute({ phone: '5511999999999' })
    expect(result.isOk).toBe(true)
    expect(result.value.isDuplicate).toBe(true)
  })

  it('should return false for non-duplicate', async () => {
    const result = await useCase.execute({ email: 'novo@pousada.com' })
    expect(result.isOk).toBe(true)
    expect(result.value.isDuplicate).toBe(false)
  })

  it('should fail with no email or phone', async () => {
    const result = await useCase.execute({})
    expect(result.isFail).toBe(true)
  })
})
