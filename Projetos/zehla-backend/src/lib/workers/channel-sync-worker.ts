import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

/**
 * ChannelSyncWorker — Processes OTA (Booking.com) reservations
 * 
 * Architecture:
 * 1. Receives job from BullMQ queue (zehla-channel-sync)
 * 2. Maps external room ID to internal ZEHLA room ID
 * 3. Checks for duplicates (prevents overbooking)
 * 4. Creates reservation in ZEHLA database
 * 5. Locks the room to prevent double-booking via WhatsApp
 * 6. Sends confirmation to guest (optional)
 * 
 * Error Handling:
 * - BullMQ retries up to 5 times with exponential backoff
 * - Failed jobs are logged to ChannelSyncLog
 * - Duplicate reservations are gracefully handled
 */

export const channelSyncWorker = new Worker('zehla-channel-sync', async (job: Job) => {
  const { rawPayload, eventType, reservationId, propertyId, receivedAt } = job.data;

  console.log(`⚙️ [CHANNEL_WORKER] Processing ${eventType} for reservation ${reservationId}`);

  try {
    // Log the incoming event
    const syncLog = await prisma.channelSyncLog.create({
      data: {
        propertyId: propertyId.toString(),
        channel: 'booking',
        eventType,
        externalId: reservationId.toString(),
        status: 'pending',
        payload: JSON.parse(JSON.stringify(rawPayload)),
      },
    });

    // Handle different event types
    switch (eventType) {
      case 'new_reservation':
      case 'reservation_new':
      case 'new':
        await processNewReservation(propertyId.toString(), reservationId.toString(), rawPayload, syncLog.id);
        break;

      case 'modified':
      case 'reservation_modified':
        await processModifiedReservation(propertyId.toString(), reservationId.toString(), rawPayload, syncLog.id);
        break;

      case 'cancelled':
      case 'reservation_cancelled':
        await processCancelledReservation(propertyId.toString(), reservationId.toString(), rawPayload, syncLog.id);
        break;

      default:
        console.warn(`[CHANNEL_WORKER] Unknown event type: ${eventType}`);
        await prisma.channelSyncLog.update({
          where: { id: syncLog.id },
          data: { status: 'processed', error: `Unknown event type: ${eventType}` },
        });
    }

    return { status: 'completed', eventType, reservationId };

  } catch (error) {
    console.error(`[CHANNEL_WORKER] Failed to process ${eventType} for ${reservationId}:`, error);
    throw error; // BullMQ will retry
  }
}, {
  connection: redisWorker,
  concurrency: 3, // Process 3 OTA events in parallel
});

/**
 * Process a new reservation from Booking.com
 */
async function processNewReservation(
  externalPropertyId: string,
  externalReservationId: string,
  payload: any,
  syncLogId: string
) {
  // 1. Find the ZEHLA property by external ID mapping
  const channelMapping = await prisma.channelMapping.findFirst({
    where: {
      channel: 'booking',
      externalId: externalPropertyId.toString(),
      type: 'property',
      isActive: true,
    },
  });

  const propertyId = channelMapping?.internalId || externalPropertyId;

  // 2. Check for duplicate reservation
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      propertyId,
      source: 'BOOKING.COM',
      code: `BKG-${externalReservationId}`,
    },
  });

  if (existingReservation) {
    console.log(`[CHANNEL_WORKER] Duplicate reservation ${externalReservationId}, skipping`);
    await prisma.channelSyncLog.update({
      where: { id: syncLogId },
      data: { status: 'duplicate' },
    });
    return;
  }

  // 3. Map external room ID to internal room ID
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

  // Fallback: find first available room if no mapping
  if (!internalRoomId) {
    const availableRoom = await prisma.room.findFirst({
      where: {
        propertyId,
        status: 'AVAILABLE',
      },
      orderBy: { basePrice: 'asc' },
    });

    internalRoomId = availableRoom?.id || null;
  }

  if (!internalRoomId) {
    throw new Error(`No available room found for property ${propertyId}`);
  }

  // 4. Extract reservation details
  const checkIn = payload.arrival_date ? new Date(payload.arrival_date) : new Date();
  const checkOut = payload.departure_date ? new Date(payload.departure_date) : new Date(Date.now() + 86400000);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const guestName = payload.guest_name || payload.customer_name || `${payload.guest_first_name || ''} ${payload.guest_last_name || ''}`.trim() || 'Guest';
  const guestEmail = payload.guest_email || payload.email || '';
  const guestPhone = payload.guest_phone || payload.phone || '';
  const totalAmount = parseFloat(payload.price || payload.total_price || payload.amount || '0');
  const currency = payload.currency || 'BRL';
  const guestCount = parseInt(payload.number_of_guests || payload.guests || '1');

  // 5. Create the reservation in ZEHLA
  const reservation = await prisma.reservation.create({
    data: {
      code: `BKG-${externalReservationId}`,
      guestName,
      guestEmail,
      guestPhone,
      guestCount,
      checkIn,
      checkOut,
      nights,
      roomPrice: totalAmount / Math.max(nights, 1),
      totalAmount,
      status: 'CONFIRMED',
      checkInStatus: 'PENDING',
      source: 'BOOKING.COM',
      notes: `Booking.com reservation #${externalReservationId}\nCurrency: ${currency}\nExternal Room ID: ${externalRoomId}`,
      roomId: internalRoomId,
      propertyId,
    },
  });

  // 6. Lock the room to prevent overbooking via WhatsApp
  await prisma.room.update({
    where: { id: internalRoomId },
    data: { status: 'OCCUPIED' },
  });

  // 7. Update sync log
  await prisma.channelSyncLog.update({
    where: { id: syncLogId },
    data: {
      status: 'processed',
      propertyId,
    },
  });

  console.log(`✅ [CHANNEL_WORKER] Reservation created: ${reservation.code} for ${guestName}`);

  // 8. Optional: Send confirmation via WhatsApp (if guest has phone)
  if (guestPhone) {
    try {
      await sendWhatsAppMessage(propertyId, guestPhone, 
        `Olá ${guestName}! Sua reserva na nossa pousada foi confirmada via Booking.com.\n` +
        `📅 Check-in: ${checkIn.toLocaleDateString('pt-BR')}\n` +
        `📅 Check-out: ${checkOut.toLocaleDateString('pt-BR')}\n` +
        `💰 Total: R$ ${totalAmount.toFixed(2)}\n` +
        `Código: ${reservation.code}\n\n` +
        `Estamos ansiosos para recebê-lo! 🏨`
      );
    } catch (err) {
      console.warn('[CHANNEL_WORKER] Failed to send WhatsApp confirmation:', err);
    }
  }
}

