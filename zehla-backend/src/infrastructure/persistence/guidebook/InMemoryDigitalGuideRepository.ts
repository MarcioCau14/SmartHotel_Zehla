import { Result } from '../../../domain/shared/Result'
import { DigitalGuide } from '../../../domain/guidebook/entities/DigitalGuide'
import { GuideStatus } from '../../../domain/guidebook/enums'
import { IDigitalGuideRepository } from '../../../application/guidebook/ports/IDigitalGuideRepository'

export class InMemoryDigitalGuideRepository implements IDigitalGuideRepository {
  private guides: Map<string, DigitalGuide> = new Map()

  async save(guide: DigitalGuide): Promise<Result<DigitalGuide, Error>> {
    this.guides.set(guide.id, guide)
    return Result.ok(guide)
  }

  async findById(id: string): Promise<Result<DigitalGuide | null, Error>> {
    const guide = this.guides.get(id)
    return Result.ok(guide ?? null)
  }

  async findByPropertyId(propertyId: string): Promise<Result<DigitalGuide | null, Error>> {
    const guide = Array.from(this.guides.values()).find(g => g.propertyId === propertyId)
    return Result.ok(guide ?? null)
  }

  async findByStatus(status: GuideStatus): Promise<Result<DigitalGuide[], Error>> {
    const guides = Array.from(this.guides.values()).filter(g => g.status === status)
    return Result.ok(guides)
  }

  async delete(id: string): Promise<Result<void, Error>> {
    this.guides.delete(id)
    return Result.ok(undefined)
  }
}
