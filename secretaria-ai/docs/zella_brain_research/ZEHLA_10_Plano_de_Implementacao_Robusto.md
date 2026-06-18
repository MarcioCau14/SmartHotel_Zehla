# ZEHLA 10 — PLANO DE IMPLEMENTAÇÃO ROBUSTO
# Engenharia de Software + Estratégia de Mercado Cruzada

> **Gerado em:** 21/05/2026  
> **Base:** ZEHLA_09 (Engenharia Reversa Estratégica) + Inventário Real do Projeto  
> **Tipo:** Plano de Execução Técnica Priorizado  
> **Classificação:** CONFIDENCIAL — Uso Exclusivo da Equipe ZEHLA  

---

## SUMÁRIO EXECUTIVO

Este plano traduz os **47 gaps exploráveis** mapeados no ZEHLA_09 em **tarefas de engenharia concretas**, priorizadas por impacto comercial × esforço técnico, e cruzadas com o **estado real do repositório** (36 models Prisma, 35 route groups, 147 componentes, 9 workers).

**Princípio arquitetural central:** Clean Architecture Lite — cada domínio (PMS, IA, WhatsApp, CRM, Revenue, Booking) é um módulo desacoplado dentro do monorepo Next.js, compartilhando PostgreSQL via Prisma, mas com regras de negócio independentes. Isso evita o "Frankenstein de 38 módulos" da Silbeck.

---

## 1. INVENTÁRIO: O QUE JÁ EXISTE vs O QUE FALTA

### 1.1 FULLY BUILT (Produção-Ready) — 20 módulos

| # | Módulo | Status | Gaps que Resolve |
|---|--------|--------|-----------------|
| 1 | Multi-tenant + Prisma middleware | ✅ | S-03, CL-03 |
| 2 | Auth (NextAuth, JWT, 2FA) | ✅ | VZAP_05 |
| 3 | Property/Room/Reservation CRUD | ✅ | QV-01, SH-01 |
| 4 | Pagamentos (PIX QR + Stripe) | ✅ | S-02, HM-03 |
| 5 | 8 AI Agents (Receptionist→Learner) | ✅ | S-01, SH-02, IN-01 |
| 6 | Brain Engine (chat, predict, simulations) | ✅ | HM-01, S-06 |
| 7 | CRM Full Stack (pipelines, contacts, deals, tasks) | ✅ | IN-01, S-05 |
| 8 | ZEHLA Connect (Link-in-Bio + analytics) | ✅ | S-07, SH-05, ST-02 |
| 9 | Lead Management + Fish Scoring | ✅ | FUNIL_VENDAS |
| 10 | Blast Campaigns (Evolution API) | ✅ | SH-07 |
| 11 | Trends/Market Intelligence | ✅ | HM-01, CL-02 |
| 12 | Swipe Intelligence | ✅ | FUNIL_VENDAS |
| 13 | ZCC Admin Panel (overview, radar, team, telemetry) | ✅ | S-06, CL-02 |
| 14 | Security Fortress (4 camadas) | ✅ | VZAP_05 |
| 15 | Voice Studio (DNA Voice) | ✅ | HERMES_Brain |
| 16 | Worker Pipeline (Capture→Act) | ✅ | FUNIL_VENDAS |
| 17 | Webhooks (WhatsApp, Stripe, PIX, Pagar.me) | ✅ | S-02 |
| 18 | Landing Page + Sales Pages (Lite/Pro/Max) | ✅ | VZAP_04 |
| 19 | Onboarding Wizard | ✅ | S-08 |
| 20 | Observability (Prometheus, logs) | ✅ | VZAP_05 |

### 1.2 PARCIALMENTE BUILT — 10 módulos (precisam completude)

