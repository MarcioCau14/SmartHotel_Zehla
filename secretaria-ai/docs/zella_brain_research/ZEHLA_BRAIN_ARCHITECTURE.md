# ZEHLA BRAIN — Arquitetura do Sistema Cognitivo para Smart Hotels

> **Versão do Documento:** 1.0  
> **Propósito:** Documentar completa e exaustivamente o Cérebro ZEHLA para que qualquer ferramenta de IA ou engenheiro entenda linha a linha a arquitetura, componentes, fluxos e decisões técnicas.  
> **Projeto:** ZEHLA SmartHotel — Plataforma de Automação Comercial, Marketing e Hospitalidade para Pousadas.

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Camada de Domínio (Domain Layer)](#4-camada-de-domínio-domain-layer)
   - 4.1 [Domain / Comercial](#41-domain--comercial)
   - 4.2 [Domain / Lead (FSM do Funil)](#42-domain--lead-fsm-do-funil)
   - 4.3 [Domain / Guidebook](#43-domain--guidebook)
   - 4.4 [Domain / Marketing](#44-domain--marketing)
   - 4.5 [Domain / Hospitalidade](#45-domain--hospitalidade)
   - 4.6 [Domain / Operacional](#46-domain--operacional)
   - 4.7 [Domain / Revenue](#47-domain--revenue)
   - 4.8 [Domain / Shared (Result Type)](#48-domain--shared-result-type)
   - 4.9 [Domain / Outros](#49-domain--outros)
5. [Camada de Aplicação (Application Layer)](#5-camada-de-aplicação-application-layer)
   - 5.1 [Application / Comercial](#51-application--comercial)
   - 5.2 [Application / Marketing](#52-application--marketing)
   - 5.3 [Application / Guidebook](#53-application--guidebook)
   - 5.4 [Application / Hospitalidade](#54-application--hospitalidade)
   - 5.5 [Application / Operacional](#55-application--operacional)
   - 5.6 [Application / Revenue](#56-application--revenue)
6. [O Cérebro: lib/brain](#6-o-cérebro-libbrain)
   - 6.1 [AgentOrchestrator](#61-agentorchestrator)
   - 6.2 [AgentClosingEngine](#62-agentclosingengine)
   - 6.3 [LeadIntelligenceEngine](#63-leadintelligenceengine)
   - 6.4 [LeadScorer](#64-leadscorer)
   - 6.5 [IntentClassifier](#65-intentclassifier)
   - 6.6 [SwarmEngine](#66-swarmengine)
   - 6.7 [WhatsAppAgentService](#67-whatsappagentservice)
   - 6.8 [WhatsAppPersonaLearner](#68-whatsapppersonalearner)
   - 6.9 [ReceiptExtractor](#69-receiptextractor)
   - 6.10 [Processors](#610-processors)
   - 6.11 [Use Cases do Brain](#611-use-cases-do-brain)
   - 6.12 [FeatureGuard](#612-featureguard)
7. [Workers (BullMQ)](#7-workers-bullmq)
   - 7.1 [CaptureWorker](#71-captureworker)
   - 7.2 [ClassifyWorker](#72-classifyworker)
   - 7.3 [EnrichWorker](#73-enrichworker)
   - 7.4 [ScraperWorker](#74-scraperworker)
   - 7.5 [ValidateWorker](#75-validateworker)
   - 7.6 [TelemetryWorker](#76-telemetryworker)
   - 7.7 [CampaignOutboundWorker](#77-campaignoutboundworker)
   - 7.8 [GuardianAgent](#78-guardianagent)
8. [Infraestrutura](#8-infraestrutura)
   - 8.1 [Persistência (Prisma)](#81-persistência-prisma)
   - 8.2 [Messaging / Evolution API](#82-messaging--evolution-api)
   - 8.3 [Segurança / Hardening](#83-segurança--hardening)
   - 8.4 [HTTP / Autenticação](#84-http--autenticação)
   - 8.5 [Rate Limiting](#85-rate-limiting)
   - 8.6 [Serviços de Adaptadores](#86-serviços-de-adaptadores)
9. [API Routes (Entrypoints HTTP)](#9-api-routes-entrypoints-http)
   - 9.1 [Webhooks](#91-webhooks)
   - 9.2 [Brain API](#92-brain-api)
   - 9.3 [Comercial](#93-comercial)
   - 9.4 [Marketing](#94-marketing)
   - 9.5 [Guidebook](#95-guidebook)
   - 9.6 [Hospitalidade](#96-hospitalidade)
   - 9.7 [Outras Rotas](#97-outras-rotas)
10. [Infraestrutura de Suporte (lib/)](#10-infraestrutura-de-suporte-lib)
    - 10.1 [AI / LLM Router](#101-ai--llm-router)
    - 10.2 [Redis](#102-redis)
    - 10.3 [Queues (BullMQ)](#103-queues-bullmq)
    - 10.4 [Prisma Client](#104-prisma-client)
    - 10.5 [Observability / CognitiveTerminal](#105-observability--cognititerminal)
    - 10.6 [Swipe Engine](#106-swipe-engine)
    - 10.7 [ZMG (Zé Marketing Growth)](#107-zmg-zé-marketing-growth)
    - 10.8 [ZCC (ZEHLA Command Center)](#108-zcc-zehla-command-center)
    - 10.9 [Delivery Machine](#109-delivery-machine)
    - 10.10 [Security](#1010-security)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Docker / Infraestrutura Local](#12-docker--infraestrutura-local)
13. [Modelo de Dados (Prisma Schema)](#13-modelo-de-dados-prisma-schema)
14. [Máquina de Estados Finita (FSM)](#14-máquina-de-estados-finita-fsm)
    - 14.1 [Lead Status FSM](#141-lead-status-fsm)
    - 14.2 [Funnel Stages](#142-funnel-stages)
    - 14.3 [Campaign Status FSM](#143-campaign-status-fsm)
15. [Fluxos Transversais](#15-fluxos-transversais)
    - 15.1 [Fluxo de Captura de Lead](#151-fluxo-de-captura-de-lead)
    - 15.2 [Fluxo de Campanha em Massa](#152-fluxo-de-campanha-em-massa)
    - 15.3 [Fluxo do Concierge IA](#153-fluxo-do-concierge-ia)
    - 15.4 [Fluxo de Webhook (Zero-Trust)](#154-fluxo-de-webhook-zero-trust)
16. [Decisões Arquiteturais](#16-decisões-arquiteturais)
17. [Erros Discriminados (Discriminated Unions)](#17-erros-discriminados-discriminated-unions)
18. [Glossário](#18-glossário)

---

## 1. Visão Geral da Arquitetura

O ZEHLA Brain é um sistema cognitivo multi-agente projetado para automatizar completamente a operação de pousadas brasileiras. A arquitetura segue **Clean Architecture** com **Domain-Driven Design (DDD)**, utilizando **TypeScript** em todo o stack.

### Princípios Arquiteturais Fundamentais

1. **Pure Domain**: Entidades imutáveis (`Object.freeze`), Value Objects congelados, `Result<T,E>` em todos os retornos
2. **Anemic Controllers**: Controllers HTTP fazem apenas parse de request, autenticação JWT, chamada de Use Case e tradução de `Result` para HTTP status
3. **Async-first**: Disparo de campanhas SEMPRE assíncrono via BullMQ (anti-ban anti-spam)
4. **Zero-Trust**: Webhooks validados com HMAC + timingSafeEqual
5. **Tenant Isolation**: RLS (Row-Level Security) por `propertyId` em TODAS as queries
6. **Fail-Fast**: Validação de payload antes de qualquer I/O (rate limit, Redis, DB)
7. **Spec-Driven Development**: FSM propagada do documento SPEC para código

### Camadas

```
┌─────────────────────────────────────────────┐
│           API Routes (Next.js App Router)     │
│  JWT Guard → Rate Limit → Validation → UC    │
├─────────────────────────────────────────────┤
│         Application Layer (Use Cases)         │
│  Coordenação de fluxo, orquestração           │
├─────────────────────────────────────────────┤
│         Domain Layer (Entidades, VOs, FSM)    │
│  Regras de negócio imutáveis, Result<T,E>     │
├─────────────────────────────────────────────┤
│     Infrastructure Layer (Adaptadores)        │
│  Prisma, Redis, Evolution API, HMAC, etc      │
├─────────────────────────────────────────────┤
│         Workers (BullMQ Background Jobs)      │
│  Capture → Classify → Enrich → Validate       │
│  CampaignOutbound, Guardian Agent             │
└─────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológica

| Componente | Tecnologia | Versão |
|---|---|---|
| Runtime | Node.js | 20+ |
| Framework Web | Next.js (App Router) | 14+ |
| Linguagem | TypeScript | 5.x (strict) |
| ORM | Prisma | 5.22 |
| Banco Principal | PostgreSQL | 16 |
| Cache/Fila | Redis (ioredis) | 7 |
| Fila de Jobs | BullMQ | 4+ |
| Rate Limiter | rate-limiter-flexible | 2+ |
| LLM Router | OpenRouter + Ollama | - |
| Mensageria WhatsApp | Evolution API | - |
| Orchestrador | Docker Compose | - |
| CI/CD | GitHub Actions | - |
| Testes | Vitest | 4.x |
| Gerenciador de Pacotes | pnpm | 9 |
| Prometheus + Grafana | Monitoramento | - |

---

## 3. Estrutura de Diretórios

```
zehla-backend/
├── src/
│   ├── app/api/          # API Routes (Next.js App Router)
│   ├── application/      # Use Cases (Casos de Uso)
│   ├── domain/           # Entidades, VOs, Enums, FSM
│   ├── infrastructure/   # Adaptadores (Prisma, HTTP, Messaging)
│   ├── lib/              # Utilitários Core (Brain, AI, Redis, Security)
│   ├── workers/          # BullMQ Workers
│   ├── services/         # Serviços (Adapters, EventKernel)
│   ├── __tests__/        # Testes
│   ├── components/       # Componentes React (Frontend)
│   └── shared/           # Result Type Compartilhado
├── prisma/
│   ├── schema.prisma     # Modelo de Dados (2720 linhas, 124+ modelos)
│   ├── migrations/       # Migrações Prisma
│   └── seed.ts           # Seeds
├── docker-compose.yml    # PostgreSQL, Redis, Evolution API, Prometheus, Grafana
├── .github/workflows/    # CI/CD
└── BLUEPRINTS/           # Arquivos de especificação
    └── INTELLIGENCE/     # Scripts de inteligência
```

---

## 4. Camada de Domínio (Domain Layer)

### 4.1 Domain / Comercial

**Localização:** `src/domain/comercial/`

#### Entidades (`src/domain/comercial/entities/`)

| Arquivo | Descrição | Key Exports |
|---|---|---|
| `Lead.ts` | Entidade Lead com FSM de 7 estados | `Lead` class, `LeadStatus` type, `LeadProps` |
| `Proposta.ts` | Proposta comercial | `Proposta` class |
| `Pagamento.ts` | Pagamento | `Pagamento` class |
| `Pacote.ts` | Pacote de serviços | `Pacote` class |
| `Conversao.ts` | Conversão de lead | `Conversao` class |

**Lead.ts** — Entidade central. Estados: `prospect | qualified | trial | negotiation | converted | churned | reactivated`. Métodos de transição: `qualificar()`, `iniciarTrial()`, `negociar()`, `converter()`, `churn()`, `reativar()`. Helper `_transition()`. Imutável via `Object.freeze`. Retorna `Result<Lead, Error>` em todas as mutações.

#### Value Objects (`src/domain/comercial/value-objects/`)

| Arquivo | Descrição |
|---|---|
| `Canal.ts` | Canal de captura (site, whatsapp, indicacao, etc) |
| `Email.ts` | Email validado |
| `Documento.ts` | CPF/CNPJ |
| `Score.ts` | Score 0-100 com `isQualificado()` |
| `Telefone.ts` | Telefone |
| `Nome.ts` | Nome próprio |
| `Endereco.ts` | Endereço |
| `StatusLead.ts` | Status do lead |

#### Erros (`src/domain/comercial/errors.ts`)

Discriminated unions para erros comerciais:
- `LeadError` (9 códigos: `LEAD_NOT_FOUND`, `DUPLICATE_LEAD`, `INVALID_TRANSITION`, etc.)
- `PropostaError`
- `RoiError`
- `CommercialError` (união de todos)

### 4.2 Domain / Lead (FSM do Funil)

**Localização:** `src/domain/lead/`

| Arquivo | Descrição |
|---|---|
| `LeadStatus.ts` | FSM completa: enum `LeadStatus`, `canTransitionLeadStatus()`, `FunnelStage`, `canTransitionFunnelStage()`, `Cluster`, `deriveCluster()`, `BehaviorProfile` |
| `LeadEventType.ts` | Tipos de evento: `EMAIL_OPEN`, `LINK_CLICK`, `WHATSAPP_REPLY`, etc. |
| `LeadSource.ts` | Fontes de lead: `SECRETARIA_AI`, `INDICACAO`, `SITE`, etc. |

**LeadStatus Enum:**
```typescript
enum LeadStatus {
  PROSPECT, QUALIFIED, TRIAL, NEGOTIATION, CONVERTED, CHURNED, REACTIVATED, BLACKLISTED
}
```

**Transições Válidas:**
```
PROSPECT → QUALIFIED | BLACKLISTED
QUALIFIED → TRIAL | NEGOTIATION | BLACKLISTED
TRIAL → NEGOTIATION | CONVERTED | CHURNED | BLACKLISTED
NEGOTIATION → CONVERTED | CHURNED | BLACKLISTED
CONVERTED → CHURNED
CHURNED → REACTIVATED
REACTIVATED → QUALIFIED | CHURNED | BLACKLISTED
BLACKLISTED → (terminal)
```

**Funnel Stages (9 estágios):**
`NEUTRAL(0) → AWARE(1) → INTERESTED(2) → ENGAGED(3) → TRIAL(4) → NEGOTIATION(5) → CONVERTED(6) → CHURNED(7) | REACTIVATED(1)`

**Clusters:** `HOT(score >= 60) | WARM(score >= 30) | COLD`

**BehaviorProfiles:** `analítico | urgente | curioso | resistente | conservador`

### 4.3 Domain / Guidebook

**Localização:** `src/domain/guidebook/`

| Arquivo | Descrição |
|---|---|
| `entities/DigitalGuide.ts` | Guia digital da pousada |
| `value-objects/GuideSection.ts` | Seção do guia (wifi, cafe, etc) com `Array.isArray` guard |
| `enums.ts` | `GuideStatus`, `GuideSectionType` |
| `errors.ts` | `GuidebookError` — 12 códigos (discriminated union) |

**DigitalGuide** — Entidade imutável com FSM de status: `rascunho → publicado | arquivado`. Métodos: `addSection()`, `removeSection()`, `reorderSections()`, `publish()`, `archive()`. Eventos de domínio: `GuiaDigitalCriadoEvent`, `SecaoAdicionadaEvent`, `GuiaPublicadoEvent`.

**GuideSection** — Value Object com `LocalizedContent[]`. Protegido contra `TypeError` com `Array.isArray(props.content)` (correção SB33).

### 4.4 Domain / Marketing

**Localização:** `src/domain/marketing/`

| Arquivo | Descrição |
|---|---|
| `entities/` | Entidades de marketing |
| `services/CampaignOrchestrator.ts` | Orquestrador de campanhas |
| `value-objects/` | VOs de marketing |
| `errors.ts` | `CampaignError`, `PostError`, `ReviewError`, `MetricaError`, `ConteudoError`, `MarketingError` |
| `events/` | Eventos de domínio |

**CampaignOrchestrator** — Serviço de domínio que valida schedule, segmentos, transições de status (`agendada → em_envio → concluida | cancelada`). Calcula batch size, estima duração, valida janela de envio (9h-20h).

### 4.5 Domain / Hospitalidade

**Localização:** `src/domain/hospitalidade/`

| Arquivo | Descrição |
|---|---|
| `entities/` | Entidades de hospitalidade (Concierge, Servicos, etc) |
| `value-objects/` | VOs de hospitalidade |
| `events/` | Eventos de domínio |

### 4.6 Domain / Operacional

**Localização:** `src/domain/operacional/`

Entidades e VOs para tarefas operacionais (Zé-Ops).

### 4.7 Domain / Revenue

**Localização:** `src/domain/revenue/`

Entidades e VOs para yield management, tarifas, break-even (Zé-Analyst).

### 4.8 Domain / Shared (Result Type)

**Localização:** `src/domain/shared/Result.ts`

```typescript
class Result<T, E = Error> {
  static ok<T, E>(value: T): Result<T, E>
  static fail<T, E>(error: E): Result<T, E>
  get isOk(): boolean
  get isFail(): boolean
  get value(): T
  get error(): E
  map<U>(fn: (value: T) => U): Result<U, E>
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>
  getOrElse(defaultValue: T): T
}
```

**Padrão:** TODOS os retornos de domínio e use cases usam `Result<T, E>`. NUNCA lançam exceções (exceptions são para erros de infraestrutura, catchadas no controller).

### 4.9 Domain / Outros

| Diretório | Propósito |
|---|---|
| `domain/finance/` | Entidades financeiras |
| `domain/financeiro/` | Entidades financeiras (legado) |
| `domain/property/` | Entidades de propriedade |
| `domain/reservation/` | Entidades de reserva |
| `domain/room/` | Entidades de quarto |
| `domain/hardening/` | Value Objects de hardening (ex: `TenantSession`) |
| `domain/plan/` | Entidades de plano/assinatura |
| `domain/sales/` | Entidades de vendas |
| `domain/security/` | Entidades de segurança |
| `domain/memory/` | Entidades de memória do agente |
| `domain/knowledge/` | Entidades de conhecimento |
| `domain/swarm/` | Entidades do swarm de agents |
| `domain/decision/` | Entidades de decisão |
| `domain/evolution/` | Entidades de evolução |

---

## 5. Camada de Aplicação (Application Layer)

### 5.1 Application / Comercial

**Localização:** `src/application/comercial/`

#### Ports (`ports/`)

| Arquivo | Interface | Métodos Principais |
|---|---|---|
| `ILeadPort.ts` | `ILeadPort` | `criarLead()`, `buscarLeadPorId()`, `listarLeadsPorPropriedade()`, `atualizarLead()`, `atualizarScoreLead()`, `buscarLeadPorEmail()`, `buscarLeadPorDocumento()` |
| `IPropostaPort.ts` | `IPropostaPort` | CRUD de propostas |
| `IPacotePort.ts` | `IPacotePort` | CRUD de pacotes |
| `IPagamentoPort.ts` | `IPagamentoPort` | CRUD de pagamentos |
| `IConversaoPort.ts` | `IConversaoPort` | CRUD de conversões |

#### Use Cases (`use-cases/`)

| Arquivo | Classe | Função |
|---|---|---|
| `CapturarLeadUseCase.ts` | `CapturarLeadUseCase` | Captura lead validando canal, email (duplicidade), documento. Reativa se churned |
| `QualificarLeadUseCase.ts` | `QualificarLeadUseCase` | Qualifica lead (prospect → qualified), delega transição ao domínio |
| `CriarPropostaUseCase.ts` | `CriarPropostaUseCase` | Cria proposta comercial |
| `AceitarPropostaUseCase.ts` | `AceitarPropostaUseCase` | Aceita proposta |
| `SugerirDescontoUseCase.ts` | `SugerirDescontoUseCase` | Sugere desconto inteligente |
| `ConfirmarPagamentoUseCase.ts` | `ConfirmarPagamentoUseCase` | Confirma pagamento |
| `CalcularTaxaConversaoUseCase.ts` | `CalcularTaxaConversaoUseCase` | Calcula taxa de conversão |
| `ProcessarPropostasExpiradasUseCase.ts` | `ProcessarPropostasExpiradasUseCase` | Processa propostas expiradas |

#### Cognitive (`cognitive/`)

| Arquivo | Classe | Função |
|---|---|---|
| `ZeSalesCognitiveService.ts` | `ZeSalesCognitiveService` | Serviço cognitivo de vendas. Processa intents (`CAPTURAR_LEAD`, `QUALIFICAR_LEAD`, `CRIAR_PROPOSTA`, etc.) via roteador de intenções |

**ZeSalesCognitiveService** — Orquestrador de intenções comerciais. Recebe `{ intent, messageId, propriedadeId, payload }` e roteia para o Use Case correto. Usa `ZCP_SECRET` para validação. Retorna `{ success, responseId, responseText, confidenceScore, needsEscalation, handoffRequired, data? }`.

### 5.2 Application / Marketing

**Localização:** `src/application/marketing/`

#### Ports

| Arquivo | Interface | Descrição |
|---|---|---|
| `IMessagingGateway.ts` | `IMessagingGateway` | `sendTemplate()`, `sendText()`, `getDeliveryStatus()` |
| `ICampanhaRepository.ts` | `ICampanhaRepository` | CRUD de campanhas |

#### Use Cases

| Arquivo | Classe | Função |
|---|---|---|
| `ExecutarCampanhaMassaUseCase.ts` | `ExecutarCampanhaMassaUseCase` | Executa campanha em massa. Valida schedule, segmento. Envia batches para BullMQ. Retorna 202 |

### 5.3 Application / Guidebook

**Localização:** `src/application/guidebook/`

#### Ports

| Arquivo | Interface | Descrição |
|---|---|---|
| `IDigitalGuideRepository.ts` | `IDigitalGuideRepository` | `save()`, `findByPropertyId()` |

#### Use Cases

| Arquivo | Classe | Função |
|---|---|---|
| `CriarGuiaDigitalUseCase.ts` | `CriarGuiaDigitalUseCase` | Cria guia digital. Valida duplicidade por propertyId |
| `SincronizarGuiaComSmartAIUseCase.ts` | `SincronizarGuiaComSmartAIUseCase` | Sincroniza com IA |

### 5.4 Application / Hospitalidade

**Localização:** `src/application/hospitalidade/`

Ports e Use Cases para Concierge, serviços de hospitalidade.

### 5.5 Application / Operacional

**Localização:** `src/application/operacional/`

Ports e Use Cases para tarefas operacionais (Zé-Ops).

### 5.6 Application / Revenue

**Localização:** `src/application/revenue/`

Ports e Use Cases para yield, tarifas, break-even (Zé-Analyst).

---

## 6. O Cérebro: lib/brain

**Localização:** `src/lib/brain/`

Este é o coração cognitivo do ZEHLA. Contém os agentes de IA, motores de scoring, classificadores de intenção e orquestradores de conversação.

### 6.1 AgentOrchestrator

**Arquivo:** `agent-orchestrator.ts`

**Classe:** `AgentOrchestrator`

**Pipeline de Processamento (10 estágios):**

1. **Security Validation** — `SecurityProcessor.validate()` contra PII e Injection
2. **Intent Classification** — `classifyIntent()` (placeholder → integração com LLM real)
3. **Trial Validation** — Verifica se propriedade está em trial ativo
4. **Supplier Inquiry** — Se fornecedor e canal é GUESTS_ONLY, redireciona
5. **Receipt Extraction** — `ReceiptExtractor.extract()` detecta comprovantes de pagamento
6. **Prompt Building** — `PromptBuilder.build()` constrói prompts contextuais
7. **Semantic Cache** — Cache de respostas por `userPrompt + propertyId` para economizar tokens
8. **LLM Execution** — `llmRouter.generate()` com modelo `reasoning` ou `general`
9. **Logging** — Persiste em `agentLog` no banco
10. **Voice Metadata** — Se plano PRO/MAX, adiciona parâmetros de voz neural

**Modelos LLM:**
- `reasoning` (DeepSeek-R1 / Kimi K2.6) — para tática de vendas
- `general` (Qwen, Llama, Mistral) — para atendimento geral

**Voice Adaptation (DNAVoiceAdapter):**
- Plano PRO: voz habilitada, parâmetros padrão
- Plano MAX: parâmetros adaptativos (taxa, pitch, estilo, emotividade)

### 6.2 AgentClosingEngine

**Arquivo:** `agent-closing-engine.ts`

**Classe:** `AgentClosingEngine`

**Máquina de Conversão (6 estados):**
`IDLE → QUALIFYING → AVAILABILITY → QUOTATION → OBJECTION → CLOSING → HANDOVER`

**Pipeline:**
1. **Carga de Contexto** — Carrega property, persona (WhatsAppPersonaLearner), trends (clima + feriados), lead
2. **Auditoria de Disponibilidade** — Escassez real (quartos livres vs ocupados)
3. **Detecção de Handover** — Palavras gatilho: "falar com humano", "reclamação", etc.
4. **Geração Tática** — LLM com prompt de fechamento via `reasoning` model
5. **Trend Injection** — Clima e feriados como argumentos de venda

### 6.3 LeadIntelligenceEngine

**Arquivo:** `lead-intelligence-engine.ts`

**Classe:** `LeadIntelligenceEngine`

**Pipeline Assíncrona (4 camadas):**

1. **Event Ingestion** — Encaminha eventos para `captureQueue` (BullMQ). Fallback síncrono se Redis indisponível
2. **Memory & Scoring** — Recalcula score e estágio do funil baseado no histórico de eventos
3. **Profile Detection** — Detecta perfil comportamental: `urgente | curioso | resistente | analítico`
4. **Funnel Stage Detection** — `NEUTRAL → AWARE → INTERESTED → ENGAGED → TRIAL → CONVERTED`

**Métodos:**
- `processEventAsync(data)` — Pipeline assíncrona via BullMQ
- `trackEvent(data)` — Fallback síncrono
- `refreshBrain(lead)` — Atualiza conversionScore, behavioralProfile, funnelStage

### 6.4 LeadScorer

**Arquivo:** `lead-scorer.ts`

**Classe:** `LeadScorer`

- `calculateEventScore(events)` — Calcula score baseado em eventos
- `calculateConversionProbability(lead, events)` — Probabilidade de conversão

### 6.5 IntentClassifier

**Arquivo:** `intent-classifier.ts`

**Função:** `classifyIntent(message: string)` → `{ intent, confidence, entities }`

Intenções suportadas:
- `GREETING`, `PRICE_INQUIRY`, `RESERVATION_CREATE`, `RESERVATION_MODIFY`, `RESERVATION_CANCEL`
- `ROOM_AVAILABILITY`, `CHECK_IN`, `CHECK_OUT`, `HOUSEKEEPING_REQUEST`
- `AMENITIES_INQUIRY`, `LOCAL_INFO`, `PAYMENT_STATUS`, `CANCELATION_POLICY`
- `SUPPLIER_INQUIRY`, `FAREWELL`, `UNKNOWN`

### 6.6 SwarmEngine

**Arquivo:** `swarm-engine.ts`

**Classe:** `SwarmEngine`

Orquestrador de múltiplos agentes para tarefas complexas. Coordena comunicação entre agentes especializados.

### 6.7 WhatsAppAgentService

**Arquivo:** `whatsapp-agent-service.ts`

**Classe:** `WhatsAppAgentService`

Serviço de agente para WhatsApp. Gerencia conversas, aplica personalidade, processa mensagens.

### 6.8 WhatsAppPersonaLearner

**Arquivo:** `whatsapp-persona-learner.ts`

**Classe:** `WhatsappPersonaLearner`

Aprende a personalidade do hoteleiro baseado no histórico de conversas. Gera `tone`, `rules`, `commonExpressions` para cada propriedade.

### 6.9 ReceiptExtractor

**Arquivo:** `receipt-extractor.ts`

**Classe:** `ReceiptExtractor`

Extrai dados de comprovantes de pagamento de mensagens de texto (PIX, transferência, etc.).

### 6.10 Processors

**Localização:** `src/lib/brain/processors/`

| Arquivo | Classe/Função | Descrição |
|---|---|---|
| `SecurityProcessor.ts` | `SecurityProcessor` | Valida segurança da mensagem (PII, injection) |
| `TrialValidator.ts` | `TrialValidator` | Valida trial da propriedade |
| `PromptBuilder.ts` | `PromptBuilder` | Constrói prompts contextuais para LLM |

### 6.11 Use Cases do Brain

**Localização:** `src/lib/brain/use-cases/`

| Arquivo | Classe | Descrição |
|---|---|---|
| `ProcessPaymentProofUseCase.ts` | `ProcessPaymentProofUseCase` | Processa comprovante de pagamento |

### 6.12 FeatureGuard

**Arquivo:** `feature-guard.ts`

Controla liberação de features por plano/propriedade.

---

## 7. Workers (BullMQ)

**Localização:** `src/workers/`

Fila de processamento assíncrono com 8 workers. Utiliza BullMQ com Redis como backend.

### 7.1 CaptureWorker

**Arquivo:** `captureWorker.ts`

**Fila:** `QUEUE_NAMES.CAPTURE`

**Pipeline:** Rate limiting por email (100/hora) → Deduplicação SHA-256 (janela de 1h) → Score impact → Encaminha para ValidateQueue

**Rate Limit:** `brain:rate:{email}` — 100 eventos/hora via Redis INCR + EXPIRE

**Deduplicação:** `${email}:${fingerprint}:${eventType}:${hourWindow}` → SHA-256 → busca em `leadEvent.dedupHash`

### 7.2 ClassifyWorker

**Arquivo:** `classifyWorker.ts`

**Fila:** `QUEUE_NAMES.CLASSIFY`

Classifica eventos e leads usando ML/regras.

### 7.3 EnrichWorker

**Arquivo:** `enrichWorker.ts`

**Fila:** `QUEUE_NAMES.ENRICH`

Enriquece dados de leads (geolocalização, score, etc.).

### 7.4 ScraperWorker

**Arquivo:** `scraperWorker.ts`

**Fila:** `QUEUE_NAMES.SCRAPER`

Worker de scraping para coleta de dados de fontes públicas.

### 7.5 ValidateWorker

**Arquivo:** `validateWorker.ts`

**Fila:** `QUEUE_NAMES.VALIDATE`

Valida eventos processados.

### 7.6 TelemetryWorker

**Arquivo:** `telemetry-worker.ts`

**Fila:** `QUEUE_NAMES.TELEMETRY`

Coleta e processa telemetria.

### 7.7 CampaignOutboundWorker

**Arquivo:** `campaignOutboundWorker.ts` → delega para `src/infrastructure/workers/CampaignOutboundWorker`

**Fila:** `campaign-outbound`

**Funcionamento:**
1. Recebe `BatchJobData` com campanha, template, destinatários
2. Para cada destinatário, personaliza variáveis (`{{nome}}`, `{{id}}`)
3. Chama `IMessagingGateway.sendTemplate()` (Evolution API)
4. Acumula resultados (sent/failed)
5. Se batch inteiro falha → throw (BullMQ retry com exponential backoff)
6. Se falha permanente → DLQ → `sendWhatsAppAlert()`

**Configuração:**
- `concurrency: 5`
- `lockDuration: 120000`
- `maxStalledCount: 3`
- Conexão: `redisWorker` (DB 1)

### 7.8 GuardianAgent

**Arquivo:** `guardian-agent.ts`

**Classe:** `GuardianAgent`

Agente de segurança contínuo. Escuta stream Redis `guardian:alerts` via XREAD.

**Regras de Segurança:**

| Alerta | Severidade | Threshold | Ações |
|---|---|---|---|
| `CANARY_TOUCHED` | CRITICAL | 1 | ALERT, BLOCK, ISOLATE |
| `HMAC_FAIL` | HIGH | 3/5min | ALERT, BLOCK |
| `BRUTE_FORCE` | HIGH | 5/5min | CHALLENGE, ALERT |
| `SUSPICIOUS_PATTERN` | MEDIUM | 10/10min | LOG, ALERT |

**Ações:** `LOG | ALERT | CHALLENGE (MFA) | BLOCK (IP) | ISOLATE (Tenant)`

**Métricas Prometheus:** Porta 9091, endpoints: `/metrics`

---

## 8. Infraestrutura

### 8.1 Persistência (Prisma)

**Localização:** `src/infrastructure/persistence/`

| Diretório | Repositório | Interface Implementada |
|---|---|---|
| `comercial/PrismaLeadRepository.ts` | `PrismaLeadRepository` | `ILeadPort` |
| `guidebook/PrismaDigitalGuideRepository.ts` | `PrismaDigitalGuideRepository` | `IDigitalGuideRepository` |
| `marketing/PrismaCampanhaRepository.ts` | `PrismaCampanhaRepository` | `ICampanhaRepository` |
| `guidebook/` | PrismaDigitalGuideRepository | + Data Mapper (toData/hydrate) |

**Padrão Data Mapper:** Todos os repositórios convertem entre Prisma models e entidades de domínio usando `toData()` e `hydrate()`. NUNCA expõem tipos do `@prisma/client` para o domínio.

**PrismaLeadRepository** — Implementa `ILeadPort` com:
- RLS por `propriedadeId` em TODAS as queries
- Validação de domínio via `Lead.create()` antes de persistir
- `toData()` serializa entidade → Prisma
- `hydrate()` desserializa Prisma → entidade

### 8.2 Messaging / Evolution API

**Localização:** `src/infrastructure/messaging/`

| Arquivo | Classe | Descrição |
|---|---|---|
| `EvolutionApiMessagingGateway.ts` | `EvolutionApiMessagingGateway` | Implementa `IMessagingGateway`. Wrapper do `EvolutionWhatsAppAdapter` |

**EvolutionWhatsAppAdapter** (`src/infrastructure/external/evolution/`): Adaptador HTTP para Evolution API. Envia mensagens WhatsApp com delay configurável.

**Configuração:** `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` via env vars.

### 8.3 Segurança / Hardening

**Localização:** `src/infrastructure/hardening/`

| Arquivo | Classe | Descrição |
|---|---|---|
| `JwtGuard.ts` | `JwtGuard` | Guard JWT com HS256. `sign()` e `validate()` retornam `Result<TenantSession, Error>` |
| `HMACValidator.ts` | (módulo) | Validação HMAC-SHA256 com `crypto.timingSafeEqual` |

### 8.4 HTTP / Autenticação

**Localização:** `src/infrastructure/http/auth/`

| Arquivo | Função | Descrição |
|---|---|---|
| `jwtAuth.ts` | `authenticateRequest()` | Extrai Bearer token, valida com JwtGuard, retorna `TenantSession` |
| `hmacAuth.ts` | `verifyHmacSignature()` | Valida HMAC-SHA256 com timingSafeEqual |

### 8.5 Rate Limiting

**Localização:** `src/lib/security/`

| Arquivo | Descrição |
|---|---|
| `rate-limit.ts` | 4 limiters predefinidos (`api`, `campaign`, `webhook`, `auth`) + `rateLimit()` genérico + `checkRateLimit()` |
| `rate-limit-webhook.ts` | `webhookRateGuard(request)` — guard IP-based para webhooks |

**Limiters:**
- `api`: 50 requests/60s
- `campaign`: 1 request/600s (10 min)
- `webhook`: 100 requests/60s
- `auth`: 10 requests/60s

### 8.6 Serviços de Adaptadores

**Localização:** `src/services/adapters/`

| Arquivo | Classe | Descrição |
|---|---|---|
| `BaseHttpAdapter.ts` | `BaseHttpAdapter` | Adaptador HTTP base |
| `SalesServiceAdapter.ts` | `SalesServiceAdapter` | Adaptador para serviço de vendas |
| `MarketingServiceAdapter.ts` | `MarketingServiceAdapter` | Adaptador para marketing |
| `HospitalityServiceAdapter.ts` | `HospitalityServiceAdapter` | Adaptador para hospitalidade |
| `OperationsServiceAdapter.ts` | `OperationsServiceAdapter` | Adaptador para operações |
| `RevenueServiceAdapter.ts` | `RevenueServiceAdapter` | Adaptador para revenue |

---

## 9. API Routes (Entrypoints HTTP)

**Localização:** `src/app/api/`

Todas as rotas seguem o padrão:
1. Parse do request (body, headers)
2. Autenticação (JWT Guard ou HMAC)
3. Rate Limit (se aplicável)
4. Validação do payload
5. Instanciação do Use Case
6. Execução
7. Tradução de `Result` para HTTP status

### 9.1 Webhooks

**Localização:** `src/app/api/webhooks/`

| Rota | Método | Proteção | Função |
|---|---|---|---|
| `/api/webhooks/whatsapp` | POST | HMAC SHA-256 + Rate Limit | Recebe mensagens do WhatsApp |
| `/api/webhooks/stripe` | POST | HMAC + Rate Limit | Webhook do Stripe |
| `/api/webhooks/pagamento` | POST | HMAC + Rate Limit | Webhook de pagamento |
| `/api/webhooks/pagarme` | POST | Rate Limit | Webhook do PagarMe |
| `/api/webhooks/pix` | POST | Rate Limit | Webhook PIX |
| `/api/webhooks/delivery-events` | POST | HMAC `x-zehla-signature` + IdempotencyGuard + Rate Limit | Recebe status de delivery (SENT, DELIVERED, READ, FAILED) |

**WhatsApp Webhook:** Extrai raw body → `text()`, verifica `X-Hub-Signature-256` com `verifyHmacSignature()`, retorna 401 se inválido.

**Delivery Events:** Verifica `x-zehla-signature` com `WebhookSigner.verify()`, proteção contra duplicidade com `IdempotencyGuard`.

### 9.2 Brain API

**Localização:** `src/app/api/brain/`

| Rota | Método | Função |
|---|---|---|
| `/api/brain` | POST | Gateway para operações do cérebro: `CLASSIFY_INTENT`, `GENERATE_RESPONSE`, `HEALTH_CHECK` |
| `/api/brain` | GET | Status do brain: modelos locais e cloud |
| `/api/brain/health` | GET | Health check do brain |
| `/api/brain/chat` | POST | Chat com o agente |
| `/api/brain/predict` | POST | Predições do brain |
| `/api/brain/simulations` | POST | Simulações |

### 9.3 Comercial

**Localização:** `src/app/api/comercial/`

| Rota | Método | Use Case | Descrição |
|---|---|---|---|
| `/api/comercial/leads` | POST | `ZeSalesCognitiveService.processIntent()` | Captura/qualifica leads via intent router |
| `/api/comercial/propostas` | POST | `ZeSalesCognitiveService.processIntent()` | Gerencia propostas |

### 9.4 Marketing

**Localização:** `src/app/api/marketing/`

| Rota | Método | Use Case | Descrição |
|---|---|---|---|
| `/api/marketing/campanhas` | POST | (CRUD campanhas) | Gerencia campanhas |
| `/api/marketing/reviews` | POST | (CRUD reviews) | Gerencia reviews |
| `/api/marketing/ai-strategy` | POST | Estratégia de IA | Geração de estratégia |
| `/api/marketing/leads` | POST | Lead capture marketing | Captura leads |
| `/api/marketing/campaigns/dispatch` | POST | `ExecutarCampanhaMassaUseCase` | Dispara campanha em massa |

### 9.5 Guidebook

**Localização:** `src/app/api/guidebook/`

| Rota | Método | Use Case | Descrição |
|---|---|---|---|
| `/api/guidebook` | POST | `CriarGuiaDigitalUseCase` | Cria guia digital |
| `/api/guidebook` | GET | `PrismaDigitalGuideRepository.findByPropertyId()` | Busca guia por propertyId |

### 9.6 Hospitalidade

**Localização:** `src/app/api/hospitalidade/`

| Rota | Método | Use Case | Descrição |
|---|---|---|---|
| `/api/hospitalidade/concierge` | POST | Concierge service | Processa intenções de hóspedes |

### 9.7 Outras Rotas

| Prefixo | Descrição |
|---|---|
| `/api/agents/` | Agentes de IA |
| `/api/auth/` | Autenticação |
| `/api/blast/` | Disparo em massa (legado) |
| `/api/checkout/` | Checkout |
| `/api/config/` | Configurações |
| `/api/connect/` | Conexões |
| `/api/crm/` | CRM |
| `/api/events/` | Eventos |
| `/api/exclusive/` | Recursos exclusivos |
| `/api/financeiro/` | Financeiro |
| `/api/fish/` | Phishing/segurança |
| `/api/health/` | Health check |
| `/api/help/` | Ajuda |
| `/api/leads/` | Leads (legado) |
| `/api/metrics/` | Métricas Prometheus |
| `/api/mkt/` | Marketing (legado) |
| `/api/onboarding/` | Onboarding |
| `/api/operacional/` | Tarefas operacionais (Zé-Ops) |
| `/api/pricing-rules/` | Regras de preço |
| `/api/properties/` | Propriedades |
| `/api/reservations/` | Reservas |
| `/api/revenue/` | Revenue (Zé-Analyst) |
| `/api/rooms/` | Quartos |
| `/api/sales/` | Vendas |
| `/api/security/` | Segurança |
| `/api/swipes/` | Swipe engine |
| `/api/system/` | Sistema |
| `/api/telemetry/` | Telemetria |
| `/api/tenant/` | Tenants |
| `/api/terminal/` | Terminal cognitivo |
| `/api/testing/` | Testes |
| `/api/track/` | Tracking |
| `/api/trends/` | Tendências (clima, feriados) |
| `/api/trial/` | Trial |
| `/api/v2/` | API v2 |
| `/api/visibility/` | Visibilidade |
| `/api/zcc/` | ZEHLA Command Center |
| `/api/zmg/` | Zé Marketing Growth |

---

## 10. Infraestrutura de Suporte (lib/)

**Localização:** `src/lib/`

### 10.1 AI / LLM Router

**Localização:** `src/lib/ai/`

| Arquivo | Descrição |
|---|---|
| `llm-router.ts` | Roteador de LLM: seleciona modelo (local/cloud) baseado na tarefa |
| `semantic-cache.ts` | Cache semântico para respostas (economia de tokens) |
| `embeddings.ts` | Geração de embeddings |
| `ai-cache.ts` | Cache de respostas da IA |

**Modelos Suportados:**
- Locais (Ollama): `qwen2.5-coder:14b`, `deepseek-r1:14b`, `llama3.1:8b`, `mistral:7b`
- Cloud (OpenRouter): `moonshotai/kimi-k2-6`

### 10.2 Redis

**Arquivo:** `redis.ts`

**3 instâncias segregadas:**
- `redisSession` (DB 0) — Sessões + cache
- `redisWorker` (DB 1) — Filas BullMQ
- `redisAI` (DB 2) — Cache de IA

**Modo Dev:** Proxy com fallback resiliente quando Redis está offline (retorna valores default para gets/incr)

### 10.3 Queues (BullMQ)

**Arquivo:** `queues.ts`

Filas definidas via `QUEUE_NAMES`:
- `CAPTURE` — Captura de eventos
- `CLASSIFY` — Classificação
- `ENRICH` — Enriquecimento
- `SCRAPER` — Scraping
- `VALIDATE` — Validação
- `TELEMETRY` — Telemetria

Cada fila tem `EVENT_SCORES` associados para cálculo de impacto.

### 10.4 Prisma Client

**Arquivo:** `prisma.ts`

Configuração do Prisma Client com múltiplos helpers.

### 10.5 Observability / CognitiveTerminal

**Localização:** `src/lib/observability/`

**CognitiveTerminal:** Terminal cognitivo para logging e debugging das operações do cérebro.

### 10.6 Swipe Engine

**Localização:** `src/lib/swipe/`

Motor de "swipe" para leads (similar a Tinder). Gerencia matches, perfis, e interações.

### 10.7 ZMG (Zé Marketing Growth)

**Localização:** `src/lib/zmg/`

Módulo de Growth Marketing com estratégias, campanhas e métricas.

### 10.8 ZCC (ZEHLA Command Center)

**Localização:** `src/lib/zcc/`

Centro de comando e controle com telemetria, radar de mercado e dashboard.

### 10.9 Delivery Machine

**Localização:** `src/lib/delivery/`

Sistema de delivery de mensagens:
- `services/webhook-signer.ts` — Assinatura HMAC de webhooks
- `services/idempotency-guard.ts` — Guard de idempotência
- Configuração Redis para delivery

### 10.10 Security

**Localização:** `src/lib/security/`

| Arquivo | Descrição |
|---|---|
| `rate-limit.ts` | Rate limiter com `rate-limiter-flexible` |
| `rate-limit-webhook.ts` | Rate guard específico para webhooks |
| `ip-block.ts` | Bloqueio de IP |
| `challenge.ts` | Desafios de segurança |

---

## 11. CI/CD Pipeline

**Localização:** `.github/workflows/`

### CI (ci.yml)

Trigger: push/PR para `main`

**Serviços:**
- PostgreSQL 16 (efêmero, `pg_isready` health check)
- Redis 7 (efêmero, `redis-cli ping` health check)

**Steps:**
1. Checkout
2. Setup Node.js 20
3. pnpm install (cache)
4. Prisma generate
5. Lint (`pnpm lint`)
6. TypeScript type check (`npx tsc --noEmit`)
7. Testes (`pnpm test` com DATABASE_URL e REDIS_URL)
8. Prisma migration diff check
9. Secret scan (truffleHog)
10. Build (`pnpm build`)

### CD (cd.yml)

Trigger: push para `main`

Deploy para Fly.io.

### Security Scan (security-scan.yml)

Trigger: semanal + manual

Steps:
1. truffleHog (secret scanning)
2. pnpm audit
3. FSA deep review (`pnpm fsa:review`)
4. Upload de relatório
5. Criação de issue automática se crítico

### Outros Workflows
- `db-backup.yml` — Backup de banco
- `zehla-operational-swarm.yml` — Swarm operacional

---

## 12. Docker / Infraestrutura Local

**Arquivo:** `docker-compose.yml`

### Serviços

| Serviço | Imagem | Porta | Propósito |
|---|---|---|---|
| PostgreSQL | `postgres:16-alpine` | 5432 | Banco principal |
| Redis | `redis:7-alpine` | 6379 | Cache + filas |
| Evolution API | `atendai/evolution-api:latest` | 8080 | Gateway WhatsApp |
| Prometheus | `prom/prometheus:v2.51.0` | 9090 | Métricas (profile: monitoring) |
| Grafana | `grafana/grafana:10.4.0` | 3001 | Dashboards (profile: monitoring) |

### Credenciais
- PostgreSQL: `zehla / zehla_secret_2026 / zehla_db`
- Redis: sem autenticação
- Evolution API Key: `zehla-evolution-key`

---

## 13. Modelo de Dados (Prisma Schema)

**Arquivo:** `prisma/schema.prisma` (2720 linhas, 124+ modelos)

### Principais Modelos

| Modelo | Tabela | Descrição |
|---|---|---|
| `User` | `users` | Usuários do sistema |
| `Property` | `properties` | Pousadas/clientes |
| `Lead` | `leads` | Leads de vendas (60+ campos) |
| `LeadEvent` | `lead_events` | Eventos de lead (tracking comportamental) |
| `DigitalGuide` | `digital_guides` | Guia digital da pousada |
| `GuideSection` | `guide_sections` | Seções do guia |
| `MarketingCampanha` | `marketing_campanhas` | Campanhas de marketing |
| `ComercialLead` | `comercial_leads` | Leads do módulo comercial |
| `Proposta` | `propostas` | Propostas comerciais |
| `Pagamento` | `pagamentos` | Pagamentos |
| `Room` | `rooms` | Quartos |
| `Reservation` | `reservations` | Reservas |
| `AgentLog` | `agent_logs` | Logs dos agentes de IA |
| `SecurityAlert` | `security_alerts` | Alertas de segurança |
| `SecurityIncident` | `security_incidents` | Incidentes de segurança |
| `CrmContact` | `crm_contacts` | Contatos CRM |
| `CrmDeal` | `crm_deals` | Negócios CRM |

---

## 14. Máquina de Estados Finita (FSM)

### 14.1 Lead Status FSM

**Implementação dual:**
1. `src/domain/lead/LeadStatus.ts` — Enum `LeadStatus` (8 valores) + `canTransitionLeadStatus()`
2. `src/domain/comercial/entities/Lead.ts` — Type `LeadStatus` (7 valores) + métodos de transição

**7 Estados (versão enxuta):**
```
PROSPECT ──→ QUALIFIED ──→ TRIAL ──→ NEGOTIATION ──→ CONVERTED
   │                          │           │               │
   └──→ BLACKLISTED            └──→ CHURNED ←──────────────┘
                                        │
                                        └──→ REACTIVATED ──→ QUALIFIED
```

### 14.2 Funnel Stages

9 estágios progressivos: `NEUTRAL → AWARE → INTERESTED → ENGAGED → TRIAL → NEGOTIATION → CONVERTED → CHURNED`

### 14.3 Campaign Status FSM

```
agendada → em_envio → concluida
    │          │
    └──→ cancelada
```

---

## 15. Fluxos Transversais

### 15.1 Fluxo de Captura de Lead

```
[Web/WhatsApp/Indicação]
       │
       ▼
[POST /api/comercial/leads] ─── JWT Guard ───→ authenticateRequest()
       │
       ▼
[ZeSalesCognitiveService.processIntent({ intent: 'CAPTURAR_LEAD' })]
       │
       ▼
[CapturarLeadUseCase.execute()]
   ├── Validar Canal (Canal.criar)
   ├── Validar Email (Email.criar)
   ├── Buscar duplicidade (buscarLeadPorEmail)
   │     └── Se churned → reativar → 'reactivated'
   ├── Validar Documento
   └── Criar Lead (leadPort.criarLead)
         │
         ▼
[PrismaLeadRepository.criarLead()]
   ├── Lead.create({ status: 'prospect' })
   ├── toData() → serializa
   └── prisma.comercialLead.create()
         │
         ▼
[Response: 201 { id, status: 'prospect', ... }]
```

### 15.2 Fluxo de Campanha em Massa

```
[Dashboard/API]
       │
       ▼
[POST /api/marketing/campaigns/dispatch] ─── JWT Guard
       │
       ▼
[Body Validation] (campanhaId, templateId, recipients)
       │
       ▼
[Rate Limit Check] (1/10min por propertyId)
       │
       ▼
[ExecutarCampanhaMassaUseCase.execute()]
   ├── Buscar campanha (PrismaCampanhaRepository)
   ├── Validar schedule (CampaignOrchestrator)
   ├── Validar segmento
   ├── Calcular batches
   └── Enfileirar batches (campaignOutboundQueue.add)
         │
         ▼
[Response: 202 { status: 'em_execucao' }]
         │
         ▼
[CampaignOutboundWorker]
   ├── Para cada destinatário:
   │   ├── Personalizar variáveis
   │   └── EvolutionApiMessagingGateway.sendTemplate()
   ├── Acumular resultados
   └── Se falha → retry → DLQ → WhatsApp Alert
```

### 15.3 Fluxo do Concierge IA

```
[WhatsApp Hóspede]
       │
       ▼
[POST /api/hospitalidade/concierge] ─── JWT Guard
       │
       ▼
[AgentOrchestrator.process()]
   ├── 1. SecurityProcessor.validate()
   ├── 2. classifyIntent()
   ├── 3. TrialValidator.validate()
   ├── 4. Supplier Handler
   ├── 5. ReceiptExtractor.extract()
   ├── 6. PromptBuilder.build()
   ├── 7. Semantic Cache (hit → return)
   ├── 8. LLM Router (reasoning/general)
   ├── 9. Agent Log (Prisma)
   └── 10. Voice Metadata (PRO/MAX)
         │
         ▼
[Response: AgentResponse]
```

### 15.4 Fluxo de Webhook (Zero-Trust)

```
[External API (Evolution, Stripe, etc.)]
       │
       ▼
[POST /api/webhooks/*]
       │
       ├── webhookRateGuard() → IP-based rate limit
       │
       ▼
[HMAC Validation]
   ├── Extrair raw body (request.text())
   ├── Extrair assinatura do header
   ├── verifyHmacSignature(rawBody, signature, secret)
   │   └── crypto.timingSafeEqual()
   └── Se inválido → 401 Unauthorized
         │
         ▼
[Process Payload]
   ├── Parse JSON
   ├── IdempotencyGuard (se aplicável)
   └── Encaminhar para Use Case
         │
         ▼
[Response: 200 OK]
```

---

## 16. Decisões Arquiteturais

| Decisão | Motivação | Trade-off |
|---|---|---|
| **BullMQ sobre sync** | Anti-ban anti-spam (Gaussian delay + DLQ) | Complexidade operacional |
| **Rate limit por tenant, não IP** | 1 dispatch/10min por propriedade | IP-based para webhooks |
| **Body validation antes de rate limit** | Economiza Redis I/O, previne auto-DDoS | Mínimo atraso extra |
| **Result<T,E> em vez de exceptions** | Pure Domain, previsibilidade | Verbosidade |
| **Discriminated unions para erros** | Type-safe error handling | Mais arquivos |
| **Data Mapper (Prisma isolado)** | Domínio não conhece Prisma | Duplicação de tipos |
| **FSM 7 estados** | Funil enxuto, SPEC-driven | Quebra de compatibilidade |
| **HMAC timingSafeEqual** | Zero-Trust, prevenção de timing attacks | Custo computacional mínimo |
| **Redis lazyConnect** | Resiliência em dev | Latência no primeiro request |
| **Cache semântico** | Economia de tokens LLM | Possível stale response |
| **Workers segregados por DB Redis** | Isolamento de responsabilidades | Mais conexões Redis |

---

## 17. Erros Discriminados (Discriminated Unions)

### GuidebookError (src/domain/guidebook/errors.ts)

12 códigos:
- `ID_REQUIRED`, `LOCALIZED_CONTENT_REQUIRED`, `SECTION_ALREADY_EXISTS`, `SECTION_NOT_FOUND`
- `INVALID_TRANSITION`, `REORDER_MISMATCH`, `MAX_SECTIONS_REACHED`, `INVALID_SECTION_TYPE`
- `DUPLICATE_SECTION_ORDER`, `GUIDE_NOT_FOUND`, `PROPERTY_NOT_FOUND`, `SYNC_FAILED`

### CampaignError (src/domain/marketing/errors.ts)

5 tipos de erro:
- `CampaignError`, `PostError`, `ReviewError`, `MetricaError`, `ConteudoError`
- `MarketingError` (união de todos)

### CommercialError (src/domain/comercial/errors.ts)

3 tipos de erro:
- `LeadError` (9 códigos), `PropostaError`, `RoiError`
- `CommercialError` (união de todos)

---

## 18. Glossário

| Termo | Significado |
|---|---|
| **ZEHLA** | Nome do projeto (ZEHLA SmartHotel) |
| **ZCC** | ZEHLA Command Center — Centro de comando |
| **ZMG** | Zé Marketing Growth — Módulo de growth |
| **ZCP** | ZEHLA Cognitive Protocol — Protocolo cognitivo |
| **ZDR** | ZEHLA Data Radar — Radar de dados |
| **FSA** | Full Stack Agent — Agente de análise |
| **SDR** | Sales Development Representative — Representante de vendas |
| **BullMQ** | Fila de mensagens baseada em Redis |
| **FSM** | Máquina de Estados Finita |
| **VO** | Value Object (DDD) |
| **RLS** | Row-Level Security (isolamento por tenant) |
| **HMAC** | Hash-based Message Authentication Code |
| **DLQ** | Dead Letter Queue (fila de mensagens mortas) |
| **LLM** | Large Language Model |
| **DDD** | Domain-Driven Design |
| **Clean Architecture** | Arquitetura em camadas com dependência invertida |
| **JWT** | JSON Web Token (autenticação) |
| **PII** | Personally Identifiable Information |
| **LGPD** | Lei Geral de Proteção de Dados (Brasil) |

---

> **Fim do Documento ZEHLA BRAIN ARCHITECTURE**  
> Gerado em: Junho 2026  
> Projeto: ZEHLA SmartHotel — zehla.io
