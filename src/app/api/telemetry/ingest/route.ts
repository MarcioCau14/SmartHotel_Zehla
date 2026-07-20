// =============================================================================
// ZÉLLA — Telemetry Ingest API
// =============================================================================
// POST endpoint that accepts TelemetryEvent objects from DDC dashboards.
// Validates event structure, verifies tenant exists, stores in memory,
// and triggers relevant counter updates.
//
// This endpoint does NOT require ZCC security — it's the DDC → ZCC bridge.
// DDC pages emit events here, and ZCC reads them via the query endpoint.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { addEvent } from '@/lib/telemetry-store';
import { VALID_EVENT_TYPES } from '@/lib/telemetry-types';
import type { TelemetryEventType, TelemetryIngestRequest } from '@/lib/telemetry-types';

// ── Tenant cache (avoid hitting DB on every ingest) ────────────────────────────

const tenantCache = new Map<string, { exists: boolean; checkedAt: number }>();
const TENANT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function verifyTenantExists(tenantId: string): Promise<boolean> {
  const cached = tenantCache.get(tenantId);
  if (cached && Date.now() - cached.checkedAt < TENANT_CACHE_TTL) {
    return cached.exists;
  }

  try {
    const { db } = await import('@/lib/db');
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    const exists = !!tenant;
    tenantCache.set(tenantId, { exists, checkedAt: Date.now() });
    return exists;
  } catch {
    // If DB is down, allow the event through (resilient)
    return true;
  }
}

// ── Periodic cache cleanup ─────────────────────────────────────────────────────

let lastCleanup = Date.now();
function cleanupTenantCache() {
  if (Date.now() - lastCleanup > 10 * 60 * 1000) {
    for (const [id, entry] of tenantCache) {
      if (Date.now() - entry.checkedAt > TENANT_CACHE_TTL) {
        tenantCache.delete(id);
      }
    }
    lastCleanup = Date.now();
  }
}

// ── POST Handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── Parse request body ──────────────────────────────────────────
    let body: TelemetryIngestRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // ── Validate required fields ────────────────────────────────────
    if (!body.type || !body.tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, tenantId' },
        { status: 400 }
      );
    }

    // ── Validate event type ─────────────────────────────────────────
    if (!VALID_EVENT_TYPES.has(body.type as TelemetryEventType)) {
      return NextResponse.json(
        { error: `Invalid event type: ${body.type}` },
        { status: 400 }
      );
    }

    // ── Validate data field ─────────────────────────────────────────
    if (body.data && typeof body.data !== 'object') {
      return NextResponse.json(
        { error: 'data must be an object' },
        { status: 400 }
      );
    }

    // ── Verify tenant exists (best-effort) ──────────────────────────
    const tenantExists = await verifyTenantExists(body.tenantId);
    if (!tenantExists) {
      // Still accept the event — tenant may exist in a different system
      // or the DB might be temporarily unavailable
      console.warn(`[Telemetry] Unknown tenant: ${body.tenantId}`);
    }

    // ── Clean up tenant cache periodically ──────────────────────────
    cleanupTenantCache();

    // ── Store the event ─────────────────────────────────────────────
    const event = addEvent({
      type: body.type as TelemetryEventType,
      tenantId: body.tenantId,
      data: body.data ?? {},
    });

    // ── Return success ──────────────────────────────────────────────
    return NextResponse.json({
      received: true,
      eventId: event.id,
    }, { status: 200 });

  } catch (error) {
    // ── Silent failure — telemetry should never break the caller ────
    console.error('[Telemetry Ingest] Error:', error);
    return NextResponse.json(
      { received: true, eventId: 'error' },
      { status: 200 } // Always return 200 to not break DDC
    );
  }
}
