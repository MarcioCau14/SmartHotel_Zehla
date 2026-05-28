import { PrismaClient } from '@prisma/client'
import { FinancialAuditEntry, IFinancialAuditRepository } from '../../../application/financeiro/ports/IFinancialAuditRepository'

export class PrismaFinancialAuditRepository implements IFinancialAuditRepository {
  constructor(private prisma: PrismaClient) {}

  async save(entry: FinancialAuditEntry): Promise<FinancialAuditEntry> {
    await this.prisma.financeiroAuditLog.create({
      data: {
        id: entry.id,
        propertyId: entry.propertyId,
        action: entry.action,
        amount: entry.amount,
        currency: entry.currency,
        source: entry.source,
        externalId: entry.externalId,
        metadata: entry.metadata,
        hash: entry.hash,
      },
    })
    return entry
  }

  async findByProperty(
    propertyId: string,
    filters?: { limit?: number; offset?: number }
  ): Promise<FinancialAuditEntry[]> {
    const rows = await this.prisma.financeiroAuditLog.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ?? 100,
      skip: filters?.offset ?? 0,
    })
    return rows.map(this.hydrate)
  }

  async findByDateRange(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialAuditEntry[]> {
    const rows = await this.prisma.financeiroAuditLog.findMany({
      where: {
        propertyId,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(this.hydrate)
  }

  private hydrate(row: any): FinancialAuditEntry {
    return {
      id: row.id,
      propertyId: row.propertyId,
      action: row.action,
      amount: row.amount,
      currency: row.currency,
      source: row.source,
      externalId: row.externalId ?? undefined,
      metadata: row.metadata ?? undefined,
      hash: row.hash,
      createdAt: row.createdAt,
    }
  }
}
