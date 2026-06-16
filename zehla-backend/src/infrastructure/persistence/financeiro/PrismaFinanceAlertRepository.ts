import { prisma } from '@/lib/prisma';
import { FinanceAlert } from '../../../domain/financeiro/entities/FinanceAlert';
import { IFinanceAlertRepository } from '../../../application/financeiro/ports/IFinanceAlertRepository';
import { Prisma } from '@prisma/client';

export class PrismaFinanceAlertRepository implements IFinanceAlertRepository {
  async save(alert: FinanceAlert): Promise<void> {
    const data = {
      scope: alert.scope,
      type: alert.type,
      severity: alert.severity,
      agentName: alert.agentName,
      message: alert.message,
      metric: alert.metric as Prisma.InputJsonValue,
      isRead: alert.isRead,
      actionTaken: alert.actionTaken,
    };

    await prisma.financeAlert.upsert({
      where: { id: alert.id },
      update: data,
      create: {
        id: alert.id,
        propertyId: alert.propertyId,
        createdAt: alert.createdAt,
        ...data,
      },
    });
  }

  async findUnread(propertyId: string, limit?: number): Promise<FinanceAlert[]> {
    const records = await prisma.financeAlert.findMany({
      where: {
        propertyId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit ?? 50,
    });

    return records.map(this.hydrate);
  }

  async markAsRead(id: string): Promise<void> {
    await prisma.financeAlert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  private hydrate(record: any): FinanceAlert {
    const result = FinanceAlert.create({
      id: record.id,
      propertyId: record.propertyId,
      scope: record.scope as 'CORPORATE' | 'CLIENT',
      type: record.type,
      severity: record.severity as 'INFO' | 'WARNING' | 'CRITICAL',
      agentName: record.agentName,
      message: record.message,
      metric: record.metric ? (record.metric as Record<string, any>) : null,
      isRead: record.isRead,
      actionTaken: record.actionTaken,
    });
    if (result.isFail) {
      throw result.error;
    }
    // We restore the object since createdAt is already set and cannot be overridden by create (create sets it to new Date())
    return FinanceAlert.restore({
      ...result.value.toJSON(),
      createdAt: record.createdAt,
    });
  }
}
