import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { StripeService } from '@/lib/finance/stripe-service';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan } = await req.json();

  if (!['LITE', 'PRO', 'MAX'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid Plan' }, { status: 400 });
  }

  try {
    const url = await StripeService.createCheckoutSession(session.user.tenantId, plan);
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error(`❌ [CHECKOUT-API] Erro: ${err.message}`);
    return NextResponse.json({ error: 'Checkout Error' }, { status: 500 });
  }
}
