// ==============================================================================
// ZEHLA SmartHotel — Require MAX Plan Guard
// ==============================================================================
// Verifica se o tenant possui assinatura MAX ativa.
// CRÍTICO: Consulta a tabela Subscription (NÃO Tenant.plan).
// O campo Tenant.plan usa valores (gratuito|lite|pro|max|parceiro)
// O campo Subscription.planType usa valores (gratuito|lite|pro|max|parceiro)
// "max" só existe em Subscription.planType.
// ==============================================================================

import { db } from '@/lib/db';

export interface PlanCheckResult {
  authorized: boolean;
  planType: string | null;
  subscriptionStatus: string | null;
  error?:
    | 'NO_SUBSCRIPTION'
    | 'PLAN_NOT_MAX'
    | 'SUBSCRIPTION_INACTIVE'
    | 'SUBSCRIPTION_EXPIRED';
}

/**
 * Verifica se o tenant tem uma assinatura MAX ativa.
 *
 * A query faz 3 filtros simultâneos:
 *  1. tenantId corresponde ao tenant autenticado
 *  2. planType = 'max'
 *  3. status = 'active'
 *
 * Se qualquer filtro falhar, o acesso é negado.
 */
export async function requireMaxPlan(tenantId: string): Promise<PlanCheckResult> {
  const subscription = await db.subscription.findFirst({
    where: { tenantId },
    select: {
      planType: true,
      status: true,
      currentPeriodEnd: true,
    },
  });

  // Sem assinatura nenhuma
  if (!subscription) {
    return {
      authorized: false,
      planType: null,
      subscriptionStatus: null,
      error: 'NO_SUBSCRIPTION',
    };
  }

  // Plano não é MAX
  if (subscription.planType !== 'max') {
    return {
      authorized: false,
      planType: subscription.planType,
      subscriptionStatus: subscription.status,
      error: 'PLAN_NOT_MAX',
    };
  }

  // Assinatura não está ativa
  if (subscription.status !== 'active') {
    return {
      authorized: false,
      planType: subscription.planType,
      subscriptionStatus: subscription.status,
      error: 'SUBSCRIPTION_INACTIVE',
    };
  }

  // Verificar se o período já expirou (segurança extra caso status não tenha sido atualizado)
  if (
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) < new Date()
  ) {
    return {
      authorized: false,
      planType: subscription.planType,
      subscriptionStatus: 'expired',
      error: 'SUBSCRIPTION_EXPIRED',
    };
  }

  return {
    authorized: true,
    planType: subscription.planType,
    subscriptionStatus: subscription.status,
  };
}