| # | Módulo | O que falta | Prioridade |
|---|--------|-------------|-----------|
| 1 | **Dashboard sub-pages** | 8 tabs como rotas dedicadas (Quartos, Reservas, Financeiro, etc.) | ALTA |
| 2 | **Finance Dashboard ROI** | Fee calculator avançado, DRE, fluxo de caixa | ALTA |
| 3 | **FNRH Check-in Digital** | DB model + fluxo completo + integração gov | MÉDIA |
| 4 | **Cadastur Monitoring** | Schema + worker de monitoramento | MÉDIA |
| 5 | **Push Notifications** | Service worker + Web Push API | MÉDIA |
| 6 | **Lead Scoring Visual ZCC** | Painel visual no ZCC | ALTA |
| 7 | **Webhook Production Validation** | Testes reais com Meta API | ALTA |
| 8 | **UX/UI Refinement (Huashu Pass)** | Design system VZAPS aplicado em todo dashboard | ALTA |
| 9 | **Creative Tracking (CTR)** | Ingestão de métricas de campanhas | BAIXA |
| 10 | **Multi-property Management UI** | UI para MAX tier (multi-propriedade) | MÉDIA |

### 1.3 NOT YET BUILT — 7 módulos (roadmap)

| # | Módulo | Esforço | Impacto | Fase |
|---|--------|---------|---------|------|
| 1 | **MAL (Malha de Aprendizado)** | Médio | Alto | Fase 2 |
| 2 | **Channel Manager (5→300+ canais)** | Alto | Crítico | Fase 2→3 |
| 3 | **Booking Engine Avançado** | Médio | Alto | Fase 1→2 |
| 4 | **NF/CPF/CNPJ Nativo** | Médio | Alto | Fase 3 |
| 5 | **Revenue AI Avançado** | Alto | Crítico | Fase 2→3 |
| 6 | **Marketplace de Integrações** | Alto | Médio | Fase 3→4 |
| 7 | **Gov.br Integration** | Alto | Médio | Fase 3 |

---

## 2. PLANO DE EXECUÇÃO: SEMANAS 1-12 (FASE 1 — FUNDAÇÃO)

### 2.1 Semana 1-2: Consolidação do Banco de Dados + Schemas Críticos

**Objetivo:** Garantir que todos os schemas projetados no ZEHLA_09 (Anexo B) estejam migrados e funcionais.

| Tarefa | Arquivo | Descrição |
|--------|---------|-----------|
| **T1.1** | `prisma/schema.prisma` | Validar e completar schemas: `TransactionLog`, `CreditAccount`, `CreditTransaction`, `Referral`, `ServiceItem`, `ReservationItem`, `Agent` |
| **T1.2** | `prisma/schema.prisma` | Adicionar modelos ausentes: `MALProfile`, `CadasturRecord`, `PushSubscription` |
| **T1.3** | Terminal | `npx prisma migrate dev` — rodar migração e validar seed |
| **T1.4** | `prisma/seed.ts` | Criar seed completo com dados de teste (3 propriedades, 50 reservas, 20 leads) |
| **T1.5** | `src/lib/prisma.ts` | Adicionar tipagens estendidas para os novos modelos |

**Critério de aceite:** `npx prisma db push` sem erros, seed popula 3 propriedades completas.

### 2.2 Semana 3-4: Dashboard Sub-Pages + UX VZAPS

**Objetivo:** Transformar o dashboard de single-page em multi-page com design VZAPS.

