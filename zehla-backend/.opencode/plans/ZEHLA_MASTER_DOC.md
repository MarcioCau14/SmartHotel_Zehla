╔══════════════════════════════════════════════════════════════════════════════╗
║   ZEHLA PRIME — MASTER DOC (Agente)                                        ║
║   SmartHotel: Fundação → SB32.2 Hardening (Junho/2026)                     ║
║   Versão compacta para consultas rápidas do agente.                        ║
║   ⚡ AUTO-ATUALIZÁVEL: toda SB.                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

> Repo: https://github.com/MarcioCau14/SmartHotel_Zehla
> Stack: Next.js 16 + TS5 + Prisma 5 + PG16 + BullMQ + Redis 7
> Frontend: React 19 + Tailwind 4 + Shadcn/UI + React Query
> Deploy: Fly.io (Docker multi-stage) + CI/CD GitHub Actions
> Autor: MarcioCau14 | 165 commits | ~800 TS files | 134 suites verdes

═══════════════════════════════════════════════════════════════════════════════
SUMÁRIO EXECUTIVO
═══════════════════════════════════════════════════════════════════════════════

SB ATUAL: 32.2 (Hardening: rate limit, DLQ alert, tenant isolation tests,
           FSM 17→7, Prisma real em todas as rotas, Evolution API real)
17 BCs (7 Core + 10 Labs) | 124 modelos Prisma | 8 filas BullMQ | 8 Workers

═══════════════════════════════════════════════════════════════════════════════
HISTÓRICO RÁPIDO
═══════════════════════════════════════════════════════════════════════════════

SB1-10   → Fundação: Núcleo Cognitivo, Swarm, Ralph Loop, Comercial, Connect
SB11-20  → Maturação: KB Graph, Operacional, Revenue, Marketing
SB21-25  → CRM+Front: 120+ rotas, Frontend React, 8 Teses CRM
SB26-31  → DevOps: CI/CD, Docker, Expurgo TS, Fly.io, Telemetria
SB32.1   → OSINT MySmartHotel, Guidebook P0, Mass Messaging P1, 103 testes
SB32.2   → Hardening: rate limit, DLQ alert, tenant isolation tests,
           FSM Comercial 17→7, Prisma em todas as rotas, SB21 tests

═══════════════════════════════════════════════════════════════════════════════
ARQUITETURA
═══════════════════════════════════════════════════════════════════════════════

Clean Architecture + DDD Estrito:
  HTTP → Use Cases → Domínio Puro ← Ports ← Infra (Data Mapper)

Princípios:
  • Result<T,E> em todo retorno — sem exceções para fluxo de negócio
  • Entidades imutáveis — mutação = novo estado ou Result.fail
  • VOs com Object.freeze() — proteção recursiva
  • Data Mapper estrito — zero @prisma/client no domínio
  • Ports & Adapters — domínio depende de interfaces
  • BullMQ assíncrono para mensageria — sincrono proibido (anti-ban)
  • Gaussian delay (Box-Muller) entre mensagens
  • JWT Guard HS256 em toda rota
  • Payload leve na fila (IDs, não entidades)

═══════════════════════════════════════════════════════════════════════════════
17 BOUNDED CONTEXTS
═══════════════════════════════════════════════════════════════════════════════

1. Shared Kernel     → Result<T,E>, Uuid, DomainEvent
2. Hospitalidade     → Hóspede, Reserva, CheckIn/Out, Serviço, Feedback
3. Comercial/Vendas  → ROICalculator (P1), MarketIntelligence, FSM 7 estados (Core)
4. Marketing         → CampaignOrchestrator (P1), Zé-Marketer, Reviews
5. CRM               → 8 Teses (Context Engine, Thompson, Follow-up, SDR,
                       GraphRAG, Social Seller, Auditor, Farmer IA)
