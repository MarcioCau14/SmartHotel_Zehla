import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'payment.updated' || body.type === 'payment') {
      const paymentId = body.data?.id;

      if (!paymentId) {
        return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
      }

      const transaction = await db.paymentTransaction.findFirst({
        where: { externalId: String(paymentId) },
      });

      if (!transaction) {
        console.log(`Webhook: Payment ${paymentId} not found in DB`);
        return NextResponse.json({ received: true });
      }

      const token = process.env.MP_ACCESS_TOKEN;
      if (token) {
        try {
          const mpResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const mpData = await mpResponse.json();
          const newStatus = mpData.status;

          await db.paymentTransaction.update({
            where: { id: transaction.id },
            data: { status: newStatus },
          });

          if (newStatus === 'approved') {
            const subscription = await db.subscription.findUnique({
              where: { id: transaction.subscriptionId },
            });

            if (subscription) {
              const now = new Date();
              const periodEnd = new Date(now);
              periodEnd.setMonth(periodEnd.getMonth() + 1);

              await db.subscription.update({
                where: { id: subscription.id },
                data: {
                  status: 'active',
                  paymentStatus: 'approved',
                  paymentId: String(paymentId),
                  currentPeriodStart: now,
                  currentPeriodEnd: periodEnd,
                },
              });

              await db.tenant.update({
                where: { id: subscription.tenantId },
                data: { plan: subscription.planType, subscriptionAt: now, status: 'active' },
              });
            }
          } else if (newStatus === 'rejected') {
            await db.subscription.update({
              where: { id: transaction.subscriptionId },
              data: { paymentStatus: 'rejected' },
            });
          }
        } catch (mpError) {
          console.error('MP fetch error:', mpError);
        }
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, action: body.action });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
