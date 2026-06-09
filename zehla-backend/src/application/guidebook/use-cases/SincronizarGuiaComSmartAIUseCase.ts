import { Result } from '../../../domain/shared/Result'
import { IDigitalGuideRepository } from '../ports/IDigitalGuideRepository'

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
