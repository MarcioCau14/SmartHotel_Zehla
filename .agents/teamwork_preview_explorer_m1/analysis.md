# ZEHLA CODEBASE ANALYSIS REPORT

## Core Summary
This report summarizes an investigation into the Seu Zélla codebase, analyzing:
1. Serverless configurations, function limits, and reverse proxy vulnerabilities.
2. Tenant data isolation gaps, raw Prisma client usage bypassing encryption, unprotected endpoints, and the proxy layer weaknesses.
3. Swarm structures for Pousadas and Airbnb agents, alongside their billing and context boundaries.
4. Load and stress testing capabilities with recommendations for pipeline automation.

---

## 1. Serverless Function Limits & Configurations

### A. Next.js Config
* **Path**: `/Users/marciocau/SeuZella_project/next.config.ts`
* **Key Configurations**:
  * `output: 'standalone'`: Configured for Docker/standalone Node.js environment deployment.
  * `serverExternalPackages`: Explicitly contains `["@prisma/client", "prisma", "bcryptjs", "sharp"]` to prevent bundling issues in standalone build.
  * **Headers (Security & CSP)**:
    ```typescript
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://api.openai.com https://api.groq.com https://graph.facebook.com https://api.vturb.com.br https://api.zapsign.com.br; frame-ancestors 'none'; form-action 'self'; base-uri 'self';"
    ```

### B. Vercel Config
* **Path**: `/Users/marciocau/SeuZella_project/vercel.json`
* **Key Configurations**:
  * `regions`: Hardcoded to `["gru1"]` (São Paulo, Brazil).
  * **Missing Limits**: No `maxDuration` (timeouts) or `memory` limits are configured globally or per-function, defaulting to Vercel's standard plan limitations (15s for Hobby, 50s-900s for Pro).
  * **Cron Jobs**:
    * `/api/cron/budget-reset`: Every day at midnight UTC (`0 0 * * *`).
    * `/api/cron/metrics-snapshot`: Every day at 6:00 AM UTC (`0 6 * * *`).

### C. Reverse Proxy Vulnerability (Caddyfile)
* **Path**: `/Users/marciocau/SeuZella_project/Caddyfile`
* **Key Configuration**:
  ```caddy
  :81 {
  	@transform_port_query {
  		query XTransformPort=*
  	}

  	handle @transform_port_query {
  		reverse_proxy localhost:{query.XTransformPort} {
  			header_up Host {host}
  			header_up X-Forwarded-For {remote_host}
  			header_up X-Forwarded-Proto {scheme}
  			header_up X-Real-IP {remote_host}
  		}
  	}
    ...
  ```
* **Vulnerability Analysis**: 
  The `@transform_port_query` rule reverse-proxies directly to any local port specified in the `XTransformPort` query string parameter (e.g. `http://domain:81/?XTransformPort=5432` or `6379`). This allows external actors to scan internal ports and access internal databases or Docker endpoints running on the host, bypassing external firewall rules.

### D. Nginx Config
* **Path**: `/Users/marciocau/SeuZella_project/nginx/seuzella.conf`
* **Key Configurations**:
  * **Upstream**: Configures `seuzella_app` at `127.0.0.1:3000` with standard keepalive.
  * **Timeouts**: Proxy connection, send, and read timeouts are set to `60s` (restricting execution duration for slow webhook calls or LLM queries hitting Next.js):
    ```nginx
    proxy_connect_timeout 60s;
    proxy_send_timeout    60s;
    proxy_read_timeout    60s;
    ```
  * **Rate Limiting**:
    * `limit_req_zone $binary_remote_addr zone=global:10m rate=10r/s;` (SSR and static content)
    * `limit_req_zone $binary_remote_addr zone=auth:10m rate=3r/s;` (Login and signup protection)
    * `limit_req_zone $binary_remote_addr zone=webhook:10m rate=30r/s;` (WhatsApp Webhook ingestion)
    * `limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;` (General API endpoints)
  * **File Restrictions**: Explicitly denies access to `.env`, `.git`, `.md`, `.log`, `.sql`, and `.db` files, returning `404`.
  * **Upload Limit**: `client_max_body_size 10M` (10 Megabytes).

---

## 2. Database Tenant Isolation Gaps

The Seu Zélla database uses SQLite as the configured schema provider (`prisma/schema.prisma`). Because SQLite does not support native Row Level Security (RLS) policies, all tenant isolation relies on application-layer wrappers and conventions.

### A. Nullable `tenantId` in schema.prisma
In `prisma/schema.prisma`, multiple core business models have nullable `tenantId` fields, allowing data to be created globally or orphaned from tenant ownership:
1. **Lead** (line 236):
   ```prisma
   tenantId String?
   ```
2. **Target** (line 336):
   ```prisma
   tenantId String?
   ```
3. **Campaign** (line 468):
   ```prisma
   tenantId String?
   ```
* **Risk**: Queries that forget to explicitly filter by `tenantId` can accidentally retrieve and leak these global/orphaned records to other tenants.