| Tarefa | Arquivo | Descrição |
|--------|---------|-----------|
| **T2.1** | `src/app/dashboard/painel/page.tsx` | Página principal com KPIs em tempo real |
| **T2.2** | `src/app/dashboard/quartos/page.tsx` | Gestão de quartos (grid visual, status, limpeza) |
| **T2.3** | `src/app/dashboard/reservas/page.tsx` | Calendário de reservas (timeline view) |
| **T2.4** | `src/app/dashboard/financeiro/page.tsx` | Painel financeiro (RevPAR, ADR, ocupação, fluxo de caixa) |
| **T2.5** | `src/app/dashboard/promocoes/page.tsx` | Gestão de promoções + blast campaigns |
| **T2.6** | `src/app/dashboard/configuracoes/page.tsx` | Settings da propriedade (dados, WhatsApp, integrações) |
| **T2.7** | `src/app/globals.css` | Aplicar design system VZAPS em TODO o dashboard (cores #25D366, Rubik, cards, botões pill) |
| **T2.8** | `src/components/dashboard/` | Refatorar componentes existentes para usar classes VZAPS |

**Critério de aceite:** Todas as 6 sub-pages navegáveis, design consistente com VZAPS, zero erros de build.

### 2.3 Semana 5-6: ZEHLA Connect — Setup do Freemium

**Objetivo:** Transformar o Connect em produto de aquisição em massa (resolve gaps S-07, SH-05).

| Tarefa | Arquivo | Descrição |
|--------|---------|-----------|
| **T3.1** | `src/app/connect/[slug]/page.tsx` | Refatorar página pública com design VZAPS |
| **T3.2** | `src/components/connect/` | Criar componentes modulares: `LinkCard`, `ThemePreview`, `AnalyticsChart`, `ReviewCard` |
| **T3.3** | `src/app/connect/setup/page.tsx` | Wizard de setup do Connect (3 passos: perfil → links → tema) |
| **T3.4** | `src/lib/connect/seo.ts` | Implementar Schema.org `LodgingBusiness` para SEO |
| **T3.5** | `src/app/api/connect/*/route.ts` | Validar todos os 20+ endpoints do Connect |
| **T3.6** | `src/components/connect/editor/` | Editor visual de temas (cores, fontes, layout) |

**Critério de aceite:** Usuário consegue criar um Connect profile completo em <3 minutos, página pública com SEO válido.

### 2.4 Semana 7-8: Pipeline Freemium + Middleware de Planos

**Objetivo:** Implementar o controle de acesso por plano (Free/Pro/Max) com Next.js Middleware.

| Tarefa | Arquivo | Descrição |
|--------|---------|-----------|
| **T4.1** | `middleware.ts` | Middleware de validação de plano: bloquear/liberar features por tier |
| **T4.2** | `src/lib/billing/trial-service.ts` | Completar TrialService: limites de mensagens, consultas IA, reservas |
| **T4.3** | `src/lib/brain/feature-guard.ts` | Feature flags por plano (IA básica no free, avançada no pro) |
| **T4.4** | `src/app/api/brain/chat/route.ts` | Rate limiting por plano (10 consultas/mes free, 100 pro, ilimitado max) |
| **T4.5** | `src/app/api/whatsapp/send/route.ts` | Rate limiting WhatsApp (50 msgs/mes free, 500 pro, ilimitado max) |
| **T4.6** | `src/components/subscription/` | Painel de upgrade/downgrade com comparativo de planos |
| **T4.7** | `src/lib/billing/stripe-service.ts` | Webhooks de upgrade/downgrade, proration, cancelamento |

**Critério de aceite:** Usuário free bloqueado em features pro, upgrade via Stripe funciona, downgrade respeita limites.

### 2.5 Semana 9-10: Booking Engine Básico + CRM Cognitivo MVP

**Objetivo:** Motor de reservas com 0% comissão + CRM que prevê preferências.

| Tarefa | Arquivo | Descrição |
|--------|---------|-----------|
| **T5.1** | `src/app/booking/[propertySlug]/page.tsx` | Página pública de reservas da pousada |
| **T5.2** | `src/components/booking/` | Componentes: `RoomSelector`, `DateRangePicker`, `GuestForm`, `PaymentStep` |
| **T5.3** | `src/app/api/booking/route.ts` | API de criação de reserva direta (sem OTA) |
| **T5.4** | `src/lib/brain/use-cases/PredictGuestPreferencesUseCase.ts` | Caso de uso de previsão (exemplo do texto do usuário) |
| **T5.5** | `src/lib/brain/use-cases/GuestHistoryAnalyzer.ts` | Análise de histórico de hóspedes para tags cognitivas |
| **T5.6** | `src/components/crm/CognitivePanel.tsx` | Painel de preferências previstas no CRM |
| **T5.7** | `src/lib/ai/llm-router.ts` | Integrar LLM Router no fluxo de previsão |

**Critério de aceite:** Fluxo completo de reserva direta (select → book → pay), CRM exibe preferências previstas para hóspedes recorrentes.

### 2.6 Semana 11-12: Onboarding Mágico + Funil de Vendas Ativo

**Objetivo:** Wizard de 5 minutos + funil de aquisição operacional.

| Tarefa | Arquivo | Descrição |
|--------|---------|-----------|
| **T6.1** | `src/app/onboarding/page.tsx` | Wizard de 5 minutos (dados → quartos → WhatsApp → Connect → pronto) |
| **T6.2** | `src/components/onboarding/steps/` | 5 steps componentizados com validação por step |
| **T6.3** | `src/lib/onboarding/orchestrator.ts` | Orquestrador: cria Property, Rooms, ConnectProfile, configura WhatsApp |
| **T6.4** | `src/app/teste-gratis/page.tsx` | Refatorar página de teste grátis com copy competitiva |
| **T6.5** | `src/lib/marketing/lead-capture.ts` | Integrar captura de leads da landing page → CRM |
| **T6.6** | `src/lib/email/email-service.ts` | Templates de email: welcome, trial-reminder, upgrade-prompt |
| **T6.7** | `src/lib/whatsapp/templates.ts` | Templates WhatsApp: welcome, trial-start, trial-ending |

**Critério de aceite:** Novo usuário completa onboarding em <5 minutos, recebe email + WhatsApp de boas-vindas, lead capturado no CRM.

---

## 3. FASE 2: DIFERENCIAÇÃO (SEMANAS 13-24)

### 3.1 Semanas 13-16: CRM Cognitivo Avançado + WhatsApp IA Conversacional

| Tarefa | Descrição | Gap |
|--------|-----------|-----|
| **T7.1** | Hermes Brain integrado com CRM (skills de hospitalidade) | IN-01, S-05 |
| **T7.2** | WhatsApp NLP conversacional (respostas contextuais, não templates) | S-01, SH-01 |
| **T7.3** | Persona Learner: IA aprende estilo de comunicação da pousada | S-01 |
| **T7.4** | CRM Timeline: visualização cronológica de interações + previsões | IN-01 |

### 3.2 Semanas 17-20: Revenue AI Básico + Programa Ambassador

| Tarefa | Descrição | Gap |
|--------|-----------|-----|
| **T8.1** | Revenue AI: precificação sazonal baseada em ocupação + eventos | HM-01, SH-04 |
| **T8.2** | Integração com Trends API (feriados, clima, eventos locais) | HM-01 |
| **T8.3** | Referral/Ambassador schema + UI (VZAP_03 já projetou) | SH-08 |
| **T8.4** | Dashboard de indicações: tracking, recompensas, leaderboard | SH-08 |

### 3.3 Semanas 21-24: Analytics Preditivos + Channel Manager (5 canais)

| Tarefa | Descrição | Gap |
|--------|-----------|-----|
| **T9.1** | Forecast 7-14 dias: ocupação, receita, RevPAR previsto | S-06, HM-01 |
| **T9.2** | Channel Manager: Booking.com + Airbnb (API integration) | SH-06, ST-01 |
| **T9.3** | Sync bidirecional de disponibilidade e preços | SH-06 |
| **T9.4** | Painel de canais no dashboard: status, erros, sync log | SH-06 |

---

## 4. FASE 3: DOMINÂNCIA (SEMANAS 25-36)

| Semana | Feature | Gap | Esforço |
|--------|---------|-----|---------|
| 25-28 | Channel Manager 300+ canais (integração com SiteMinder/Cloudbeds API) | CL-01, ST-01 | Alto |
| 29-30 | Revenue AI Avançado (eventos + clima + feriados + concorrência local) | CL-02, HM-02 | Alto |
| 31-32 | NF/CPF/CNPJ nativo (integração com API de emissão de NF) | CL-03, ME-01 | Médio |
| 33-36 | Marketplace de integrações (webhooks públicos, SDK, docs) | S-09, ME-02 | Alto |

---

## 5. FASE 4: LIDERANÇA (SEMANAS 37-48)

| Semana | Feature | Gap | Esforço |
|--------|---------|-----|---------|
| 37-40 | API Aberta para desenvolvedores (GraphQL/REST público) | ME-02, ME-03 | Alto |
| 41-44 | Expansão LATAM (Portugal, Espanha — i18n, moedas, fiscal) | — | Alto |
| 45-48 | IA Avançada (multi-agente, personalização extrema, auto-configuração) | Todos | Alto |

---

## 6. ARQUITETURA TÉCNICA: CLEAN ARCHITECTURE LITE

### 6.1 Estrutura de Módulos Desacoplados

```
src/
├── modules/
│   ├── pms/              # Property Management System
│   │   ├── models/       # Prisma: Property, Room, Reservation
│   │   ├── services/     # ReservationService, RoomService
│   │   ├── api/          # /api/properties, /api/reservations, /api/rooms
│   │   └── components/   # Dashboard de quartos, reservas
│   │
│   ├── whatsapp/         # WhatsApp IA
│   │   ├── services/     # WhatsAppAgentService, TemplateService
│   │   ├── api/          # /api/whatsapp/*
│   │   └── components/   # WhatsAppPanel, MessageFeed
│   │
│   ├── brain/            # IA Cognitiva
│   │   ├── services/     # AgentOrchestrator, LlmRouter
│   │   ├── use-cases/    # PredictGuestPreferences, RevenueOptimization
│   │   ├── api/          # /api/brain/*
│   │   └── components/   # BrainDashboard, CognitivePanel
│   │
│   ├── crm/              # CRM Cognitivo
│   │   ├── services/     # ContactService, DealService
│   │   ├── api/          # /api/crm/*
│   │   └── components/   # CRMModule, ContactDetail, KanbanBoard
│   │
│   ├── revenue/          # Revenue Management
│   │   ├── services/     # RevenueService, PricingService
│   │   ├── api/          # /api/revenue/*
│   │   └── components/   # RevenueDashboard, PricingRules
│   │
│   ├── booking/          # Booking Engine
│   │   ├── services/     # BookingService, AvailabilityService
│   │   ├── api/          # /api/booking/*
│   │   └── components/   # BookingWidget, RoomSelector
│   │
│   ├── connect/          # ZEHLA Connect (Link-in-Bio)
│   │   ├── services/     # ConnectService, SeoService
│   │   ├── api/          # /api/connect/*
│   │   └── components/   # ConnectProfile, LinkEditor
│   │
│   └── billing/          # Billing & Plans
│       ├── services/     # StripeService, TrialService, FeeCalculator
│       ├── api/          # /api/checkout, /api/trial, /api/billing
│       └── components/   # SubscriptionPanel, UpgradeModal
```

### 6.2 Princípios de Desacoplamento

1. **Cada módulo tem seu próprio `services/`** — nenhuma chamada direta entre módulos, apenas via API interna ou events
2. **Prisma models são compartilhados** — mas cada módulo opera apenas nos models que lhe dizem respeito
3. **Event-Driven para cross-module** — BullMQ queues para comunicação entre módulos (ex: nova reserva → notifica WhatsApp → atualiza CRM)
4. **Feature flags por plano** — `feature-guard.ts` controla o que cada tier acessa

### 6.3 Event Flow Exemplo: Nova Reserva

```
1. Booking Engine cria reserva → publica evento `reservation.created` na BullMQ queue
2. WhatsApp Module consome → envia confirmação automática via IA
3. CRM Module consome → atualiza perfil do hóspede + tags cognitivas
4. Revenue Module consome → recalcula previsão de ocupação
5. Finance Module consome → registra transação financeira
6. Telemetry Module consome → atualiza dashboard ZCC
```

---

## 7. TRADE-OFFS: CONSTRUIR TUDO vs INTEGRAR

### 7.1 All-in-One (Estratégia Atual)

| Prós | Contras | Mitigação |
|------|---------|-----------|
| Data Gravity: IA tem acesso direto ao PostgreSQL | Gargalo de engenharia (PMS + Booking + Channel Manager) | Focar no core (PMS + WhatsApp + IA) primeiro |
| Lock-in comercial: setup de 5 minutos = churn baixo | Risco de bug sistêmico (tudo depende do DB) | Redis + BullMQ para disponibilidade |
| Sem delays de webhooks/APIs terceiras | CAP theorem: precisaremos priorizar Disponibilidade | Arquitetura Event-Driven com retry |
| Revenue AI em tempo real (sem latência) | Channel Manager requer integrações complexas | Fase 2: 5 canais → Fase 3: 300+ |

### 7.2 Decisão: All-in-One com Integrações Progressivas

- **Fase 1:** Tudo interno (PMS + WhatsApp + IA + Connect + Booking básico)
- **Fase 2:** Channel Manager 5 canais (integração com Booking.com + Airbnb)
- **Fase 3:** 300+ canais (via SiteMinder API ou similar)
- **Fase 4:** Marketplace (terceiros integram conosco)

---

## 8. CHECKLIST DE PRÓXIMOS PASSOS (IMEDIATO)

### Semana 1 (Começar Agora)

- [ ] **T1.1:** Validar schemas Prisma do Anexo B do ZEHLA_09
- [ ] **T1.2:** Adicionar models ausentes (`MALProfile`, `CadasturRecord`, `PushSubscription`)
- [ ] **T1.3:** Rodar `npx prisma migrate dev`
- [ ] **T1.4:** Criar seed completo com dados de teste
- [ ] **T1.5:** Validar tipagens estendidas

### Prioridade Imediata (Alto Impacto × Baixo Esforço)

- [ ] Freemium generoso (vs QuartoVerde) — já projetado, precisa implementação
- [ ] WhatsApp básico (vs SimplesHotel, Innotel) — já projetado, precisa rate limiting
- [ ] ZEHLA Connect (vs TODOS) — já projetado, precisa UI refinada
- [ ] CRM básico (vs Innotel) — já projetado, precisa painel visual
- [ ] Landing page estilizada VZAPS — ✅ FEITO

---

## 9. KPIs DE ENGENHARIA

| KPI | Meta Semana 4 | Meta Semana 12 | Como Medir |
|-----|--------------|----------------|------------|
| Models Prisma migrados | 36 → 39 | 39 estáveis | `npx prisma db pull` |
| API routes funcionais | 35 → 45 | 50+ | Testes E2E Playwright |
| Dashboard sub-pages | 0 → 6 | 6 estáveis | Navegação manual |
| Onboarding completion rate | — | >70% | Analytics |
| Build time | <60s | <45s | CI/CD |
| Test coverage | — | >60% | `npm run test -- --coverage` |
| Zero errors no build | ✅ | ✅ | `npx next build` |

---

## 10. RISCOS TÉCNICOS E MITIGAÇÃO

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Prisma migration quebra produção | Baixa (10%) | Crítico | Backup DB antes de cada migration, rollback plan |
| BullMQ queue overflow sob carga | Média (25%) | Alto | Redis cluster, dead letter queue, monitoring |
| WhatsApp API rate limit da Meta | Média (20%) | Alto | Fila de retry exponential backoff, múltiplos números |
| LLM Router falha sem fallback | Baixa (15%) | Alto | Multi-provider fallback (OpenAI → Gemini → Anthropic) |
| Stripe webhook não processa | Baixa (10%) | Alto | Idempotency keys, retry manual via ZCC |
| Channel Manager API muda | Média (20%) | Médio | Adapter pattern, testes de integração semanais |

---

## 11. MENSAGEM FINAL

> **"O ZEHLA_09 mapeou 47 gaps. O inventário do projeto mostra que 20 módulos já estão production-ready. O plano acima transforma os 27 gaps restantes em 48 tarefas de engenharia concretas, organizadas em 4 fases de 12 semanas. A vantagem competitiva não é ter a melhor IA — é saber exatamente qual ferida do cliente cada feature cura. Keep building. One commit at a time."**

---

*Plano gerado em 21/05/2026. Baseado no ZEHLA_09 (Engenharia Reversa Estratégica) + inventário real do repositório zehla-backend. CONFIDENCIAL.*
