import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { PLANS } from '@/lib/stripe';
import { TenantLocalizationService } from '@/lib/i18n/TenantLocalizationService';

/**
 * ZEHLA FINOPS BREAKER — Multi-Currency Support (Fase 4)
 * Monitora custos por tenant e bloqueia operações caras quando o limite é excedido.
 *
 * Custo zero mantra: tudo é rastreado, mas bloqueios só ativam em produção.
 * 
 * Internamente: custos armazenados em centavos de USD (moeda base das APIs)
 * Exibição: formatada para a moeda do tenant via TenantLocalizationService
 */

interface TenantCostSummary {
  propertyId: string;
  plan: string;
  currentCost: number; // Em USD (base currency)
  budgetLimit: number; // Em USD (base currency)
  usagePercent: number;
  isOverBudget: boolean;
  aiTokenCount: number;
  apiCallCount: number;
}

// Limites de custo por plano (em USD — moeda base do Stripe)
// Proporcionais ao valor real de cada plano
const COST_LIMITS_USD: Record<string, number> = {
  TRIAL: 0.5,   // Hard-limit trial: ~R$ 2.50 (máximo 50 msgs IA/dia)
  LITE: 5,      // ~R$ 25 (proporcional ao plano R$248)
  PRO: 20,      // ~R$ 100 (proporcional ao plano R$448)
  MAX: 80,      // ~R$ 400 (proporcional ao plano R$798)
};

// Custos operacionais em USD (preços das APIs)
const AI_COST_PER_1K_TOKENS_USD = 0.002; // Kimi/GPT-4o-mini
const API_COST_PER_CALL_USD = 0.001;

// Limites rígidos por operação para TRIAL (FinOps Breaker)
const TRIAL_HARD_LIMITS = {
  aiMessagesPerDay: 50,
  whatsappMessagesPerDay: 100,
  apiCallsPerDay: 200,
  maxTokensPerRequest: 2000,
};

/**
 * Formata custo para exibição na moeda do tenant
 */
function formatCostForTenant(amountUSD: number, currencyCode: string, locale: string): string {
  // Conversão aproximada (em produção, usar taxa de câmbio real via API)
  const rates: Record<string, number> = {
    'BRL': 5.0,
    'EUR': 0.92,
    'USD': 1.0,
    'ARS': 350,
    'CLP': 850,
    'COP': 3900,
    'MXN': 17,
  };
  const rate = rates[currencyCode] || 1.0;
  const localAmount = amountUSD * rate;
  
  return TenantLocalizationService.formatCurrency(localAmount, currencyCode, locale);
}

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
      return (units / 1000) * AI_COST_PER_1K_TOKENS_USD;
    case 'api_call':
      return units * API_COST_PER_CALL_USD;
    case 'email':
      return units * 0.01;
    case 'storage':
      return units * 0.001;
    default:
      return 0;
  }
}

export async function getTenantCostSummary(propertyId: string, plan: string): Promise<TenantCostSummary> {
  const budgetLimit = COST_LIMITS_USD[plan] || 2;

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

  // TRIAL HARD-LIMITS (FinOps Breaker — custo zero)
  if (plan === 'TRIAL' || (plan === 'PRO' && summary.currentCost < 0.5)) {
    const today = new Date().toISOString().split('T')[0];
    const todayKey = `finops:daily:${propertyId}:${today}`;
    const [aiToday, waToday] = await Promise.all([
      redis.get(`${todayKey}:ai`).then(v => parseInt(v || '0')),
      redis.get(`${todayKey}:wa`).then(v => parseInt(v || '0')),
    ]);

    if (operation === 'ai_token' && aiToday >= TRIAL_HARD_LIMITS.aiMessagesPerDay) {
      return {
        allowed: false,
        reason: `Limite diário de IA do trial atingido (${TRIAL_HARD_LIMITS.aiMessagesPerDay} mensagens). Faça upgrade para ilimitado.`,
      };
    }
    if (operation === 'whatsapp' && waToday >= TRIAL_HARD_LIMITS.whatsappMessagesPerDay) {
      return {
        allowed: false,
        reason: `Limite diário de WhatsApp do trial atingido (${TRIAL_HARD_LIMITS.whatsappMessagesPerDay} mensagens).`,
      };
    }
  }

  if (summary.isOverBudget) {
    return {
      allowed: false,
      reason: `Budget exceeded for ${plan} plan ($${summary.currentCost.toFixed(2)} / $${summary.budgetLimit.toFixed(2)} USD)`,
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

export async function incrementTrialDailyCounter(propertyId: string, type: 'ai' | 'wa') {
  const today = new Date().toISOString().split('T')[0];
  const key = `finops:daily:${propertyId}:${today}:${type}`;
  await redis.incr(key);
  await redis.expire(key, 86400 * 2);
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

/**
 * Helper para formatar custos na moeda do tenant (uso em APIs/UI)
 */
export async function getFormattedCostSummary(
  propertyId: string,
  plan: string,
  currencyCode: string = 'BRL',
  locale: string = 'pt-BR'
) {
  const summary = await getTenantCostSummary(propertyId, plan);
  
  return {
    ...summary,
    currentCostFormatted: formatCostForTenant(summary.currentCost, currencyCode, locale),
    budgetLimitFormatted: formatCostForTenant(summary.budgetLimit, currencyCode, locale),
  };
}
