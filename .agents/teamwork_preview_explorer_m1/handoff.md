# Handoff Report — teamwork_preview_explorer_m1

## 1. Observation
* **O1: Caddyfile vulnerability**: In `/Users/marciocau/SeuZella_project/Caddyfile` (lines 1-13), a proxy rule handles requests matching `@transform_port_query` (where query `XTransformPort=*`) and forwards them to `localhost:{query.XTransformPort}`.
* **O2: Vercel serverless configurations**: `/Users/marciocau/SeuZella_project/vercel.json` defines region `gru1` (line 7) but does not define `maxDuration` or `memory` properties.
* **O3: Nginx limits**: `/Users/marciocau/SeuZella_project/nginx/seuzella.conf` sets `proxy_connect_timeout`, `proxy_send_timeout`, and `proxy_read_timeout` to `60s` (lines 83-85).
* **O4: Nullable tenantId in schema**: In `/Users/marciocau/SeuZella_project/prisma/schema.prisma`:
  * `Lead` has `tenantId String?` (line 236).
  * `Target` has `tenantId String?` (line 336).
  * `Campaign` has `tenantId String?` (line 468).
* **O5: Models without tenantId**: In `prisma/schema.prisma`, `SwipeTemplate` (lines 409–441) and `AgentLog` (lines 356–383) contain no `tenantId` field.
* **O6: Unsecure database client instantiations**: Three files instantiate raw `new PrismaClient()` directly (bypassing `prismaEncryptionExtension` in `src/lib/prisma-encryption-middleware.ts`):
  * `src/lib/intelligence/funnel/classifier.ts` (line 7)
  * `src/lib/intelligence/funnel/event-processor.ts` (line 9)
  * `src/lib/intelligence/funnel/scorer.ts` (line 8)
* **O7: Wrong client imports**: Legacy API routes import `prisma` client singleton from `prisma/db.ts` instead of `src/lib/db.ts` (which applies encryption middleware):
  * `src/app/api/v1/metrics/route.ts` (line 2)
  * `src/app/api/v1/reservations/route.ts` (line 2)
* **O8: Unprotected `/api/tenants`**: `/Users/marciocau/SeuZella_project/src/app/api/tenants/route.ts` returns all tenant details globally (lines 7-16) without checking session user credentials.
* **O9: Tenant extension proxy limits**: `src/lib/tenant-extension.ts` limits dynamic `{ tenantId }` injection to a subset of models (excluding Lead, Target, Campaign, SwipeTemplate, AgentLog, and Airbnb models) and fails to inject verification filters for `findUnique`, `update`, `delete`, and `upsert` queries.
* **O10: Swarms structure**:
  * Pousada agents map to `RECEPTIONIST`, `RESERVATIONS`, `HOUSEKEEPING`, `CONCIERGE`, `FINANCIAL`, and `SYSTEM` (in `src/lib/brain/agent-orchestrator.ts`). Financial-specific agents are `JONY`, `MARIA`, `TEDD` (in `src/lib/intelligence/finance-agents-brain.ts`).
  * Zélla AirB agents map to `CONCIERGE`, `CHECK_IN`, `RESOLVER`, `RESERVAS`, `ANFITRIAO` (in `src/lib/airb/system-prompt.ts`).
* **O11: Load testing framework**: `stress-test-seuzella.js` performs simulated multi-tenant stress tests using simulated session cookie jars (`CookieJar`) and credentials bypass, verifying rate limiting and checking for cross-tenant data leaks.

## 2. Logic Chain
1. Based on **O1**, the Caddyfile reverse proxies to raw query-specified ports. Any attacker querying `XTransformPort` can bridge internal networks directly to the outside web, presenting a critical security exposure.
2. Based on **O2** and **O3**, serverless execution limits default to the platform values (Vercel) but are constrained to `60s` when routed via Nginx, which must be considered for long-running LLM completions.
3. Based on **O4**, **O5**, and **O9**, multi-tenant database records are not fully isolated. The proxy wrapper `withTenant()` lacks key models (leads, campaigns, Airbnb, etc.), and `findUnique`, `update`, `delete` can bypass tenant checks if raw IDs are supplied by cross-tenant requests.
4. Based on **O6** and **O7**, using raw `new PrismaClient()` instantiations or importing `prisma/db` instead of `src/lib/db.ts` skips the cryptographic extensions, leading to unencrypted credentials storing in the database or failing to decrypt on read.
5. Based on **O8**, `/api/tenants` leaks all client data globally because `withSecurity` lacks built-in authentication enforcement and the route handler itself lacks session authorization checks.
6. Based on **O10**, Zélla utilizes separate swarm mappings for Pousadas (focused on hotel metrics, housekeeping, check-ins) and Airbnb (with specific RAG pipelines, system prompts, and strict PIX filters to prevent platform bans).
7. Based on **O11**, load and cross-tenant leak checks are fully scriptable and can be run locally or integrated into build actions to prevent regressions.

## 3. Caveats
* We assumed that the local SQLite configuration in `schema.prisma` mirrors production structure, though there could be migration files/database mappings in production (e.g. pgvector, PostgreSQL) not present in the current workspace.
* We have not run the load tests locally to verify server output, as this is a read-only investigation.

## 4. Conclusion
The Seu Zélla codebase has several critical vulnerabilities and tenant isolation gaps:
* Reverse proxy loop in Caddyfile allowing internal port scanning.
* API key/secret encryption bypasses in raw `PrismaClient` usage.
* Publicly exposed administrative route `/api/tenants` leaking data.
* Vulnerable dynamic tenant wrapper (`withTenant`) failing to filter records by tenant on queries like `update`/`delete`/`findUnique`.
* Missing database isolation constraints for core models like `Lead`, `Target`, `Campaign`, `SwipeTemplate`, and `AgentLog`.

Addressing these issues requires applying structural schema constraints, refactoring Prisma clients, securing administrative endpoints, and restricting proxy bindings.

## 5. Verification Method
1. Inspect the Caddyfile locally or test local port forwarding.
2. Inspect `analysis.md` at `/Users/marciocau/SeuZella_project/.agents/teamwork_preview_explorer_m1/analysis.md` for full references.
3. Execute the automated load test suite command to check for leaks:
   `node stress-test-seuzella.js --url <URL> --tenants 5 --duration 10`
