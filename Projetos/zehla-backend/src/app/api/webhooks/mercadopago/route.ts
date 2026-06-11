import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { IdempotencyBarrier } from '@/infrastructure/security/IdempotencyBarrier';
import { ProcessPaymentProofUseCase } from '@/lib/brain/use-cases/ProcessPaymentProofUseCase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature') || '';
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || 'mp-secret-key-2026';

    // 1. Validar a assinatura via HMAC
    const isSignatureValid = verifySignature(body, signature, secret);
    
    // Permitir simulação de teste no ambiente de desenvolvimento
    const isDevSimulation = process.env.NODE_ENV === 'development' && body.includes('SIMULATE');
    
    if (!isSignatureValid && !isDevSimulation) {
      console.error('❌ [MercadoPago Webhook] Assinatura HMAC inválida.');
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
    }

    const payload = JSON.parse(body);
    // Extrai o ID único da transação (Mercado Pago envia em data.id ou id)
    const paymentId = payload.data?.id || payload.id;
    const propertyId = payload.propertyId || payload.data?.propertyId || 'default-property';

    if (!paymentId) {
      console.error('❌ [MercadoPago Webhook] ID do pagamento não localizado no payload.');
      return NextResponse.json({ error: 'ID do pagamento ausente' }, { status: 400 });
    }

    // 2. Barreira de Idempotência (Redis SETNX)
    const idempotencyKey = `mp:webhook:${paymentId}`;
    const isFirstAttempt = await IdempotencyBarrier.checkAndLock(idempotencyKey, 86400); // 24h

    if (!isFirstAttempt) {
      console.warn(`⚠️ [MercadoPago Webhook] Requisição duplicada detectada para chave ${idempotencyKey}. Ignorando silenciosamente.`);
      return NextResponse.json({ received: true, status: 'duplicate_ignored' }, { status: 200 });
    }

    // 3. Processamento Financeiro
    const amount = payload.data?.transaction_amount || payload.amount || 0;
    const phone = payload.data?.phone || payload.phone || '';

    const result = await ProcessPaymentProofUseCase.execute(phone, propertyId, {
      amount,
      transactionId: String(paymentId),
    });

    if (!result.success) {
      console.error(`❌ [MercadoPago Webhook] Erro ao processar pagamento: ${result.message}`);
      // Erro interno: retorna 200 OK para evitar retry contínuo do Mercado Pago
      return NextResponse.json({ received: true, status: 'error_logged', details: result.message }, { status: 200 });
    }

    return NextResponse.json({ received: true, status: 'success', reservationId: result.reservationId }, { status: 200 });
  } catch (error) {
    console.error('❌ [MercadoPago Webhook Fatal Error]:', error);
    // Sempre retorna 200 no catch genérico de Webhooks para estancar retentativas do gateway
    return NextResponse.json({ received: true, error: String(error) }, { status: 200 });
  }
}

function verifySignature(payloadString: string, signatureHeader: string, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  try {
    const parts = signatureHeader.split(',');
    let timestamp = '';
    let hash = '';
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'ts') timestamp = value;
      if (key === 'v1') hash = value;
    }

    if (!timestamp || !hash) {
      // Se não for no formato ts/v1, fazemos a comparação do HMAC direto do body
      const calculated = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signatureHeader));
    }

    const manifest = `id:${payloadString};request-timestamp:${timestamp};`;
    const calculatedHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash));
  } catch {
    return false;
  }
}
