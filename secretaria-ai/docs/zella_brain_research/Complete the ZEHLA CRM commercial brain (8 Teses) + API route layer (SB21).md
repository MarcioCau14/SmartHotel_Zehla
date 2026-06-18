Complete the ZEHLA CRM commercial brain (8 Teses) \+ API route layer (SB21) \+ Prisma persistence \+ Stripe split payment motor \+ forecasting/social UI (SB23) — validated end-to-end with integration tests running against ephemeral PostgreSQL in CI, now deployed locally against Supabase cloud DB with static ngrok tunnel.

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
\- \*\*Ngrok static tunnel\*\* — ngrok v3.39.6 installed, autenticado com token, domínio reservado \`valley-dispersed-thing.ngrok-free.dev\` (estável, não muda em restart)  
\- \*\*Supabase DATABASE\_URL resolvida\*\* — senha resetada via Management API SQL (\`ALTER USER postgres WITH PASSWORD 'Zehla\_Supabase\_2026'\`); conexão testada com \`prisma db push\` → banco sincronizado  
\- \*\*GitHub Secrets\*\* (4/4) — \`DATABASE\_URL\` (Supabase produção), \`JWT\_SECRET\`, \`META\_APP\_SECRET\`, \`META\_VERIFY\_TOKEN\`  
\- \*\*fly.toml\*\* criado — app \`zehla-crm\`, porta 3000, Docker standalone, \`auto\_stop\_machines \= false\`, \`min\_machines\_running \= 1\`  
\- \*\*vercel.json removido\*\* — descartado (serverless incompatível com BullMQ worker)  
\- \*\*Commits no GitHub\*\* — \`b38689e\` (infra: ngrok \+ secrets \+ fly.toml \+ vercel), \`3d0cda8\` (Supabase URL \+ worker \+ remoção vercel)  
\- \*\*Webhook simulation test\*\* — \`scripts/simulate-meta-webhook.ts\` criado e executado  
  \- HMAC válido → \*\*200\*\* \`EVENT\_RECEIVED\` ✅  
  \- HMAC inválido → \*\*401\*\* bloqueado pelo \`timingSafeEqual\` ✅  
  \- Bug corrigido: \`comment.message\` → \`comment.text\` no route.ts  
  \- Bug corrigido: \`timingSafeEqual\` sem verificação de tamanho → adicionado \`sigBuf.length \!== expBuf.length\` guard  
\- \*\*BullMQ worker\*\* — rodando localmente (PID 25834), ouvindo filas Upstash Redis  
\- \*\*Dev server\*\* — rodando na porta 3000, apontando para Supabase cloud  
\- \*\*Página Facebook\*\* criada (ID: \`61590442482017\`)  
\- \*\*Conta Instagram Business\*\* criada e vinculada à página do Facebook  
\- \*\*Plano D operacional\*\* — Localhost \+ ngrok \+ Supabase \+ worker BullMQ

\#\#\# In Progress  
\- Testes das Teses 4 e 5 (Domínio Puro) — revisar cobertura, expandir suíte Vitest in-memory

\#\#\# Blocked  
\- \*\*Meta Developer Console\*\* — SMS de verificação nunca chega a tempo; conta bloqueada temporariamente por excesso de tentativas (aguardar 24h)  
\- \*\*Fly.io deploy\*\* — exige cartão de crédito (bloqueado por política de custo zero)  
\- \*\*Instagram webhook real\*\* — depende do App na Meta ser criado e configurado com a URL do ngrok

\#\# Key Decisions  
\- \*\*Fly.io descartado temporariamente\*\* — exige cartão de crédito; optou-se por Plano D (localhost \+ ngrok \+ Supabase) para Fase Beta  
\- \*\*Vercel rejeitada\*\* — serverless Functions não suportam BullMQ worker em background (morre após responder HTTP)  
\- \*\*Ngrok sobre localhost.run\*\* — ngrok autenticado com domínio reservado (não muda em restart); \`localhost.run\` gerava URLs efêmeras  
\- \*\*Data Mapper over Active Record\*\* — zero Prisma types leak to domain; switching ORMs needs zero changes to domain/use cases  
\- \*\*\`db push\` over \`migrate deploy\` in CI\*\* — ephemeral DB (born empty, dies in 5 min); \`db push\` is faster and sufficient for schema validation  
\- \*\*Email-first outbound\*\* — LGPD: corporativo \= legítimo interesse (pode disparar), pessoal \= consentimento (não pode); WhatsApp apenas após opt-in  
\- \*\*Stripe over Pagar.me v5\*\* — better conditions for SMARTHOTEL/ZEHLA; swapped mid-session  
\- \*\*Senha Supabase resetada via Management API\*\* — \`ALTER USER postgres WITH PASSWORD 'Zehla\_Supabase\_2026'\` via \`POST /v1/projects/{ref}/database/query\`  
\- \*\*HMACValidator bug corrigido\*\* — \`timingSafeEqual\` sem guard de tamanho causava exceção engolida pelo try/catch; campo \`message\` → \`text\` no payload da Meta

\#\# Next Steps  
1\. \*\*Revisar Teses 4 e 5 (SDR Slot-Filling \+ Revenue GraphRAG)\*\* — expandir suíte de testes unitários Vitest in-memory (Domínio Puro, zero rede/disco)  
2\. \*\*Aguardar 24h\*\* para o bloqueio SMS da Meta resetar, então criar o App e configurar webhook com URL \`https://valley-dispersed-thing.ngrok-free.dev/api/webhooks/social\`, token \`zehla\_dev\_verify\_2026\`, inscrição em \`comments\` \+ \`messages\`  
3\. \*\*Plano D contínuo\*\* — manter dev server \+ ngrok \+ worker BullMQ rodando localmente durante o Programa Beta (5-10 pousadas)  
4\. \*\*Migração futura\*\* — Oracle Cloud (Always Free ARM, 4 CPUs, 24GB RAM) ou VPS Hostinger para produção 24/7; cartão necessário apenas para verificação

\#\# Critical Context  
\- \`BUCKETS\` array length \= 35; all downstream bounds derived from \`BUCKETS.length\`  
\- Meta webhook HMAC usa \`crypto.createHmac('sha256', META\_APP\_SECRET)\` \+ \`timingSafeEqual\` com guard de tamanho  
\- Gaussian delay reuses Box-Muller transform from \`BetaBinomialPosterior.ts\`  
\- Git repo root \= \`/Users/marciocau\` (\`.git\` is at home dir); code in \`Projetos/zehla-backend\` and \`Projetos/zehla-frontend\`  
\- \`.env\` com DATABASE\_URL apontando para Supabase cloud (\`postgresql://postgres:Zehla\_Supabase\_2026@db.yzuryspivefbgmehjfse.supabase.co:5432/postgres\`)  
\- Dev server rodando \`:3000\` (PID 25244), ngrok estático em \`https://valley-dispersed-thing.ngrok-free.dev\`  
\- Webhook challenge testado: GET \`?hub.mode=subscribe\&hub.verify\_token=zehla\_dev\_verify\_2026\&hub.challenge=test\` → \`200 test\`  
\- Supabase ref: \`yzuryspivefbgmehjfse\`, região \`sa-east-1\`, PostgreSQL 17  
\- Upstash Redis cloud já configurado (heroic-drake-131102.upstash.io)  
\- BullMQ worker rodando localmente (PID 25834\)  
\- \`test:ci\` excludes: hospitalidade/prisma-repositories\*, \_\_tests\_\_/infrastructure/persistence/\*\*, revenue/domain/entities.test.ts, revenue/use-cases/use-cases.test.ts, decision/ZaosNeuroRouterLote4\*  
\- GitHub Secrets atualizados: \`DATABASE\_URL\`, \`JWT\_SECRET\`, \`META\_APP\_SECRET\`, \`META\_VERIFY\_TOKEN\`  
\- Meta Developer Console bloqueado por excesso de tentativas SMS (aguardar 24h)

\#\# Relevant Files  
\- \*\*Backend domain:\*\* \`src/domain/crm/\` (models, ports, services), \`src/domain/finance/\` (split, pricing), \`src/domain/security/services/\` (HMACValidator, PIIScanner, IdempotencyBarrier)  
\- \*\*New routes:\*\* \`src/app/api/webhooks/social/route.ts\`, \`src/app/api/marketing/outbound/route.ts\`, \`src/app/api/revenue/strategy/route.ts\`  
\- \*\*PrismaCRMRepository:\*\* \`src/infrastructure/persistence/crm/PrismaCRMRepository.ts\`  
\- \*\*CI workflow:\*\* \`.github/workflows/ci.yml\` (at git root \`/Users/marciocau\`)  
\- \*\*SB21 tests:\*\* \`src/\_\_tests\_\_/api/sb21\_crm\_routes.test.ts\` (10), \`src/\_\_tests\_\_/api/sb21\_new\_routes.test.ts\` (17)  
\- \*\*Script simulador:\*\* \`scripts/simulate-meta-webhook.ts\`  
\- \*\*Fly.io config:\*\* \`Projetos/zehla-backend/fly.toml\`  
\- \*\*Types:\*\* \`src/types/social.ts\`, \`src/types/commercial.ts\` (expanded)  
\- \*\*Frontend hooks:\*\* \`src/hooks/use-strategy-overview.ts\`, \`src/hooks/use-social-capture.ts\`, \`src/hooks/use-commercial-strategy.ts\`  
\- \*\*Frontend pages:\*\* \`src/app/(dashboard)/revenue/page.tsx\`, \`src/app/(dashboard)/social/page.tsx\`  
\- \*\*Dumb components:\*\* \`src/components/features/revenue/ForecastMetricsBoard.tsx\`, \`src/components/features/social/SocialInteractionList.tsx\`  
\- \*\*Frontend routes:\*\* \`src/lib/api/api-routes.ts\` (aligned to new backend paths)  
\- \*\*Git:\*\* commits \`54dc032\`..\`3d0cda8\` on \`main\` at \`https://github.com/MarcioCau14/SmartHotel\_Zehla\`

\#\# Summary

\#\#\# Tese 4 (SDR Slot-Filling) — \`SDRSlotFilling.ts\` \+ \`sdr-slot-filling.test.ts\`  
\- \*\*Audit\*\*: Domain model already solid — immutability via \`Object.freeze\`, \`fillSlot\` returns new state, confidence clamped \`\[0,1\]\`, required vs optional slots tracked via \`currentTargetSlot\`. 14 tests existing.  
\- \*\*Added 4 edge case tests\*\*: overwrite filled slot, empty string value, \`currentTargetSlot\` null after all 7 filled, \`currentTargetSlot\` maintains first-required-empty when only optionals filled.  
\- \*\*18 tests total\*\*, all passing.

\#\#\# Tese 5 (Revenue GraphRAG Upsell) — \`RevenueGraphEntities.ts\` \+ \`revenue-graph.test.ts\`  
\- \*\*Audit\*\*: \`UPSELL\_BFS\_PATHS\` (5 hardcoded paths) existed but had \*\*no consumption logic\*\*. \`RevenueGraphService\` only did pricing, no upsell traversal.  
\- \*\*Created \`UpsellPathRecommender\`\*\* in \`RevenueGraphEntities.ts:38-67\`: takes a persona string → matches exact (\`Guest\_{persona}\`) and wildcard (\`Guest\_Any\`) paths → returns frozen \`UpsellRecommendation\[\]\` sorted by confidence desc, steps asc.  
\- \*\*Added 10 tests\*\*: exact match for each persona (Family/Romantic/B2B/Leisure), Guest\_Any fallback, confidence ordering, frozen output, product extraction validation.  
\- \*\*27 tests total\*\*, all passing.

\#\#\# Overall  
\- \*\*325 tests across 18 files\*\*, all green  
\- Zero TypeScript errors in changed files  
\- No new files created — all changes within existing files  
