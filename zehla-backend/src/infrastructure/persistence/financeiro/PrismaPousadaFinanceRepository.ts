import { prisma } from '@/lib/prisma';
import { PousadaFinance } from '../../../domain/financeiro/entities/PousadaFinance';
import { IPousadaFinanceRepository } from '../../../application/financeiro/ports/IPousadaFinanceRepository';
import { Prisma } from '@prisma/client';

export class PrismaPousadaFinanceRepository implements IPousadaFinanceRepository {
  async save(finance: PousadaFinance): Promise<void> {
    const data = {
      grossRevenue: finance.grossRevenue,
      netRevenue: finance.netRevenue,
      channelBreakdown: finance.channelBreakdown as Prisma.InputJsonValue,
      totalRooms: finance.totalRooms,
      occupiedRooms: finance.occupiedRooms,
      occupancyRate: finance.occupancyRate,
      adr: finance.adr,
      revpar: finance.revpar,
      operatingCosts: finance.operatingCosts as Prisma.InputJsonValue,
      totalCosts: finance.totalCosts,
      aiInsight: finance.aiInsight,
      healthScore: finance.healthScore,
      alertLevel: finance.alertLevel,
      scope: finance.scope,
    };

    await prisma.pousadaFinance.upsert({
      where: { date: finance.date },
      update: data,
      create: {
        id: finance.id,
        propertyId: finance.propertyId,
        date: finance.date,
        ...data,
      },
    });
  }

  async findByDateRange(propertyId: string, startDate: Date, endDate: Date): Promise<PousadaFinance[]> {
    const records = await prisma.pousadaFinance.findMany({
      where: {
        propertyId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    return records.map(this.hydrate);
  }

  async findUnique(propertyId: string, date: Date): Promise<PousadaFinance | null> {
    const record = await prisma.pousadaFinance.findFirst({
      where: { propertyId, date },
    });

    if (!record) return null;
    return this.hydrate(record);
  }

  private hydrate(record: any): PousadaFinance {
    return PousadaFinance.restore({
      id: record.id,
      propertyId: record.propertyId,
      scope: record.scope as 'CORPORATE' | 'CLIENT',
      date: record.date,
      grossRevenue: record.grossRevenue,
      netRevenue: record.netRevenue,
      channelBreakdown: record.channelBreakdown ? (record.channelBreakdown as Record<string, number>) : null,
      totalRooms: record.totalRooms,
      occupiedRooms: record.occupiedRooms,
      occupancyRate: record.occupancyRate,
      adr: record.adr,
      revpar: record.revpar,
      operatingCosts: record.operatingCosts ? (record.operatingCosts as Record<string, number>) : null,
      totalCosts: record.totalCosts,
      aiInsight: record.aiInsight,
      healthScore: record.healthScore,
      alertLevel: record.alertLevel,
    });
  }
}
