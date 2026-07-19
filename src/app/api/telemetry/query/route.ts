// =============================================================================
// ZÉLLA — Telemetry Query API
// =============================================================================
// GET endpoint that returns aggregated telemetry data for the ZCC dashboard.
// Requires ZCC Security Gate V3 validation via verifyZCCAccessOrReject.
//
// Query params:
//   ?type=whatsapp.message_sent    — filter by event type
//   &tenantId=xxx                  — filter by tenant
//   &category=whatsapp             — filter by category
//   &since=2024-01-01              — events after this date
//   &until=2024-12-31              — events before this date
//   &limit=100                     — max events to return
//   &include=aggregates            — include aggregate counts
//   &include=burnRate              — include per-tenant burn rates
//   &include=revenue               — include per-tenant revenue
//   &include=storeStats            — include store statistics
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyZCCAccessOrReject } from '@/lib/zcc-security';
import {
  getEvents,
  getAggregates,
  getBurnRate,
  getRevenue,
  getActiveTenantIds,
  getStoreStats,
} from '@/lib/telemetry-store';
import type { TelemetryEventType, TelemetryCategory, TelemetryQueryParams } from '@/lib/telemetry-types';

// ── GET Handler ────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // ── Security Gate V3 — 6-Layer Protection ──
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  try {
    const { searchParams } = request.nextUrl;

    // ── Parse query parameters ──────────────────────────────────────
    const filters: TelemetryQueryParams = {};

    const type = searchParams.get('type') as TelemetryEventType | null;
    if (type) filters.type = type;

    const tenantId = searchParams.get('tenantId');
    if (tenantId) filters.tenantId = tenantId;

    const category = searchParams.get('category') as TelemetryCategory | null;
    if (category) filters.category = category;

    const since = searchParams.get('since');
    if (since) filters.since = since;

    const until = searchParams.get('until');
    if (until) filters.until = until;

    const limitParam = searchParams.get('limit');
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        filters.limit = Math.min(parsed, 1000); // Cap at 1000
      }
    }

    // ── Determine what to include ───────────────────────────────────
    const includeParam = searchParams.get('include') || '';
    const includes = includeParam.split(',').filter(Boolean);
    const includeAll = includes.length === 0 || includes.includes('all');
    const includeAggregates = includeAll || includes.includes('aggregates');
    const includeBurnRate = includeAll || includes.includes('burnRate');
    const includeRevenue = includeAll || includes.includes('revenue');
    const includeStoreStats = includeAll || includes.includes('storeStats');

    // ── Build response ──────────────────────────────────────────────
    const events = getEvents(filters);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: Record<string, any> = {
      success: true,
      data: {
        events,
        total: events.length,
      },
    };

    // ── Aggregates ──────────────────────────────────────────────────
    if (includeAggregates) {
      response.data.aggregates = getAggregates(
        filters.tenantId,
        filters.type,
        filters.since
      );
    }

    // ── Per-tenant burn rates ───────────────────────────────────────
    if (includeBurnRate) {
      const tenantIds = filters.tenantId
        ? [filters.tenantId]
        : getActiveTenantIds();

      response.data.burnRates = tenantIds.map(id => getBurnRate(id));
    }

    // ── Per-tenant revenue ──────────────────────────────────────────
    if (includeRevenue) {
      const tenantIds = filters.tenantId
        ? [filters.tenantId]
        : getActiveTenantIds();

      response.data.revenues = tenantIds.map(id => getRevenue(id));
    }

    // ── Store statistics ────────────────────────────────────────────
    if (includeStoreStats) {
      response.data.storeStats = getStoreStats();
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Telemetry Query] Error:', error);
    return NextResponse.json({
      success: true,
      data: {
        events: [],
        total: 0,
        aggregates: null,
      },
    });
  }
}