### B. Lack of `tenantId` in Global Models
Multiple tables lack tenant association entirely, representing potential cross-tenant leakage:
1. **SwipeTemplate** (lines 409–441):
   * **Problem**: No `tenantId` field exists. Swipe templates are entirely shared globally.
2. **AgentLog** (lines 356–383):
   * **Problem**: No `tenantId` field exists. Telemetry, tokens used, cost, and LLM input/output are logged globally.

### C. Raw `new PrismaClient()` Bypassing Encryption
Sensitive API credentials (`apiKey`, `apiSecret` in `ApiConfig`) are encrypted/decrypted via `prismaEncryptionExtension` in `src/lib/prisma-encryption-middleware.ts`. This middleware is only registered on the lazy Prisma client singleton exported by `src/lib/db.ts`. 

Three files directly instantiate raw, unextended Prisma Clients, bypassing encryption entirely:
1. **Classifier**: `src/lib/intelligence/funnel/classifier.ts` (line 7)
   ```typescript
   const prisma = new PrismaClient();
   ```
2. **Event Processor**: `src/lib/intelligence/funnel/event-processor.ts` (line 9)
   ```typescript
   const prisma = new PrismaClient();
   ```
3. **Scorer**: `src/lib/intelligence/funnel/scorer.ts` (line 8)
   ```typescript
   const prisma = new PrismaClient();
   ```
* **Risk**: Reading or writing `ApiConfig` records using these clients will deal with raw encrypted strings (writes bypass encryption, storing plaintext credentials; reads retrieve the raw ciphertext format without decrypting it).

### D. Old API Routes Importing Wrong Client
The legacy client singleton (`prisma/db.ts`) does not apply the encryption extension. The following API routes import from `prisma/db` instead of the secure wrapper (`src/lib/db.ts`):
1. **Metrics Route**: `src/app/api/v1/metrics/route.ts` (line 2):
   ```typescript
   import prisma from '../../../../../prisma/db';
   ```
2. **Reservations Route**: `src/app/api/v1/reservations/route.ts` (line 2):
   ```typescript
   import prisma from '../../../../../prisma/db';
   ```

### E. Tenant Proxy Layer Isolation Gaps
Tenant isolation in Zélla is enforced dynamically using `withTenant(tenantId)` in `src/lib/tenant-extension.ts`. This proxy wrapper has serious security gaps:
1. **Missing Models**: The proxy only filters queries on select models. It completely excludes `Lead`, `Target`, `Campaign`, `SwipeTemplate`, `AgentLog`, and all Airbnb models (`AirBProperty`, `AirBConversation`, `AirBMessage`, `AirBRegionalKnowledge`, `AirBScrapingJob`, `AirBSubscription`, `AirBTransaction`).
2. **Bypassed Operations**: Methods like `findUnique`, `update`, `delete`, and `upsert` do **not** inject the `tenantId` filter criteria into the query args:
   ```typescript
   findUnique: (args: { where: Record<string, unknown>; include?: Record<string, unknown> }) => {
     return (prismaModel.findUnique as (...args: any[]) => any)(args);
   },
   ```
   If a malicious tenant passes a known ID belonging to another tenant, the query executes successfully across tenant boundaries, bypassing isolation.

### F. Global Tenant Leakage in `/api/tenants`
* **Path**: `src/app/api/tenants/route.ts`
* **Code**:
  ```typescript
  async function getHandler(_request: NextRequest, _ctx: any) {
    try {
      const tenants = await db.tenant.findMany({
        select: { id: true, name: true, email: true, plan: true, status: true, createdAt: true },
      });
      return NextResponse.json({ success: true, tenants });
    } ...
  ```
* **Security Risk**:
  Although wrapped with `withSecurity`, the middleware itself contains no auth checks. The route handler lacks token check or session validation (`requireTenantId()`), returning a list of all tenants, names, emails, and IDs. This route is public and leaks administrative data.

---

## 3. Agent Teams Core

### A. Pousada Swarm Structure
* **Orchestrator**: `src/lib/brain/agent-orchestrator.ts`
* **Execution flow**: The incoming request is sent through a Chain of Responsibility handlers: `SecurityHandler` → `IntentClassifierHandler` → `TrialValidatorHandler` → `ReceiptHandler` → `PromptBuilderHandler` → `ToolCallingHandler` → `SemanticCacheHandler` → `LLMExecutionHandler` → `LoggingHandler` → `VoiceHandler`.
* **Agent Definitions**: Intents are classified and mapped via `getAgentName(intent)` to specialized agents:
  * `RECEPTIONIST`: Reservation creation, modification, cancel, room availability, price inquiry, greeting.
  * `RESERVATIONS`: Check-in, check-out.
  * `HOUSEKEEPING`: Housekeeping request.
  * `CONCIERGE`: Amenities inquiry, local info.
  * `FINANCIAL`: Payment status, cancellation policy.
  * `SYSTEM`: Supplier inquiry.
