import { describe, it, expect, beforeEach } from 'vitest'
import { AtualizarConfiguracaoUseCase } from '../../../../src/application/property/use-cases/AtualizarConfiguracaoUseCase'
import { InMemoryPropertyRepository } from '../../../../src/infrastructure/persistence/property/InMemoryPropertyRepository'
import { CriarPropertyUseCase } from '../../../../src/application/property/use-cases/CriarPropertyUseCase'
import { AtivarPropertyUseCase } from '../../../../src/application/property/use-cases/AtivarPropertyUseCase'
import { RegistrationNumberGenerator } from '../../../../src/domain/property/services/RegistrationNumberGenerator'
import { PropertyStatus } from '../../../../src/domain/property/enums'

describe('AtualizarConfiguracaoUseCase', () => {
  let repo: InMemoryPropertyRepository
  let criarUseCase: CriarPropertyUseCase
  let ativarUseCase: AtivarPropertyUseCase
  let useCase: AtualizarConfiguracaoUseCase
  let propertyId: string

  beforeEach(async () => {
    repo = new InMemoryPropertyRepository()
    criarUseCase = new CriarPropertyUseCase(repo, new RegistrationNumberGenerator())
    ativarUseCase = new AtivarPropertyUseCase(repo)
    useCase = new AtualizarConfiguracaoUseCase(repo)

    const created = await criarUseCase.execute({
      id: 'prop-1',
      name: 'Pousada Teste',
      slug: 'pousada-teste',
      address: { street: 'Rua A', city: 'São Paulo', state: 'SP', zipCode: '01234-567' },
      contactInfo: { phone: '+5511999999999', whatsapp: '+5511999999999', email: 'a@b.com' },
      capacity: 10,
      state: 'SP',
    })
    propertyId = created.value.id
  })

  it('should update address', async () => {
    const result = await useCase.execute({
      propertyId,
      address: { street: 'Rua Nova', city: 'Rio', state: 'RJ', zipCode: '20000-000' },
    })
    expect(result.isOk).toBe(true)
    expect(result.value.changedFields).toContain('address')

    const updated = await repo.findById(propertyId)
    expect(updated!.address.street).toBe('Rua Nova')
    expect(updated!.address.state).toBe('RJ')
  })

  it('should update capacity', async () => {
    const result = await useCase.execute({ propertyId, capacity: 20 })
    expect(result.isOk).toBe(true)
    expect(result.value.changedFields).toContain('capacity')

    const updated = await repo.findById(propertyId)
    expect(updated!.capacity).toBe(20)
  })

  it('should update operational window', async () => {
    const result = await useCase.execute({
      propertyId,
      operationalWindow: { checkInHours: 48, cleaningHours: 6 },
    })
    expect(result.isOk).toBe(true)
    expect(result.value.changedFields).toContain('operationalWindow')
  })

  it('should fail with invalid operational window', async () => {
    const result = await useCase.execute({
      propertyId,
      operationalWindow: { checkInHours: 0, cleaningHours: 3 },
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail if property not found', async () => {
    const result = await useCase.execute({ propertyId: 'nonexistent', capacity: 20 })
    expect(result.isFail).toBe(true)
  })

  it('should fail with negative capacity', async () => {
    const result = await useCase.execute({ propertyId, capacity: -1 })
    expect(result.isFail).toBe(true)
  })

  it('should update multiple fields at once', async () => {
    const result = await useCase.execute({
      propertyId,
      capacity: 15,
      address: { street: 'Rua X', city: 'Curitiba', state: 'PR', zipCode: '80000-000' },
      contactInfo: { phone: '+5511988888888', whatsapp: '+5511988888888', email: 'novo@email.com' },
    })
    expect(result.isOk).toBe(true)
    expect(result.value.changedFields).toContain('capacity')
    expect(result.value.changedFields).toContain('address')
    expect(result.value.changedFields).toContain('contactInfo')
  })

  it('should not change if no fields provided', async () => {
    const result = await useCase.execute({ propertyId })
    expect(result.isOk).toBe(true)
    expect(result.value.changedFields).toEqual([])
  })
})