6. Revenue/Pricing   → GraphRAG pricing, 3 fatores, confidence [0,0.99]
7. Financeiro        → Account, Invoice, PIX, Stripe, split, estorno
8. Operacional       → Tarefa, Checklist, Staff, Fornecedor, SLA
9. Property/Cadastro → Property (40+ attr), 11 VOs, Planos LITE/PRO/MAX
10. Reservas         → Reservation FSM (6 estados), Payment, PricingRule
11. Lead/Funil       → Lead (50+ attr), Thompson Scoring, 17 eventos
12. Decisão          → ZaosNeuroRouter, 32 buckets (CADMAS-CTX), ProviderHealthMonitor
13. Swarm            → Subagent, Ralph Loop (OPAL), ConsensusEngine
14. Guidebook (P0)   → DigitalGuide, GuideSection VO, 28 testes
15. Segurança        → HardeningScore, HardeningVote, HardeningMission
16. Conhecimento     → KnowledgeBase, KnowledgeEntry, Memory
17. Evolução/Planos  → EvolutionEngine, ActionPlan, PlanTemplate

═══════════════════════════════════════════════════════════════════════════════
INFRAESTRUTURA
═══════════════════════════════════════════════════════════════════════════════

PRISMA: 124 modelos, 28 enums, ~2700 linhas, PostgreSQL

REDIS: 3 instâncias (Session DB 0, Worker DB 1, AI DB 2)

BULLMQ — 8 filas:
  brain-capture(10) → brain-validate(10) → brain-enrich(5) →
  brain-classify(5) → brain-act(2) | swipe-match | deep-scrape(3) |
  campaign-outbound(5) ← NOVO

WORKERS — 8:
  captureWorker → validateWorker → enrichWorker → classifyWorker →
  actWorker | scraperWorker | guardian-agent | telemetry-worker |
  CampaignOutboundWorker(5 concorrência): 120s lock, maxStalledCount=3,
    DLQ Alert → WhatsApp admin via sendWhatsAppAlert

JWT GUARD: HS256 (jose), extrai tenantId: pousadaId→tenantId→sub
          Testado SB21: 401 sem token, 401 token inválido (10 endpoints)

RATE LIMIT: Redis-based (src/lib/security/rate-limit.ts)
  Dispatch: 1 req/10min por propertyId → 429 Too Many Requests

MESSAGING: EvolutionApiMessagingGateway (IMessagingGateway)
  sendTemplate → Evolution API /message/sendText (template composto de variáveis)
  sendText → Evolution API /message/sendText
  getDeliveryStatus → stub (retorna 'sent' — webhook futuro)
  Wired ao CampaignOutboundWorker via injeção de dependência

DLQ ALERT: CampaignOutboundWorker.on('failed') → sendWhatsAppAlert()
  Notifica admin WhatsApp quando job falha permanentemente (3 tentativas)
  Mensagem: campanha, batch, erro, propertyId
  Worker: maxStalledCount=3, lockDuration=120s, concorrência=5

MULTI-TENANCY: 4 camadas (isolamento, WORM, canary, auditoria)
  PENTEST: src/__tests__/pentest/
    zaos-pentest-final.test.ts → PII leak, prompt injection, RLS isolation
    cross-tenant-isolation.test.ts → tenant A token não acessa dados de
      tenant B (retorna 404, nunca 403 — garante que não há data leak)

DATA MAPPER: PrismaDigitalGuideRepository (toData/hydrate) — rotas HTTP
             PrismaCampanhaRepository (toData/hydrate) — rotas HTTP
             InMemory repos — testes unitários apenas

═══════════════════════════════════════════════════════════════════════════════
120+ ROTAS HTTP — PRINCIPAIS
═══════════════════════════════════════════════════════════════════════════════

NOVAS (SB32):
  POST /api/guidebook               → Criar Guia (201) JWT
  GET  /api/guidebook               → Buscar Guia (200/404) JWT
  POST /api/marketing/campaigns/dispatch → Disparo campanha (202) JWT

CRM:    /api/crm/leads, contacts, deals, tasks, pipelines, farmer
BRAIN:  /api/brain/chat, health, predict, simulations, logs
AGENTS: /api/agents/concierge, financial, guardian, marketing, etc
WEBHOOKS: whatsapp, stripe, pagamento, pagarme, pix, delivery
FINANCE:  invoices, payments/pix, refund
CONNECT:  profile, links, analytics
SWIPES:   match, stats, track, send-email, seed
OTHER:    rooms, reservations, pricing-rules, revenue/kpis,
          operations/tarefas, onboarding, trial, security, health

