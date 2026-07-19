# Task 3 — API Route Engineer: Work Record

## Task: Create ZCC API routes for data hydration

## Summary
Created 7 API route files under `/api/zcc/` that power the ZCC dashboard with real data from Prisma. All routes follow existing project patterns (NextResponse.json, db from @/lib/db, proper error handling, graceful fallbacks).

## Files Created

### 1. `/src/app/api/zcc/metrics/route.ts` — GET
- Returns aggregated ZCC Overview metrics
- Queries: tenant count, room count, reservation count, transaction revenue, AI messages processed, occupancy rate, monthly growth
- Computes MRR breakdown by niche (pousadas, airbnb, parceiro)
- Computes niche breakdown with per-niche clients/revenue/reservations
- Returns system status (always operational for SQLite)
- Graceful fallback: returns zeros on any DB error

### 2. `/src/app/api/zcc/tenants/route.ts` — GET
- Returns all tenants with enriched metrics
- Accepts query params: `?niche=pousadas|anfitrioes|parceiro&search=term&plan=pro`
- Each tenant includes: id, name, niche, plan, planPrice, status, city, state, owner, whatsapp, revenue, aiMessagesProcessed, conversionRate, brainAccuracy, brainStatus, killSwitchActive
- Niche determined from `tenant.plan` and `property.type`
- Revenue computed from Transaction aggregate
- Brain accuracy is plan-based mock placeholder

### 3. `/src/app/api/zcc/burn-rate/route.ts` — GET
- Returns WhatsApp cost breakdown for Burn Rate tab
- Per-tenant: monthlyPrice, whatsappCostWeek/Month, messagesWeek/Month, costRatio, anomaly flag, trend (up/down/stable)
- Anomaly detection: cost ratio >20% or >500 messages/week
- Trend: compares this week vs previous week (±10% threshold)
- Breakdown by niche with percentage
- Meta tariff constants: US$0.0068/msg, R$0.035/msg

### 4. `/src/app/api/zcc/whatsapp/simulate/route.ts` — POST
- Simulates a WhatsApp message with cost tracking
- Body: `{ tenantId, direction, intent?, oneShot? }`
- ZCC access verification required (cookie or header)
- Creates WhatsAppMessageCost record
- Only outbound messages incur US$0.0068 cost
- Returns cost record + updated tenant cost summary (30-day window)

### 5. `/src/app/api/zcc/airbnb/oauth/route.ts` — POST
- Mock Airbnb OAuth flow
- ZCC access verification required
- Creates mock AirbnbOAuthToken with fake access/refresh tokens
- Imports 3 mock AirBProperty records (Copacabana apartment, Monte Verde chalet, São Paulo studio)
- All mock properties have realistic Brazilian data

### 6. `/src/app/api/zcc/airbnb/webhook/route.ts` — POST
- Mock Airbnb webhook receiver
- ZCC access verification required
- Body: `{ tenantId, eventType, payload? }`
- Creates AirbnbWebhookEvent record with mockTriggered=true
- Returns the created event

### 7. `/src/app/api/zcc/consent/route.ts` — GET + POST
- LGPD consent management
- GET: Returns consent records + consent logs for a tenant (`?tenantId=xxx`)
- POST: Creates/updates a ConsentRecord via upsert on (tenantId, guestPhone, consentType)
- Validates consentType (whatsapp_communication, data_processing, marketing) and status (granted, denied, pending, withdrawn)
- Also creates ConsentLog audit trail entry on POST
- Graceful fallback if ConsentLog table unavailable

## Prisma Schema Status
All required models already existed in the schema:
- WhatsAppMessageCost ✓
- AirbnbOAuthToken ✓
- AirbnbWebhookEvent ✓
- ConsentRecord ✓
- ConsentLog ✓

Database was already in sync (`bun run db:push` confirmed).

## Lint Status
No new errors or warnings introduced. Only minor fixes applied:
- Removed unused `USD_TO_BRL` constant from burn-rate route
- Replaced `any[]` with proper types in burn-rate and consent routes

## Existing Patterns Followed
- `import { db } from '@/lib/db'` (not @/lib/prisma)
- `NextResponse.json()` from next/server
- `{ success: true, data: ... }` / `{ success: false, error: ... }` response shape
- ZCC access verification via `zcc_godmode` cookie or `X-ZCC-Master-Key` header for write routes
- Graceful fallback with try/catch on all DB queries
