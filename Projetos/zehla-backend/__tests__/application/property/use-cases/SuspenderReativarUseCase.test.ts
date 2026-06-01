import { describe, it, expect, beforeEach } from 'vitest'
import { SuspenderReativarUseCase } from '../../../../src/application/property/use-cases/SuspenderReativarUseCase'
import { InMemoryPropertyRepository } from '../../../../src/infrastructure/persistence/property/InMemoryPropertyRepository'
import { CriarPropertyUseCase } from '../../../../src/application/property/use-cases/CriarPropertyUseCase'
import { AtivarPropertyUseCase } from '../../../../src/application/property/use-cases/AtivarPropertyUseCase'
import { RegistrationNumberGenerator } from '../../../../src/domain/property/services/RegistrationNumberGenerator'

describe('SuspenderReativarUseCase', () => {
  let repo: InMemoryPropertyRepository
  let useCase: SuspenderReativarUseCase
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
    useCase = new SuspenderReativarUseCase(repo)
  })

  it('should suspend active property', async () => {
    const result = await useCase.suspend({ propertyId, reason: 'Pagamento atrasado' })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('SUSPENDED')
  })

  it('should fail suspend with empty reason', async () => {
    const result = await useCase.suspend({ propertyId, reason: '' })
    expect(result.isFail).toBe(true)
  })

  it('should reactivate suspended property', async () => {
    await useCase.suspend({ propertyId, reason: 'Inadimplência' })
    const result = await useCase.reactivate({ propertyId })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('ACTIVE')
  })

  it('should fail reactivate if not suspended', async () => {
    const result = await useCase.reactivate({ propertyId })
    expect(result.isFail).toBe(true)
  })

  it('should fail if property not found', async () => {
    const result = await useCase.suspend({ propertyId: 'nonexistent', reason: 'test' })
    expect(result.isFail).toBe(true)
  })

  it('should suspend then reactivate then suspend again', async () => {
    await useCase.suspend({ propertyId, reason: 'Motivo 1' })
    await useCase.reactivate({ propertyId })
    const result = await useCase.suspend({ propertyId, reason: 'Motivo 2' })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('SUSPENDED')
  })
})
