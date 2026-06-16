import { prisma } from '@/lib/prisma';
import { Subscription } from '../../../domain/financeiro/entities/Subscription';
import { ISubscriptionRepository } from '../../../application/financeiro/ports/ISubscriptionRepository';
import { Money } from '../../../domain/financeiro/value-objects/Money';

export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  async save(subscription: Subscription): Promise<void> {
    const props = subscription.toJSON();
    await prisma.property.update({
      where: { id: subscription.propertyId },
      data: {
        plan: subscription.plan,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd,
        stripeSubscriptionId: subscription.externalId,
        subscriptionJson: props as any,
      },
    });
  }

  private mapToDomain(property: any): Subscription | null {
    const rawProps = property.subscriptionJson as any;
    if (!rawProps) return null;

    const moneyResult = Money.create(rawProps.amount.amount, rawProps.amount.currency);
    if (moneyResult.isFail) return null;

    return Subscription.restore({
      id: rawProps.id,
      propertyId: rawProps.propertyId,
      tenantId: rawProps.tenantId,
      plan: rawProps.plan,
      status: rawProps.status,
      amount: moneyResult.value,
      paymentMethod: rawProps.paymentMethod,
      externalId: rawProps.externalId,
      currentPeriodStart: new Date(rawProps.currentPeriodStart),
      currentPeriodEnd: new Date(rawProps.currentPeriodEnd),
      nextPaymentDate: new Date(rawProps.nextPaymentDate),
      cancelAtPeriodEnd: rawProps.cancelAtPeriodEnd,
      metadata: rawProps.metadata,
      createdAt: new Date(rawProps.createdAt),
      updatedAt: new Date(rawProps.updatedAt),
    });
  }

  async findById(id: string): Promise<Subscription | null> {
    const property = await prisma.property.findFirst({
      where: {
        subscriptionJson: {
          path: ['id'],
          equals: id,
        },
      },
    });
    if (!property) return null;
    return this.mapToDomain(property);
  }

  async findByExternalId(externalId: string): Promise<Subscription | null> {
    const property = await prisma.property.findUnique({
      where: { stripeSubscriptionId: externalId },
    });
    if (!property) return null;
    return this.mapToDomain(property);
  }
}
