Goal  
Complete the ZEHLA CRM commercial brain (8 Teses) \+ API route layer (SB21) \+ Prisma persistence \+ Stripe split payment motor \+ forecasting/social UI (SB23) — validated end-to-end with integration tests running against ephemeral PostgreSQL in CI.

\#\# Constraints & Preferences  
\- Clean Architecture: domain logic in \`src/domain/\`, no Prisma/infra/LLM calls in unit tests  
\- Value Objects frozen with \`Object.freeze\`, validated via \`Result\<T,E\>\`  
\- Controllers are anemic: parse HTTP → auth → Use Case → \`Result\<T,E\>\` as HTTP status  
\- RLS/tenant isolation: \`tenantId\` from JWT only, never from request body  
\- Data Mapper: \`PrismaCRMRepository.toData()\`/\`hydrate()\` isolates domain from Prisma types  
\- SB21 integration tests must pass in CI (blocker for deploy)  
\- Meta webhooks: HMAC SHA-256 with \`crypto.timingSafeEqual\`, 401 if invalid signature  
\- Frontend: dumb components receive data via props; pages invoke smart hooks; zero \`any\`, zero \`as T\`, zero try/catch  
\- CI/CD: PostgreSQL 16 service container ephemeral in GitHub Actions; \`db push\` not \`migrate deploy\` in ephemeral

\#\# Progress  
\#\#\# Done  
\- \*\*All 8 Teses\*\* — CRM Context Engine, Lead Scoring Thompson Sampling, Follow-up \+ Farmer IA, SDR Slot-Filling DSPy, Revenue GraphRAG, Social Seller \+ BullMQ Worker \+ Meta Webhook, Auditor D+1, ReactivateColdLeadUseCase \+ GaussianDelay — 217 tests, 12 files, green, TS clean  
\- \*\*Commercial Intelligence\*\* — conversion rates, pricing (R$197/397/697 PIX, trial 14d), LGPD, 5 regional strategies, benchmark — 36 tests  
\- \*\*Stripe motor\*\* — \`IFinancialGatewayPort\`, \`PaymentSplitConfig\` (liable:false), \`StripeGatewayAdapter\` (split via application\_fee\_amount \+ transfer\_data), \`HMACValidator\` (Web Crypto \+ timingSafeEqual), \`IdempotencyBarrier\`, \`PlanPricingService\`, \`ProcessPaymentWebhookUseCase\` (PIIScanner masking) — 22 tests  
\- \*\*Fase 0–3 Frontend\*\* — Next.js \+ Tailwind \+ Shadcn \+ React Query; dumb components (LeadCard, KanbanBoard, CognitiveTerminal, RoomGrid); smart hooks (useLeadsKanban, useCognitiveTerminal, useRoomBoard, useCommercialStrategy, useOutboundEngine, useFarmerCandidates) — zero \`any\`, zero \`as T\`  
\- \*\*Fase 4 Page Components\*\* — CRM page (useLeadsKanban → KanbanBoard), Brain page (useCognitiveTerminal → CognitiveTerminal), Reservas page (useRoomBoard → RoomGrid)  
\- \*\*SB21 API Routes\*\* — \`/api/crm/leads\` GET+PATCH, \`/api/crm/farmer/candidates\` GET, \`/api/crm/farmer/reactivate\` POST, \`/api/brain/logs\` GET — all with \`withApiSecurity\` \+ JWT RLS  
\- \*\*PrismaCRMRepository\*\* — Data Mapper \`toData()\`/\`hydrate()\` (LeadProfile ↔ ComercialLead); schema: pipelineStage, ltvScore, persona, totalSpentUsd, staysCount, bookingValueUsd, CrmLeadInteraction; eager loading (anti N+1); RLS via \`prisma.$extends\`; \`InMemoryCRMAdapter\` retired  
\- \*\*3 new backend routes\*\* (commit \`653d961\`):  
  \- \`/api/webhooks/social\` — POST (HMAC → ProcessSocialInteractionUseCase) \+ GET (challenge verification)  
  \- \`/api/marketing/outbound\` — GET (PAIN\_VARIANTS) \+ POST (dispatch single/batch), \`withApiSecurity\` \+ JWT  
  \- \`/api/revenue/strategy\` — GET (planos, conversão, regiões, LGPD, benchmark) \+ POST (recommend), \`withApiSecurity\` \+ JWT  
\- \*\*SB21 integration tests\*\* — 17 tests for new routes (HMAC inválido → 401, JWT ausente → 401, payload inválido → 400, dispatch/batch/strategy válido → 200\) — 27 total SB21 tests passing  
\- \*\*Frontend aligned\*\* — api-routes.ts: \`STRATEGY.\*\` → \`/api/revenue/strategy\`, \`OUTBOUND.\*\` → \`/api/marketing/outbound\`; \`use-commercial-strategy.ts\` migrated to POST  
\- \*\*SB23 Frontend UI\*\*:  
  \- \`types/social.ts\` — SocialInteractionView, PLATFORM\_META, URGENCY\_COR  
  \- \`hooks/use-strategy-overview.ts\` — GET \`/api/revenue/strategy\` → StrategyOverview  
  \- \`hooks/use-social-capture.ts\` — GET \`/api/social/captured\` \+ useConvertToLead mutation  
  \- \`ForecastMetricsBoard.tsx\` — dumb component: plan cards (R$197/397/697), conversion table, pain variants, regional strategies, LGPD, benchmark, competitive diffs  
  \- \`SocialInteractionList.tsx\` — dumb component: interaction cards with platform badge, urgency, buy intent, convert button  
  \- \`revenue/page.tsx\` — Forecasting Dashboard: 4 KPI cards \+ ForecastMetricsBoard  
  \- \`social/page.tsx\` — full page with SocialInteractionList (replaced placeholder)  
  \- \`layout.tsx\` — added "Inteligência de Mercado" nav link  
\- \*\*CI/CD PostgreSQL Service Container\*\* (commit \`88e03f2\`) — \`.github/workflows/ci.yml\`: \`services.postgres\` with \`postgres:16-alpine\`, pg\_isready health check, Prisma generate \+ db push before tests, DATABASE\_URL/JWT\_SECRET/META env vars injected  
\- \*\*Local tunnel active\*\* — \`localhost.run\` SSH tunnel at \`https://e3586c8dfef748.lhr.life\` forwarding to \`localhost:3000\`; dev server running (PID 2801\)

\#\#\# In Progress  
\- Meta webhook real test: tunnel is up, but need user to configure URL in Meta Developer panel and send a real Instagram comment

\#\#\# Blocked  
\- Fly.io deploy: missing \`FLY\_API\_TOKEN\` GitHub secret (pre-existing; step exists in CI workflow but won't run without secret)  
\- Stripe sync: pricing matrix (R$197/397/697) not yet reflected in payment gateway (deferred as GTM task)  
\- Meta webhook live: requires user to configure \`https://e3586c8dfef748.lhr.life/api/webhooks/social\` in Meta Developer Console with verify token \`zehla\_dev\_verify\_2026\`

\#\# Key Decisions  
\- \*\*Stripe over Pagar.me v5\*\* — better conditions for SMARTHOTEL/ZEHLA; swapped mid-session  
\- \*\*Monolito Modularizado\*\* — Next.js API Routes \+ domain in \`zehla-backend\`; \`zehla-frontend\` consumes via apiClient → \`/api\` proxy  
\- \*\*Data Mapper over Active Record\*\* — zero Prisma types leak to domain; switching ORMs needs zero changes to domain/use cases  
\- \*\*\`db push\` over \`migrate deploy\` in CI\*\* — ephemeral DB (born empty, dies in 5 min); \`db push\` is faster and sufficient for schema validation  
\- \*\*Email-first outbound\*\* — LGPD: corporativo \= legítimo interesse (pode disparar), pessoal \= consentimento (não pode); WhatsApp apenas após opt-in  
\- \*\*localtunnel → SSH localhost.run\*\* — ngrok v2.3.41 failed (ERR\_NGROK\_4018 requires authtoken), localtunnel blocks API calls (interstitial page), serveo.net SSH tunnel bypasses both auth requirements

\#\# Next Steps  
1\. \*\*User action\*\*: Configure Meta Developer Console → Webhooks → Instagram: set Callback URL to \`https://e3586c8dfef748.lhr.life/api/webhooks/social\`, Verify Token to \`zehla\_dev\_verify\_2026\`, subscribe to \`comments\` \+ \`messages\` fields; test with real Instagram comment  
2\. \*\*Stripe replacement (Pagar.me v5 / Stark Bank)\*\* — add \`liable: false\` split support for Brazilian payment ecosystem  
3\. \*\*Governança de Segredos\*\* — add \`FLY\_API\_TOKEN\`, \`META\_APP\_SECRET\`, \`META\_VERIFY\_TOKEN\`, \`DATABASE\_URL\` (Supabase prod) to GitHub Secrets  
4\. \*\*Ngrok account setup\*\* — sign up at dashboard.ngrok.com, get authtoken, run \`ngrok authtoken \<token\>\` for stable URL (avoids random hostname on each tunnel restart)  
5\. \*\*Fly.io deploy\*\* — unblock after secrets are configured and Meta webhook is validated

\#\# Critical Context  
\- \`BUCKETS\` array length \= 35; all downstream bounds derived from \`BUCKETS.length\`  
\- Meta webhook HMAC uses \`createHmac('sha256', META\_APP\_SECRET)\` \+ \`timingSafeEqual\`  
\- Gaussian delay reuses Box-Muller transform from \`BetaBinomialPosterior.ts\`  
\- Git repo root \= \`/Users/marciocau\` (\`.git\` is at home dir); code in \`Projetos/zehla-backend\` and \`Projetos/zehla-frontend\`  
\- \`.env\` updated with \`META\_APP\_SECRET\`, \`META\_VERIFY\_TOKEN\`, \`JWT\_SECRET\` for local dev  
\- Dev server running on \`:3000\` (PID 2801), SSH tunnel at \`https://e3586c8dfef748.lhr.life\` (PID 3201\)  
\- CI workflow: 4 jobs (lint → test with PostgreSQL → e2e → deploy Fly.io); test job now includes \`services.postgres\` block  
\- \`test:ci\` excludes: hospitalidade/prisma-repositories\*, \_\_tests\_\_/infrastructure/persistence/\*\*, revenue/domain/entities.test.ts, revenue/use-cases/use-cases.test.ts, decision/ZaosNeuroRouterLote4\*

\#\# Relevant Files  
\- \*\*Backend domain:\*\* \`src/domain/crm/\` (models, ports, services), \`src/domain/finance/\` (split, pricing), \`src/domain/security/services/\` (HMACValidator, PIIScanner, IdempotencyBarrier)  
\- \*\*New routes:\*\* \`src/app/api/webhooks/social/route.ts\`, \`src/app/api/marketing/outbound/route.ts\`, \`src/app/api/revenue/strategy/route.ts\`  
\- \*\*PrismaCRMRepository:\*\* \`src/infrastructure/persistence/crm/PrismaCRMRepository.ts\`  
\- \*\*CI workflow:\*\* \`.github/workflows/ci.yml\` (at git root \`/Users/marciocau\`)  
\- \*\*SB21 tests:\*\* \`src/\_\_tests\_\_/api/sb21\_crm\_routes.test.ts\` (10), \`src/\_\_tests\_\_/api/sb21\_new\_routes.test.ts\` (17)  
\- \*\*Types:\*\* \`src/types/social.ts\`, \`src/types/commercial.ts\` (expanded)  
\- \*\*Frontend hooks:\*\* \`src/hooks/use-strategy-overview.ts\`, \`src/hooks/use-social-capture.ts\`, \`src/hooks/use-commercial-strategy.ts\`  
\- \*\*Frontend pages:\*\* \`src/app/(dashboard)/revenue/page.tsx\`, \`src/app/(dashboard)/social/page.tsx\`  
\- \*\*Dumb components:\*\* \`src/components/features/revenue/ForecastMetricsBoard.tsx\`, \`src/components/features/social/SocialInteractionList.tsx\`  
\- \*\*Frontend routes:\*\* \`src/lib/api/api-routes.ts\` (aligned to new backend paths)  
\- \*\*Git:\*\* commits \`54dc032\`..\`88e03f2\` on \`main\` at \`https://github.com/MarcioCau14/SmartHotel\_Zehla\`  
