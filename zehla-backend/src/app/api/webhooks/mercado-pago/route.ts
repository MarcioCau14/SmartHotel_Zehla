import { NextRequest, NextResponse } from 'next/server';
import { ProcessarWebhookMercadoPagoUseCase } from '../../../../application/financeiro/use-cases/ProcessarWebhookMercadoPagoUseCase';
import { MercadoPagoGateway } from '../../../../infrastructure/finance/gateways/MercadoPagoGateway';
import { FinanceiroControllerFactory } from '../../../../infrastructure/http/financeiro/FinanceiroControllerFactory';
import { InMemorySubscriptionRepository } from '../../../../infrastructure/persistence/financeiro/InMemorySubscriptionRepository';
import { scanAndMaskPII } from '../../../../lib/security/pii-scanner';

const subscriptionRepo = new InMemorySubscriptionRepository();

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature') || '';
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // Security PII scan for logs
    const safeLogPayload = scanAndMaskPII(JSON.stringify({
      type: payload.type,
      action: payload.action,
      data_id: payload.data?.id,
      live_mode: payload.live_mode
    })).masked;

    console.log('[Webhook Mercado Pago]', safeLogPayload);

    // Initialize gateway
    const gateway = new MercadoPagoGateway({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-MOCK-TOKEN',
      publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || 'TEST-MOCK-KEY',
      webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET || 'TEST-MOCK-SECRET',
      sandbox: process.env.MERCADO_PAGO_SANDBOX === 'true' || process.env.NODE_ENV !== 'production',
      idempotencyKeyPrefix: 'zehla'
    });

    const invoiceRepository = FinanceiroControllerFactory.getInvoiceRepository();

    const useCase = new ProcessarWebhookMercadoPagoUseCase(
      gateway,
      invoiceRepository,
      subscriptionRepo
    );

    const result = await useCase.execute(payload, signature);

    if (result.isFail()) {
      const errorMsg = result.getError();
      console.error('[Webhook Error]', errorMsg);
      if (errorMsg.includes('ASSINATURA')) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
      return NextResponse.json({ received: true, error: errorMsg }, { status: 200 });
    }

    return NextResponse.json({ received: true, event: result.getValue() }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook Exception]', error);
    return NextResponse.json({ received: true, error: 'Internal error logged' }, { status: 200 });
  }
}

export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
