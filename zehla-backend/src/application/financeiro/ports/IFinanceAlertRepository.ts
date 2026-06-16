import { FinanceAlert } from '../../../domain/financeiro/entities/FinanceAlert';

export interface IFinanceAlertRepository {
  save(alert: FinanceAlert): Promise<void>;
  findUnread(propertyId: string, limit?: number): Promise<FinanceAlert[]>;
  markAsRead(id: string): Promise<void>;
}
