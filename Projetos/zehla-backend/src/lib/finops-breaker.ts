import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { PLANS } from '@/lib/stripe';

/**
 * ZEHLA FINOPS BREAKER
 * Monitora custos por tenant e bloqueia operações caras quando o limite é excedido.
 *
 * Custo zero mantra: tudo é rastreado, mas bloqueios só ativam em produção.
 */

interface TenantCostSummary {
  propertyId: string;
  plan: string;
  currentCost: number;
  budgetLimit: number;
  usagePercent: number;
  isOverBudget: boolean;
  aiTokenCount: number;
  apiCallCount: number;
}

const COST_LIMITS: Record<string, number> = {
  LITE: 10,
  PRO: 50,
  MAX: 200,
};

const AI_COST_PER_1K_TOKENS = 0.02;
const API_COST_PER_CALL = 0.001;

export async function logBillingEvent(
  propertyId: string,
  type: string,
  units: number = 1,
  metadata?: Record<string, unknown>
) {
  const cost = calculateCost(type, units);

  try {
    await prisma.billingLog.create({
      data: {
        propertyId,
        type,
        units,
        cost,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });

    await redis.incr(`finops:cost:${propertyId}:${type}`);
    await redis.incrby(`finops:total_cost:${propertyId}`, Math.round(cost * 1000));
  } catch (error) {
    console.error('[FinOps] Failed to log billing event:', error);
  }
}

function calculateCost(type: string, units: number): number {
  switch (type) {
    case 'ai_token':
      return (units / 1000) * AI_COST_PER_1K_TOKENS;
    case 'api_call':
      return units * API_COST_PER_CALL;
    case 'email':
      return units * 0.01;
    case 'storage':
      return units * 0.001;
    default:
      return 0;
  }
}

export async function getTenantCostSummary(propertyId: string, plan: string): Promise<TenantCostSummary> {
  const budgetLimit = COST_LIMITS[plan] || 10;

  const [aiTokens, apiCalls, emailCost, storageCost] = await Promise.all([
    redis.get(`finops:cost:${propertyId}:ai_token`).then(v => parseInt(v || '0')),
    redis.get(`finops:cost:${propertyId}:api_call`).then(v => parseInt(v || '0')),
    redis.get(`finops:cost:${propertyId}:email`).then(v => parseInt(v || '0')),
    redis.get(`finops:cost:${propertyId}:storage`).then(v => parseInt(v || '0')),
  ]);

  const totalCostRaw = await redis.get(`finops:total_cost:${propertyId}`);
  const currentCost = (parseInt(totalCostRaw || '0')) / 1000;

  return {
    propertyId,
    plan,
    currentCost,
    budgetLimit,
    usagePercent: Math.min(100, (currentCost / budgetLimit) * 100),
    isOverBudget: currentCost >= budgetLimit,
    aiTokenCount: aiTokens,
    apiCallCount: apiCalls,
  };
}

export async function checkFinOpsBreaker(propertyId: string, plan: string, operation: string): Promise<{ allowed: boolean; reason?: string }> {
  const summary = await getTenantCostSummary(propertyId, plan);

  if (summary.isOverBudget) {
    return {
      allowed: false,
      reason: `Budget exceeded for ${plan} plan (R$${summary.currentCost.toFixed(2)} / R$${summary.budgetLimit.toFixed(2)})`,
    };
  }

  if (summary.usagePercent > 80 && operation === 'ai_token') {
    return {
      allowed: true,
      reason: `Warning: 80% of budget used. Consider upgrading plan.`,
    };
  }

  const planLimits = PLANS[plan as keyof typeof PLANS]?.limits;
  if (planLimits) {
    if (operation === 'ai_token' && summary.aiTokenCount >= planLimits.aiMessages) {
      return {
        allowed: false,
        reason: `AI message limit reached for ${plan} plan (${planLimits.aiMessages} messages)`,
      };
    }
  }

  return { allowed: true };
}

export async function resetTenantCosts(propertyId: string) {
  const keys = await redis.keys(`finops:*:${propertyId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export async function getAllTenantsCostSummary(): Promise<TenantCostSummary[]> {
  const properties = await prisma.property.findMany({
    select: { id: true, plan: true },
  });

  return Promise.all(
    properties.map(p => getTenantCostSummary(p.id, p.plan))
  );
}