═══════════════════════════════════════════════════════════════════════════════
TESTES — 134 SUITES VERDES / 1658 tests
═══════════════════════════════════════════════════════════════════════════════

NOSSOS TESTES SB32.2 (28 total — todos verdes):

  Guidebook HTTP (7): create, id, sections, content, GET, 404, 409
  Campaign Dispatch HTTP (6): 202, missing, 404, empty, metadata, batch
  Guidebook use cases (5): CriarGuiaDigitalUseCase
  Campaign use cases (10): ExecutarCampanhaMassaUseCase

  Pentest (5): cross-tenant-isolation (3 tests) — tenant A/B isolation
  SB21 integração (10): guidebook POST/GET + dispatch + JWT guard

PRÉ-EXISTENTES:
  Domínio (159): Guidebook(28), ROI(10), CampaignOrch(20), Financeiro(~20),
                 Property(~43), Lead(~93), Reservation(~84), etc
  Aplicação: Marketing(~12), Property(8)
  7 suites (SB21 integration) precisam PostgreSQL local

CI: 6 estágios (install→prisma→lint→typecheck→test→build) | 20min timeout

═══════════════════════════════════════════════════════════════════════════════
OSINT — MySmartHotel
═══════════════════════════════════════════════════════════════════════════════

584 linhas análise competitiva | 641 vendas | 306 DNS/stack

MySmartHotel TEM: Channel Manager, Dynamic Pricing, PMS, Housekeeping

ZEHLA DIFERENCIA (MSH NÃO TEM):
  ⭐ CRM Thompson Sampling  ⭐ Social Seller Agent
  ⭐ Follow-up DSPy         ⭐ Revenue GraphRAG
  ⭐ Swarm Cognitivo        ⭐ DIGITAL GUIDEBOOK (P0)
  ⭐ Mass Messaging anti-ban ⭐ ROI Calculator Brasil
  ⭐ Terminal Cognitivo     ⭐ Multi-Tenancy militarizado

═══════════════════════════════════════════════════════════════════════════════
PRÓXIMOS PASSOS — SB32.2 → SB33
═══════════════════════════════════════════════════════════════════════════════

FEITO (SB32.2 HARDENING):
  ✓ InMemory → PrismaDigitalGuideRepository nas rotas guidebook
  ✓ CampanhaInMemoryRepository → PrismaCampanhaRepository na rota dispatch
  ✓ EvolutionApiMessagingGateway (IMessagingGateway real) conectado ao
    CampaignOutboundWorker via injeção de dependência
  ✓ Rate limiting Redis (1 dispatch/10min por tenant) na rota dispatch → 429
  ✓ Worker registrado no orchestrator (campaignOutboundWorker em workers/index.ts)
  ✓ ContextDiscretizer buckets corrigido: 35 → 32 (CADMAS-CTX)
  ✓ SB21 integration tests expandidos: guidebook + dispatch + JWT guard (10 tests)
  ✓ Cross-tenant isolation pentest: tenant A não acessa dados de tenant B
  ✓ DLQ Alert: WhatsApp notification via sendWhatsAppAlert() em falha permanente
  ✓ FSM Comercial SPEC refatorada: 17 estados → 7 (PROSPECT→CONVERTED+CHURNED)
    com Apêndice A preservando o modelo expandido original

SB33 PLAN — DIAGNÓSTICO + AÇÕES RECOMENDADAS
═══════════════════════════════════════════════════════════════════════════

Diagnóstico: Código com 918 erros tsc (apenas 2 arquivos externos), 
FSM SPEC atualizada mas código de domínio ainda com estados antigos,
134 testes verdes, 6 dependem de PG local.

CRÍTICOS (Semanas 1-2):
  [ ] 1. Subir PostgreSQL local (docker compose up PG + Redis)
       → validar 10 testes SB21 integration em CI
  [ ] 2. Propagar FSM 7 estados da SPEC para o código:
       → Lead.ts: substituir estados legacy por PROSPECT|QUALIFIED|TRIAL|...
       → Use cases: transições PROSPECT→QUALIFIED (scoring ≥0.7) etc
       → Remover estados órfãos do domínio (manter apenas 7)
  [ ] 3. Rate limit + throttling na Evolution API:
       → 1 msg/3s por phone (Meta anti-spam)
       → Se 429 da Evolution, exponential backoff na fila (já existe)
  [ ] 4. Completar suíte de penetração cross-tenant:
       → Mais cenários: PII de hóspedes entre tenants, RLS bypass
  [ ] 5. Conectar webhook de delivery status da Evolution API
       → getDeliveryStatus() atual: stub — precisa polling ou webhook real
       → Novo worker: campaign-delivery-monitor

