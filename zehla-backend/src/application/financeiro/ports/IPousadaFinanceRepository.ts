import { PousadaFinance } from '../../../domain/financeiro/entities/PousadaFinance';

export interface IPousadaFinanceRepository {
  save(finance: PousadaFinance): Promise<void>;
  findByDateRange(propertyId: string, startDate: Date, endDate: Date): Promise<PousadaFinance[]>;
  findUnique(propertyId: string, date: Date): Promise<PousadaFinance | null>;
}
