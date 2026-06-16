import { FinanceTransaction } from '../../../domain/financeiro/entities/FinanceTransaction';

export interface IFinanceTransactionRepository {
  save(transaction: FinanceTransaction): Promise<void>;
  findByProperty(propertyId: string, startDate: Date, endDate: Date): Promise<FinanceTransaction[]>;
}
