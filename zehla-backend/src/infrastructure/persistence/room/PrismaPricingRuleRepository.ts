import { PrismaClient } from '@prisma/client'
import { PricingRule } from '../../../domain/room/entities/PricingRule'
import { MonetaryValue } from '../../../domain/room/value-objects/MonetaryValue'
import { RoomDateRange } from '../../../domain/room/value-objects/RoomDateRange'
import { RoomType } from '../../../domain/room/enums'
import { IPricingRuleRepository } from '../../../application/room/ports/IPricingRuleRepository'

export class PrismaPricingRuleRepository implements IPricingRuleRepository {
  constructor(private prisma: PrismaClient) {}

  async save(rule: PricingRule): Promise<PricingRule> {
    const data = rule.toJSON()
    await this.prisma.pricingRule.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        roomType: data.roomType as any,
        startDate: new Date(data.dateRange.startDate),
        endDate: new Date(data.dateRange.endDate),
        multiplier: data.multiplier,
        fixedAmount: data.fixedAmount?.amount ?? null,
        isActive: data.isActive,
        propertyId: data.propertyId,
      },
    })
    return rule
  }

  async update(rule: PricingRule): Promise<PricingRule> {
    const data = rule.toJSON()
    await this.prisma.pricingRule.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        roomType: data.roomType as any,
        startDate: new Date(data.dateRange.startDate),
        endDate: new Date(data.dateRange.endDate),
        multiplier: data.multiplier,
        fixedAmount: data.fixedAmount?.amount ?? null,
        isActive: data.isActive,
      },
    })
    return rule
  }

  async findById(id: string): Promise<PricingRule | null> {
    const row = await this.prisma.pricingRule.findUnique({ where: { id } })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByProperty(propertyId: string): Promise<PricingRule[]> {
    const rows = await this.prisma.pricingRule.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as PricingRule[]
  }

  async findActiveByDate(propertyId: string, date: Date): Promise<PricingRule[]> {
    const rows = await this.prisma.pricingRule.findMany({
      where: {
        propertyId,
        isActive: true,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as PricingRule[]
  }

  async findConflicting(rule: PricingRule): Promise<PricingRule | null> {
    const data = rule.toJSON()
    const rows = await this.prisma.pricingRule.findMany({
      where: {
        propertyId: data.propertyId,
        isActive: true,
        id: { not: data.id },
        roomType: data.roomType as any ?? undefined,
        startDate: { lt: new Date(data.dateRange.endDate) },
        endDate: { gt: new Date(data.dateRange.startDate) },
      },
    })
    return rows.length > 0 ? this.hydrate(rows[0]) : null
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pricingRule.delete({ where: { id } })
  }

  private hydrate(row: any): PricingRule | null {
    const dateRangeResult = RoomDateRange.create(
      new Date(row.startDate),
      new Date(row.endDate)
    )
    if (dateRangeResult.isFail) return null

    let fixedAmount: MonetaryValue | undefined
    if (row.fixedAmount != null) {
      const amtResult = MonetaryValue.create(row.fixedAmount)
      if (amtResult.isFail) return null
      fixedAmount = amtResult.value
    }

    const ruleResult = PricingRule.create({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      roomType: (row.roomType as RoomType) ?? undefined,
      dateRange: dateRangeResult.value,
      multiplier: row.multiplier ?? 1.0,
      fixedAmount,
      propertyId: row.propertyId,
    })
    if (ruleResult.isFail) return null

    const rule = ruleResult.value
    if (!row.isActive) {
      ;(rule as any).data.isActive = false
    }

    return rule
  }
}
