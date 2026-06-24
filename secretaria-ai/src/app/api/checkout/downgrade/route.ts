import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/checkout/downgrade
 *
 * Faz downgrade de plano. Sem cobrança — o novo plano entra
 * na próxima renovação (currentPeriodEnd).
 *
 * Body: { tenantId, newPlanType }
 *
 * Planos: max → pro → lite → gratuito (só permite descer)
 */

const PLAN_ORDER = ['gratuito', 'lite', 'pro', 'max'] as const;
type PlanType = (typeof PLAN_ORDER)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, newPlanType } = body as {
      tenantId?: string;
      newPlanType?: string;
    };

    if (!tenantId || !newPlanType) {
      return NextResponse.json(
        { success: false, error: 'Missing tenantId or newPlanType' },
        { status: 400 },
      );
    }

    if (!PLAN_ORDER.includes(newPlanType as PlanType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid plan: ${newPlanType}. Valid: ${PLAN_ORDER.join(', ')}`,
        },
        { status: 400 },
      );
    }

    const subscription = await db.subscription.findFirst({
      where: { tenantId },
    });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active subscription found for this tenant',
        },
        { status: 404 },
      );
    }

    const currentPlan = subscription.planType as PlanType;
    const currentIdx = PLAN_ORDER.indexOf(currentPlan);
    const newIdx = PLAN_ORDER.indexOf(newPlanType as PlanType);

    if (newIdx >= currentIdx) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot upgrade via downgrade endpoint. Current: ${currentPlan}, Requested: ${newPlanType}. Use /api/checkout/upgrade instead.`,
        },
        { status: 400 },
      );
    }

    const effectiveDate =
      subscription.currentPeriodEnd ||
      new Date(Date.now() + 30 * 86400000);

    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        metadata: JSON.stringify({
          ...JSON.parse(subscription.metadata || '{}'),
          pendingDowngrade: {
            toPlan: newPlanType,
            effectiveDate: effectiveDate.toISOString(),
            requestedAt: new Date().toISOString(),
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Downgrade agendado: ${currentPlan} → ${newPlanType}`,
      currentPlan,
      newPlanType,
      effectiveDate: effectiveDate.toISOString(),
      details: {
        currentPlan,
        newPlanType,
        effectiveDate,
        reason: `O novo plano entra na próxima renovação. Você mantém todos os benefícios atuais até ${effectiveDate.toLocaleDateString('pt-BR')}`,
      },
    });
  } catch (error) {
    console.error('[Checkout Downgrade] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process downgrade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
