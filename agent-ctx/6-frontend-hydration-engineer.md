# Task ID: 6 — Frontend Hydration Engineer

## Task: Connect ZCC Overview and TenantXRay to real API routes

## Work Log

### Part 1: ZCC Page Overview (`/src/app/zcc/page.tsx`)

- Added `useEffect` import alongside `useState`
- Renamed static imports: `globalMetrics as _globalMetrics`, `airbnbMetrics as _airbnbMetrics`, `parceiroMetrics as _parceiroMetrics`
- Created `useZCCMetrics()` hook that:
  - Fetches from `/api/zcc/metrics` on mount and every 30 seconds
  - Returns `{ data, loading }` state
  - Gracefully falls back on API failure (keeps loading=false, data=null)
- Added `apiGlobalMetrics`, `apiAirbnbMetrics`, `apiParceiroMetrics` computed variables that merge API data with static fallbacks using `??` operator
- Updated overview tab to use `apiGlobalMetrics`, `apiAirbnbMetrics`, `apiParceiroMetrics` instead of raw static imports
- Added loading skeleton (shimmer placeholders) for the 6 metric cards while `metricsLoading` is true
- Header MRR and client counts now use API data with static fallback

### Part 2: TenantXRay (`/src/components/zcc/TenantXRay.tsx`)

- Added `useEffect` import
- Renamed `unifiedTenants` → `staticTenants` (kept as module-level fallback)
- Renamed `globalMetrics` import → `_globalMetrics` (avoiding unused import warning)
- Added `tenantsLoading` state (initialized to `true`)
- Added `useEffect` that:
  - Fetches from `/api/zcc/tenants` on mount
  - Maps API response to `UnifiedTenant` format
  - If API returns data with length > 0, replaces static tenants with API tenants
  - On failure, keeps static fallback (tenants already initialized with `staticTenants`)
- Added subtle loading indicator ("Carregando dados..." with amber spinner) at top of component

### Part 3: CerebroZella (`/src/components/zcc/CerebroZella.tsx`)

- No changes needed — already fetches from `/api/brain` with 5s interval

### Part 4: FintechHub (`/src/components/zcc/FintechHub.tsx`)

- Added `useState` and `useEffect` imports
- Renamed static imports: `airbnbMetrics as _airbnbMetrics`, `parceiroMetrics as _parceiroMetrics`
- Removed `globalMetrics` import (not used in JSX)
- Converted `BETA_PROGRAM` to `BETA_PROGRAM_BASE` (base values only), dynamically enriched inside component
- Converted `zehlaProducts` to `zehlaProductsBase` (without `subscribers`), subscribers computed dynamically inside component
- Removed module-level `nicheMRR` (moved inside component as dynamic computation)
- Added `useEffect` that fetches from `/api/zcc/metrics` on mount and every 30 seconds
- Added `airbnbMetrics` and `parceiroMetrics` local variables that merge API data with static fallbacks
- `nicheMRR` now uses `apiData?.mrr?.pousadas`, `apiData?.mrr?.airbnb`, `apiData?.mrr?.parceiro` directly from API
- Added subtle loading indicator ("Carregando métricas..." with amber spinner)

## Lint Results

- No new errors introduced
- Pre-existing warnings only (unused imports in TenantXRay, `any` types in hooks)
- Dev server compiled successfully

## Files Modified

1. `/src/app/zcc/page.tsx` — useZCCMetrics hook, API-hydrated overview, loading skeletons
2. `/src/components/zcc/TenantXRay.tsx` — /api/zcc/tenants fetch, loading state
3. `/src/components/zcc/FintechHub.tsx` — /api/zcc/metrics fetch, dynamic BETA_PROGRAM/zehlaProducts/nicheMRR

## Design Decisions

- **Graceful degradation**: All components fall back to static data if API fails. No broken UI.
- **Non-disruptive loading states**: Subtle spinners/badges, not full-page blockers
- **API data wins over static**: When API returns data, it replaces static values. `??` operator used throughout.
- **30-second polling**: Metrics refresh automatically every 30s (matching task spec for overview, applied consistently to FintechHub)
- **Tenants one-shot fetch**: TenantXRay only fetches once on mount (no polling) since tenant data changes infrequently
