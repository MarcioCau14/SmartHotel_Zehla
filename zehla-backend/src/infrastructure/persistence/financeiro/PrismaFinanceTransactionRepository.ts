import { prisma } from '@/lib/prisma';
import { FinanceTransaction } from '../../../domain/financeiro/entities/FinanceTransaction';
import { IFinanceTransactionRepository } from '../../../application/financeiro/ports/IFinanceTransactionRepository';
import { Prisma } from '@prisma/client';

export class PrismaFinanceTransactionRepository implements IFinanceTransactionRepository {
  async save(transaction: FinanceTransaction): Promise<void> {
    const data = {
      scope: transaction.scope,
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
      channel: transaction.channel,
      description: transaction.description,
      amount: transaction.amount,
      status: transaction.status,
      metadata: transaction.metadata as Prisma.InputJsonValue,
    };

    await prisma.financeTransaction.upsert({
      where: { id: transaction.id },
      update: data,
      create: {
        id: transaction.id,
        propertyId: transaction.propertyId,
        ...data,
      },
    });
  }

  async findByProperty(propertyId: string, startDate: Date, endDate: Date): Promise<FinanceTransaction[]> {
    const records = await prisma.financeTransaction.findMany({
      where: {
        propertyId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });

    return records.map(this.hydrate);
  }

  private hydrate(record: any): FinanceTransaction {
    const result = FinanceTransaction.create({
      id: record.id,
      propertyId: record.propertyId,
      scope: record.scope as 'CORPORATE' | 'CLIENT',
      date: record.date,
      type: record.type as 'INCOME' | 'EXPENSE',
      category: record.category,
      channel: record.channel,
      description: record.description,
      amount: record.amount,
      status: record.status,
      metadata: record.metadata ? (record.metadata as Record<string, any>) : null,
    });
    if (result.isFail) {
      throw result.error;
    }
    return result.value;
  }
}
