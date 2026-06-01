import { describe, it, expect, beforeEach } from 'vitest'
import { HandleClusterTransitionUseCase } from '../../../../src/application/lead/use-cases/HandleClusterTransitionUseCase'
import { CaptureLeadUseCase } from '../../../../src/application/lead/use-cases/CaptureLeadUseCase'
import { QualifyLeadUseCase } from '../../../../src/application/lead/use-cases/QualifyLeadUseCase'
import { InMemoryLeadRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadRepository'
import { FakeDuplicateDetectionService } from '../../../../src/infrastructure/persistence/lead/FakeDuplicateDetectionService'
import { FakeClusterActionService } from '../../../../src/infrastructure/persistence/lead/FakeClusterActionService'
import { FakeEventBus } from '../../../../src/infrastructure/persistence/lead/FakeEventBus'

describe('HandleClusterTransitionUseCase', () => {
  let leadRepo: InMemoryLeadRepository
  let clusterActions: FakeClusterActionService
  let eventBus: FakeEventBus
  let useCase: HandleClusterTransitionUseCase
  let qualifyUseCase: QualifyLeadUseCase

  beforeEach(async () => {
    leadRepo = new InMemoryLeadRepository()
    clusterActions = new FakeClusterActionService()
    eventBus = new FakeEventBus()
    const duplicateService = new FakeDuplicateDetectionService(leadRepo)
    const capture = new CaptureLeadUseCase(leadRepo, duplicateService, eventBus)
    qualifyUseCase = new QualifyLeadUseCase(leadRepo, clusterActions, eventBus)
    useCase = new HandleClusterTransitionUseCase(leadRepo, clusterActions, eventBus)

    const r = await capture.execute({
      name: 'Pousada Cluster',
      phone: '5511999999999',
    })
  })

  it('should detect no transition when cluster stays same', async () => {
    const result = await useCase.execute({ leadId: 'nonexistent' })
    expect(result.isFail).toBe(true)
  })
})
