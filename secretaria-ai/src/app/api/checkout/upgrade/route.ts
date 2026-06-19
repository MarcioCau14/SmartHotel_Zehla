import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { userId, orgId } = session;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planType, tenantId } = body; 

    if (!planType) {
      return NextResponse.json({ error: 'Missing planType' }, { status: 400 });
    }

    let tenant;
    if (tenantId) {
       tenant = await db.tenant.findUnique({ where: { id: tenantId }, include: { subscriptions: true } });
    } else if (orgId) {
       tenant = await db.tenant.findUnique({ where: { clerkOrgId: orgId }, include: { subscriptions: true } });
    } else {
       tenant = await db.tenant.findFirst({ where: { clerkOrgId: null }, include: { subscriptions: true } });
    }

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (!tenant.subscriptionId) {
       return NextResponse.json({ error: 'No active subscription found for tenant' }, { status: 400 });
    }

    const currentSubscription = await db.subscription.findUnique({
       where: { id: tenant.subscriptionId }
    });

    if (!currentSubscription) {
       return NextResponse.json({ error: 'Subscription data not found' }, { status: 404 });
    }

    const pricing: Record<string, number> = {
      trial: 0,
      lite: currentSubscription.paymentMethod === 'pix' ? 197 : 247,
      pro: currentSubscription.paymentMethod === 'pix' ? 397 : 447,
      max: currentSubscription.paymentMethod === 'pix' ? 697 : 797,
    };

    const novoPreco = pricing[planType];
    const precoAtual = pricing[currentSubscription.planType] || 0;

    if (novoPreco === undefined) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const agora = new Date();
    const fimCiclo = currentSubscription.currentPeriodEnd || new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);
    const inicioCiclo = currentSubscription.currentPeriodStart || agora;

    const diasTotais = Math.max(1, Math.floor((fimCiclo.getTime() - inicioCiclo.getTime()) / (1000 * 60 * 60 * 24)));
    const diasRestantes = Math.max(0, Math.floor((fimCiclo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)));
    const diferencaPreco = novoPreco - precoAtual;

    const valorProrata = Math.max(0, (diasRestantes / diasTotais) * diferencaPreco);

    const updatedSub = await db.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        planType: planType,
        amount: novoPreco,
        lastProrateAmount: valorProrata,
        lastProrateDate: agora
      }
    });

    await db.tenant.update({
      where: { id: tenant.id },
      data: { plan: planType }
    });

    if (valorProrata > 0) {
      await db.paymentTransaction.create({
        data: {
          subscriptionId: updatedSub.id,
          type: 'prorate',
          amount: valorProrata,
          status: 'approved',
          paymentMethod: currentSubscription.paymentMethod || 'cartao',
          metadata: JSON.stringify({ description: `Upgrade from ${currentSubscription.planType} to ${planType}` })
        }
      });
    }

    return NextResponse.json({
      success: true,
      newPlan: planType,
      prorateAmount: valorProrata,
      message: 'Upgrade efetuado com sucesso (Mock)'
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
