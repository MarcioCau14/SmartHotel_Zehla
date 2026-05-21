import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import crypto from 'crypto';

/**
 * Booking.com Webhook Endpoint
 * 
 * Architecture: Event-Driven with BullMQ
 * 1. Receives webhook payload from Booking.com
 * 2. Validates signature (if configured)
 * 3. Pushes raw payload to BullMQ queue immediately
 * 4. Returns HTTP 200 OK to prevent Booking.com from retrying
 * 
 * The ChannelSyncWorker processes the queue asynchronously.
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
 * Validate Booking.com webhook signature
 * Booking.com sends X-Booking-Signature header (HMAC-SHA256)
 */
function validateBookingSignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    // In development, allow unsigned webhooks
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }

  const secret = process.env.BOOKING_WEBHOOK_SECRET;
  if (!secret) return true; // Skip validation if no secret configured

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('X-Booking-Signature') ||
                      request.headers.get('x-booking-signature');

    // Validate signature in production
    if (!validateBookingSignature(rawBody, signature)) {
      console.error('[BOOKING_WEBHOOK] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Extract key fields for logging
    const eventType = payload.type || payload.event_type || 'unknown';
    const reservationId = payload.reservation_id || payload.id || 'unknown';
    const propertyId = payload.hotel_id || payload.property_id || 'unknown';

    console.log(`📥 [BOOKING_WEBHOOK] Received ${eventType} for reservation ${reservationId}`);

    // Push to BullMQ queue immediately — zero processing here
    await channelSyncQueue.add('ProcessBookingComReservation', {
      rawPayload: payload,
      eventType,
      reservationId,
      propertyId,
      receivedAt: new Date().toISOString(),
      signature,
    }, {
      jobId: `booking-${reservationId}-${Date.now()}`,
    });

    // Return 200 OK immediately to prevent Booking.com from retrying
    return NextResponse.json(
      { status: 'queued', reservationId, eventType },
      { status: 200 }
    );

  } catch (error) {
    console.error('[BOOKING_WEBHOOK_ERROR]', error);
    // Even on error, return 200 to prevent Booking.com retries
    // The error will be logged and can be investigated
    return NextResponse.json(
      { status: 'error_logged' },
      { status: 200 }
    );
  }
}

/**
 * GET endpoint for Booking.com webhook verification
 * Booking.com may send a GET request to verify the webhook URL
 */
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');
  if (challenge) {
    return NextResponse.json({ challenge });
  }
  return NextResponse.json({ status: 'ok' });
}
