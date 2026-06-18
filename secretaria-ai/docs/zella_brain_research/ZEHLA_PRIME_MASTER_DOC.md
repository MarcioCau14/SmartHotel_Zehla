╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ZEHLA PRIME — MASTER DOCUMENTATION                                         ║
║   SmartHotel: Da Fundação ao Estado Atual (Junho/2026)                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

> **Repositório:** https://github.com/MarcioCau14/SmartHotel_Zehla
> **Stack:** Next.js 16 + TypeScript 5 + Prisma 5 + PostgreSQL 16 + BullMQ + Redis 7
> **Frontend:** React 19 + Tailwind 4 + Shadcn/UI + React Query
> **Testes:** Vitest 4 + Playwright
> **Deploy:** Fly.io (Docker multi-stage) + CI/CD GitHub Actions
> **Autor:** MarcioCau14 | **Commits:** 164 | **Arquivos TS:** ~800

---

## ÍNDICE

1. [VISÃO GERAL DO PROJETO](#1-visão-geral-do-projeto)
2. [HISTÓRICO DE EVOLUÇÃO](#2-histórico-de-evolução)
3. [ARQUITETURA](#3-arquitetura)
4. [INFRAESTRUTURA DE HOSPEDAGEM](#4-infraestrutura-de-hospedagem)
5. [17 DOMÍNIOS (BOUNDED CONTEXTS)](#5-17-domínios-bounded-contexts)
6. [CAMADA DE APLICAÇÃO](#6-camada-de-aplicação-use-cases)
7. [INFRAESTRUTURA DETALHADA](#7-infraestrutura-detalhada)
8. [API HTTP — 120+ ROTAS](#8-api-http--120-rotas)
9. [FRONTEND](#9-frontend)
10. [TESTES — 103+ VERDES](#10-testes--103-verdes)
11. [OSINT — MySmartHotel](#11-osint--mysmarthotel)
12. [CRONOGRAMA SB](#12-cronograma-sb)
13. [MÉTRICAS DO PROJETO](#13-métricas-do-projeto)
14. [ESTADO ATUAL](#14-estado-atual-sb32)
15. [PRÓXIMOS PASSOS](#15-próximos-passos)

---

## 1. VISÃO GERAL DO PROJETO

ZEHLA PRIME é um ecossistema SaaS de gestão hoteleira focado em **pousadas independentes no Brasil**. O sistema cobre desde prospecção de leads (funil público + CRM + inteligência comercial) até operação diária (check-in/out, serviços de quarto, manutenção) e pós-estadia (marketing de reputação, remarketing, guia digital para hóspedes).

| Métrica | Valor |
|---|---|
| Nome do pacote | `zehla-backend` |
| Linguagem | TypeScript 5 (estrito) |
| Framework | Next.js 16 (App Router) |
| ORM | Prisma 5.22.0 |
| Banco | PostgreSQL 16 |
| Cache/Filas | Redis 7 + BullMQ |
| Testes | Vitest 4 + Playwright |
| Containers | Docker multi-stage + Fly.io |
| Domínios | 17 Bounded Contexts |
| Arquivos TS | ~800 (src/) + 111 (testes) + 159 (domínio) |
| Rotas HTTP | 120+ |
| Testes | 103+ verdes |
| Workers | 8 (7 pipeline cognitivo + 1 campaign) |
| Filas BullMQ | 8 |

---

## 2. HISTÓRICO DE EVOLUÇÃO

O projeto evolui em **Sprints Boundaries (SB)**, numeradas sequencialmente:

### SB1-SB10: Fundação do Núcleo Cognitivo
- **SB1-SB4** (Zaos-Shield): Núcleo cognitivo, SwarmCoordinator, Ralph Loop, Ofuscação Gaussiana, Proxy Chains
- **SB5-SB9** (Zaos-Shield): Pentest Final, Casca HTTP, Hardening
- **SB8**: Bounded Context Comercial com persistência real Prisma
- **SB9-SB10**: ZEHLA Connect, Schema.org, ISR, tema VZAPS

### SB11-SB20: Maturação dos Domínios
- **SB11-SB14**: KB Graph, Operacional Prisma, Ze-Ops Cognitive, Ze-Analyst Revenue
- **SB15**: Persistência Prisma do Domínio Revenue
- **SB17-SB19**: Spec-Driven Marketing + Domínio Marketing + Persistência Prisma
- **SB20**: Despertar Cognitivo do Zé-Marketer

### SB21-SB25: CRM, Decisão e Frontend
- **SB21**: Adaptadores HTTP — CRM leads + Farmer + Brain logs (JWT Guard)
- **SB22**: Spec-Driven Frontend + React Query + Shadcn/UI
- **SB23**: Smart Hooks (Fase 1-3), Dumb Components, ZCC Container, Autenticação Visual
- **SB24**: Funil Público com Landing + Onboarding Wizard
- **SB25 (CRM - 8 Teses)**:
  - Tese 1: CRM Context Engine (LeadProfile, Pipeline, Envelope, Provider)
  - Tese 2: Lead Scoring via Thompson Sampling (Beta-Binomial, Marsaglia-Tsang)
  - Tese 3: Follow-up Engine (CadenceClock + DSPy GenerateFollowUpSignature)
  - Tese 4: SDR Slot-Filling DSPy (SlotFillingState, 7 slots)
  - Tese 5: Revenue GraphRAG (Pricing + Upsell BFS)
  - Tese 6: Social Seller Agent (Instagram → CRM, BullMQ + Webhook)
  - Tese 7: Auditor D+1 + Quality Proxy (6 sinais heurísticos)
  - Tese 8: Farmer IA Eligibility Engine (reativação > 180 dias)

### SB26-SB29.5: DevOps, CI/CD e Expurgo
- **SB26**: Correções de pipeline CI
- **SB27**: Comercial FSM (17 estados, 50 transições), Casos de Uso, PrismaCRMRepository
- **SB28**: Input Adapters HTTP Comercial
- **SB29**: Zero-Trust CI Barrier com 4 estágios (lint → typecheck → test → build)
- **SB29.5**: Expurgo TypeScript — `tsc --noEmit` zero erros

### SB30-SB31: Containerização e Observabilidade
- **SB30**: Containerização imutável multi-stage Docker + Fly.io CD
- **SB31**: Caixa Preta com logs JSON estruturados e telemetria

### SB32 (ATUAL): OSINT + Digital Guidebook + Mass Messaging
- OSINT completo do MySmartHotel (584 linhas análise, 641 vendas, 306 DNS/stack)
- **Digital Guidebook P0**: Domínio puro + Use Cases + Ports + Data Mapper Prisma + HTTP Routes
- **Savings Calculator P1**: ROICalculator.ts com parâmetros Brasil (salário mínimo R$1.412)
- **Mass Messaging Engine P1**: CampaignOrchestrator + ExecutarCampanhaMassaUseCase refatorado para BullMQ assíncrono
- **CampaignOutboundWorker**: Worker BullMQ com retry exponencial + DLQ
- **Correções arquiteturais**: Data Mapper isolado, BullMQ async-only, Prisma schema para DigitalGuide
- **103 testes verdes** (90 existentes + 13 novos de integração HTTP)

---

## 3. ARQUITETURA

### 3.1 Clean Architecture + DDD Estrito

```
┌──────────────────────────────────────────────────────────────┐
│  INTERFACES (HTTP)                                           │
│  src/app/api/*/route.ts  — 120+ rotas Next.js App Router     │
│  JwtGuard (HS256) em todas as rotas protegidas              │
├──────────────────────────────────────────────────────────────┤
│  APLICAÇÃO (Use Cases)                                       │
│  src/application/*/use-cases/ — Orquestram domínio puro      │
│  Sem dependência de infraestrutura — apenas Ports            │
├──────────────────────────────────────────────────────────────┤
│  DOMÍNIO PURO                                                │
│  src/domain/*/entities/     — Entidades ricas imutáveis      │
│  src/domain/*/value-objects/ — VOs congelados Object.freeze  │
│  src/domain/*/services/     — Serviços de domínio puros      │
│  src/domain/shared/Result.ts — Monada Result<T,E>           │
├──────────────────────────────────────────────────────────────┤
│  INFRAESTRUTURA                                              │
│  src/infrastructure/persistence/ — Data Mappers (toData/hydrate)
│  src/infrastructure/http/auth/   — JWT Guard + authenticateRequest
│  src/infrastructure/workers/     — BullMQ Workers           │
│  src/infrastructure/queue/       — Filas                     │
│  src/infrastructure/llm/         — LLM Router Adapter       │
├──────────────────────────────────────────────────────────────┤
│  BIBLIOTECAS (lib)                                           │
│  src/lib/prisma.ts  — Prisma Client + Extensão Multi-Tenant  │
│  src/lib/redis.ts   — 3 instâncias Redis (Session/Worker/AI) │
│  src/lib/queues.ts  — 8 filas BullMQ                        │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Princípios Arquiteturais

| Princípio | Descrição |
|---|---|
| **Result<T,E>** | Em TODOS os retornos — nunca exceções para fluxo de negócio |
| **Imutabilidade** | Entidades imutáveis: mutação retorna novo estado ou `Result.fail` |
| **Object.freeze()** | VOs congelados recursivamente |
| **Data Mapper estrito** | Zero tipos `@prisma/client` vazam para o domínio |
| **Ports & Adapters** | Domínio depende de interfaces, nunca de implementações concretas |
| **BullMQ assíncrono** | Mensageria SEMPRE assíncrona — sincrono proibido (anti-banimento Big Techs) |
| **Gaussian Delay** | Atrasos Gaussianos (Box-Muller) entre mensagens de campanha |
| **JWT Guard** | HS256, extração de `tenantId` do token (fallback: pousadaId → tenantId → sub) |
| **Payload leve na fila** | Apenas IDs e ponteiros nos jobs BullMQ (evita OOM no Redis) |

---

## 4. INFRAESTRUTURA DE HOSPEDAGEM

### 4.1 Docker Compose (5 serviços)

| Serviço | Imagem | Porta | Função |
|---|---|---|---|
| PostgreSQL | postgres:16-alpine | 5432 | Banco de dados principal |
| Redis | redis:7-alpine | 6379 | Cache + Filas BullMQ |
| Evolution API | atendai/evolution-api | 8080 | API WhatsApp |
| Prometheus | prom/prometheus:v2.51.0 | 9090 | Métricas (profile: monitoring) |
| Grafana | grafana/grafana:10.4.0 | 3001 | Dashboards (profile: monitoring) |

Volumes: `postgres_data`, `redis_data`, `evolution_data`, `prometheus_data`, `grafana_data`

### 4.2 Docker Multi-Stage (Fly.io)

```
Stage 1 (deps):   Node 20-alpine → instala dependências
Stage 2 (builder): Build Next.js (output: standalone)
Stage 3 (runner):  Node 20-alpine, usuário nextjs, porta 3000, CMD: node server.js
```

### 4.3 CI/CD (GitHub Actions)

**ci.yml** — Gatilho: push/PR para `main`
- Serviços: PostgreSQL 16 + Redis 7 (service containers)
- Cache: pnpm store + Next.js cache
- Passos: `install → prisma generate → lint (ESLint) → typecheck (tsc --noEmit) → test (Vitest) → build (next build)`
- Timeout: 20 minutos

**Outros workflows:** `cd.yml` (Fly.io), `db-backup.yml`, `security-scan.yml`, `zehla-operational-swarm.yml`

### 4.4 Deploy

| Ambiente | Destino | Observação |
|---|---|---|
| Produção | Fly.io | Standalone Next.js |
| Staging | CI pipeline | Verificado antes do deploy |
| Dev Webhooks | Ngrok estático | `valley-dispersed.thing.ngrok-free.dev` |
| Banco Produção | Supabase | PostgreSQL cloud |

---

## 5. 17 DOMÍNIOS (BOUNDED CONTEXTS)

### 5.1 Shared Kernel (`src/domain/shared/`)

| Arquivo | Função |
|---|---|
| `Result.ts` | Monada `Result<T,E>`: `ok(value)`, `fail(error)`, `isOk/isFail`, `map`, `flatMap`, `getOrElse` |
| `Uuid.ts` | VO gerador de UUID (`crypto.randomUUID()`) |
| `Event.ts` | `DomainEvent`: `{ id, type, timestamp, payload }` |

### 5.2 Hospitalidade (`src/domain/hospitalidade/`)

7 entidades: `Hospede`, `Reserva`, `CheckIn`, `CheckOut`, `ServicoQuarto`, `Experiencia`, `Feedback`

Definido em `SPEC.md` (378 linhas). Gerencia experiência do hóspede do primeiro contato ao pós-checkout. É o contexto mais sensível (PII).

### 5.3 Comercial / Vendas

**`ROICalculator.ts` (P1, NOVO):**
- Calculadora de ROI para pousadas brasileiras
- Salário mínimo: R$ 1.412 | Diária média: R$ 250
- Cálculos: horas economizadas, savings mensais/anuais, ROI, payback
- 10 testes

**MarketIntelligence (SB27):**
- Conversão realista: 2% B2B, 3% WhatsApp
- Pricing psicológico: R$ 197/397/697 (PIX) | R$ 247/447/797 (cartão)
- Trial 14 dias | LGPD compliance
- 5 estratégias regionais (Norte a Sul)
- 36 testes

**FSM Comercial (SB27):**
- 17 estados, 50 transições
- VOs: LeadScore, OrigemLead, ProductTier (LITE/PRO/MAX)
- 16 Domain Events

### 5.4 Marketing & Reputação

**SPEC_MARKETING.md** define o Zé-Marketer — agente de marketing digital.

**`CampaignOrchestrator.ts` (P1, NOVO):**
- Validação de segmento, schedule, batch sizing
- Transições: rascunho → agendada → em_execucao → concluida → cancelada
- `calculateBatchSize()`: ≤100 = total, ≤1000 = 100, ≤10000 = 200, >10000 = 500
- Gaussian delay (Box-Muller) para anti-banimento

**Modelos Prisma Marketing:**
`MarketingReview`, `MarketingCampanha`, `MarketingConteudo`, `MarketingPost`, `MarketingMetrica`

### 5.5 CRM (8 Teses — SB25)

| Tese | Nome | Arquitetura | Testes |
|---|---|---|---|
| T1 | Context Engine | CRMPipelineStage (6 estágios), LeadProfile upgrade, CRMContextEnvelope + Provider | 20 |
| T2 | Thompson Scoring | LeadConversionPosterior (Beta-Binomial), Marsaglia-Tsang + Johnk, 16 posteriors (4 canais × 4 personas) | 13 |
| T3 | Follow-up Engine | CadenceClock (2h/24h/48h), GenerateFollowUpSignature (DSPy-style, 3 templates) | 33 |
| T4 | SDR Slot-Filling | SlotFillingState (7 slots), completionPercentage, nextPromptType | 14 |
| T5 | Revenue GraphRAG | RevenueEntityType, UPSELL_BFS_PATHS (5 caminhos), confidence [0, 0.99] | 17 |
| T6 | Social Seller | SocialInteraction VO, AnalyzeSocialIntentSignature (DSPy), BullMQ + Webhook Meta | 23 |
| T7 | Auditor D+1 | AuditTranscriptSignature, QualityProxy (6 sinais, threshold 0.7) | 15 |
| T8 | Farmer IA | ReservationSnapshot, ReactivationEligibility (>180 dias), ReactivationCandidate | 8 |

### 5.6 Revenue / Pricing (`src/domain/revenue/`)

**RevenueGraphService:**
- 3 fatores de precificação: ocupação (0.90/1.00/1.15), sazonalidade (0.95/1.05/1.20), competidor (clamp [0.85, 1.20])
- Confiança: `0.7 + occ*0.2 + demand*0.1` (max 0.99)
- Preço mínimo: 85%, máximo: 115% do sugerido

### 5.7 Financeiro (`src/domain/finance/`)

8 entidades: `Account`, `Budget`, `CashFlow`, `CostCenter`, `Expense`, `Invoice`, `Revenue`, `Transaction`
`FluxoCaixa`, split de pagamento, Stripe Gateway (HMAC + IdempotencyBarrier)
Preços: R$ 197/397/697 (PIX) | R$ 247/447/797 (cartão)
22 testes

### 5.8 Operacional (`src/domain/operacional/`)

6 entidades: `Tarefa`, `Checklist`, `Equipe`, `Jornada`, `Ocorrencia`, `Auditoria`

Modelos Prisma:
`OperacionalTarefa`, `OperacionalManutencao`, `OperacionalStaff`, `OperacionalFornecedor`, `OperacionalChecklist`, `OperacionalSla`

### 5.9 Property / Cadastro (`src/domain/property/`)

**Entidade:** `Property` com 40+ atributos (nome, slug, endereço, plano, trial, stripe, UTM, voz, etc.)

**11 VOs imutáveis:** Address, CadasturInfo, ContactInfo, FeatureSet, OperationalWindow, PropertyConfiguration, RegistrationNumber, Subscription, TrialPeriod, UTMTracking, VoiceTokenBudget

**Planos:** LITE, PRO, MAX, BETA_TESTER, EARLY_ADOPTER
**Status:** ACTIVE, SUSPENDED, CANCELLED, TRIAL_EXPIRED

### 5.10 Reservas (`src/domain/reservation/`)

**Entidade:** `Reservation` (25+ atributos)
**Status:** PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT | CANCELLED | NO_SHOW
**VOs:** DateRange, GuestCount, GuestInfo, Money

### 5.11 Lead / Funil (`src/domain/lead/`)

**Entidade:** `Lead` (50+ atributos)
**Status:** PROSPECT → QUALIFIED → TRIAL_STARTED → CONVERTED | BLACKLISTED
**Score:** Thompson Sampling + cluster dinâmico (HOT/WARM/COLD — thresholds: 60/30/0)
**Eventos:** 17 LeadEventTypes (EMAIL_OPEN, WHATSAPP_REPLY, TRIAL_STARTED, PAYMENT_MADE, CONVERSION...)

### 5.12 Decisão — ZaosNeuroRouter (`src/domain/decision/`)

- `ContextDiscretizer`: 35 buckets contextuais (IDs 0-34)
- `ProviderHealthMonitor`: health check de provedores LLM
- `HierarchicalTransfer`: roteamento entre agentes
- Categorias: Emergency → Complaint → Pricing → Booking → CRM → FAQ

### 5.13 Swarm / Agentes Cognitivos (`src/domain/swarm/`)

- `Subagent`: ciclo idle → working → done/failed
- `SubagentProfile`: catálogo de papéis (pricing, reviews, concierge, analyst)
- `SwarmCoordinator`: gerencia ciclo de vida
- `ConsensusEngine`: votação para tomada de decisão
- `DogmaticEvaluator`: avalia outputs contra critérios
- `RalphLoop`: Observe → Plan → Act → Learn (OPAL completo)

### 5.14 Guidebook Digital (P0, NOVO) — `src/domain/guidebook/`

**`enums.ts`:**
- `GuideSectionType`: wifi, cafe, cafeDaManha, piscina, spa, academia, restaurante, checkin, checkout, contato, emergencia, regras, atracoes, translado, custom
- `GuideStatus`: rascunho, publicado, arquivado
- `LocalizedContent`: `{ title, content, language }`

**`GuideSection.ts` (VO):**
- Value Object imutável (Object.freeze)
- `create(id, sectionType, icon, order, content)` → `Result<GuideSection>`
- Conteúdo vazio → `Result.fail('SECAO_VAZIA')`
- 12 testes

**`DigitalGuide.ts` (Entity):**
- Agregado raiz: id, propertyId, status, version, sections[], createdAt, updatedAt
- Métodos: `publish()`, `archive()`, `addSection()`, `removeSection()`, `updateSection()`
- `restore()` sem eventos (para repositórios)
- 16 testes

### 5.15 Segurança / Hardening (`src/domain/hardening/`)

`HardeningScore`, `HardeningVote`, `HardeningMission`, `HardeningEvaluation`

### 5.16 Conhecimento / Memória

`KnowledgeBase`, `KnowledgeEntry`, `Memory`, `MemoryStore`

### 5.17 Evolução / Planos

`EvolutionEngine`, `EvolutionRecord`, `ActionPlan`, `ActionItem`, `PlanTemplate`, `PlanExecution`

---

## 6. CAMADA DE APLICAÇÃO (USE CASES)

### 6.1 Comercial (8 UCs)

`AceitarPropostaUseCase`, `CalcularTaxaConversaoUseCase`, `CapturarLeadUseCase`, `ConfirmarPagamentoUseCase`, `CriarPropostaUseCase`, `ProcessarPropostasExpiradasUseCase`, `QualificarLeadUseCase`, `SugerirDescontoUseCase`

### 6.2 Marketing

**`ExecutarCampanhaMassaUseCase` (P1, REFATORADO):**
- Porta: `IMessagingGateway` (sendTemplate)
- **Refatorado para BullMQ assíncrono**: injeta `Queue`, faz `addBulk()` com batches
- Gaussian delay entre jobs (baseDelay + Box-Muller jitter)
- Payload leve: apenas IDs e ponteiros (não entidades hidratadas)
- Retorna `{ status, campaignId, batchesDispatched, totalRecipients }`
- 10 testes

`ZeMarketerCognitiveService` — serviço cognitivo do Zé-Marketer

### 6.3 Financeiro (8 UCs)

`EmitirFaturaUseCase`, `ConciliarTransacaoPixUseCase`, `ProcessarPagamentoPixUseCase`, `CancelarFaturaUseCase`, `ProcessarEstornoUseCase`, `GerarFaturaUseCase`, `ListarFaturamentoUseCase`, `MarcarFaturaVencidaUseCase`

### 6.4 Property (8 UCs)

`AlterarPlanoUseCase`, `AtivarPropertyUseCase`, `AtualizarConfiguracaoUseCase`, `ConsumirTokenVozUseCase`, `CriarPropertyUseCase`, `SuspenderReativarUseCase`, `VerificarCadasturUseCase`, `VerificarTrialUseCase`

### 6.5 Guidebook (P0, NOVO)

**`CriarGuiaDigitalUseCase`:**
- Valida unicidade: `GUIA_JA_EXISTE` se já existe guia para a propertyId
- Cria `DigitalGuide` com sections validadas
- Persiste via `IDigitalGuideRepository`
- Retorna guia com status 'rascunho'
- 5 testes

**`SincronizarGuiaComSmartAIUseCase`:**
- Requer guia no status 'publicado'
- Detecta multi-idioma nas seções
- Prepara payload para envio ao SmartAI (GraphRAG)
- 4 testes

### 6.6 Portas (Ports)

| Porta | Função |
|---|---|
| `IDigitalGuideRepository` | `findByPropertyId(propertyId)` / `save(guide)` |
| `IMessagingGateway` | `sendTemplate(phone, templateId, variables)` |

---

## 7. INFRAESTRUTURA DETALHADA

### 7.1 Prisma ORM

**Provider:** PostgreSQL | **Client:** 5.22.0 | **Modelos:** 44 | **Enums:** 15 | **Linhas:** ~1900

**Modelos principais:**

| Modelo | Função | Destaques |
|---|---|---|
| `User` | Usuários | Role: CLIENT, ADMIN, SUPER_ADMIN, TEAM |
| `Property` | Propriedades/pousadas | 40+ atributos, slug único, plan/stripe/trial |
| `Room` | Quartos | type/capacity/price, @@unique(propertyId, number) |
| `Reservation` | Reservas | 25+ atributos, FSM 6 estados |
| `Payment` | Pagamentos | PIX com QR code, externalId |
| `MarketingCampanha` | Campanhas marketing | status, datas, promiseFinanceira |
| `MarketingReview` | Reviews | sentimento, nota, tom, problemaRelatado |
| `CrmContact` | Contatos CRM | tags, customFields, soft delete |
| `CrmDeal` | Negócios CRM | stage, probability, pipeline |
| `DigitalGuide` | **Guia Digital (NOVO)** | @@unique(propertyId), status, version |
| `GuideSection` | **Seções do Guia (NOVO)** | sectionType, icon, order, content (Json) |
| `Lead` | Leads | 50+ atributos, cluster, scoring |
| `Tenant` | Tenants | slug único |
| `AgentLog` | Logs de agentes | agentName, action, confidence, tokensUsed |

**Enums (15):** `Role`, `PropertyStatus`, `Plan`, `WhatsappChannelType`, `PixKeyType`, `RoomType`, `RoomStatus`, `ReservationStatus`, `CheckInStatus`, `PaymentMethod`, `PaymentStatus`, `LeadStatus`, `PricingType`, `InvoiceStatus`, `InvoiceItemType`, `FinanceScope`, `FinanceTransactionType`, `FinanceSeverity`, `CrmInteractionType`, `CrmTaskPriority`, `CrmTaskType`, `FiscalStatus`, `LeadEventType`

### 7.2 Redis — 3 Instâncias

| Instância | DB | Função |
|---|---|---|
| `redisSession` | 0 | Sessões NextAuth, cache de sessão (+ sensor de latência >500ms) |
| `redisWorker` | 1 | Todas as filas BullMQ (8 filas) |
| `redisAI` | 2 | Cache semântico LLM, embeddings |

**Resilience Mode:** Quando `REDIS_URL` não definida ou durante build Next.js (`NEXT_PHASE`), retorna MockRedis (operações no-op). Em dev, proxy com fallback degradado para `ECONNREFUSED`.

### 7.3 BullMQ — 8 Filas

| Fila | Concorrência | Backoff | Função |
|---|---|---|---|
| `brain-capture` | 10 | 2s exp | Captura de dados brutos |
| `brain-validate` | 10 | 2s exp | Validação |
| `brain-enrich` | 5 | 2s exp | Enriquecimento |
| `brain-classify` | 5 | 2s exp | Classificação |
| `brain-act` | 2 | 2s exp | Ação (crítico: não estourar APIs) |
| `brain-swipe-match` | — | 2s exp | Match Swipe Intelligence |
| `brain-deep-scrape` | 3 | 2s exp | Deep scraping |
| `campaign-outbound` | 5 | 10s exp | **Disparo de campanhas (NOVO)** |

### 7.4 Workers — 8 no Total

**Pipeline Cognitivo (`src/workers/`):**

| Worker | Função |
|---|---|
| `captureWorker` | Captura inicial de leads/eventos |
| `validateWorker` | Validação de dados capturados |
| `enrichWorker` | Enriquecimento com dados externos |
| `classifyWorker` | Classificação e scoring |
| `actWorker` | Execução de ações (WhatsApp, Email) |
| `scraperWorker` | Deep scraping de dados |
| `guardian-agent` | Agente de segurança |
| `telemetry-worker` | Telemetria e métricas |

**`CampaignOutboundWorker` (NOVO — `src/infrastructure/workers/`):**

| Parâmetro | Valor |
|---|---|
| Fila | `campaign-outbound` |
| Concorrência | 5 |
| Lock Duration | 120s |
| Max Stalled | 3 |
| Retry | Exponential backoff (10s base) |
| DLQ | `worker.on('failed')` captura falhas definitivas |

Fluxo: job → itera recipients[] → `IMessagingGateway.sendTemplate()` → falha total do batch = throw Error (BullMQ retry) → falha parcial = log + segue

### 7.5 Autenticação JWT

**JwtGuard** (`src/infrastructure/hardening/JwtGuard.ts`):
- Algoritmo: HS256
- Lib: `jose` (zero dependência de `jsonwebtoken`)
- Extrai `tenantId` com fallback: `pousadaId` → `tenantId` → `sub`
- Retorna `TenantSession { pousadaId, userId, role }`

**authenticateRequest** (`src/infrastructure/http/auth/jwtAuth.ts`):
- Extrai Bearer token do header `Authorization`
- Retorna `Result<TenantSession>`
- Usado em todas as rotas protegidas

### 7.6 Data Mappers

**`PrismaDigitalGuideRepository` (NOVO):**
- `toData(guide)`: converte entidade domínio → formato Prisma (sections como JSON)
- `hydrate(raw)`: reconstrói entidade via `DigitalGuide.restore()` (sem eventos)
- Zero vazamento de tipos `@prisma/client`

**`InMemoryDigitalGuideRepository` (NOVO):**
- Implementação em memória para testes (futuro: substituir por Prisma nas rotas)
- `save()` detecta duplicatas por propertyId

### 7.7 Multi-Tenancy — 4 Camadas de Proteção

A extensão Prisma em `src/lib/prisma.ts` aplica 4 camadas em toda query:

| Camada | Nome | Mecanismo |
|---|---|---|
| 1 | Isolamento Militarizado | Injeta `propertyId` em todo `where` + força em `create` |
| 2 | Bunker Financeiro (WORM) | Bloqueia update/delete em `FinancialAudit`, `PaymentAudit` |
| 3 | Lead Canary (Honeypot) | Filtra `isCanary: false` em consultas de Lead |
| 4 | Auditoria de Canário | Detecta acesso a registros canários → alerta de segurança |

### 7.8 Segurança Adicional

- **HMAC**: Webhooks Stripe/Meta com validação de assinatura (`x-hub-signature-256`)
- **PII Masking**: Dados pessoais mascarados em logs
- **Rate Limiting**: 50 requisições/segundo por tenant
- **Dogmatic Evaluator**: Avaliação de outputs de agentes contra critérios

---

## 8. API HTTP — 120+ ROTAS

### 8.1 ZEHLA PRIME (SB21)

| Método | Rota | Função |
|---|---|---|
| GET/POST | `/api/crm/leads` | Kanban com PII masking |
| PATCH | `/api/crm/leads` | Atualizar estágio lead |
| GET | `/api/crm/farmer/candidates` | Candidatos reativação Farmer IA |
| POST | `/api/crm/farmer/reactivate` | Gatilho reativação |
| GET | `/api/brain/logs` | Terminal cognitivo |

### 8.2 Marketing

| Método | Rota | Função |
|---|---|---|
| **POST** | **`/api/marketing/campaigns/dispatch`** | **Disparo campanha → 202 (NOVO)** |
| GET | `/api/marketing/campanhas` | Listar campanhas |
| POST | `/api/marketing/leads` | Capturar lead marketing |
| GET | `/api/marketing/reviews` | Reviews de hóspedes |
| POST | `/api/marketing/send-email` | Envio de email |
| GET | `/api/marketing/ai-strategy` | Estratégia de IA |

### 8.3 CRM (SB25)

| Método | Rota |
|---|---|
| CRUD | `/api/crm/contacts` |
| CRUD | `/api/crm/contacts/[id]` |
| POST | `/api/crm/contacts/[id]/interactions` |
| CRUD | `/api/crm/deals` |
| CRUD | `/api/crm/deals/[id]` |
| PATCH | `/api/crm/deals/[id]/stage` |
| CRUD | `/api/crm/tasks` |
| CRUD | `/api/crm/tasks/[id]` |
| GET | `/api/crm/pipelines` |

### 8.4 Guidebook (NOVO)

| Método | Rota | Função | Auth | Response |
|---|---|---|---|---|
| **POST** | **`/api/guidebook`** | Criar Guia Digital | JWT Guard | 201 |
| **GET** | **`/api/guidebook`** | Buscar Guia Digital | JWT Guard | 200/404 |

### 8.5 Agentes e Brain (14 rotas)

| Rota | Métodos |
|---|---|
| `/api/agents` | GET |
| `/api/agents/concierge` | POST |
| `/api/agents/financial`, `/api/agents/guardian`, etc. | POST |
| `/api/brain/chat` | POST |
| `/api/brain/health` | GET |
| `/api/brain/predict` | POST |
| `/api/brain/simulations` | POST |
| `/api/brain` | GET/POST |

### 8.6 Webhooks (6 rotas)

| Rota | Função |
|---|---|
| `/api/webhooks/whatsapp` | Mensagens WhatsApp (Evolution API) |
| `/api/webhooks/stripe` | Eventos Stripe (HMAC) |
| `/api/webhooks/pagamento` | Pagamento sinal |
| `/api/webhooks/pagarme` | Pagar.me |
| `/api/webhooks/pix` | Transações PIX |
| `/api/webhooks/delivery-events` | Eventos de entrega |

### 8.7 Financeiro (6 rotas)

| Rota | Métodos |
|---|---|
| `/api/financeiro/invoices` | CRUD |
| `/api/financeiro/invoices/[id]` | CRUD |
| `/api/financeiro/invoices/[id]/issue` | POST |
| `/api/financeiro/invoices/[id]/cancel` | POST |
| `/api/financeiro/payments/pix/initiate` | POST |
| `/api/financeiro/payments/[id]/refund` | POST |

### 8.8 Connect (5 rotas)

| Rota | Métodos |
|---|---|
| `/api/connect/profile` | CRUD |
| `/api/connect/profile/[slug]` | GET (público) |
| `/api/connect/links` | CRUD |
| `/api/connect/analytics` | GET/POST |
| `/api/connect/analytics/track` | POST |

### 8.9 Swipes / Scoring (8 rotas)

| Rota | Métodos |
|---|---|
| `/api/swipes` | CRUD |
| `/api/swipes/[id]` | CRUD |
| `/api/swipes/match` | GET |
| `/api/swipes/stats` | GET |
| `/api/swipes/track` | POST |
| `/api/swipes/send-email` | POST |
| `/api/swipes/seed` | POST |

### 8.10 Operacional + Infra (20+ rotas)

| Rota | Função |
|---|---|
| `/api/operacional/tarefas` | CRUD tarefas operacionais |
| `/api/rooms` | CRUD quartos |
| `/api/rooms/availability` | Disponibilidade |
| `/api/rooms/[id]` | Quarto específico |
| `/api/reservations` | CRUD reservas |
| `/api/pricing-rules` | CRUD regras de preço |
| `/api/revenue/kpis` | KPIs de receita |
| `/api/health` | Health check |
| `/api/system/health` | Health check sistema |
| `/api/onboarding` | POST onboarding wizard |
| `/api/trial` | GET/POST trial |
| `/api/tenant` | GET/POST tenant |
| `/api/terminal` | GET/POST terminal cognitivo |
| `/api/security` | GET/POST segurança |
| `/api/events/track` | POST tracking eventos |
| `/api/events/webhook` | POST webhook eventos |

---

## 9. FRONTEND

### 9.1 Smart Hooks (Fase 3)

| Hook | Função | Cache/StaleTime |
|---|---|---|
| `useLeadsKanban` | KanbanBoardDTO do backend | React Query |
| `useCognitiveTerminal` | Stream de logs + comandos brain | — |
| `useRoomBoard` | Grid de quartos com status | React Query |
| `useAuth` | Login JWT + localStorage | — |
| `useZehlaBrain` | Chat com o Brain (sendMessage) | — |
| `useCommercialStrategy` | Recomendação por lead + batch + forecast | staleTime 10min |
| `useOutboundEngine` | Dispatch individual + batch (3 variantes de dor) | Mutation |
| `useFarmerCandidates` | Candidatos reativação Farmer IA | useQuery + useMutation |

### 9.2 Dumb Components (Fase 2)

| Componente | Função |
|---|---|
| `LeadCard` | Card com LTV score, canal origem, tags |
| `KanbanBoard` | Colunas drag-and-drop (dnd-kit) com contagem |
| `CognitiveTerminal` | Console dark-mode, logs coloridos, agentes |
| `RoomGrid` | Grid responsivo (1-5 colunas) com status por cor |
| `KanbanCard` | Score colorido, ações por grupo |
| `ChatBubble` | Escalada, confidence score |
| `LoginFormUI` | Inputs email/password, loading state |
| `KanbanColumn` | Coluna de kanban vazia/preenchida |

### 9.3 Páginas ZCC

| Rota | Conteúdo |
|---|---|
| `/zcc/leads` | Kanban + terminal cognitivo |
| `/zcc/finance` | Dashboard financeiro |
| `/zcc/security` | Alertas de segurança |
| `/zcc/radar` | Radar Neural (mapa leads) |
| `/zcc/telemetry` | Telemetria |
| `/zcc/overview` | Visão geral |
| `/zcc/agents` | Agentes do sistema |
| `/zcc/dna` | ToneDNA cloner |

### 9.4 Funil Público (SB24)

**Landing:** HeroSection, FeaturesSection, PricingSection, CTASection (todas SSR)
**Onboarding Wizard (3 passos):** Step1 (dados) → Step2 (preferências) → Step3 (confirmação) → POST `/api/comercial/leads`
**Páginas:** `/` (landing), `/teste-gratis` (wizard)

### 9.5 Autenticação Visual (SB23 L5)

`/login` → `LoginFormUI` + `useAuth` com `Result<T,E>` → redireciona para `/zcc`

---

## 10. TESTES — 103+ VERDES

### 10.1 Domínio (83 testes)

| Suite | Arquivos | Testes |
|---|---|---|
| Guidebook | 2 | 28 (16 DigitalGuide + 12 GuideSection) |
| Comercial (ROI) | 1 | 10 |
| Marketing (CampaignOrch) | 1 | 20 |
| Financeiro | 7 | ~20 |
| Property | 15 | ~43 |
| Lead | 8 | ~93 |
| Reservation | 3 | ~84 |

### 10.2 Aplicação (20 testes)

| Suite | Testes |
|---|---|
| `CriarGuiaDigitalUseCase` | 5 |
| `SincronizarGuiaComSmartAIUseCase` | 4 |
| `ExecutarCampanhaMassaUseCase` (refatorado) | 10 |
| Marketing | ~12 |
| Property | 8 |

### 10.3 Integração HTTP (13 NOVOS)

**POST /api/guidebook (7 testes):**

```
✓ create guide successfully with valid data
✓ fail with 400 when id is missing
✓ fail with 400 when sections is empty
✓ fail with 400 when section has empty localized content
✓ return 200 on GET for existing guide
✓ return 404 on GET for non-existent guide
✓ reject duplicate guide per property (409)
```

**POST /api/marketing/campaigns/dispatch (6 testes):**

```
✓ return 202 on successful dispatch
✓ fail with 400 when campanhaId is missing
✓ fail with 404 when campaign does not exist
✓ fail with 400 when recipients is empty
✓ dispatch to queue with correct metadata
✓ handle multiple recipients with correct batch sizing
```

---

## 11. OSINT — MySmartHotel

### 11.1 Análise Realizada (22 Jun 2026)

| Tipo | Linhas |
|---|---|
| Análise competitiva | 584 |
| Mapeamento de vendas | 641 |
| DNS/Stack/Integrações | 306 |

### 11.2 Funcionalidades do MySmartHotel

- Channel Manager integrado a 20+ OTAs
- Dynamic Pricing por algoritmo
- Gestão de reservas multi-propriedade
- PMS completo (Property Management System)
- Gestão de housekeeping
- Relatórios financeiros

### 11.3 Diferenciais ZEHLA (MySmartHotel NÃO TEM)

| Diferencial | Prioridade |
|---|---|
| CRM com Thompson Sampling (Tese 2) | Estratégico |
| Agente de vendas sociais Instagram→CRM (Tese 6) | Estratégico |
| Follow-up engine com DSPy (Tese 3) | Estratégico |
| Revenue GraphRAG (Tese 5) | Estratégico |
| Swarm de agentes cognitivos (Ralph Loop) | Inovação |
| **Digital Guidebook para hóspedes (P0)** | **DIFERENCIADOR #1** |
| Mass Messaging Engine anti-banimento (P1) | Operacional |
| Calculadora de ROI contextual Brasil (P1) | Vendas B2B |
| Terminal Cognitivo | UX |
| Multi-Tenancy militarizado (4 camadas) | Segurança |

---

## 12. CRONOGRAMA SB

| SB | Entregas | Período |
|---|---|---|
| SB1-SB4 | Zaos-Shield: Núcleo Cognitivo, Swarm, Ralph Loop | Fundação |
| SB5-SB9 | Zaos-Shield: Pentest, HTTP, Hardening | Fundação |
| SB8 | Bounded Context Comercial + Prisma | Fundação |
| SB9-SB10 | Connect, Schema.org, Temas VZAPS | Fundação |
| SB11-SB14 | KB Graph, Operacional, Ze-Ops, Ze-Analyst | Maturação |
| SB15 | Revenue Persistência | Maturação |
| SB17-SB19 | Marketing Spec + Domínio + Persistência | Maturação |
| SB20 | Zé-Marketer Cognitivo | Maturação |
| SB21 | Adaptadores HTTP + Webhooks | CRM+Front |
| SB22 | Spec Frontend + React Query | CRM+Front |
| SB23 | Frontend (Hooks, Componentes, UI) | CRM+Front |
| SB24 | Funil Público + Onboarding | CRM+Front |
| SB25 | **CRM (8 Teses completas)** | CRM+Front |
| SB26 | Correções CI | DevOps |
| SB27 | Comercial FSM + Casos de Uso | DevOps |
| SB28 | Input Adapters Comercial | DevOps |
| SB29 | Zero-Trust CI Barrier | DevOps |
| SB29.5 | Expurgo TS (0 erros tsc) | DevOps |
| SB30 | Containerização Docker + Fly.io | Infra |
| SB31 | Caixa Preta + Telemetria | Infra |
| **SB32** | **OSINT + Guidebook P0 + Mass Messaging P1 + ROI Calc P1** | **ATUAL** |

---

## 13. MÉTRICAS DO PROJETO

| Métrica | Valor |
|---|---|
| Commits totais | 164 |
| Commits do autor | 184 (MarcioCau14) |
| Arquivos TypeScript | ~800 |
| Arquivos de teste | 111 |
| Arquivos de domínio | 159 |
| Bounded Contexts | 17 |
| Modelos Prisma | 44 |
| Enums Prisma | 15 |
| Filas BullMQ | 8 |
| Workers | 8 |
| Rotas HTTP | 120+ |
| Testes verdes | 103+ |
| Dependências produção | ~50 |
| Dependências dev | ~15 |
| Serviços Docker | 5 |
| Estágios CI | 6 |
| Branches | 1 (main) |

---

## 14. ESTADO ATUAL (SB32)

### ✅ Completo e Operante

- **103 testes verdes** (90 existentes + 13 novos de integração HTTP)
- **Digital Guidebook (P0)**: Domínio puro (DigitalGuide, GuideSection, enums), Porta (IDigitalGuideRepository), 2 Use Cases (Criar, Sincronizar), 2 Repositories (InMemory, Prisma Data Mapper), HTTP Routes (POST + GET)
- **Savings Calculator (P1)**: ROICalculator.ts com parâmetros Brasil (salário mínimo R$1.412, diária média R$250)
- **Mass Messaging Engine (P1)**: CampaignOrchestrator (segmento, schedule, batch sizing), ExecutarCampanhaMassaUseCase (BullMQ async, Gaussian delays), CampaignOutboundWorker (retry + DLQ)
- **Prisma Schema**: DigitalGuide (`@@unique(propertyId)`) + GuideSection (`content: Json`)
- **Data Mapper**: PrismaDigitalGuideRepository (toData/hydrate, isolamento total)
- **HTTP Routes**: POST `/api/guidebook` (201), GET `/api/guidebook` (200/404), POST `/api/marketing/campaigns/dispatch` (202)
- **CampaignOutboundWorker**: Consome `campaign-outbound`, 5 concorrência, sendTemplate, retry exponencial
- **BullMQ**: Fila `campaign-outbound` registrada em `QUEUE_NAMES`, `campaignOutboundQueue` exportada
- **TypeScript**: 0 erros (`tsc --noEmit`)
- **CI Pipeline**: Funcional (lint → typecheck → test → build)
- **Commits no GitHub**: `d8cf6cb` (implementação inicial) + `a6b9937` (correções arquiteturais)
- **JWT Guard**: HS256 em todas as rotas, extração de `tenantId`
- **Multi-Tenancy**: 4 camadas de proteção via Prisma Extension
- **Redis**: 3 instâncias (Session, Worker, AI) com Resilience Mode

### 🟡 Pendente (próxima sessão)

- Substituir `InMemoryDigitalGuideRepository` → `PrismaDigitalGuideRepository` nas rotas HTTP
- Testes de integração sb21 para as novas rotas
- Conectar `CampaignOutboundWorker` ao `IMessagingGateway` real (Evolution API WhatsApp)
- Rate limiting específico para `POST /api/marketing/campaigns/dispatch`

---

## 15. PRÓXIMOS PASSOS

### Imediatos

1. Substituir `InMemoryDigitalGuideRepository` por `PrismaDigitalGuideRepository` nas rotas HTTP (`/api/guidebook`)
2. Adicionar testes de integração sb21 para as novas rotas (POST/GET guidebook + dispatch)
3. Conectar `CampaignOutboundWorker` ao `IMessagingGateway` real (Evolution API WhatsApp)
4. Rate limiting específico para `/api/marketing/campaigns/dispatch` (proteção contra disparo acidental)

### Curto Prazo

5. Conectar DigitalGuide ao vector DB (GraphRAG) para alimentar SmartAI (respostas automáticas a hóspedes)
6. Acoplar ROICalculator ao Thompson Sampling para nutrição B2B automatizada
7. Aplicar DSPy nos Workers para variação semântica de prompts de campanha
8. Dashboard de campanhas no ZCC (status, taxa de entrega, falhas)

### Médio Prazo

9. Multi-idioma completo no Digital Guidebook (EN/ES/FR)
10. Template builder de campanhas (drag-and-drop de seções)
11. A/B testing de templates de campanha
12. Integração com SmartAI para resposta automática a perguntas de hóspedes via WhatsApp

### Visão de Longo Prazo

13. Expansão LATAM/Europa (i18n, multi-moeda, multi-timezone)
14. Channel Manager completo (Booking.com, Airbnb, Expedia)
15. Marketplace de integrações (API pública + webhooks públicos)
16. Swarm auto-gestionável com meta-aprendizado contínuo (Ralph Loop completo)

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   FIM DA MASTER DOCUMENTATION                                               ║
║   ZEHLA PRIME — SmartHotel Ecosystem                                        ║
║   Versão: SB32 | Junho 2026 | 103+ testes | 17 BCs | 800+ arquivos         ║
║   Repositório: https://github.com/MarcioCau14/SmartHotel_Zehla              ║
║   Autor: MarcioCau14                                                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
