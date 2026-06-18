import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, planType, paymentMethod } = body;

    // Validate required fields
    if (!email || !name || !planType || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate plan type
    const validPlans = ['gratuito', 'lite', 'pro', 'max'];
    if (!validPlans.includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Define pricing
    const pricing = {
      gratuito: 0,
      lite: paymentMethod === 'pix' ? 197 : 247,
      pro: paymentMethod === 'pix' ? 397 : 447,
      max: paymentMethod === 'pix' ? 697 : 797,
    };

    const amount = pricing[planType];

    // Create or find user
    let user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name,
          role: 'client'
        }
      });
    }

    // Create or find tenant
    let tenant = await db.tenant.findUnique({
      where: { email }
    });

    if (!tenant) {
      tenant = await db.tenant.create({
        data: {
          name,
          email,
          passwordHash: '', // Will be set after registration
          plan: 'trial',
          status: 'active',
          trialStart: new Date(),
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          userId: user.id
        }
      });
    }

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        tenantId: tenant.id,
        planType,
        status: 'pending',
        paymentMethod,
        amount,
        paymentStatus: 'pending',
        trialStart: planType === 'gratuito' ? new Date() : null,
        trialEnd: planType === 'gratuito' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
      }
    });

    // For free plan, activate immediately and redirect to dashboard
    if (planType === 'gratuito') {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          paymentStatus: 'approved'
        }
      });

      await db.tenant.update({
        where: { id: tenant.id },
        data: {
          plan: 'trial',
          subscriptionAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        redirectUrl: '/dashboard',
        message: 'Trial iniciado com sucesso!'
      });
    }

    // For paid plans, return checkout details
    // In production, this would integrate with Mercado Pago/Stripe APIs
    const mockCheckoutUrl = `/checkout/success?subscription_id=${subscription.id}`;

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      checkoutUrl: mockCheckoutUrl,
      amount,
      paymentMethod,
      planType,
      message: 'Checkout criado com sucesso!'
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}