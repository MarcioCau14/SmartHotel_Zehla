import { describe, it, expect, beforeEach } from 'vitest'
import { VerificarTrialUseCase } from '../../../../src/application/property/use-cases/VerificarTrialUseCase'
import { InMemoryPropertyRepository } from '../../../../src/infrastructure/persistence/property/InMemoryPropertyRepository'
import { CriarPropertyUseCase } from '../../../../src/application/property/use-cases/CriarPropertyUseCase'
import { AtivarPropertyUseCase } from '../../../../src/application/property/use-cases/AtivarPropertyUseCase'
import { RegistrationNumberGenerator } from '../../../../src/domain/property/services/RegistrationNumberGenerator'

describe('VerificarTrialUseCase', () => {
  let repo: InMemoryPropertyRepository
  let criarUseCase: CriarPropertyUseCase
  let ativarUseCase: AtivarPropertyUseCase
  let useCase: VerificarTrialUseCase
  let propertyId: string

  beforeEach(async () => {
    repo = new InMemoryPropertyRepository()
    criarUseCase = new CriarPropertyUseCase(repo, new RegistrationNumberGenerator())
    ativarUseCase = new AtivarPropertyUseCase(repo)
    useCase = new VerificarTrialUseCase(repo)

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
  })

  it('should check trial for specific property', async () => {
    const result = await useCase.execute({ propertyId })
    expect(result.isOk).toBe(true)
    expect(Array.isArray(result.value)).toBe(true)
  })

  it('should fail if property not found', async () => {
    const result = await useCase.execute({ propertyId: 'nonexistent' })
    expect(result.isFail).toBe(true)
  })

  it('should check all expiring trials when no specific ID', async () => {
    const result = await useCase.execute({})
    expect(result.isOk).toBe(true)
    expect(Array.isArray(result.value)).toBe(true)
  })

})
