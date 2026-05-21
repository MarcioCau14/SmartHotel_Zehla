import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

/**
 * Worker de Sincronização de Canais — Processa reservas de OTAs (Booking.com)
 * 
 * Arquitetura:
 * 1. Recebe job da fila BullMQ (zehla-channel-sync)
 * 2. Trava de idempotência via Redis SETNX (evita duplicidade no retry)
 * 3. Mapeia ID externo do quarto para ID interno ZEHLA
 * 4. Verifica duplicidade (previne overbooking)
 * 5. Cria reserva no banco ZEHLA
 * 6. Bloqueia o quarto para evitar venda dupla via WhatsApp
 * 7. Envia confirmação ao hóspede (opcional)
 * 
 * Tratamento de Erros:
 * - BullMQ tenta até 5 vezes com backoff exponencial
 * - Jobs falhados são registrados no ChannelSyncLog
 * - Duplicidades são tratadas graciosamente via idempotência Redis
 */

const IDEMPOTENCY_TTL = 86400; // 24 horas

export const channelSyncWorker = new Worker('zehla-channel-sync', async (job: Job) => {
  const { rawPayload, eventType, reservationId, propertyId, receivedAt } = job.data;

  console.log(`⚙️ [WORKER CANAL] Processando ${eventType} para reserva ${reservationId}`);

  // 1. TRAVA DE IDEMPOTÊNCIA (SETNX)
  // Previne que retries do BullMQ causem duplicidade de WhatsApp/reservas
  const idempotencyKey = `channel_sync:${reservationId}:${eventType}`;
  const isFirstAttempt = await redisWorker.set(idempotencyKey, 'LOCKED', 'EX', IDEMPOTENCY_TTL, 'NX');

  if (!isFirstAttempt) {
    console.warn(`🔒 [IDEMPOTÊNCIA] Evento ${idempotencyKey} já processado ou em andamento. Ignorando.`);
    return { status: 'IGNORADO_DUPLICATA' };
  }

  try {
    // Registrar evento recebido
    const syncLog = await prisma.channelSyncLog.create({
      data: {
        propertyId: propertyId.toString(),
        channel: 'booking',
        eventType,
        externalId: reservationId.toString(),
        status: 'pendente',
        payload: JSON.parse(JSON.stringify(rawPayload)),
      },
    });

    // Processar por tipo de evento
    switch (eventType) {
      case 'new_reservation':
      case 'reservation_new':
      case 'new':
        await processarNovaReserva(propertyId.toString(), reservationId.toString(), rawPayload, syncLog.id);
        break;

      case 'modified':
      case 'reservation_modified':
        await processarReservaModificada(propertyId.toString(), reservationId.toString(), rawPayload, syncLog.id);
        break;

      case 'cancelled':
      case 'reservation_cancelled':
        await processarReservaCancelada(propertyId.toString(), reservationId.toString(), rawPayload, syncLog.id);
        break;

      default:
        console.warn(`[WORKER CANAL] Tipo de evento desconhecido: ${eventType}`);
        await prisma.channelSyncLog.update({
          where: { id: syncLog.id },
          data: { status: 'processado', error: `Tipo de evento desconhecido: ${eventType}` },
        });
    }

    return { status: 'concluido', eventType, reservationId };

  } catch (error) {
    console.error(`❌ [WORKER CANAL] Falha ao processar ${eventType} para ${reservationId}:`, error);
    // Remove a trava de idempotência para permitir retry do BullMQ
    await redisWorker.del(idempotencyKey);
    throw error; // BullMQ vai tentar novamente com backoff exponencial
  }
}, {
  connection: redisWorker,
  concurrency: 3, // Processa 3 eventos OTA em paralelo
});

/**
 * Processa uma nova reserva da Booking.com
 */
