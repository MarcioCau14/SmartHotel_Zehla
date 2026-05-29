import { PrismaClient } from '@prisma/client'
import { RevenueSettings, LeadTimeDiscount, OccupancyThreshold } from '../../../domain/room/value-objects/RevenueSettings'
import { IRevenueSettingsRepository } from '../../../application/room/ports/IRevenueSettingsRepository'

export class PrismaRevenueSettingsRepository implements IRevenueSettingsRepository {
  constructor(private prisma: PrismaClient) {}

  async findByPropertyId(propertyId: string): Promise<RevenueSettings | null> {
    const row = await this.prisma.revenue_settings.findUnique({
      where: { propertyId },
    })
    if (!row) return null

    const leadTimeDiscounts: LeadTimeDiscount[] = Array.isArray(row.leadTimeDiscounts)
      ? (row.leadTimeDiscounts as any[]).map((d: any) => ({
          daysBefore: d.daysBefore ?? 0,
          discount: d.discount ?? 0,
        }))
      : []

    const occupancyThresholds: OccupancyThreshold[] = Array.isArray(row.occupancyThresholds)
      ? (row.occupancyThresholds as any[]).map((t: any) => ({
          minOccupancy: t.minOccupancy ?? 0,
          multiplier: t.multiplier ?? 1.0,
        }))
      : []

    const result = RevenueSettings.create({
      dynamicPricingEnabled: row.dynamicPricingEnabled,
      minPrice: row.minPrice,
      maxPrice: row.maxPrice,
      weekendMultiplier: row.weekendMultiplier,
      seasonalMultiplier: row.seasonalMultiplier,
      leadTimeDiscounts,
      occupancyThresholds,
    })

    return result.isOk ? result.value : null
  }

  async save(propertyId: string, settings: RevenueSettings): Promise<void> {
    const data = settings.toJSON()
    await this.prisma.revenue_settings.create({
      data: {
        id: `${propertyId}-revenue`,
        propertyId,
        dynamicPricingEnabled: data.dynamicPricingEnabled,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        weekendMultiplier: data.weekendMultiplier,
        seasonalMultiplier: data.seasonalMultiplier,
        leadTimeDiscounts: JSON.parse(JSON.stringify(data.leadTimeDiscounts)),
        occupancyThresholds: JSON.parse(JSON.stringify(data.occupancyThresholds)),
        updatedAt: new Date(),
      },
    })
  }

  async update(propertyId: string, settings: RevenueSettings): Promise<void> {
    const data = settings.toJSON()
    await this.prisma.revenue_settings.update({
      where: { propertyId },
      data: {
        dynamicPricingEnabled: data.dynamicPricingEnabled,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        weekendMultiplier: data.weekendMultiplier,
        seasonalMultiplier: data.seasonalMultiplier,
        leadTimeDiscounts: JSON.parse(JSON.stringify(data.leadTimeDiscounts)),
        occupancyThresholds: JSON.parse(JSON.stringify(data.occupancyThresholds)),
      },
    })
  }
}
