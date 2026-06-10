import { Subscription } from '../../../domain/financeiro/entities/Subscription';
import { ISubscriptionRepository } from '../../../application/financeiro/ports/ISubscriptionRepository';

export class InMemorySubscriptionRepository implements ISubscriptionRepository {
  private subscriptions: Map<string, Subscription> = new Map();

  async save(subscription: Subscription): Promise<void> {
    this.subscriptions.set(subscription.id, subscription);
  }

  async findById(id: string): Promise<Subscription | null> {
    return this.subscriptions.get(id) || null;
  }

  async findByExternalId(externalId: string): Promise<Subscription | null> {
    for (const sub of this.subscriptions.values()) {
      if (sub.externalId === externalId) {
        return sub;
      }
    }
    return null;
  }
}
