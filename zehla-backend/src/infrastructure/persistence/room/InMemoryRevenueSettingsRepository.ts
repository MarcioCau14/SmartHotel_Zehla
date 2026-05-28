import { RevenueSettings } from '../../../domain/room/value-objects/RevenueSettings'
import { IRevenueSettingsRepository } from '../../../application/room/ports/IRevenueSettingsRepository'

export class InMemoryRevenueSettingsRepository implements IRevenueSettingsRepository {
  private store = new Map<string, RevenueSettings>()

  async findByPropertyId(propertyId: string): Promise<RevenueSettings | null> {
    return this.store.get(propertyId) ?? null
  }

  async save(propertyId: string, settings: RevenueSettings): Promise<void> {
    this.store.set(propertyId, settings)
  }

  async update(propertyId: string, settings: RevenueSettings): Promise<void> {
    this.store.set(propertyId, settings)
  }

  clear(): void {
    this.store.clear()
  }
}
