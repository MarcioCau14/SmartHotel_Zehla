import { PrismaClient } from '@prisma/client'
import { Result } from '../../../domain/shared/Result'
import { DigitalGuide, DigitalGuideProps } from '../../../domain/guidebook/entities/DigitalGuide'
import { GuideSection, GuideSectionProps } from '../../../domain/guidebook/value-objects/GuideSection'
import { GuideStatus } from '../../../domain/guidebook/enums'
import { IDigitalGuideRepository } from '../../../application/guidebook/ports/IDigitalGuideRepository'

interface GuideSectionPrisma {
  id: string
  guideId: string
  sectionType: string
  icon: string | null
  order: number
  content: GuideSectionContent[]
}

interface GuideSectionContent {
  title: string
  content: string
  language: string
}

interface DigitalGuidePrisma {
  id: string
  propertyId: string
  status: string
  version: number
  createdAt: Date
  updatedAt: Date
  sections: GuideSectionPrisma[]
}

export class PrismaDigitalGuideRepository implements IDigitalGuideRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toData(guide: DigitalGuide): { 
    guide: { id: string; propertyId: string; status: string; version: number }
    sections: Array<{ id: string; sectionType: string; icon: string | null; order: number; content: GuideSectionContent[] }>
  } {
    return {
      guide: {
        id: guide.id,
        propertyId: guide.propertyId,
        status: guide.status,
        version: guide.version,
      },
      sections: guide.sections.map(s => ({
        id: s.id,
        sectionType: s.sectionType,
        icon: s.icon,
        order: s.order,
        content: s.content.map(c => ({ title: c.title, content: c.content, language: c.language })),
      })),
    }
  }

  private hydrate(prismaRecord: DigitalGuidePrisma): Result<DigitalGuide, Error> {
    const sections: GuideSection[] = []
    for (const secData of prismaRecord.sections) {
      const props: GuideSectionProps = {
        id: secData.id,
        sectionType: secData.sectionType as GuideSectionProps['sectionType'],
        icon: secData.icon,
        order: secData.order,
        content: secData.content as GuideSectionProps['content'],
      }
      const sectionResult = GuideSection.restore(props)
      sections.push(sectionResult)
    }

    const props: DigitalGuideProps = {
      id: prismaRecord.id,
      propertyId: prismaRecord.propertyId,
      sections,
      status: prismaRecord.status as GuideStatus,
      version: prismaRecord.version,
      createdAt: prismaRecord.createdAt,
      updatedAt: prismaRecord.updatedAt,
    }

    return Result.ok(DigitalGuide.restore(props))
  }

  async save(guide: DigitalGuide): Promise<Result<DigitalGuide, Error>> {
    try {
      const data = this.toData(guide)
      const saved = await this.prisma.$transaction(async (tx) => {
        await tx.guideSection.deleteMany({ where: { guideId: guide.id } })
        const result = await tx.digitalGuide.upsert({
          where: { id: guide.id },
          create: {
            id: data.guide.id,
            propertyId: data.guide.propertyId,
            status: data.guide.status,
            version: data.guide.version,
            sections: {
              create: data.sections.map(s => ({
                id: s.id,
                sectionType: s.sectionType,
                icon: s.icon,
                order: s.order,
                content: s.content as any,
              })),
            },
          },
          update: {
            status: data.guide.status,
            version: data.guide.version,
            sections: {
              create: data.sections.map(s => ({
                id: s.id,
                sectionType: s.sectionType,
                icon: s.icon,
                order: s.order,
                content: s.content as any,
              })),
            },
          },
          include: { sections: true },
        })
        return result
      })
      return Result.ok(this.hydrate(saved as unknown as DigitalGuidePrisma).value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Falha ao salvar guia digital'))
    }
  }

  async findById(id: string): Promise<Result<DigitalGuide | null, Error>> {
    try {
      const record = await this.prisma.digitalGuide.findUnique({
        where: { id },
        include: { sections: { orderBy: { order: 'asc' } } },
      })
      if (!record) return Result.ok(null)
      return this.hydrate(record as unknown as DigitalGuidePrisma)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Falha ao buscar guia digital'))
    }
  }

  async findByPropertyId(propertyId: string): Promise<Result<DigitalGuide | null, Error>> {
    try {
      const record = await this.prisma.digitalGuide.findUnique({
        where: { propertyId },
        include: { sections: { orderBy: { order: 'asc' } } },
      })
      if (!record) return Result.ok(null)
      return this.hydrate(record as unknown as DigitalGuidePrisma)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Falha ao buscar guia digital por propriedade'))
    }
  }

  async findByStatus(status: GuideStatus): Promise<Result<DigitalGuide[], Error>> {
    try {
      const records = await this.prisma.digitalGuide.findMany({
        where: { status },
        include: { sections: { orderBy: { order: 'asc' } } },
      })
      const guides: DigitalGuide[] = []
      for (const record of records) {
        const result = this.hydrate(record as unknown as DigitalGuidePrisma)
        if (result.isOk) guides.push(result.value)
      }
      return Result.ok(guides)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Falha ao buscar guias por status'))
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      await this.prisma.digitalGuide.delete({ where: { id } })
      return Result.ok(undefined)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Falha ao deletar guia digital'))
    }
  }
}
