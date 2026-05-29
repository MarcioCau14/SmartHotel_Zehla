import { RevenueSettings } from '../../../domain/room/value-objects/RevenueSettings'

export interface IRevenueSettingsRepository {
  findByPropertyId(propertyId: string): Promise<RevenueSettings | null>
  save(propertyId: string, settings: RevenueSettings): Promise<void>
  update(propertyId: string, settings: RevenueSettings): Promise<void>
}