async function processarNovaReserva(
  externalPropertyId: string,
  externalReservationId: string,
  payload: any,
  syncLogId: string
) {
  // 1. Encontrar propriedade ZEHLA pelo mapeamento externo
  const channelMapping = await prisma.channelMapping.findFirst({
    where: {
      channel: 'booking',
      externalId: externalPropertyId.toString(),
      type: 'property',
      isActive: true,
    },
  });

  const propertyId = channelMapping?.internalId || externalPropertyId;

  // 2. Verificar reserva duplicata
  const reservaExistente = await prisma.reservation.findFirst({
    where: {
      propertyId,
      source: 'BOOKING.COM',
      code: `BKG-${externalReservationId}`,
    },
  });

  if (reservaExistente) {
    console.log(`⚠️ [WORKER CANAL] Reserva duplicata ${externalReservationId}, ignorando`);
    await prisma.channelSyncLog.update({
      where: { id: syncLogId },
      data: { status: 'duplicata' },
    });
    return;
  }

  // 3. Mapear ID externo do quarto para ID interno
  const externalRoomId = payload.room_id || payload.roomtype_id || payload.roomId;
  let internalRoomId: string | null = null;

  if (externalRoomId) {
    const roomMapping = await prisma.channelMapping.findFirst({
      where: {
        propertyId,
        channel: 'booking',
        externalId: externalRoomId.toString(),
        type: 'room',
        isActive: true,
      },
    });

    internalRoomId = roomMapping?.internalId || null;
  }

  // Fallback: encontrar primeiro quarto disponível se não houver mapeamento
  if (!internalRoomId) {
    const quartoDisponivel = await prisma.room.findFirst({
      where: {
        propertyId,
        status: 'AVAILABLE',
      },
      orderBy: { basePrice: 'asc' },
    });

    internalRoomId = quartoDisponivel?.id || null;
  }

  if (!internalRoomId) {
    throw new Error(`Nenhum quarto disponível encontrado para propriedade ${propertyId}`);
  }

  // 4. Extrair detalhes da reserva
  const checkIn = payload.arrival_date ? new Date(payload.arrival_date) : new Date();
  const checkOut = payload.departure_date ? new Date(payload.departure_date) : new Date(Date.now() + 86400000);
  const noites = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const nomeHospede = payload.guest_name || payload.customer_name || `${payload.guest_first_name || ''} ${payload.guest_last_name || ''}`.trim() || 'Hóspede';
  const emailHospede = payload.guest_email || payload.email || '';
  const telefoneHospede = payload.guest_phone || payload.phone || '';
  const valorTotal = parseFloat(payload.price || payload.total_price || payload.amount || '0');
  const moeda = payload.currency || 'BRL';
  const numeroHospedes = parseInt(payload.number_of_guests || payload.guests || '1');

  // 5. Criar reserva no ZEHLA
  const reserva = await prisma.reservation.create({
    data: {
      code: `BKG-${externalReservationId}`,
      guestName: nomeHospede,
      guestEmail: emailHospede,
      guestPhone: telefoneHospede,
      guestCount: numeroHospedes,
      checkIn,
      checkOut,
      nights: noites,
      roomPrice: valorTotal / Math.max(noites, 1),
      totalAmount: valorTotal,
      status: 'CONFIRMED',
      checkInStatus: 'PENDING',
      source: 'BOOKING.COM',
      notes: `Reserva Booking.com #${externalReservationId}\nMoeda: ${moeda}\nID Externo Quarto: ${externalRoomId}`,
      roomId: internalRoomId,
      propertyId,
    },
  });

  // 6. Bloquear quarto para prevenir overbooking via WhatsApp
  await prisma.room.update({
    where: { id: internalRoomId },
    data: { status: 'OCCUPIED' },
  });

  // 7. Atualizar log de sincronização
  await prisma.channelSyncLog.update({
    where: { id: syncLogId },
    data: {
      status: 'processado',
      propertyId,
    },
  });

  console.log(`✅ [WORKER CANAL] Reserva criada: ${reserva.code} para ${nomeHospede}`);

  // 8. Opcional: Enviar confirmação via WhatsApp (se hóspede tem telefone)
  if (telefoneHospede) {
    try {
      await enviarMensagemWhatsApp(propertyId, telefoneHospede, 
        `Olá ${nomeHospede}! Sua reserva na nossa pousada foi confirmada via Booking.com.\n` +
        `📅 Check-in: ${checkIn.toLocaleDateString('pt-BR')}\n` +
        `📅 Check-out: ${checkOut.toLocaleDateString('pt-BR')}\n` +
        `💰 Total: R$ ${valorTotal.toFixed(2)}\n` +
        `Código: ${reserva.code}\n\n` +
        `Estamos ansiosos para recebê-lo! 🏨`
      );
    } catch (err) {
      console.warn(`⚠️ [WORKER CANAL] Falha ao enviar confirmação WhatsApp:`, err);
    }
  }
}

