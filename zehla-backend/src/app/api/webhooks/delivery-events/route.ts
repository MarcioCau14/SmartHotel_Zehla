import { NextRequest, NextResponse } from 'next/server';
import { HMACValidator } from '@/infrastructure/hardening/HMACValidator';
import { webhookRateGuard } from '@/lib/security/rate-limit-webhook';
import { AtualizarStatusEntregaUseCase } from '@/application/comercial/use-cases/AtualizarStatusEntregaUseCase';
import { PrismaLeadRepository } from '@/infrastructure/persistence/comercial/PrismaLeadRepository';
import { prisma } from '@/lib/prisma';

/**
 * ZEHLA WEBHOOK DELIVERY EVENTS
 * Recebe eventos de status de entrega de mensagens (SENT, DELIVERED, READ, FAILED) com blindagem Zero-Trust.
 */
export async function POST(req: NextRequest) {
  // 1. Defesa de Borda / Rate Limit
  const guard = await webhookRateGuard(req);
  if (guard) return guard;

  try {
    // 2. Extração do Cabeçalho de Assinatura
    const signatureHeader = req.headers.get('x-hub-signature-256') || req.headers.get('x-zehla-signature') || '';
    const signature = signatureHeader.replace('sha256=', '').trim();

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
    }

    const secret = process.env.WHATSAPP_WEBHOOK_SECRET || process.env.EVOLUTION_WEBHOOK_SECRET || 'zehla_whatsapp_webhook_secret_2026';

    // 3. Obter rawBody para validação HMAC timing-safe antes de fazer parse JSON (Fail-Fast)
    const rawBody = await req.text();

    const hmacValidator = new HMACValidator('sha256');
    const isValid = hmacValidator.verify(rawBody, signature, secret);

    if (!isValid) {
      console.warn('⚠️ [SECURITY] Webhook signature invalid. Potential tampering or spoofing.');
      return NextResponse.json({ error: 'Unauthorized Signature' }, { status: 401 });
    }

    // 4. Ingestão do Evento e Parse Seguro
    const payload = JSON.parse(rawBody);
    const { leadId, status, propriedadeId } = payload;

    if (!leadId || !status || !propriedadeId) {
      return NextResponse.json({ error: 'Bad Request: Missing required fields' }, { status: 400 });
    }

    // 5. Instanciar Caso de Uso (Controller Anêmico)
    const repository = new PrismaLeadRepository(prisma);
    const useCase = new AtualizarStatusEntregaUseCase(repository);

    const result = await useCase.execute({
      leadId,
      propriedadeId,
      status
    });

    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      status: 'processed',
      leadId: result.value.id
    }, { status: 200 });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('❌ [DELIVERY WEBHOOK ERROR]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
