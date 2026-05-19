import { NextRequest, NextResponse } from 'next/server';

import { fireGuardianAlert } from '@/lib/security/guardian-alert';
import { prisma } from '@/lib/prisma';
import { validatePixWebhook } from '@/lib/security/pix-webhook-guard';

import { withApiSecurity } from '@/lib/server/with-api-security';

export const runtime = 'nodejs';

async function _POST(request: NextRequest) : void {
  try {
    const gateway = request.nextUrl.searchParams.get('gateway') as any || 'asaas';
    const payload = await request.text(); // Raw body
    const headers = request.headers;

    // 1. Validação HMAC
    const validation = await validatePixWebhook(gateway, payload, headers);
      
    if (!validation.valid) {
      void fireGuardianAlert({
        alertType: 'HMAC_FAIL',
        severity: 'HIGH',
        metadata: {
          gateway,
          reason: validation.reason,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          payloadPreview: payload.slice(0, 200),
        },
      });

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse e Idempotência
    const data = JSON.parse(payload);
    const endToEndId = data.endToEndId || data.pix?.endToEndId;
      
    if (endToEndId) {
      const exists = await prisma.pixTransaction.findUnique({
        where: { endToEndId },
        select: { id: true }
      });
        
      if (exists) {
        return NextResponse.json({ status: 'already_processed' }, { status: 200 });
      }
    }

    // 3. Registrar transação
    await prisma.pixTransaction.create({
      data: {
        endToEndId: endToEndId || `FAKE-${Date.now()}`,
        amount: data.value || data.amount || 0,
        status: 'PAID',
        metadata: payload,
      }
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('[WEBHOOK:PIX] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 300, windowSeconds: 60 } });

