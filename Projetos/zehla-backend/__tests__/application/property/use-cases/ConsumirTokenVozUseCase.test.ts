import { describe, it, expect, beforeEach } from 'vitest'
import { ConsumirTokenVozUseCase } from '../../../../src/application/property/use-cases/ConsumirTokenVozUseCase'
import { InMemoryPropertyRepository } from '../../../../src/infrastructure/persistence/property/InMemoryPropertyRepository'
import { CriarPropertyUseCase } from '../../../../src/application/property/use-cases/CriarPropertyUseCase'
import { AtivarPropertyUseCase } from '../../../../src/application/property/use-cases/AtivarPropertyUseCase'
import { RegistrationNumberGenerator } from '../../../../src/domain/property/services/RegistrationNumberGenerator'

describe('ConsumirTokenVozUseCase', () => {
  let repo: InMemoryPropertyRepository
  let useCase: ConsumirTokenVozUseCase
  let propertyId: string

  beforeEach(async () => {
    repo = new InMemoryPropertyRepository()
    const criarUseCase = new CriarPropertyUseCase(repo, new RegistrationNumberGenerator())
    const ativarUseCase = new AtivarPropertyUseCase(repo)

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
    await ativarUseCase.execute({ propertyId })
    useCase = new ConsumirTokenVozUseCase(repo)
  })

  it('should consume voice tokens', async () => {
    const result = await useCase.execute({ propertyId, count: 100 })
    expect(result.isOk).toBe(true)
    expect(result.value.used).toBe(100)
    expect(result.value.remaining).toBe(99900)
  })

  it('should fail with excessive consumption', async () => {
    const result = await useCase.execute({ propertyId, count: 100001 })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Token limit')
  })

  it('should track cumulative consumption', async () => {
    await useCase.execute({ propertyId, count: 1000 })
    const result = await useCase.execute({ propertyId, count: 2000 })
    expect(result.isOk).toBe(true)
    expect(result.value.used).toBe(3000)
  })

  it('should fail if property not found', async () => {
    const result = await useCase.execute({ propertyId: 'nonexistent', count: 100 })
    expect(result.isFail).toBe(true)
  })

  it('should detect exhaustion', async () => {
    await useCase.execute({ propertyId, count: 99900 })
    const result = await useCase.execute({ propertyId, count: 100 })
    expect(result.isOk).toBe(true)
    expect(result.value.isExhausted).toBe(true)
  })
})
