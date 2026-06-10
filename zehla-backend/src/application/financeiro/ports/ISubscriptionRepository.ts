import { Subscription } from '../../../domain/financeiro/entities/Subscription';

export interface ISubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
  findById(id: string): Promise<Subscription | null>;
  findByExternalId(externalId: string): Promise<Subscription | null>;
}
