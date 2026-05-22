import { prisma } from '@/lib/prisma';

export interface TrialStatus {
  isTrial: boolean;
  isActive: boolean;
  trialEndsAt: Date | null;
  daysRemaining: number;
  isExpired: boolean;
  plan: string;
  stripeSubscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
}

export async function getTrialStatus(propertyId: string): Promise<TrialStatus> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      isTrial: true,
      trialEndsAt: true,
      plan: true,
      stripeSubscriptionId: true,
      cancelAtPeriodEnd: true,
    },
  });

  if (!property) {
    return {
      isTrial: false,
      isActive: false,
      trialEndsAt: null,
      daysRemaining: 0,
      isExpired: true,
      plan: 'NONE',
      stripeSubscriptionId: null,
      cancelAtPeriodEnd: false,
    };
  }

  const now = new Date();
  const trialEndsAt = property.trialEndsAt;
  const isExpired = property.isTrial && !!trialEndsAt && trialEndsAt < now;
  const daysRemaining = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  const hasActiveSubscription = !!property.stripeSubscriptionId && !property.cancelAtPeriodEnd;
  const isActive = !isExpired || hasActiveSubscription;

  return {
    isTrial: property.isTrial,
    isActive,
    trialEndsAt,
    daysRemaining,
    isExpired,
    plan: property.plan,
    stripeSubscriptionId: property.stripeSubscriptionId,
    cancelAtPeriodEnd: property.cancelAtPeriodEnd,
  };
}

export async function checkSubscriptionGuard(propertyId: string, operation: string): Promise<{ allowed: boolean; reason?: string; redirectTo?: string }> {
  const status = await getTrialStatus(propertyId);

  if (!status.isActive) {
    if (status.isExpired && status.isTrial) {
      return {
        allowed: false,
        reason: 'Seu período de teste de 7 dias expirou. Faça upgrade para continuar usando o ZEHLA.',
        redirectTo: '/dashboard/upgrade',
      };
    }
    return {
      allowed: false,
      reason: 'Assinatura inativa. Faça upgrade para continuar.',
      redirectTo: '/dashboard/upgrade',
    };
  }

  if (status.isTrial && status.daysRemaining <= 2 && operation === 'ai_heavy') {
    return {
      allowed: true,
      reason: `Atenção: ${status.daysRemaining} dias restantes no trial. Considere fazer upgrade.`,
    };
  }

  return { allowed: true };
}
