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

    // Em downgrade, não tem pró-rata. Agendamos para o fim do ciclo (cancelAtPeriodEnd) ou trocamos mock
    // MOCK: Troca imediata e flag de cancelAtPeriodEnd para simular
    const updatedSub = await db.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        cancelAtPeriodEnd: true, 
        planType: planType // Mocked imediato
      }
    });

    // Atualiza cache
    await db.tenant.update({
      where: { id: tenant.id },
      data: { plan: planType }
    });

    return NextResponse.json({
      success: true,
      newPlan: planType,
      effectiveDate: currentSubscription.currentPeriodEnd || new Date(),
      message: 'Downgrade agendado/efetuado com sucesso (Mock)'
    });

  } catch (error) {
    console.error('Downgrade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
