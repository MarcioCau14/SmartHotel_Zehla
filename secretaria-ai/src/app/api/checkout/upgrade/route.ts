import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/checkout/upgrade
 *
 * Faz upgrade de plano com cálculo pró-rata.
 * O crédito do período atual é descontado do novo plano.
 *
 * Body: { tenantId, newPlanType, paymentMethod }
 *
 * Planos: gratuito → lite → pro → max (só permite subir)
 * Preços (PIX): gratuito=0, lite=197, pro=397, max=697
 */

const PLAN_ORDER = ['gratuito', 'lite', 'pro', 'max'] as const;
type PlanType = (typeof PLAN_ORDER)[number];

const PRICING: Record<PlanType, number> = {
  gratuito: 0,
  lite: 197,
  pro: 397,
  max: 697,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, newPlanType, paymentMethod } = body as {
      tenantId?: string;
      newPlanType?: string;
      paymentMethod?: string;
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

    const method = paymentMethod || 'pix';

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

    if (newIdx <= currentIdx) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot downgrade via upgrade endpoint. Current: ${currentPlan}, Requested: ${newPlanType}. Use /api/checkout/downgrade instead.`,
        },
        { status: 400 },
      );
    }

    // Cálculo pró-rata
    const newPrice = PRICING[newPlanType as PlanType];
    const currentPrice = PRICING[currentPlan];

    const now = new Date();
    const periodEnd = subscription.currentPeriodEnd || new Date();
    const remainingDays = Math.max(
      0,
      Math.ceil((periodEnd.getTime() - now.getTime()) / 86400000),
    );

    const creditPerDay = currentPrice / 30;
    const totalCredit = Math.round(creditPerDay * remainingDays * 100) / 100;

    const costPerDay = newPrice / 30;
    const proratedCost = Math.round(costPerDay * remainingDays * 100) / 100;

    const amountToPay = Math.max(0, proratedCost - totalCredit);

    // Upgrade gratuito
    if (amountToPay === 0 && newPrice === 0) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          planType: newPlanType,
          status: 'active',
          paymentStatus: 'approved',
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 86400000),
        },
      });

      await db.tenant.update({
        where: { id: tenantId },
        data: { plan: newPlanType },
      });

      return NextResponse.json({
        success: true,
        message: `Upgrade para ${newPlanType} ativado (sem custo)`,
        newPlanType,
        proratedCost: 0,
        creditApplied: totalCredit,
        amountPaid: 0,
        remainingDays,
      });
    }

    // Criar transação de pagamento
    const transaction = await db.paymentTransaction.create({
      data: {
        subscriptionId: subscription.id,
        amount: amountToPay,
        status: 'pending',
        paymentMethod: method,
        metadata: JSON.stringify({
          type: 'upgrade',
          fromPlan: currentPlan,
          toPlan: newPlanType,
          proratedCost,
          totalCredit,
          remainingDays,
        }),
      },
    });

    // Integrar com Mercado Pago
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    const mpToken = process.env.MP_ACCESS_TOKEN;

    if (mpToken && amountToPay > 0) {
      try {
        const { createPixPayment } = await import('@/lib/mercadopago');

        const mpResult = await createPixPayment({
          amount: amountToPay,
          email: tenant?.email || '',
          firstName: tenant?.name?.split(' ')[0] || 'ZEHLA',
          lastName: tenant?.name?.split(' ').slice(1).join(' ') || '',
          description: `ZEHLA Upgrade: ${currentPlan} → ${newPlanType}`,
          externalRef: transaction.id,
        });

        await db.paymentTransaction.update({
          where: { id: transaction.id },
          data: { externalId: String(mpResult.id) },
        });

        const pixData = mpResult.point_of_interaction?.transaction_data;

        return NextResponse.json({
          success: true,
          transactionId: transaction.id,
          newPlanType,
          amountToPay,
          proratedCost,
          creditApplied: totalCredit,
          remainingDays,
          pix: pixData
            ? {
                qrCode: pixData.qr_code,
                qrCodeBase64: pixData.qr_code_base64,
                ticketUrl: pixData.ticket_url,
              }
            : null,
          message: `Upgrade de R$${currentPrice} para R$${newPrice}/mês. Pró-rata: R$${amountToPay.toFixed(2)}`,
        });
      } catch (mpError) {
        console.error('MP upgrade error, falling back to mock:', mpError);
      }
    }

    // Fallback mock
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        planType: newPlanType,
        status: 'active',
        paymentStatus: amountToPay === 0 ? 'approved' : 'pending',
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 86400000),
      },
    });

    await db.tenant.update({
      where: { id: tenantId },
      data: { plan: newPlanType },
    });

    await db.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: amountToPay === 0 ? 'approved' : 'pending' },
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      newPlanType,
      amountToPay,
      proratedCost,
      creditApplied: totalCredit,
      remainingDays,
      message:
        amountToPay === 0
          ? `Upgrade para ${newPlanType} ativado (sem custo)`
          : `Upgrade criado (modo mock). R$${amountToPay.toFixed(2)} pró-rata.`,
    });
  } catch (error) {
    console.error('[Checkout Upgrade] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process upgrade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
