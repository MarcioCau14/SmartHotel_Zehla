import { TaxProfile } from '../entities/TaxProfile';

export interface ITaxProfileRepositoryPort {
  findByPropertyId(propertyId: string): Promise<TaxProfile | null>;
  save(profile: TaxProfile): Promise<void>;
}
