import { describe, it, expect, beforeEach } from 'vitest'
import { SincronizarGuiaComSmartAIUseCase } from '../../../../src/application/guidebook/use-cases/SincronizarGuiaComSmartAIUseCase'
import { InMemoryDigitalGuideRepository } from '../../../../src/infrastructure/persistence/guidebook/InMemoryDigitalGuideRepository'
import { DigitalGuide } from '../../../../src/domain/guidebook/entities/DigitalGuide'
import { GuideSection } from '../../../../src/domain/guidebook/value-objects/GuideSection'

describe('SincronizarGuiaComSmartAIUseCase', () => {
  let repo: InMemoryDigitalGuideRepository
  let useCase: SincronizarGuiaComSmartAIUseCase

  function createPublishedGuide(propertyId: string) {
    const sections = [
      GuideSection.create({
        id: 'sec-1', sectionType: 'wifi', order: 0,
        content: [
          { title: 'Wi-Fi', content: 'Senha', language: 'pt-BR' },
          { title: 'WiFi', content: 'Password', language: 'en' },
        ],
      }).value,
    ]
    const guide = DigitalGuide.create({
      id: `guide-${propertyId}`,
      propertyId,
      sections,
    }).value
    return guide.publish().value
  }

  beforeEach(() => {
    repo = new InMemoryDigitalGuideRepository()
    useCase = new SincronizarGuiaComSmartAIUseCase(repo)
  })

  it('should sync published guide successfully', async () => {
    const guide = createPublishedGuide('prop-1')
    await repo.save(guide)
    const result = await useCase.execute('prop-1')
    expect(result.isOk).toBe(true)
    expect(result.value.guiaId).toBe('guide-prop-1')
    expect(result.value.propertyId).toBe('prop-1')
    expect(result.value.sectionsProcessed).toBe(1)
    expect(result.value.languages).toContain('pt-BR')
    expect(result.value.languages).toContain('en')
    expect(result.value.syncedAt).toBeDefined()
  })

  it('should fail if guide not found', async () => {
    const result = await useCase.execute('prop-not-found')
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('GUIA_NAO_ENCONTRADO')
  })

  it('should fail if guide is not published', async () => {
    const sections = [
      GuideSection.create({
        id: 'sec-1', sectionType: 'wifi', order: 0,
        content: [{ title: 'Wi-Fi', content: 'Senha', language: 'pt-BR' }],
      }).value,
    ]
    const guide = DigitalGuide.create({
      id: 'guide-draft', propertyId: 'prop-draft', sections,
    }).value
    await repo.save(guide)
    const result = await useCase.execute('prop-draft')
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('GUIA_PRECISA_SER_PUBLICADO')
  })

  it('should detect multiple languages', async () => {
    const sections = [
      GuideSection.create({
        id: 'sec-1', sectionType: 'wifi', order: 0,
        content: [
          { title: 'Wi-Fi', content: 'Senha', language: 'pt-BR' },
          { title: 'WiFi', content: 'Password', language: 'en' },
          { title: 'Wi-Fi', content: 'Contraseña', language: 'es' },
        ],
      }).value,
    ]
    const guide = DigitalGuide.create({
      id: 'guide-multi', propertyId: 'prop-multi', sections,
    }).value
    await repo.save(guide.publish().value)
    const result = await useCase.execute('prop-multi')
    expect(result.isOk).toBe(true)
    expect(result.value.languages).toHaveLength(3)
  })
})
