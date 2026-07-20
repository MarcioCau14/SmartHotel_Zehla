# Task 9 — ZCC Telemetry Bridge

## Agent: ZCC Telemetry Bridge Builder

## Summary
Built the complete ZCC Telemetry Bridge system that captures events from DDC (client dashboards) and feeds them into the ZCC (admin panel). All 6 components created and verified working.

## Files Created

### 1. `src/lib/telemetry-types.ts`
- 16 telemetry event types across 8 categories (whatsapp, reservation, payment, ai, guest, integration, tenant, airbnb)
- Core `TelemetryEvent` interface with id, type, tenantId, timestamp, data
- Specialized interfaces: `BurnRateUpdate`, `RevenueUpdate`, `TelemetryIngestRequest/Response`, `TelemetryQueryParams/Response`
- `TelemetryAggregates` with burn rate and revenue rollups
- `TenantBurnRate` and `TenantRevenue` per-tenant metrics
- `EVENT_CATEGORY_MAP` for category grouping
- `VALID_EVENT_TYPES` set for validation

### 2. `src/lib/telemetry-store.ts`
- Singleton in-memory store with auto-eviction at 10,000 events
- `addEvent()` — stores event, auto-evicts oldest when over limit
- `getEvents(filters)` — queries with type, tenantId, category, date range, limit filters
- `getAggregates(tenantId?, type?, since?)` — aggregated counts/sums with burn rate and revenue
- `getBurnRate(tenantId)` — per-tenant WhatsApp cost metrics
- `getRevenue(tenantId)` — per-tenant payment metrics
- `getActiveTenantIds()` — unique tenants with telemetry activity
- `getStoreStats()` — monitoring stats (total events, max events, unique tenants)
- `clear()` — for testing

### 3. `src/app/api/telemetry/ingest/route.ts`
- POST endpoint accepting TelemetryEvent objects
- Validates event structure (required fields, valid event type, data is object)
- Verifies tenant exists with 5-minute cache (graceful on DB failure)
- Always returns 200 for resilience — telemetry never breaks DDC
- Periodic tenant cache cleanup

### 4. `src/app/api/telemetry/query/route.ts`
- GET endpoint with ZCC Security Gate V3 validation
- Query params: type, tenantId, category, since, until, limit
- Include params: aggregates, burnRate, revenue, storeStats (or all)
- Cap at 1000 events per query
- Returns events, aggregates, per-tenant burn rates, per-tenant revenues, store stats

### 5. `src/lib/telemetry-client.ts`
- Client-side utility for DDC pages
- `emitTelemetry()` — fire-and-forget POST with 5s timeout, silent failure
- `queueTelemetry()` — batched sending with 2s flush interval or 20-event threshold
- `flushTelemetryQueue()` — sends all queued events
- 16 convenience emitters (one per event type): `emitWhatsAppMessageSent`, `emitPaymentReceived`, `emitGuestCheckin`, etc.

### 6. Updated `src/app/api/zcc/metrics/route.ts`
- Added telemetry store imports (getAggregates, getActiveTenantIds, getBurnRate, getRevenue)
- Enriches existing DB metrics with telemetry data:
  - `totalMessagesProcessed` now includes telemetry messages
  - `telemetry` object in response with:
    - Burn rate (cost, savings, per-tenant breakdown)
    - Revenue telemetry (by currency, by source, per-tenant)
    - Event counts by type and category
    - Active telemetry tenants count
- Graceful fallback if telemetry store fails

## Verification
- Ingest API: POST returns `{ received: true, eventId: "evt_..." }` ✅
- Query API: GET with godmode returns events + aggregates + burn rates + revenues ✅
- Security Gate: Query API requires ZCC authentication (works with godmode in dev) ✅
- Invalid event type: Returns 400 error ✅
- Missing fields: Returns 400 error ✅
- ZCC Metrics: Returns telemetry enrichment data ✅
- No new lint errors (only existing `Record<string, any>` warnings from type definitions) ✅

## Architecture Notes
- Telemetry ingest is UNAUTHENTICATED by design — DDC pages need to emit events freely
- Telemetry query is PROTECTED by ZCC Security Gate V3
- In-memory store resets on server restart (acceptable for real-time metrics)
- Store auto-evicts at 10K events to prevent memory leaks
- US$ 0.0068 per WhatsApp message used consistently with message-bundler.ts
