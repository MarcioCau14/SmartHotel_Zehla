import { IDomainEventHandler } from '../../../domain/shared/events/IDomainEventHandler'
import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { IZaosMemoryPort } from '../../../domain/memory/IZaosMemoryPort'

export class SyncGuideToMemoryHandler implements IDomainEventHandler {
  constructor(private readonly memoryPort: IZaosMemoryPort) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.eventName !== 'DigitalGuidePublishedEvent') {
      return
    }

    const guideId = event.aggregateId
    const { propertyId, sections } = event.payload as {
      propertyId: string
      sections: Array<{
        id: string
        sectionType: string
        icon: string | null
        order: number
        content: Array<{ title: string; content: string; language: string }>
      }>
    }

    console.log(`[SyncGuideToMemoryHandler] Iniciando ingestão do Guia Digital ${guideId} na Memória (A-MEM).`)

    for (const section of sections) {
      for (const localized of section.content) {
        const memoryId = `guide_${guideId}_sec_${section.id}_${localized.language}`
        const structuredContent = `[Guia Digital] Seção: ${section.sectionType} | Título: ${localized.title} | Conteúdo: ${localized.content}`

        const storeResult = await this.memoryPort.store({
          id: memoryId,
          tenantId: propertyId, // Blindagem RLS principal
          pousadaId: propertyId,
          content: structuredContent,
          embedding: [0.1, 0.2, 0.3], // Dummy embedding para in-memory
          metadata: {
            guideId,
            sectionId: section.id,
            sectionType: section.sectionType,
            language: localized.language,
            title: localized.title,
            tenantId: propertyId, // RLS metadados redundantes para segurança extra
            propertyId: propertyId,
          },
        })

        if (storeResult.isFail) {
          console.error(`❌ [SyncGuideToMemoryHandler] Falha ao salvar seção ${section.id} (${localized.language}):`, storeResult.error)
        } else {
          console.log(`✅ [SyncGuideToMemoryHandler] Seção ${section.id} (${localized.language}) armazenada com sucesso.`)
        }
      }
    }
  }
}