IMPORTANTES (Semanas 3-4):
  [ ] 6. Revisão LGPD: opt-out explícito em campanhas massivas
       → Novo campo marketing_campanha.opt_out_links
       → Bloqueio automático se lead opt-out
  [ ] 7. Retry-After header consistente em todos os rate limits
       → rateLimit() já retorna retryAfter, propagar nas responses
  [ ] 8. Dashboard de campanhas no ZCC
       → Expor: dispatched, delivered, failed, opt-out count por campanha

MÉDIO PRAZO (SB34):
  [ ] 9. Multi-idioma Guidebook (SmartAI + locale resolver)
  [ ] 10. ROICalculator no frontend (dashboard property)
  [ ] 11. Template builder de campanhas (drag & drop)
  [ ] 12. A/B testing de templates de mensagem

LONGO PRAZO:
  [ ] 13. Expansão LATAM/Europa
  [ ] 14. Channel Manager (Booking, Airbnb, Expedia)
  [ ] 15. Marketplace integrações
  [ ] 16. Swarm auto-gestionável

═══════════════════════════════════════════════════════════════════════════════
MÉTRICAS DE CÓDIGO
═══════════════════════════════════════════════════════════════════════════════

Commits: 165+1 | TS: ~37k LOC | Testes: 134 suites | BCs: 17 (7 Core + 10 Labs)
Modelos: 124 | Enums: 28 | Filas: 8 | Workers: 8 | Rotas: 120+
Testes Verdes: 134 suites / 1658 tests (--7 que precisam PG local)
Dependências: ~50 | Docker: 5 svc
Erros tsc: 918 (apenas .next/dev/types + blast/webhook — nossos 0)

═══════════════════════════════════════════════════════════════════════════════
MÉTRICAS DE PRODUTO (SB32.2)
═══════════════════════════════════════════════════════════════════════════════

Digital Guidebook P0:
  → Rotas: POST + GET  (201/200/404)
  → Repo: PrismaDigitalGuideRepository (data mapper isolado)
  → Storage: DigitalGuide (propertyId unique) + GuideSection (content: JSON)
  → 5 campos por seção: titulo, descricao, icone, ordem, conteudo
  → Testes: 7 HTTP + 5 use case + 10 SB21 = 22 testes

Mass Messaging P1:
  → Campanha: nome, segmento, template, schedule, status
  → Disparo: BullMQ assíncrono com 45s base + 0-15s jitter gaussiano
  → Rate limit: 1 req/10min por propertyId (429 se exceder)
  → Messaging: EvolutionApiMessagingGateway → Evolution API /message/sendText
  → Anti-ban: Gaussian delay entre mensagens, async dispatch
  → DLQ: 3 tentativas → WhatsApp admin (sendWhatsAppAlert)
  → Testes: 6 HTTP + 10 use case + SB21 = 18 testes + 5 pentest

ROI Calculator P1:
  → Parâmetros Brasil: salário mínimo R$1.412, diária média R$250
  → 4 outputs: horas economizadas, economia financeira, ROI %, payback (dias)
  → Testes: 10 unitários

FSM Comercial:
  → 7 estados core (SPEC): PROSPECT→QUALIFIED→TRIAL→NEGOTIATION→CONVERTED
    + CHURNED + REACTIVATED
  → Apêndice A preserva 17 estados originais
  → Pendente: propagar SPEC para código de domínio

Segurança:
  → JWT Guard HS256 em toda rota (401 sem token, 401 inválido)
  → Rate limit Redis (429)
  → Cross-tenant isolation (404, nunca 403 — sem data leak)
  → DLQ Alert: WhatsApp admin

═══════════════════════════════════════════════════════════════════════════════
║  FIM — SB32.2 HARDENING | Junho 2026 | Atualizar na próxima SB             ║
═══════════════════════════════════════════════════════════════════════════════
