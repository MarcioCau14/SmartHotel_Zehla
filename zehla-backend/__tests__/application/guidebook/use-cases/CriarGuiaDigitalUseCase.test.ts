import { describe, it, expect, beforeEach } from 'vitest'
import { CriarGuiaDigitalUseCase } from '../../../../src/application/guidebook/use-cases/CriarGuiaDigitalUseCase'
import { InMemoryDigitalGuideRepository } from '../../../../src/infrastructure/persistence/guidebook/InMemoryDigitalGuideRepository'

describe('CriarGuiaDigitalUseCase', () => {
  let repo: InMemoryDigitalGuideRepository
  let useCase: CriarGuiaDigitalUseCase

  const validInput = {
    id: 'guide-1',
    propertyId: 'prop-1',
    sections: [
      {
        id: 'sec-1',
        sectionType: 'wifi',
        icon: 'wifi-icon',
        order: 0,
        content: [{ title: 'Wi-Fi', content: 'Senha: 1234', language: 'pt-BR' }],
      },
      {
        id: 'sec-2',
        sectionType: 'horarios',
        order: 1,
        content: [{ title: 'Horários', content: 'Check-in: 14h', language: 'pt-BR' }],
      },
    ],
  }

  beforeEach(() => {
    repo = new InMemoryDigitalGuideRepository()
    useCase = new CriarGuiaDigitalUseCase(repo)
  })

  it('should create guide successfully', async () => {
    const result = await useCase.execute(validInput)
    expect(result.isOk).toBe(true)
    expect(result.value.propertyId).toBe('prop-1')
    expect(result.value.status).toBe('rascunho')
    expect(result.value.version).toBe(1)
    expect(result.value.totalSections).toBe(2)
    expect(result.value.createdAt).toBeDefined()
  })

  it('should fail if guide already exists for property', async () => {
    await useCase.execute(validInput)
    const result = await useCase.execute(validInput)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('GUIA_JA_EXISTE')
  })

  it('should fail with invalid section data', async () => {
    const result = await useCase.execute({
      ...validInput,
      sections: [{ ...validInput.sections[0], id: '' }],
    })
    expect(result.isFail).toBe(true)
  })

  it('should persist guide in repository', async () => {
    await useCase.execute(validInput)
    const found = await repo.findByPropertyId('prop-1')
    expect(found.isOk).toBe(true)
    expect(found.value).not.toBeNull()
    expect(found.value!.id).toBe('guide-1')
  })

  it('should handle multiple guides in different properties', async () => {
    const r1 = await useCase.execute(validInput)
    const r2 = await useCase.execute({
      ...validInput,
      id: 'guide-2',
      propertyId: 'prop-2',
    })
    expect(r1.isOk).toBe(true)
    expect(r2.isOk).toBe(true)
    const all = await repo.findByStatus('rascunho')
    expect(all.isOk).toBe(true)
    expect(all.value).toHaveLength(2)
  })
})
