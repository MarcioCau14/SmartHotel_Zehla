import { Result } from '../../../domain/shared/Result'
import { DigitalGuide } from '../../../domain/guidebook/entities/DigitalGuide'
import { GuideStatus } from '../../../domain/guidebook/enums'

export interface IDigitalGuideRepository {
  save(guide: DigitalGuide): Promise<Result<DigitalGuide, Error>>
  findById(id: string): Promise<Result<DigitalGuide | null, Error>>
  findByPropertyId(propertyId: string): Promise<Result<DigitalGuide | null, Error>>
  findByStatus(status: GuideStatus): Promise<Result<DigitalGuide[], Error>>
  delete(id: string): Promise<Result<void, Error>>
}
