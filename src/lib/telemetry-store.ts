// =============================================================================
// ZÉLLA — In-Memory Telemetry Store
// =============================================================================
// Singleton in-memory store for telemetry events captured from DDC dashboards.
// Auto-evicts when exceeding MAX_EVENTS to prevent memory leaks.
// Provides query, aggregation, and per-tenant metrics for ZCC consumption.
// =============================================================================

import {
  TelemetryEvent,
  TelemetryEventType,
  TelemetryCategory,
  TelemetryQueryParams,
  TelemetryAggregates,
  TenantBurnRate,
  TenantRevenue,
  EVENT_CATEGORY_MAP,
  VALID_EVENT_TYPES,
} from './telemetry-types';

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_EVENTS = 10000;
const COST_PER_MESSAGE_USD = 0.0068;

// ── Store State ────────────────────────────────────────────────────────────────

let events: TelemetryEvent[] = [];

// ── Helper: Generate unique event ID ───────────────────────────────────────────

function generateEventId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Core: Add Event ────────────────────────────────────────────────────────────

/**
 * Add a telemetry event to the store.
 * Auto-evicts oldest events when exceeding MAX_EVENTS.
 */
export function addEvent(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): TelemetryEvent {
  const fullEvent: TelemetryEvent = {
    id: generateEventId(),
    timestamp: new Date().toISOString(),
    ...event,
  };

  events.push(fullEvent);

  // Auto-evict oldest events if over limit
  if (events.length > MAX_EVENTS) {
    events = events.slice(events.length - MAX_EVENTS);
  }

  return fullEvent;
}

// ── Core: Get Events ───────────────────────────────────────────────────────────

/**
 * Query events with optional filters.
 * Returns matching events sorted by timestamp descending.
 */
