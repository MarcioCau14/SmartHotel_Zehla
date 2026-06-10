import { describe, it, expect, beforeEach } from 'vitest'
import { CriarGuiaDigitalUseCase } from '../../../src/application/guidebook/use-cases/CriarGuiaDigitalUseCase'
import { InMemoryDigitalGuideRepository } from '../../../src/infrastructure/persistence/guidebook/InMemoryDigitalGuideRepository'

describe('POST /api/guidebook', () => {
  let repo: InMemoryDigitalGuideRepository
  let useCase: CriarGuiaDigitalUseCase

  const validBody = {
    id: 'guide-test-1',
    sections: [
      {
        id: 'sec-1',
        sectionType: 'wifi',
        icon: 'wifi-icon',
        order: 0,
        content: [{ title: 'Wi-Fi', content: 'Senha: 1234', language: 'pt-BR' }],
      },
    ],
  }

  beforeEach(() => {
    repo = new InMemoryDigitalGuideRepository()
    useCase = new CriarGuiaDigitalUseCase(repo)
  })

  it('should create guide successfully with valid data', async () => {
    const result = await useCase.execute({ id: validBody.id, propertyId: 'prop-1', sections: validBody.sections })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('rascunho')
    expect(result.value.propertyId).toBe('prop-1')
  })

  it('should fail with 400 when id is missing', async () => {
    const result = await useCase.execute({ id: '', propertyId: 'prop-1', sections: validBody.sections })
    expect(result.isFail).toBe(true)
  })

  it('should fail with 400 when sections is empty', async () => {
    const result = await useCase.execute({ id: 'guide-1', propertyId: 'prop-1', sections: [] })
    expect(result.isFail).toBe(true)
  })

  it('should fail with 400 when section has empty localized content', async () => {
    const result = await useCase.execute({
      id: 'guide-1',
      propertyId: 'prop-1',
      sections: [{ id: 'sec-1', sectionType: 'wifi', order: 0, content: [] }],
    })
    expect(result.isFail).toBe(true)
  })

  it('should return 200 on GET for existing guide', async () => {
    await useCase.execute({ id: 'guide-1', propertyId: 'prop-1', sections: validBody.sections })
    const found = await repo.findByPropertyId('prop-1')
    expect(found.isOk).toBe(true)
    expect(found.value).not.toBeNull()
    expect(found.value!.id).toBe('guide-1')
  })

  it('should return 404 on GET for non-existent guide', async () => {
    const found = await repo.findByPropertyId('prop-not-found')
    expect(found.isOk).toBe(true)
    expect(found.value).toBeNull()
  })

  it('should reject duplicate guide per property (409)', async () => {
    await useCase.execute({ id: 'guide-1', propertyId: 'prop-1', sections: validBody.sections })
    const result = await useCase.execute({ id: 'guide-2', propertyId: 'prop-1', sections: validBody.sections })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('GUIA_JA_EXISTE')
  })
})
