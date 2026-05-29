import { describe, it, expect, beforeEach } from 'vitest'
import { AlterarPlanoUseCase } from '../../../../src/application/property/use-cases/AlterarPlanoUseCase'
import { InMemoryPropertyRepository } from '../../../../src/infrastructure/persistence/property/InMemoryPropertyRepository'
import { CriarPropertyUseCase } from '../../../../src/application/property/use-cases/CriarPropertyUseCase'
import { AtivarPropertyUseCase } from '../../../../src/application/property/use-cases/AtivarPropertyUseCase'
import { Plan, SubscriptionStatus, Feature } from '../../../../src/domain/property/enums'
import { PlanFeatureService } from '../../../../src/domain/property/services/PlanFeatureService'
import { RegistrationNumberGenerator } from '../../../../src/domain/property/services/RegistrationNumberGenerator'

function futureDate(days = 30): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

describe('AlterarPlanoUseCase', () => {
  let repo: InMemoryPropertyRepository
  let useCase: AlterarPlanoUseCase
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

    useCase = new AlterarPlanoUseCase(repo, new PlanFeatureService())
  })

  it('should upgrade plan from LITE to PRO', async () => {
    const result = await useCase.execute({
      propertyId,
      plan: Plan.PRO,
      subscription: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: futureDate(),
        externalSubscriptionId: 'sub_abc123',
      },
    })
    expect(result.isOk).toBe(true)
    expect(result.value.plan).toBe('PRO')
    expect(result.value.features).toContain(Feature.IA_PERSONA)
    expect(result.value.features).toContain(Feature.CADASTUR_AUTO)
  })

  it('should fail with downgrade attempt', async () => {
    await useCase.execute({
      propertyId,
      plan: Plan.PRO,
      subscription: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: futureDate(),
        externalSubscriptionId: 'sub_pro',
      },
    })
    const result = await useCase.execute({
      propertyId,
      plan: Plan.LITE,
      subscription: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: futureDate(),
        externalSubscriptionId: 'sub_lite',
      },
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with same plan', async () => {
    const result = await useCase.execute({
      propertyId,
      plan: Plan.LITE,
      subscription: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: futureDate(),
        externalSubscriptionId: 'sub_abc',
      },
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail if property not found', async () => {
    const result = await useCase.execute({
      propertyId: 'nonexistent',
      plan: Plan.PRO,
      subscription: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: futureDate(),
        externalSubscriptionId: 'sub_abc123',
      },
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with past subscription date', async () => {
    const past = new Date('2020-01-01').toISOString()
    const result = await useCase.execute({
      propertyId,
      plan: Plan.PRO,
      subscription: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: past,
        externalSubscriptionId: 'sub_abc123',
      },
    })
    expect(result.isFail).toBe(true)
  })

  it('should include MAX features in output', async () => {
    const result = await useCase.execute({
      propertyId,
      plan: Plan.MAX,
      subscription: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: futureDate(),
        externalSubscriptionId: 'sub_max',
      },
    })
    expect(result.isOk).toBe(true)
    expect(result.value.features).toContain(Feature.NEURAL_VOICE)
    expect(result.value.features).toContain(Feature.SUPPLIER_MANAGEMENT)
  })
})
