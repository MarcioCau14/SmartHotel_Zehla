import { describe, it, expect, beforeEach } from 'vitest'
import { CaptureLeadUseCase } from '../../../../src/application/lead/use-cases/CaptureLeadUseCase'
import { InMemoryLeadRepository } from '../../../../src/infrastructure/persistence/lead/InMemoryLeadRepository'
import { FakeDuplicateDetectionService } from '../../../../src/infrastructure/persistence/lead/FakeDuplicateDetectionService'
import { FakeEventBus } from '../../../../src/infrastructure/persistence/lead/FakeEventBus'

describe('CaptureLeadUseCase', () => {
  let leadRepo: InMemoryLeadRepository
  let duplicateService: FakeDuplicateDetectionService
  let eventBus: FakeEventBus
  let useCase: CaptureLeadUseCase

  beforeEach(() => {
    leadRepo = new InMemoryLeadRepository()
    duplicateService = new FakeDuplicateDetectionService(leadRepo)
    eventBus = new FakeEventBus()
    useCase = new CaptureLeadUseCase(leadRepo, duplicateService, eventBus)
  })

  it('should capture a lead with name and phone', async () => {
    const result = await useCase.execute({
      name: 'Pousada Sol Nascente',
      phone: '5511999999999',
      source: 'LANDING_PAGE',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.name).toBe('Pousada Sol Nascente')
    expect(result.value.status).toBe('PROSPECT')
    expect(result.value.score).toBe(0)
    expect(result.value.isDuplicate).toBe(false)
  })

  it('should capture a lead with email only', async () => {
    const result = await useCase.execute({
      name: 'Hotel Lua',
      email: 'contato@luahotel.com',
      source: 'WHATSAPP',
    })
    expect(result.isOk).toBe(true)
  })

  it('should detect and update duplicate by email', async () => {
    await useCase.execute({
      name: 'Pousada Original',
      email: 'dup@test.com',
      phone: '5511999999999',
    })
    const result = await useCase.execute({
      name: 'Pousada Duplicada',
      email: 'dup@test.com',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.isDuplicate).toBe(true)
    expect(result.value.name).toBe('Pousada Original')
  })

  it('should detect duplicate by phone', async () => {
    await useCase.execute({
      name: 'Original',
      phone: '5511988888888',
    })
    const result = await useCase.execute({
      name: 'Duplicado',
      phone: '5511988888888',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.isDuplicate).toBe(true)
  })

  it('should reject missing name', async () => {
    const result = await useCase.execute({
      name: 'A',
      phone: '5511999999999',
    })
    expect(result.isFail).toBe(true)
  })

  it('should reject missing all contact', async () => {
    const result = await useCase.execute({
      name: 'Pousada Teste',
    })
    expect(result.isFail).toBe(true)
  })

  it('should emit LeadCaptured event', async () => {
    await useCase.execute({
      name: 'Pousada Evento',
      phone: '5511999999999',
    })
    expect(eventBus.events.length).toBeGreaterThanOrEqual(1)
    expect(eventBus.events[0].eventName).toBe('LeadCaptured')
  })

  it('should store the lead in repository', async () => {
    const result = await useCase.execute({
      name: 'Pousada Persistida',
      phone: '5511777777777',
    })
    const stored = await leadRepo.findById(result.value.id)
    expect(stored).not.toBeNull()
    expect(stored!.contact.name).toBe('Pousada Persistida')
  })
})
