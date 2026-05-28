import { describe, it, expect, beforeEach } from 'vitest'
import { AtivarPropertyUseCase } from '../../../../src/application/property/use-cases/AtivarPropertyUseCase'
import { InMemoryPropertyRepository } from '../../../../src/infrastructure/persistence/property/InMemoryPropertyRepository'
import { CriarPropertyUseCase } from '../../../../src/application/property/use-cases/CriarPropertyUseCase'
import { RegistrationNumberGenerator } from '../../../../src/domain/property/services/RegistrationNumberGenerator'

describe('AtivarPropertyUseCase', () => {
  let repo: InMemoryPropertyRepository
  let criarUseCase: CriarPropertyUseCase
  let useCase: AtivarPropertyUseCase
  let propertyId: string

  beforeEach(async () => {
    repo = new InMemoryPropertyRepository()
    criarUseCase = new CriarPropertyUseCase(repo, new RegistrationNumberGenerator())
    useCase = new AtivarPropertyUseCase(repo)

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

  it('should activate property with trial', async () => {
    const result = await useCase.execute({ propertyId })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('ACTIVE')
    expect(result.value.trialEndDate).not.toBeNull()
  })

  it('should fail if property not found', async () => {
    const result = await useCase.execute({ propertyId: 'nonexistent' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrada')
  })

  it('should fail if already active', async () => {
    await useCase.execute({ propertyId })
    const result = await useCase.execute({ propertyId })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('já está ativa')
  })
})
