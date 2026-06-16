import { TaxProfile } from '../../../domain/financeiro/entities/TaxProfile';

export interface ITaxProfileRepository {
  save(taxProfile: TaxProfile): Promise<void>;
  findByPropertyId(propertyId: string): Promise<TaxProfile | null>;
}
