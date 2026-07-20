// =============================================================================
// ZÉLLA — Telemetry Client Utility
// =============================================================================
// Client-side utility that DDC pages can use to emit telemetry events.
// Posts to /api/telemetry/ingest with silent failure — telemetry should
// NEVER break the user experience.
// =============================================================================

import type { TelemetryEventType } from './telemetry-types';

// ── Configuration ──────────────────────────────────────────────────────────────

const INGEST_ENDPOINT = '/api/telemetry/ingest';
const TIMEOUT_MS = 5000; // 5-second timeout for telemetry requests

// ── Queue for batching (optional future optimization) ──────────────────────────

let flushTimer: ReturnType<typeof setTimeout> | null = null;
const eventQueue: Array<{
  type: TelemetryEventType;
  tenantId: string;
  data: Record<string, any>;
}> = [];

const FLUSH_INTERVAL_MS = 2000; // Flush every 2 seconds

// ── Core: Emit Single Event ────────────────────────────────────────────────────

/**
 * Emit a telemetry event to the ingest API.
 * Silent failure — telemetry should never break the user experience.
 *
 * @param event - The telemetry event to emit
 * @param event.type - The event type (e.g., 'whatsapp.message_sent')
 * @param event.tenantId - The tenant ID
 * @param event.data - Additional event data
 */
export async function emitTelemetry(event: {
  type: TelemetryEventType;
  tenantId: string;
  data: Record<string, any>;
}): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    await fetch(INGEST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch {
    // Silent failure — telemetry must not break UX
  }
}

// ── Batched: Queue Event ───────────────────────────────────────────────────────

/**
 * Queue a telemetry event for batch sending.
 * Events are flushed every 2 seconds or when the queue reaches 20 events.
 * Silent failure — telemetry must not break UX.
 */
export function queueTelemetry(event: {
  type: TelemetryEventType;
  tenantId: string;
  data: Record<string, any>;
}): void {
  eventQueue.push(event);

  // Flush if queue is full
  if (eventQueue.length >= 20) {
    flushTelemetryQueue();
    return;
  }

  // Set up flush timer
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTelemetryQueue();
    }, FLUSH_INTERVAL_MS);
  }
}

// ── Batched: Flush Queue ───────────────────────────────────────────────────────

/**
 * Flush all queued telemetry events.
 * Sends each event individually (the ingest API accepts single events).
 * In the future, this could be optimized to send batches.
 */
export async function flushTelemetryQueue(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (eventQueue.length === 0) return;

  // Take all events from queue
  const eventsToSend = eventQueue.splice(0, eventQueue.length);

  // Send all events in parallel (fire-and-forget)
  await Promise.allSettled(
    eventsToSend.map(event => emitTelemetry(event))
  );
}

// ── Convenience: Event-Specific Emitters ───────────────────────────────────────

/** Emit a WhatsApp message sent event */
export function emitWhatsAppMessageSent(
  tenantId: string,
  data: { messageCount?: number; costUsd?: number; direction?: string }
): Promise<void> {
  return emitTelemetry({
    type: 'whatsapp.message_sent',
    tenantId,
    data,
  });
}

/** Emit a WhatsApp message bundled event */
export function emitWhatsAppMessageBundled(
  tenantId: string,
  data: { messageCount?: number; savingsUsd?: number; bundleWindowMs?: number }
): Promise<void> {
  return emitTelemetry({
    type: 'whatsapp.message_bundled',
    tenantId,
    data,
  });
}

/** Emit a reservation created event */
export function emitReservationCreated(
  tenantId: string,
  data: { reservationId?: string; amount?: number; source?: string; guestName?: string }
): Promise<void> {
  return emitTelemetry({
    type: 'reservation.created',
    tenantId,
    data,
  });
}

/** Emit a reservation cancelled event */
export function emitReservationCancelled(
  tenantId: string,
  data: { reservationId?: string; reason?: string; amount?: number }
): Promise<void> {
  return emitTelemetry({
    type: 'reservation.cancelled',
    tenantId,
    data,
  });
}

/** Emit a payment received event */
export function emitPaymentReceived(
  tenantId: string,
  data: { amount: number; currency?: 'BRL' | 'USD'; source?: 'pix' | 'credit_card' | 'booking' | 'airbnb' }
): Promise<void> {
  return emitTelemetry({
    type: 'payment.received',
    tenantId,
    data,
  });
}

/** Emit a payment failed event */
export function emitPaymentFailed(
  tenantId: string,
  data: { amount?: number; currency?: string; reason?: string }
): Promise<void> {
  return emitTelemetry({
    type: 'payment.failed',
    tenantId,
    data,
  });
}

/** Emit an AI response generated event */
export function emitAIResponseGenerated(
  tenantId: string,
  data: { responseTimeMs?: number; tokensUsed?: number; intent?: string; oneShot?: boolean }
): Promise<void> {
  return emitTelemetry({
    type: 'ai.response_generated',
    tenantId,
    data,
  });
}

/** Emit a guest check-in event */
export function emitGuestCheckin(
  tenantId: string,
  data: { guestName?: string; roomId?: string; roomType?: string }
): Promise<void> {
  return emitTelemetry({
    type: 'guest.checkin',
    tenantId,
    data,
  });
}

/** Emit a guest check-out event */
export function emitGuestCheckout(
  tenantId: string,
  data: { guestName?: string; roomId?: string; stayDurationDays?: number }
): Promise<void> {
  return emitTelemetry({
    type: 'guest.checkout',
    tenantId,
    data,
  });
}

/** Emit an iCal sync completed event */
export function emitIcalSyncCompleted(
  tenantId: string,
  data: { source?: string; eventsSynced?: number; durationMs?: number }
): Promise<void> {
  return emitTelemetry({
    type: 'ical.sync_completed',
    tenantId,
    data,
  });
}

/** Emit an OAuth connected event */
export function emitOAuthConnected(
  tenantId: string,
  data: { provider?: string; accountName?: string }
): Promise<void> {
  return emitTelemetry({
    type: 'oauth.connected',
    tenantId,
    data,
  });
}

/** Emit a tenant plan changed event */
export function emitTenantPlanChanged(
  tenantId: string,
  data: { oldPlan?: string; newPlan?: string; newAmount?: number }
): Promise<void> {
  return emitTelemetry({
    type: 'tenant.plan_changed',
    tenantId,
    data,
  });
}

/** Emit a tenant suspended event */
export function emitTenantSuspended(
  tenantId: string,
  data: { reason?: string; triggeredBy?: string }
): Promise<void> {
  return emitTelemetry({
    type: 'tenant.suspended',
    tenantId,
    data,
  });
}

/** Emit a tenant reactivated event */
export function emitTenantReactivated(
  tenantId: string,
  data: { triggeredBy?: string }
): Promise<void> {
  return emitTelemetry({
    type: 'tenant.reactivated',
    tenantId,
    data,
  });
}

/** Emit an Airbnb review received event */
export function emitAirbnbReviewReceived(
  tenantId: string,
  data: { rating?: number; reviewText?: string; guestName?: string; propertyId?: string }
): Promise<void> {
  return emitTelemetry({
    type: 'airbnb.review_received',
    tenantId,
    data,
  });
}

/** Emit an Airbnb response time event */
export function emitAirbnbResponseTime(
  tenantId: string,
  data: { responseTimeSeconds?: number; messageId?: string }
): Promise<void> {
  return emitTelemetry({
    type: 'airbnb.response_time',
    tenantId,
    data,
  });
}
