import { Result } from '../../../domain/shared/Result'
import { DigitalGuide, DigitalGuideProps } from '../../../domain/guidebook/entities/DigitalGuide'
import { GuideSection, GuideSectionProps } from '../../../domain/guidebook/value-objects/GuideSection'
import { IDigitalGuideRepository } from '../ports/IDigitalGuideRepository'

export interface CriarGuiaDigitalInput {
  id: string
  propertyId: string
  sections: Array<{
    id: string
    sectionType: string
    icon?: string | null
    order: number
    content: Array<{ title: string; content: string; language: string }>
  }>
}

export interface CriarGuiaDigitalOutput {
  id: string
  propertyId: string
  status: string
  version: number
  totalSections: number
  createdAt: string
}

export class CriarGuiaDigitalUseCase {
  constructor(
    private readonly guideRepo: IDigitalGuideRepository,
  ) {}

  async execute(input: CriarGuiaDigitalInput): Promise<Result<CriarGuiaDigitalOutput, Error>> {
    const existing = await this.guideRepo.findByPropertyId(input.propertyId)
    if (existing.isFail) return Result.fail(existing.error)
    if (existing.value) {
      return Result.fail(new Error('GUIA_JA_EXISTE'))
    }

    const sections: GuideSection[] = []
    for (const secInput of input.sections) {
      const sectionResult = GuideSection.create(secInput as GuideSectionProps)
      if (sectionResult.isFail) return Result.fail(sectionResult.error)
      sections.push(sectionResult.value)
    }

    const guideResult = DigitalGuide.create({
      id: input.id,
      propertyId: input.propertyId,
      sections,
    })
    if (guideResult.isFail) return Result.fail(guideResult.error)

    const saveResult = await this.guideRepo.save(guideResult.value)
    if (saveResult.isFail) return Result.fail(saveResult.error)

    return Result.ok({
      id: guideResult.value.id,
      propertyId: guideResult.value.propertyId,
      status: guideResult.value.status,
      version: guideResult.value.version,
      totalSections: guideResult.value.sections.length,
      createdAt: guideResult.value.createdAt.toISOString(),
    })
  }
}