* **Finance Swarm**: Defined in `src/lib/intelligence/finance-agents-brain.ts`:
  * `JONY` (Sentinela Diário): Faturamento e caixa em tempo real. Foco em anomalias.
  * `MARIA` (Investigadora Orquestradora): Auditoria, discrepâncias e tendências quinzenais.
  * `TEDD` (Estrategista Preditivo): Projeções de 30-90 dias.

### B. Zélla AirB (Airbnb Swarm) Structure
* **Module Path**: `src/lib/airb/`
* **Agent Mapping**: Defined in `src/lib/airb/system-prompt.ts`:
  * `CONCIERGE`: RAG on neighborhood & location info.
  * `CHECK_IN`: RAG on check-in & checkout instructions.
  * `RESOLVER`: Host tips and complaints.
  * `RESERVAS`: Fixed price & booking intents.
  * `ANFITRIAO`: House rules and general greetings.
* **PIX Gate Security**: Enforces platform compliance under `src/lib/airb/gatekeeper.ts`.
  * If `platformContext` is `airbnb_app` or `airbnb_web`, `isPixAllowed` returns `false`.
  * Response post-processing (`filterPixFromResponse`) intercepts the text and strips out any CPF, bank key, or QR codes to prevent Airbnb platform bans.
  * PIX values/keys are allowed only on `direct` and `whatsapp` channels.

### C. Billing & Context Separation
* **Data Context**: Divided at the database schema level. Airbnb entities utilize distinct tables prefixed with `AirB` (e.g. `AirBProperty`, `AirBConversation`, `AirBMessage`).
* **Billing Tables**: 
  * Pousada subscriptions use the main `Subscription` table (Plans: Lite, Pro, Max).
  * Airbnb subscriptions use the dedicated `AirBSubscription` and `AirBTransaction` tables.
  * Plans: `airb_pro` (397.0 BRL/month, up to 4 properties, max 1 concurrent scrape) and `airb_max` (797.0 BRL/month, up to 12 properties, max 3 concurrent scrapes).
  * Limits are enforced programmatically in `src/lib/airb/gatekeeper.ts#checkEntitlement()`.

---

## 4. Deploy Seguro (Stress/Load Tests)

### A. Load Test Architecture
* **Script**: `stress-test-seuzella.js`
* **Configuration Parameters**:
  * `--url`: Target URL (default: `http://localhost:3000`).
  * `--tenants`: Number of concurrent tenants simulated (default: `10`).
  * `--duration`: Timeout window for the webhook stress test (default: `30` seconds).
  * `--concurrency`: Max concurrent connections to open (default: `50`).
* **Execution Phases**:
  1. **Phase 1 (Auth)**: Fetches CSRF tokens and performs batch credential logins via credential helper bypass `email=123` / `password=123`.
  2. **Phase 2 (Leak Verification)**: Verifies if simulated sessions can resolve property info across tenant identities.
  3. **Phase 3 (Webhook Stress)**: Sends mock messages and status updates to `/api/webhook-whatsapp` at concurrent limits.
  4. **Phase 4 (DDC API Stress)**: Spams dashboard APIs (metrics, conversations, guests) and checks if the returned tenant JSON payloads contain values mismatching the active session token.
  5. **Phase 5 (Brute Force Protection)**: Validates if sending incorrect login requests triggers a HTTP `429 Rate Limited`.

### B. CI/CD Integration & Automation Plan
To automate these tests as a gatekeeper before every deployment:
1. **GitHub Actions Workflow**:
   * Add a pipeline job `stress-test` triggered on Pull Requests to main or pre-deploy.
   * Start the application locally using a Docker container or development server (`bun run dev` / `npm run build && npm run start`).
   * Seed the local environment database with the required mock data.
   * Execute:
     ```bash
     node stress-test-seuzella.js --url http://localhost:3000 --tenants 5 --duration 15 --concurrency 20
     ```
   * Because `stress-test-seuzella.js` terminates with exit code `1` if `crossTenantLeaks > 0`, the CI runner will immediately fail the check, blocking automated deployments of compromised releases.

---

## 5. Summary of Recommended Actions

1. **Proxy Fix**: Remove or secure the query-based reverse proxy configuration (`XTransformPort`) in the `Caddyfile` immediately.
2. **Schema Hardening**: Make `tenantId` non-nullable on `Lead`, `Target`, and `Campaign` models. Add a `tenantId` field to `SwipeTemplate` and `AgentLog`.
3. **Instance Refactoring**: Stop instantiating raw `new PrismaClient()` in `classifier.ts`, `event-processor.ts`, and `scorer.ts`. Replace them with imports referencing the singleton `db` from `@/lib/db`.
4. **Proxy Wrapper Hardening**:
   * Update the `TenantDbProxy` in `src/lib/tenant-extension.ts` to include all missing tables (Airbnb tables and Lead/Target/Campaign tables).
   * Refactor proxy handlers for `findUnique`, `update`, `delete`, and `upsert` to append `{ tenantId }` checks directly to the `where` query boundaries.
5. **Secure Administrative Routes**: Require session authorization validation inside `src/app/api/tenants/route.ts` via `requireTenantId()` before execution.
