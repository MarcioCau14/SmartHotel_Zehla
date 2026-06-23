import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, planType, paymentMethod } = body;

    if (!email || !name || !planType || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validPlans = ['gratuito', 'lite', 'pro', 'max'];
    if (!validPlans.includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const pricing = {
      gratuito: 0,
      lite: paymentMethod === 'pix' ? 197 : 247,
      pro: paymentMethod === 'pix' ? 397 : 447,
      max: paymentMethod === 'pix' ? 697 : 797,
    };

    const amount = pricing[planType as keyof typeof pricing];

    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      user = await db.user.create({ data: { email, name } });
    }

    let tenant = await db.tenant.findUnique({ where: { email } });
    if (!tenant) {
      tenant = await db.tenant.create({
        data: {
          name, email, passwordHash: '', plan: 'trial', status: 'active',
          trialStart: new Date(),
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
    }

    const subscription = await db.subscription.create({
      data: {
        tenantId: tenant.id, planType, status: 'pending',
        paymentMethod, amount, paymentStatus: 'pending',
        trialStart: planType === 'gratuito' ? new Date() : null,
        trialEnd: planType === 'gratuito' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
      },
    });

    if (planType === 'gratuito') {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: 'active', paymentStatus: 'approved' },
      });
      await db.tenant.update({
        where: { id: tenant.id },
        data: { plan: 'trial', subscriptionAt: new Date() },
      });
      return NextResponse.json({
        success: true, subscriptionId: subscription.id,
        redirectUrl: '/dashboard', message: 'Trial iniciado com sucesso!',
      });
    }

    if (paymentMethod === 'pix' && process.env.MP_ACCESS_TOKEN) {
      try {
        const { createPixPayment } = await import('@/lib/mercadopago');
        const mpResult = await createPixPayment({
          amount, email,
          firstName: name.split(' ')[0] || name,
          lastName: name.split(' ').slice(1).join(' ') || '',
          description: `ZEHLA SmartHotel - Plano ${planType.toUpperCase()}`,
          externalRef: subscription.id,
        });

        await db.paymentTransaction.create({
          data: {
            subscriptionId: subscription.id, amount, status: 'pending',
            paymentMethod: 'pix', externalId: String(mpResult.id),
            metadata: JSON.stringify({ point_of_interaction: mpResult.point_of_interaction }),
          },
        });

        const ticketUrl = mpResult.point_of_interaction?.transaction_data?.ticket_url;
        if (ticketUrl) {
          await db.subscription.update({
            where: { id: subscription.id },
            data: { checkoutUrl: ticketUrl, paymentId: String(mpResult.id) },
          });
        }

        const pixData = mpResult.point_of_interaction?.transaction_data;
        return NextResponse.json({
          success: true, subscriptionId: subscription.id,
          checkoutUrl: ticketUrl || `/checkout/success?subscription_id=${subscription.id}`,
          amount, paymentMethod, planType,
          pix: pixData ? { qrCode: pixData.qr_code, qrCodeBase64: pixData.qr_code_base64, ticketUrl: pixData.ticket_url } : null,
          message: 'QR Code PIX gerado com sucesso!',
        });
      } catch (mpError) {
        console.error('Mercado Pago error, falling back to mock:', mpError);
      }
    }

    return NextResponse.json({
      success: true, subscriptionId: subscription.id,
      checkoutUrl: `/checkout/success?subscription_id=${subscription.id}`,
      amount, paymentMethod, planType, message: 'Checkout criado com sucesso!',
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}