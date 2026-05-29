import { describe, it, expect, beforeEach } from 'vitest'
import { VerificarCadasturUseCase } from '../../../../src/application/property/use-cases/VerificarCadasturUseCase'
import { InMemoryPropertyRepository } from '../../../../src/infrastructure/persistence/property/InMemoryPropertyRepository'
import { CriarPropertyUseCase } from '../../../../src/application/property/use-cases/CriarPropertyUseCase'
import { AtivarPropertyUseCase } from '../../../../src/application/property/use-cases/AtivarPropertyUseCase'
import { CadasturService } from '../../../../src/domain/property/services/CadasturService'
import { RegistrationNumberGenerator } from '../../../../src/domain/property/services/RegistrationNumberGenerator'
import { CadasturStatus } from '../../../../src/domain/property/enums'
import { CadasturInfo } from '../../../../src/domain/property/value-objects/CadasturInfo'

function futureDate(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

describe('VerificarCadasturUseCase', () => {
  let repo: InMemoryPropertyRepository
  let useCase: VerificarCadasturUseCase
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
    useCase = new VerificarCadasturUseCase(repo, new CadasturService())
  })

  it('should return empty for property without cadastur', async () => {
    const result = await useCase.execute({ propertyId })
    expect(result.isOk).toBe(true)
    expect(result.value).toEqual([])
  })

  it('should detect cadastur expiring soon', async () => {
    const property = await repo.findById(propertyId)
    if (!property) throw new Error('Property not found')
    const cadastur = CadasturInfo.create({
      number: 'CAD-123',
      status: CadasturStatus.VALID,
      expiryDate: futureDate(25),
    }).value
    property.updateCadastur(cadastur)
    await repo.save(property)

    const result = await useCase.execute({ propertyId })
    expect(result.isOk).toBe(true)
    expect(result.value.length).toBeGreaterThan(0)
    expect(result.value[0].cadasturNumber).toBe('CAD-123')
  })

  it('should fail if property not found', async () => {
    const result = await useCase.execute({ propertyId: 'nonexistent' })
    expect(result.isFail).toBe(true)
  })

  it('should batch check all properties with cadastur', async () => {
    const property = await repo.findById(propertyId)
    if (!property) throw new Error('Property not found')
    const cadastur = CadasturInfo.create({
      number: 'CAD-123',
      status: CadasturStatus.VALID,
      expiryDate: futureDate(25),
    }).value
    property.updateCadastur(cadastur)
    await repo.save(property)

    const result = await useCase.execute({})
    expect(result.isOk).toBe(true)
    expect(result.value.length).toBeGreaterThan(0)
  })
})
