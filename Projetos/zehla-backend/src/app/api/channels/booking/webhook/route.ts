import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import crypto from 'crypto';

/**
 * Webhook da Booking.com
 * 
 * Arquitetura: Event-Driven com BullMQ
 * 1. Recebe payload do webhook da Booking.com
 * 2. Valida assinatura (se configurada)
 * 3. Envia payload bruto para fila BullMQ imediatamente
 * 4. Retorna HTTP 200 OK para evitar retries da Booking.com
 * 
 * O ChannelSyncWorker processa a fila de forma assíncrona.
 */

const channelSyncQueue = new Queue('zehla-channel-sync', {
  connection: redisWorker,
  defaultJobOptions: {
    removeOnComplete: 100,
    attempts: 5,
    backoff: { type: 'exponential', delay: 3000 },
  },
});

/**
 * Valida assinatura do webhook da Booking.com
 * Booking.com envia header X-Booking-Signature (HMAC-SHA256)
 */
function validarAssinaturaBooking(payload: string, assinatura: string | null): boolean {
  if (!assinatura) {
    // Em desenvolvimento, permite webhooks sem assinatura
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }

  const segredo = process.env.BOOKING_WEBHOOK_SECRET;
  if (!segredo) return true; // Pula validação se não há segredo configurado

  const assinaturaEsperada = crypto
    .createHmac('sha256', segredo)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(assinatura),
    Buffer.from(assinaturaEsperada)
  );
}

export async function POST(request: NextRequest) {
  try {
    const corpoBruto = await request.text();
    const assinatura = request.headers.get('X-Booking-Signature') ||
                       request.headers.get('x-booking-signature');

    // Valida assinatura em produção
    if (!validarAssinaturaBooking(corpoBruto, assinatura)) {
      console.error('❌ [BOOKING_WEBHOOK] Assinatura inválida');
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(corpoBruto);
    } catch {
      return NextResponse.json(
        { error: 'Payload JSON inválido' },
        { status: 400 }
      );
    }

    // Extrair campos principais para logging
    const tipoEvento = payload.type || payload.event_type || 'desconhecido';
    const idReserva = payload.reservation_id || payload.id || 'desconhecido';
    const idPropriedade = payload.hotel_id || payload.property_id || 'desconhecido';

    console.log(`📥 [BOOKING_WEBHOOK] Recebido ${tipoEvento} para reserva ${idReserva}`);

    // Envia para fila BullMQ imediatamente — zero processamento aqui
    await channelSyncQueue.add('ProcessarReservaBooking', {
      rawPayload: payload,
      eventType: tipoEvento,
      reservationId: idReserva,
      propertyId: idPropriedade,
      receivedAt: new Date().toISOString(),
      signature: assinatura,
    }, {
      jobId: `booking-${idReserva}-${Date.now()}`,
    });

    // Retorna 200 OK imediatamente para evitar retries da Booking.com
    return NextResponse.json(
      { status: 'na_fila', reservationId: idReserva, eventType: tipoEvento },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ [BOOKING_WEBHOOK_ERRO]', error);
    // Mesmo com erro, retorna 200 para evitar retries da Booking.com
    // O erro será registrado e pode ser investigado
    return NextResponse.json(
      { status: 'erro_registrado' },
      { status: 200 }
    );
  }
}

/**
 * Endpoint GET para verificação do webhook da Booking.com
 * Booking.com pode enviar requisição GET para verificar a URL do webhook
 */
export async function GET(request: NextRequest) {
  const desafio = request.nextUrl.searchParams.get('challenge');
  if (desafio) {
    return NextResponse.json({ challenge: desafio });
  }
  return NextResponse.json({ status: 'ok' });
}
