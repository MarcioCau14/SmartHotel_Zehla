import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signature) {
        console.warn('[Webhook] Sem x-signature — modo MOCK');
      } else {
        const parts = signature.split(',');
        const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1] || '';
        const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1] || '';
        const expected = crypto
          .createHmac('sha256', webhookSecret)
          .update(`id:${ts};request:`)
          .update(rawBody)
          .digest('hex');
        if (!crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))) {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
      }
    }

    const body = JSON.parse(rawBody);

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