export function getEvents(filters: TelemetryQueryParams = {}): TelemetryEvent[] {
  let result = [...events];

  // Filter by type
  if (filters.type) {
    result = result.filter(e => e.type === filters.type);
  }

  // Filter by tenant
  if (filters.tenantId) {
    result = result.filter(e => e.tenantId === filters.tenantId);
  }

  // Filter by category
  if (filters.category) {
    result = result.filter(e => EVENT_CATEGORY_MAP[e.type] === filters.category);
  }

  // Filter by date range
  if (filters.since) {
    const sinceDate = new Date(filters.since).getTime();
    if (!isNaN(sinceDate)) {
      result = result.filter(e => new Date(e.timestamp).getTime() >= sinceDate);
    }
  }

  if (filters.until) {
    const untilDate = new Date(filters.until).getTime();
    if (!isNaN(untilDate)) {
      result = result.filter(e => new Date(e.timestamp).getTime() <= untilDate);
    }
  }

  // Sort by timestamp descending (newest first)
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply limit
  if (filters.limit && filters.limit > 0) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

// ── Core: Get Aggregates ───────────────────────────────────────────────────────

/**
 * Returns aggregated counts/sums for telemetry events, optionally filtered.
 */
export function getAggregates(
  tenantId?: string,
  type?: TelemetryEventType,
  since?: string
): TelemetryAggregates {
  const filtered = getEvents({ tenantId, type, since });

  // Count by event type
  const eventCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  let totalMessagesSent = 0;
  let totalMessagesBundled = 0;
  let totalCostUsd = 0;
  let totalSavingsUsd = 0;
  let totalRevenueAmount = 0;
  const revenueByCurrency: Record<string, number> = {};
  const revenueBySource: Record<string, number> = {};

  for (const event of filtered) {
    // Event type counts
    eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;

    // Category counts
    const category = EVENT_CATEGORY_MAP[event.type];
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    // Burn rate tracking
    if (event.type === 'whatsapp.message_sent') {
      totalMessagesSent += event.data.messageCount ?? 1;
      totalCostUsd += event.data.costUsd ?? COST_PER_MESSAGE_USD;
    }

    if (event.type === 'whatsapp.message_bundled') {
      totalMessagesBundled += event.data.messageCount ?? 1;
      totalSavingsUsd += event.data.savingsUsd ?? 0;
    }

    // Revenue tracking
    if (event.type === 'payment.received') {
      const amount = event.data.amount ?? 0;
      totalRevenueAmount += amount;

      const currency = event.data.currency ?? 'BRL';
      revenueByCurrency[currency] = (revenueByCurrency[currency] || 0) + amount;

      const source = event.data.source ?? 'unknown';
      revenueBySource[source] = (revenueBySource[source] || 0) + amount;
    }
  }

  // Ensure all valid event types and categories are present in counts
  for (const t of VALID_EVENT_TYPES) {
    if (!(t in eventCounts)) {
      eventCounts[t] = 0;
    }
    const cat = EVENT_CATEGORY_MAP[t];
    if (!(cat in categoryCounts)) {
      categoryCounts[cat] = 0;
    }
  }

  const totalUnbundledCost = (totalMessagesSent + totalMessagesBundled) * COST_PER_MESSAGE_USD;
  const savingsRate = totalUnbundledCost > 0
    ? Math.round((totalSavingsUsd / totalUnbundledCost) * 10000) / 100
    : 0;

  return {
    eventCounts: eventCounts as Record<TelemetryEventType, number>,
    categoryCounts: categoryCounts as Record<TelemetryCategory, number>,
    burnRate: {
      totalMessagesSent,
      totalMessagesBundled,
      totalCostUsd: Math.round(totalCostUsd * 10000) / 10000,
      totalSavingsUsd: Math.round(totalSavingsUsd * 10000) / 10000,
      savingsRate,
    },
    revenue: {
      totalAmount: Math.round(totalRevenueAmount * 100) / 100,
      byCurrency: revenueByCurrency,
      bySource: revenueBySource,
    },
  };
}

// ── Per-Tenant: Burn Rate ──────────────────────────────────────────────────────

/**
 * Returns current burn rate metrics for a specific tenant.
 */
export function getBurnRate(tenantId: string): TenantBurnRate {
  const whatsappEvents = getEvents({
    tenantId,
    category: 'whatsapp',
  });

  let messagesSent = 0;
  let messagesBundled = 0;
  let costUsd = 0;
  let savingsUsd = 0;
  let lastMessageAt: string | null = null;

  for (const event of whatsappEvents) {
    if (event.type === 'whatsapp.message_sent') {
      messagesSent += event.data.messageCount ?? 1;
      costUsd += event.data.costUsd ?? COST_PER_MESSAGE_USD;

      if (!lastMessageAt || event.timestamp > lastMessageAt) {
        lastMessageAt = event.timestamp;
      }
    }

    if (event.type === 'whatsapp.message_bundled') {
      messagesBundled += event.data.messageCount ?? 1;
      savingsUsd += event.data.savingsUsd ?? 0;

      if (!lastMessageAt || event.timestamp > lastMessageAt) {
        lastMessageAt = event.timestamp;
      }
    }
  }

  const totalUnbundledCost = (messagesSent + messagesBundled) * COST_PER_MESSAGE_USD;
  const savingsRate = totalUnbundledCost > 0
    ? Math.round((savingsUsd / totalUnbundledCost) * 10000) / 100
    : 0;

  return {
    tenantId,
    messagesSent,
    messagesBundled,
    costUsd: Math.round(costUsd * 10000) / 10000,
    savingsUsd: Math.round(savingsUsd * 10000) / 10000,
    savingsRate,
    lastMessageAt,
  };
}

// ── Per-Tenant: Revenue ────────────────────────────────────────────────────────

/**
 * Returns revenue metrics for a specific tenant.
 */
export function getRevenue(tenantId: string): TenantRevenue {
  const paymentEvents = getEvents({
    tenantId,
    category: 'payment',
  });

  let totalAmount = 0;
  const byCurrency: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let transactionCount = 0;
  let lastPaymentAt: string | null = null;

  for (const event of paymentEvents) {
    if (event.type === 'payment.received') {
      const amount = event.data.amount ?? 0;
      totalAmount += amount;
      transactionCount++;

      const currency = event.data.currency ?? 'BRL';
      byCurrency[currency] = (byCurrency[currency] || 0) + amount;

      const source = event.data.source ?? 'unknown';
      bySource[source] = (bySource[source] || 0) + amount;

      if (!lastPaymentAt || event.timestamp > lastPaymentAt) {
        lastPaymentAt = event.timestamp;
      }
    }
  }

  return {
    tenantId,
    totalAmount: Math.round(totalAmount * 100) / 100,
    byCurrency,
    bySource,
    transactionCount,
    lastPaymentAt,
  };
}

// ── Get all tenant IDs with activity ───────────────────────────────────────────

/**
 * Returns unique tenant IDs that have emitted telemetry events.
 */
export function getActiveTenantIds(): string[] {
  const ids = new Set(events.map(e => e.tenantId));
  return [...ids];
}

// ── Get store stats ────────────────────────────────────────────────────────────

/**
 * Returns store statistics for monitoring.
 */
export function getStoreStats(): {
  totalEvents: number;
  maxEvents: number;
  uniqueTenants: number;
  oldestEvent: string | null;
  newestEvent: string | null;
} {
  return {
    totalEvents: events.length,
    maxEvents: MAX_EVENTS,
    uniqueTenants: new Set(events.map(e => e.tenantId)).size,
    oldestEvent: events.length > 0 ? events[0].timestamp : null,
    newestEvent: events.length > 0 ? events[events.length - 1].timestamp : null,
  };
}

// ── Clear store (for testing) ──────────────────────────────────────────────────

/**
 * Clear all telemetry events from the store.
 */
export function clear(): void {
  events = [];
}
