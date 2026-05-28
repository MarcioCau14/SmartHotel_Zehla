import { describe, it, expect, beforeEach } from 'vitest'
import { CriarPropertyUseCase } from '../../../../src/application/property/use-cases/CriarPropertyUseCase'
import { InMemoryPropertyRepository } from '../../../../src/infrastructure/persistence/property/InMemoryPropertyRepository'
import { RegistrationNumberGenerator } from '../../../../src/domain/property/services/RegistrationNumberGenerator'

describe('CriarPropertyUseCase', () => {
  let repo: InMemoryPropertyRepository
  let useCase: CriarPropertyUseCase

  const validInput = {
    id: 'prop-1',
    name: 'Pousada Teste',
    slug: 'pousada-teste',
    address: {
      street: 'Rua das Flores',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    contactInfo: {
      phone: '+5511999999999',
      whatsapp: '+5511999999999',
      email: 'contato@pousada.com',
    },
    capacity: 10,
    state: 'SP',
  }

  beforeEach(() => {
    repo = new InMemoryPropertyRepository()
    useCase = new CriarPropertyUseCase(repo, new RegistrationNumberGenerator())
  })

  it('should create property successfully', async () => {
    const result = await useCase.execute(validInput)
    expect(result.isOk).toBe(true)
    expect(result.value.name).toBe('Pousada Teste')
    expect(result.value.status).toBe('PENDING_SETUP')
    expect(result.value.plan).toBe('LITE')
    expect(result.value.registrationNumber).toMatch(/^\d{4}\/LITE\/SP$/)
    expect(result.value.capacity).toBe(10)
  })

  it('should fail with duplicate slug', async () => {
    await useCase.execute(validInput)
    const result = await useCase.execute(validInput)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Slug')
  })

  it('should fail with invalid CEP', async () => {
    const result = await useCase.execute({
      ...validInput,
      address: { ...validInput.address, zipCode: '123' },
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('CEP')
  })

  it('should fail with invalid phone', async () => {
    const result = await useCase.execute({
      ...validInput,
      contactInfo: { ...validInput.contactInfo, phone: '1199999999' },
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Phone')
  })

  it('should fail with capacity zero', async () => {
    const result = await useCase.execute({ ...validInput, capacity: 0 })
    expect(result.isFail).toBe(true)
  })

  it('should persist property in repository', async () => {
    await useCase.execute(validInput)
    const found = await repo.findBySlug('pousada-teste')
    expect(found).not.toBeNull()
    expect(found!.name).toBe('Pousada Teste')
  })

  it('should generate sequential registration numbers', async () => {
    const r1 = await useCase.execute({ ...validInput, id: 'prop-1', slug: 'pousada-1' })
    const r2 = await useCase.execute({ ...validInput, id: 'prop-2', slug: 'pousada-2' })
    expect(r1.isOk).toBe(true)
    expect(r2.isOk).toBe(true)
    const seq1 = parseInt(r1.value.registrationNumber.split('/')[0], 10)
    const seq2 = parseInt(r2.value.registrationNumber.split('/')[0], 10)
    expect(seq2).toBeGreaterThan(seq1)
  })

  it('should accept optional UTM tracking', async () => {
    const result = await useCase.execute({
      ...validInput,
      utmTracking: { source: 'google', medium: 'cpc', campaign: 'summer' },
    })
    expect(result.isOk).toBe(true)
  })
})