/**
 * Processa uma reserva modificada
 */
async function processarReservaModificada(
  externalPropertyId: string,
  externalReservationId: string,
  payload: any,
  syncLogId: string
) {
  const reserva = await prisma.reservation.findFirst({
    where: {
      source: 'BOOKING.COM',
      code: `BKG-${externalReservationId}`,
    },
  });

  if (!reserva) {
    console.warn(`⚠️ [WORKER CANAL] Reserva modificada não encontrada: ${externalReservationId}`);
    await prisma.channelSyncLog.update({
      where: { id: syncLogId },
      data: { status: 'processado', error: 'Reserva não encontrada' },
    });
    return;
  }

  // Atualizar reserva com novos dados
  const dadosAtualizados: any = {};
  if (payload.arrival_date) dadosAtualizados.checkIn = new Date(payload.arrival_date);
  if (payload.departure_date) dadosAtualizados.checkOut = new Date(payload.departure_date);
  if (payload.price) dadosAtualizados.totalAmount = parseFloat(payload.price);
  if (payload.guest_name) dadosAtualizados.guestName = payload.guest_name;

  if (Object.keys(dadosAtualizados).length > 0) {
    await prisma.reservation.update({
      where: { id: reserva.id },
      data: dadosAtualizados,
    });
  }

  await prisma.channelSyncLog.update({
    where: { id: syncLogId },
    data: { status: 'processado' },
  });

  console.log(`✅ [WORKER CANAL] Reserva modificada: BKG-${externalReservationId}`);
}

/**
 * Processa uma reserva cancelada
 */
async function processarReservaCancelada(
  externalPropertyId: string,
  externalReservationId: string,
  payload: any,
  syncLogId: string
) {
  const reserva = await prisma.reservation.findFirst({
    where: {
      source: 'BOOKING.COM',
      code: `BKG-${externalReservationId}`,
    },
    include: { room: true },
  });

  if (!reserva) {
    console.warn(`⚠️ [WORKER CANAL] Reserva cancelada não encontrada: ${externalReservationId}`);
    await prisma.channelSyncLog.update({
      where: { id: syncLogId },
      data: { status: 'processado', error: 'Reserva não encontrada' },
    });
    return;
  }

  // Cancelar a reserva
  await prisma.reservation.update({
    where: { id: reserva.id },
    data: { status: 'CANCELLED' },
  });

  // Liberar o quarto
  if (reserva.roomId) {
    await prisma.room.update({
      where: { id: reserva.roomId },
      data: { status: 'AVAILABLE' },
    });
  }

  await prisma.channelSyncLog.update({
    where: { id: syncLogId },
    data: { status: 'processado' },
  });

  console.log(`✅ [WORKER CANAL] Reserva cancelada: BKG-${externalReservationId}`);
}

/**
 * Envia mensagem WhatsApp via Evolution API
 */
async function enviarMensagemWhatsApp(propertyId: string, numero: string, texto: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !evolutionKey) {
    console.warn('⚠️ [EVOLUTION] API não configurada para envio.');
    return;
  }

  await axios.post(`${evolutionUrl}/message/sendText/${propertyId}`, {
    numero,
    options: { delay: 1200, presence: 'composing' },
    textMessage: { texto },
  }, {
    headers: { 'apikey': evolutionKey },
  });
}
