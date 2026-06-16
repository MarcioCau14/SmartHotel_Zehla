import { describe, it, expect, beforeEach } from 'vitest'
import { memoryAdapter } from '../../lib/memory'
import { PromptBuilder } from '../../lib/brain/processors/PromptBuilder'
import { SincronizarGuiaComSmartAIUseCase } from '../../application/guidebook/use-cases/SincronizarGuiaComSmartAIUseCase'
import { DigitalGuide } from '../../domain/guidebook/entities/DigitalGuide'
import { GuideSection } from '../../domain/guidebook/value-objects/GuideSection'
import { Result } from '../../domain/shared/Result'

describe('GraphRAG — Guidebook Sync and Prompt Ingestion', () => {
  const propertyId = 'prop_sc_rosa_001'

  beforeEach(async () => {
    // Limpa a memória associada à propriedade
    const entries = await memoryAdapter.getByTenant(propertyId)
    if (entries.isOk) {
      for (const entry of entries.value) {
        await memoryAdapter.deleteById(entry.id, propertyId)
      }
    }
  })

  it('should sync guidebook to memory and inject it into systemPrompt', async () => {
    // 1. Cria um guia digital publicado
    const sectionResult = GuideSection.create({
      id: 'sec_cafe',
      sectionType: 'geral',
      icon: 'coffee',
      order: 1,
      content: [
        {
          title: 'Horário do Café',
          content: 'O café da manhã é servido das 8h às 10h30 no salão principal.',
          language: 'pt',
        },
      ],
    })
    expect(sectionResult.isOk).toBe(true)

    const guideResult = DigitalGuide.create({
      id: 'guide_001',
      propertyId,
      sections: [sectionResult.value],
      status: 'rascunho',
    })
    expect(guideResult.isOk).toBe(true)

    // Publica o guia
    const publishedGuideResult = guideResult.value.publish()
    expect(publishedGuideResult.isOk).toBe(true)
    const publishedGuide = publishedGuideResult.value

    // Mock do repositório
    const mockRepo = {
      findByPropertyId: async () => Result.ok(publishedGuide),
      save: async () => Result.ok(publishedGuide),
      findById: async () => Result.ok(publishedGuide),
      findByStatus: async () => Result.ok([publishedGuide]),
      delete: async () => Result.ok(undefined),
    }

    // 2. Sincroniza usando o Caso de Uso
    const syncUseCase = new SincronizarGuiaComSmartAIUseCase(mockRepo, memoryAdapter)
    const syncResult = await syncUseCase.execute(propertyId)
    expect(syncResult.isOk).toBe(true)

    // 3. Verifica se foi salvo na memória vetorial
    const entries = await memoryAdapter.getByTenant(propertyId)
    expect(entries.isOk).toBe(true)
    expect(entries.value.length).toBe(1)
    expect(entries.value[0].content).toContain('O café da manhã é servido das 8h às 10h30')

    // 4. Executa PromptBuilder e verifica se foi injetado no prompt de sistema
    const propertyMock = {
      id: propertyId,
      name: 'Pousada Teste Rosa',
      capacity: 10,
      address: 'Estrada do Rosa',
      city: 'Imbituba',
      state: 'SC',
      rooms: [],
      plan: 'LITE',
    }

    const promptResult = await PromptBuilder.build(
      propertyMock,
      'LOCAL_INFO',
      'Qual o horário do café?',
      { intent: 'LOCAL_INFO', confidence: 0.9, entities: {} },
      {}
    )

    expect(promptResult.systemPrompt).toContain('[GUIA DIGITAL DA POUSADA (INFORMAÇÕES ADICIONAIS DE SUPORTE NO WHATSAPP)]')
    expect(promptResult.systemPrompt).toContain('O café da manhã é servido das 8h às 10h30')
  })
})
