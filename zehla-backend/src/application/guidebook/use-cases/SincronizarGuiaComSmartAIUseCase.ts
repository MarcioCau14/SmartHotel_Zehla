import { Result } from '../../../domain/shared/Result'
import { IDigitalGuideRepository } from '../ports/IDigitalGuideRepository'
import { IZaosMemoryPort } from '../../../domain/memory/IZaosMemoryPort'
import { SyncGuideToMemoryHandler } from '../handlers/SyncGuideToMemoryHandler'
import { DomainEvent } from '../../../domain/shared/DomainEvent'

export interface SmartAISyncOutput {
  guiaId: string
  propertyId: string
  version: number
  sectionsProcessed: number
  languages: string[]
  syncedAt: string
}

export class SincronizarGuiaComSmartAIUseCase {
  constructor(
    private readonly guideRepo: IDigitalGuideRepository,
    private readonly memoryPort?: IZaosMemoryPort,
  ) {}

  async execute(propertyId: string): Promise<Result<SmartAISyncOutput, Error>> {
    const guideResult = await this.guideRepo.findByPropertyId(propertyId)
    if (guideResult.isFail) return Result.fail(guideResult.error)
    const guide = guideResult.value
    if (!guide) {
      return Result.fail(new Error('GUIA_NAO_ENCONTRADO'))
    }

    if (guide.status !== 'publicado') {
      return Result.fail(new Error('GUIA_PRECISA_SER_PUBLICADO'))
    }

    const languages = new Set<string>()
    for (const section of guide.sections) {
      for (const content of section.content) {
        languages.add(content.language)
      }
    }

    // Se a porta de memória foi fornecida, orquestra a sincronização atômica
    if (this.memoryPort) {
      const handler = new SyncGuideToMemoryHandler(this.memoryPort)
      const event: DomainEvent = {
        aggregateId: guide.id,
        eventName: 'DigitalGuidePublishedEvent',
        occurredAt: new Date(),
        payload: {
          propertyId: guide.propertyId,
          sections: guide.sections.map(s => ({
            id: s.id,
            sectionType: s.sectionType,
            icon: s.icon,
            order: s.order,
            content: s.content.map(c => ({ ...c })),
          })),
        },
      }
      await handler.handle(event)
    }

    return Result.ok({
      guiaId: guide.id,
      propertyId: guide.propertyId,
      version: guide.version,
      sectionsProcessed: guide.sections.length,
      languages: Array.from(languages),
      syncedAt: new Date().toISOString(),
    })
  }
}