/**
 * Process a modified reservation
 */
async function processModifiedReservation(
  externalPropertyId: string,
  externalReservationId: string,
  payload: any,
  syncLogId: string
) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      source: 'BOOKING.COM',
      code: `BKG-${externalReservationId}`,
    },
  });

  if (!reservation) {
    console.warn(`[CHANNEL_WORKER] Modified reservation not found: ${externalReservationId}`);
    await prisma.channelSyncLog.update({
      where: { id: syncLogId },
      data: { status: 'processed', error: 'Reservation not found' },
    });
    return;
  }

  // Update reservation with new data
  const updatedData: any = {};
  if (payload.arrival_date) updatedData.checkIn = new Date(payload.arrival_date);
  if (payload.departure_date) updatedData.checkOut = new Date(payload.departure_date);
  if (payload.price) updatedData.totalAmount = parseFloat(payload.price);
  if (payload.guest_name) updatedData.guestName = payload.guest_name;

  if (Object.keys(updatedData).length > 0) {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: updatedData,
    });
  }

  await prisma.channelSyncLog.update({
    where: { id: syncLogId },
    data: { status: 'processed' },
  });

  console.log(`✅ [CHANNEL_WORKER] Reservation modified: BKG-${externalReservationId}`);
}

/**
 * Process a cancelled reservation
 */
async function processCancelledReservation(
  externalPropertyId: string,
  externalReservationId: string,
  payload: any,
  syncLogId: string
) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      source: 'BOOKING.COM',
      code: `BKG-${externalReservationId}`,
    },
    include: { room: true },
  });

  if (!reservation) {
    console.warn(`[CHANNEL_WORKER] Cancelled reservation not found: ${externalReservationId}`);
    await prisma.channelSyncLog.update({
      where: { id: syncLogId },
      data: { status: 'processed', error: 'Reservation not found' },
    });
    return;
  }

  // Cancel the reservation
  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: 'CANCELLED' },
  });

  // Free up the room
  if (reservation.roomId) {
    await prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: 'AVAILABLE' },
    });
  }

  await prisma.channelSyncLog.update({
    where: { id: syncLogId },
    data: { status: 'processed' },
  });

  console.log(`✅ [CHANNEL_WORKER] Reservation cancelled: BKG-${externalReservationId}`);
}

/**
 * Send WhatsApp message via Evolution API
 */
async function sendWhatsAppMessage(propertyId: string, number: string, text: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !evolutionKey) {
    console.warn('[EVOLUTION] API not configured');
    return;
  }

  await axios.post(`${evolutionUrl}/message/sendText/${propertyId}`, {
    number,
    options: { delay: 1200, presence: 'composing' },
    textMessage: { text },
  }, {
    headers: { 'apikey': evolutionKey },
  });
}
