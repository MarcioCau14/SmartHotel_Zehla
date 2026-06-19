# ZEHLA — Plano de Organização e Execução dos Módulos
## ZCC + DDC + Página de Vendas — Integração Completa

> **Documento gerado em:** Julho 2025
> **Status do Projeto:** Três módulos existentes, parcialmente integrados
> **Banco de Dados:** Prisma/SQLite com 30 modelos (21 original + 9 DDC)
> **Framework:** Next.js 16 + Tailwind CSS 4 + shadcn/ui + Framer Motion

---

## 1. Mapa Mental do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ZEHLA COGNITIVE OS (SaaS)                        │
│                                                                     │
│  ┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐ │
│  │  LANDING PAGE    │   │      DDC         │   │      ZCC        │ │
│  │  Página Vendas   │──▶│  Command Center  │──▶│  Central Control│ │
│  │  src/app/page.tsx│   │ /dashboard       │   │  /zcc           │ │
│  │                 │   │                  │   │                 │ │
│  │  - Hero CTA     │   │  - RevenueMetrics│   │  - LeadsTable   │ │
│  │  - Pricing      │   │  - AI Live Feed  │   │  - CampaignPanel│ │
│  │  - Checkout     │   │  - CRM Pipeline  │   │  - CerebroZella │ │
│  │  - SavingsCalc  │   │  - Training      │   │  - HunterConsole│ │
│  │  - FAQ          │   │  - Notifications │   │  - TenantMgmt   │ │
│  └────────┬────────┘   └────────┬─────────┘   └────────┬────────┘ │
│           │                     │                       │          │
│           ▼                     ▼                       ▼          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   CAMADA COMPARTILHADA                      │  │
│  │                                                              │  │
│  │  Auth (next-auth)  │  Prisma/SQLite  │  AI Layer (ZaosRouter)│  │
│  │  ─────────────────│  ──────────────  │  ─────────────────── │  │
│  │  30 modelos ORM    │  User/Tenant/Guest│ Thompson Sampling   │  │
│  │  Role-based access │  Booking/Lead   │  Budget Guard       │  │
│  │  API middleware    │  AgentLog       │  Circuit Breaker    │  │
│  │                    │  Subscription  │  Semantic Cache     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  FLUXO DE DADOS:                                                    │
│  Landing → Lead → ZCC CRM → DDC Guest → Booking → Revenue → ZCC   │
│                                                                     │
│  ROTA DO USUÁRIO:                                                  │
│  / (landing) → /checkout → /dashboard (DDC) ← /zcc (admin)        │
└─────────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados Detalhado

```
VISITANTE (Landing Page)
    │
    ├──▶ Clica "Começar Trial" ──▶ POST /api/checkout/create
    │       │                        │
    │       │                        ├── Cria User (role: client)
    │       │                        ├── Cria Tenant (plan: trial)
    │       │                        ├── Cria Subscription (status: pending)
    │       │                        └── Retorna redirectUrl: /dashboard
    │       │
    └──▶ /dashboard (DDC do cliente)
            │
            ├── RevenueMetrics ← GET /api/ddc/metrics?period=today
            │                      (mock data com dados realistas)
            │
            ├── AI Live Feed ← SSE /api/ddc/live-feed
            │                      (streaming de conversas simuladas)
            │
            ├── Guest CRM ← GET /api/ddc/guests
            │                      (pipeline hot/warm/cold/booked)
            │
            └── Training ← GET /api/ddc/training
                           (prompts personalizados da pousada)


ADMINISTRADOR (ZCC)
    │
    ├── /zcc (ZCC Console)
    │       │
    │       ├── Overview: DashboardCards + ClientOverview
    │       │               ← 10 clientes beta (zcc-clients-data.ts)
    │       │
    │       ├── Cérebro: CerebroZella
    │       │               ← ZaosNeuroRouter (Thompson Sampling)
    │       │               ← GET /api/brain/health
    │       │               ← GET /api/router/providers
    │       │
    │       ├── Prospecção: TargetsPanel + HunterConsole + LeadsTable
    │       │               ← GET /api/leads (Prisma DB)
    │       │               ← GET /api/targets
    │       │               ← POST /api/hunt (IA busca novos leads)
    │       │               ← POST /api/bulk-whatsapp (disparo em massa)
    │       │
    │       └── Settings: Gateway, AI Router, Segurança, WhatsApp
    │
    └── Dados cruzam para DDC via tenantId no Prisma
```

---

## 2. Estado Atual — Inventário Completo

### 2.1 MÓDULO DDC (Digital Dreams Command Center)

#### Componentes (12 arquivos)

| Arquivo | Status | Prioridade | Observações |
|---------|--------|-----------|-------------|
| `src/components/ddc/DDCHeader.tsx` | ✅ DONE | P0 | Header com IA status, busca, notifications, user menu. 364 linhas. |
| `src/components/ddc/RevenueMetrics.tsx` | ✅ DONE | P0 | Cards KPI (receita hoje R$8.500, 45 atendimentos, 12 reservas). 278 linhas. |
| `src/components/ddc/AILiveFeed.tsx` | ✅ DONE | P0 | Feed WhatsApp com lista de conversas + mensagens. 299 linhas. |
| `src/components/ddc/GuestCRMPipeline.tsx` | ✅ DONE | P0 | Pipeline CRM com estágios (new→warm→hot→booked→lost). 291 linhas. |
| `src/components/ddc/TrainingCenter.tsx` | ✅ DONE | P1 | Centro de treinamento com CRUD de prompts. 444 linhas. |
| `src/components/ddc/QuickActionsBar.tsx` | ✅ DONE | P1 | Barra de ações rápidas (8 ícones + 4 atalhos). 121 linhas. |
| `src/components/ddc/MetricCard.tsx` | ✅ DONE | P1 | Card genérico de métrica |
| `src/components/ddc/ConversationCard.tsx` | ✅ DONE | P1 | Card de conversa individual |
| `src/components/ddc/GuestCard.tsx` | ✅ DONE | P1 | Card de hóspede |
| `src/components/ddc/PipelineStage.tsx` | ✅ DONE | P1 | Estágio do pipeline |
| `src/components/ddc/TrainingCard.tsx` | ✅ DONE | P2 | Card de treinamento |
| `src/components/ddc/AIStatusBadge.tsx` | ✅ DONE | P1 | Badge de status da IA |
| `src/components/ddc/index.ts` | ✅ DONE | P0 | Barrel exports |

#### Página Principal

| Arquivo | Status | Prioridade | Observações |
|---------|--------|-----------|-------------|
| `src/app/dashboard/page.tsx` | ✅ DONE | P0 | 252 linhas. Layout bento grid. Usa hooks custom. |
| `src/app/dashboard/layout.tsx` | ✅ DONE | P0 | Layout wrapper |

#### API Routes (12 rotas)

| Rota | Arquivo | Status | Tipo de Dados |
|------|---------|--------|---------------|
| `GET /api/ddc/metrics` | ✅ DONE | Mock data com period filter (today/week/month) |
| `SSE /api/ddc/live-feed` | ✅ DONE | Streaming com novas mensagens simuladas |
| `GET /api/ddc/conversations` | ✅ DONE | Lista de conversas com mock data |
| `GET /api/ddc/guests` | ✅ DONE | Hóspedes com filtros (status, score, search) |
| `GET /api/ddc/guests/[id]` | ✅ DONE | Detalhes de hóspede |
| `GET /api/ddc/bookings` | ✅ DONE | Reservas com mock data |
| `GET /api/ddc/ai-status` | ✅ DONE | Status da IA |
| `GET /api/ddc/training` | ✅ DONE | Lista de prompts de treino |
| `GET/PUT/DELETE /api/ddc/training/[id]` | ✅ DONE | CRUD de treino individual |
| `GET /api/ddc/notifications` | ✅ DONE | Notificações |
| `PUT /api/ddc/notifications/read-all` | ✅ DONE | Marcar todas como lidas |

#### Lib / Hooks (7 arquivos)

| Arquivo | Status | Prioridade | Observações |
|---------|--------|-----------|-------------|
| `src/lib/ddc/api.ts` | ✅ DONE | P0 | 283 linhas. API client completo com fetch functions. |
| `src/lib/ddc/mock-data.ts` | ✅ DONE | P0 | ~800 linhas. Dados mock realistas. |
| `src/lib/ddc/use-ddc-metrics.ts` | ✅ DONE | P0 | Hook com React Query + auto-refresh |
| `src/lib/ddc/use-ai-live-feed.ts` | ✅ DONE | P0 | Hook SSE para live feed |
| `src/lib/ddc/use-guest-pipeline.ts` | ✅ DONE | P0 | Hook com mutations CRUD |
| `src/lib/ddc/use-ddc-notifications.ts` | ✅ DONE | P1 | Hook para notificações |
| `src/lib/ddc/use-training-center.ts` | ✅ DONE | P1 | Hook para treinamentos |

#### Types

| Arquivo | Status | Observações |
|---------|--------|-------------|
| `src/types/ddc.ts` | ✅ DONE | 449 linhas. 30+ tipos TypeScript completos. |
| `src/hooks/ddc.ts` | ✅ DONE | 12 custom hooks (dashboard state, localStorage, keyboard, etc.) |

#### GAPs IDENTIFICADOS no DDC:

1. **RevenueMetrics data mismatch**: O componente `RevenueMetrics.tsx` espera `{ today: { generated, reservations, aiAttended, conversionRate } }` mas o hook `useDDCMetrics` retorna `{ attendedToday, bookingsClosed, revenue }` — tipos INCOMPATÍVEIS. O fallback para `mockRevenueMetrics` mascara o bug mas os dados reais da API não são usados.
2. **AILiveFeed standalone**: O componente AILiveFeed não usa o hook `useAILiveFeed` — tem dados mock internos. Não se conecta ao SSE.
3. **GuestCRMPipeline standalone**: Não usa o hook `useGuestPipeline` — usa `mockGuests` diretamente. Não tem drag-and-drop real.
4. **DDCHeader props mismatch**: O componente espera `propertyName: string` mas a página passa `aiStatus: AIStatus` — a interface `DDCHeaderProps` está duplicada (no componente e nos types/ddc.ts são diferentes).
5. **Seminário de abas**: A página atual é single-page sem abas. Não navega entre visões.
6. **Sem QueryClientProvider**: Os hooks usam `@tanstack/react-query` mas não há Provider no layout.
7. **Mobile responsiveness parcial**: Grid bento não colapsa bem em telas < 640px.

---

### 2.2 MÓDULO ZCC (Zélla Central Control)

#### Componentes (16 arquivos)

| Arquivo | Status | Prioridade | Observações |
|---------|--------|-----------|-------------|
| `src/components/zcc/ZCCLayout.tsx` | ✅ DONE | P1 | Layout wrapper |
| `src/components/zcc/DashboardCards.tsx` | ✅ DONE | P0 | Cards KPI (receita, leads, taxa conversão) |
| `src/components/zcc/CerebroZella.tsx` | ✅ DONE | P0 | Thompson Sampling visualization |
| `src/components/zcc/ClientOverview.tsx` | ✅ DONE | P0 | 10 clientes beta testers |
| `src/components/zcc/TargetsPanel.tsx` | ✅ DONE | P1 | Painel de alvos/prospecção |
| `src/components/zcc/HunterConsole.tsx` | ✅ DONE | P1 | Console de caça com IA |
| `src/components/zcc/LeadsTable.tsx` | ✅ DONE | P0 | Tabela de leads com seleção e filtros |
| `src/components/zcc/CampaignPanel.tsx` | ✅ DONE | P1 | Painel de campanhas |
| `src/components/zcc/DispararEliteButton.tsx` | ✅ DONE | P1 | Botão flutuante de disparo em massa |
| `src/components/zcc/RevenueReportElite.tsx` | ✅ DONE | P1 | Modal de diagnóstico de receita |
| `src/components/zcc/SwarmOverview.tsx` | ✅ DONE | P2 | Overview do swarm de agentes |
| `src/components/zcc/ScaleMetrics.tsx` | ✅ DONE | P2 | Métricas de escalabilidade |
| `src/components/zcc/ApiKeysPanel.tsx` | ✅ DONE | P2 | Gerenciamento de API keys |
| `src/components/zcc/CognitiveObservability.tsx` | ✅ DONE | P2 | Observabilidade cognitiva |
| `src/components/zcc/TenantManagement.tsx` | ✅ DONE | P1 | Gerenciamento de tenants |
| `src/components/zcc/FintechHub.tsx` | ✅ DONE | P2 | Hub financeiro |

#### Página Principal

| Arquivo | Status | Prioridade | Observações |
|---------|--------|-----------|-------------|
| `src/app/zcc/page.tsx` | ✅ DONE | P0 | 349 linhas. 4 abas (overview, cerebro, prospection, settings). Settings inline. |

#### API Routes (18 rotas)

| Rota | Arquivo | Status | Usa Prisma? |
|------|---------|--------|-------------|
| `GET/POST /api/leads` | ✅ DONE | ✅ SIM (CRUD completo) |
| `GET/PUT/DELETE /api/leads/[id]` | ✅ DONE | ✅ SIM |
| `GET/POST /api/targets` | ✅ DONE | ✅ SIM |
| `GET/PUT/DELETE /api/targets/[id]` | ✅ DONE | ✅ SIM |
| `GET/POST /api/campaigns` | ✅ DONE | ✅ SIM |
| `GET/PUT/DELETE /api/campaigns/[id]` | ✅ DONE | ✅ SIM |
| `POST /api/hunt` | ✅ DONE | ❌ Mock (simula busca IA) |
| `SSE /api/hunt-stream` | ✅ DONE | ❌ Mock (stream) |
| `GET /api/roi` | ✅ DONE | ❌ Cálculo puro (sem DB) |
| `GET /api/agent-logs` | ✅ DONE | ✅ SIM |
| `GET /api/readiness` | ✅ DONE | ❌ Health check |
| `GET /api/diagnose` | ✅ DONE | ❌ Diagnóstico do sistema |
| `GET/PUT /api/router/providers` | ✅ DONE | ❌ Mock (router state) |
| `GET/PUT /api/router/budget` | ✅ DONE | ❌ Mock (budget state) |
| `GET/POST /api/brain` | ✅ DONE | ❌ Mock (brain status) |
| `GET /api/brain/health` | ✅ DONE | ❌ Health check |
| `GET /api/brain/intents` | ✅ DONE | ❌ Mock |
| `GET /api/swipe-templates` | ✅ DONE | ❌ Mock |
| `POST /api/bulk-whatsapp` | ✅ DONE | ❌ Mock |

#### Lib / AI Layer (11 arquivos)

| Arquivo | Status | Prioridade | Observações |
|---------|--------|-----------|-------------|
| `src/lib/zcc-mock-data.ts` | ✅ DONE | P0 | Dados mock para ZCC |
| `src/lib/zcc-clients-data.ts` | ✅ DONE | P0 | 10 clientes beta com dados realistas |
| `src/lib/leads-types.ts` | ✅ DONE | P0 | Tipos de leads |
| `src/lib/mock-data.ts` | ✅ DONE | P1 | Mock data genérico |
| `src/lib/api-hooks.ts` | ✅ DONE | P1 | Hooks de API genéricos |
| `src/lib/ai/zaos-neuro-router.ts` | ✅ DONE | P1 | Thompson Sampling router |
| `src/lib/ai/budget-guard.ts` | ✅ DONE | P1 | Orçamento de IA |
| `src/lib/ai/circuit-breaker.ts` | ✅ DONE | P1 | Circuit breaker pattern |
| `src/lib/ai/semantic-cache.ts` | ✅ DONE | P1 | Cache semântico |
| `src/lib/ai/headroom-client.ts` | ✅ DONE | P1 | Cliente headroom |
| `src/lib/ai/context-discretizer.ts` | ✅ DONE | P2 | Discretizador de contexto |

#### GAPs IDENTIFICADOS no ZCC:

1. **HunterConsole mock-only**: O console de caça não conecta a APIs reais. Usa mock data internamente.
2. **CampaignPanel sem criação real**: Painel mostra campanhas mock sem fluxo de criação.
3. **ZCCLayout não usado**: A página `/zcc` tem layout inline, não usa ZCCLayout component.
4. **SwarmOverview, ScaleMetrics, CognitiveObservability, FintechHub**: Componentes existem mas NÃO são importados na página. Estão "órfãos".
5. **Sem auth**: Qualquer pessoa pode acessar `/zcc`. Sem middleware de proteção.
6. **TenantManagement sem CRUD real**: Exibe dados mock sem persistência.

---

### 2.3 MÓDULO LANDING PAGE (Página de Vendas)

#### Componentes (16 arquivos)

| Arquivo | Status | Prioridade | Observações |
|---------|--------|-----------|-------------|
| `src/components/landing/HeroSection.tsx` | ✅ DONE | P0 | Hero com CTA principal |
| `src/components/landing/TrustBadgesSection.tsx` | ✅ DONE | P1 | Badges de confiança |
| `src/components/landing/PainPointsSection.tsx` | ✅ DONE | P0 | Dores do mercado |
| `src/components/landing/FeaturesSection.tsx` | ✅ DONE | P0 | Features principais |
| `src/components/landing/HowItWorksSection.tsx` | ✅ DONE | P0 | Como funciona |
| `src/components/landing/SavingsCalculator.tsx` | ✅ DONE | P0 | Calculadora ROI (chama /api/roi) |
| `src/components/landing/TestimonialsSection.tsx` | ✅ DONE | P1 | Depoimentos |
| `src/components/landing/ArchitectureSection.tsx` | ✅ DONE | P1 | Diagrama de arquitetura |
| `src/components/landing/BookingPlatformsMarquee.tsx` | ✅ DONE | P1 | Marquee de plataformas |
| `src/components/landing/SecuritySection.tsx` | ✅ DONE | P1 | Segurança |
| `src/components/landing/IntegrationsSection.tsx` | ✅ DONE | P1 | Integrações |
| `src/components/landing/BetaFounderSection.tsx` | ✅ DONE | P0 | CTA fundador beta |
| `src/components/landing/PricingSection.tsx` | ✅ DONE | P0 | Pricing com 4 planos (gratuito R$0, lite R$197, pro R$397, max R$697) |
| `src/components/landing/FAQSection.tsx` | ✅ DONE | P1 | FAQ |
| `src/components/landing/CTASection.tsx` | ✅ DONE | P0 | CTA intermediário |
| `src/components/landing/FinalCTASection.tsx` | ✅ DONE | P0 | CTA final |
| `src/components/landing/Footer.tsx` | ✅ DONE | P1 | Footer |

#### Páginas de Checkout

| Arquivo | Status | Prioridade | Observações |
|---------|--------|-----------|-------------|
| `src/app/page.tsx` | ✅ DONE | P0 | Landing page principal. 41 linhas. |
| `src/app/checkout/success/page.tsx` | ✅ DONE | P0 | Pós-checkout sucesso |
| `src/app/checkout/cancel/page.tsx` | ✅ DONE | P0 | Checkout cancelado |

#### API Routes (3 rotas)

| Rota | Arquivo | Status | Usa Prisma? |
|------|---------|--------|-------------|
| `POST /api/checkout/create` | ✅ DONE | ✅ SIM (cria User + Tenant + Subscription) |
| `POST /api/checkout/success` | ✅ DONE | ✅ SIM (ativa subscription) |
| `POST /api/checkout/cancel` | ✅ DONE | ✅ SIM (cancela subscription) |

#### GAPs IDENTIFICADOS na Landing:

1. **CTASection não importado**: O componente `CTASection.tsx` existe mas NÃO é importado em `page.tsx`. Há gap no fluxo de conversão.
2. **Checkout sem Mercado Pago real**: O `POST /api/checkout/create` cria subscription no DB mas não integra com gateway de pagamento real. Redireciona para URL mock.
3. **Pricing sem persistência de plano**: Ao clicar em "Assinar", não há fluxo real de checkout. Precisa integrar com webhook de pagamento.
4. **Sem UTM tracking**: Landing page não captura UTM params para rastrear origem de leads.
5. **Sem lead magnet**: Não há captura de email antes do checkout para nurturing.
6. **Página de downloads existe**: `src/app/downloads/page.tsx` e `src/app/page-download.tsx` são arquivos legados que deveriam ser removidos.

---

## 3. Matriz de Prioridade por Módulo

### 3.1 DDC Priorities (PRIORIDADE #1 ABSOLUTA)

O DDC é o coração do produto. Se não parece "vale R$697/mês", não vende.

#### P0 — Must Have for Launch (CRÍTICO)

| # | Tarefa | Arquivo(s) | Esforço | Impacto |
|---|--------|-----------|---------|---------|
| 1 | **Corrigir tipos RevenueMetrics** | `src/types/ddc.ts` + `src/components/ddc/RevenueMetrics.tsx` + `src/app/dashboard/page.tsx` | 2h | CRÍTICO — sem isso os dados da API não renderizam |
| 2 | **Adicionar QueryClientProvider** | `src/app/dashboard/layout.tsx` ou `src/app/layout.tsx` | 30min | CRÍTICO — hooks React Query crasham sem Provider |
| 3 | **Conectar AILiveFeed ao SSE** | `src/components/ddc/AILiveFeed.tsx` + `src/lib/ddc/use-ai-live-feed.ts` | 3h | ALTO — live feed é o WOW factor |
| 4 | **Conectar GuestCRMPipeline ao hook** | `src/components/ddc/GuestCRMPipeline.tsx` + `src/lib/ddc/use-guest-pipeline.ts` | 2h | ALTO — CRM precisa de dados dinâmicos |
| 5 | **Melhorar RevenueMetrics visual** | `src/components/ddc/RevenueMetrics.tsx` | 3h | ALTO — precisa parecer "vale R$697" |
| 6 | **Adicionar mini-gráficos sparkline** | `src/components/ddc/RevenueMetrics.tsx` | 2h | ALTO — gráficos enriquecem visualmente |
| 7 | **Tela de reservas (BookingsPanel)** | NOVO: `src/components/ddc/BookingsPanel.tsx` | 4h | ALTO — ver reservas é essencial |
| 8 | **Mobile responsive completo** | Todos componentes DDC | 4h | MÉDIO — 60% dos pousadeiros usam mobile |

#### P1 — Should Have

| # | Tarefa | Arquivo(s) | Esforço |
|---|--------|-----------|---------|
| 9 | Painel de Analytics (gráficos recharts) | NOVO: `src/components/ddc/AnalyticsPanel.tsx` | 6h |
| 10 | Drag-and-drop no pipeline | `src/components/ddc/GuestCRMPipeline.tsx` | 4h |
| 11 | Resposta rápida com templates | `src/components/ddc/AILiveFeed.tsx` | 2h |
| 12 | Painel de configurações do tenant | NOVO: `src/components/ddc/SettingsPanel.tsx` | 4h |
| 13 | Notificações com som e badge | `src/lib/ddc/use-ddc-notifications.ts` | 2h |
| 14 | Busca global funcional (⌘K) | `src/components/ddc/DDCHeader.tsx` | 3h |

#### P2 — Nice to Have

| # | Tarefa | Arquivo(s) | Esforço |
|---|--------|-----------|---------|
| 15 | Dark/light mode toggle | Layout DDC | 2h |
| 16 | Export PDF de relatórios | NOVO component | 4h |
| 17 | Multi-language (PT/EN) | All components | 8h |
| 18 | Keyboard shortcuts guide | `src/hooks/ddc.ts` | 2h |

---

### 3.2 ZCC Priorities

#### P0 — Must Have for Launch

| # | Tarefa | Arquivo(s) | Esforço |
|---|--------|-----------|---------|
| 1 | Proteger /zcc com auth middleware | NOVO: `src/middleware.ts` | 2h |
| 2 | LeadsTable com API real (Prisma) | `src/components/zcc/LeadsTable.tsx` (já usa mock que funciona) | 1h |
| 3 | Importar SwarmOverview, ScaleMetrics na aba cerebro | `src/app/zcc/page.tsx` | 1h |
| 4 | TenantManagement com CRUD real | `src/components/zcc/TenantManagement.tsx` + API routes | 4h |

#### P1 — Should Have

| # | Tarefa | Arquivo(s) | Esforço |
|---|--------|-----------|---------|
| 5 | HunterConsole com /api/hunt real | `src/components/zcc/HunterConsole.tsx` | 4h |
| 6 | CampaignPanel com criação real | `src/components/zcc/CampaignPanel.tsx` | 4h |
| 7 | CognitiveObservability importada | `src/app/zcc/page.tsx` | 1h |
| 8 | FintechHub importado | `src/app/zcc/page.tsx` | 1h |

#### P2 — Nice to Have

| # | Tarefa | Arquivo(s) | Esforço |
|---|--------|-----------|---------|
| 9 | Dashboard cross-tenant metrics | NOVO component | 6h |
| 10 | API rate limiting por tenant | Middleware | 3h |
| 11 | Audit log viewer | NOVO component | 4h |

---

### 3.3 Landing Page Priorities

#### P0 — Must Have for Launch

| # | Tarefa | Arquivo(s) | Esforço |
|---|--------|-----------|---------|
| 1 | Importar CTASection na landing | `src/app/page.tsx` | 5min |
| 2 | Integrar PricingSection com checkout real | `src/components/landing/PricingSection.tsx` + `src/app/api/checkout/create` | 3h |
| 3 | Adicionar lead magnet (captura email) | NOVO: `src/components/landing/LeadCaptureSection.tsx` | 3h |
| 4 | UTM tracking + analytics | `src/app/page.tsx` + middleware | 2h |
| 5 | Testar checkout flow end-to-end | `src/app/checkout/success/page.tsx` | 2h |

#### P1 — Should Have

| # | Tarefa | Arquivo(s) | Esforço |
|---|--------|-----------|---------|
| 6 | Vídeo demo no HeroSection | `src/components/landing/HeroSection.tsx` | 3h |
| 7 | Dynamic pricing com A/B test | `src/components/landing/PricingSection.tsx` | 4h |
| 8 | Social proof widgets | `src/components/landing/TestimonialsSection.tsx` | 2h |
| 9 | AOS (Animate on Scroll) melhorado | Landing components | 3h |

#### P2 — Nice to Have

| # | Tarefa | Arquivo(s) | Esforço |
|---|--------|-----------|---------|
| 10 | Blog section | NOVO | 6h |
| 11 | Referral program CTA | NOVO | 4h |
| 12 | WhatsApp floating button | NOVO | 1h |

---

## 4. Plano de Integração ZCC ↔ DDC ↔ Landing

### 4.1 Lead Capture Flow: Landing → ZCC

```
VISITANTE clica "Começar Trial Grátis"
    │
    ▼
PricingSection.tsx → handlePlanSelect(planType, paymentMethod)
    │
    ▼
POST /api/checkout/create
    │   body: { email, name, planType, paymentMethod }
    │
    ├──▶ Cria User { email, name, role: 'client' }
    ├──▶ Cria Tenant { name, email, plan: 'trial', status: 'active' }
    ├──▶ Cria Subscription { tenantId, planType, status: 'pending' }
    │
    ├── SE gratuito:
    │   └──▶ Ativa subscription → redirect /dashboard
    │
    └── SE pago:
        └──▶ Retorna checkoutUrl (Mercado Pago)
            └──▶ Após pagamento → POST /api/checkout/success
                └──▶ Ativa subscription → redirect /dashboard
```

**Arquivos envolvidos:**
- `src/components/landing/PricingSection.tsx` → precisa de `handlePlanSelect`
- `src/app/api/checkout/create/route.ts` → já existe, funcional
- `src/app/checkout/success/page.tsx` → precisa de webhook handler

### 4.2 Tenant Data Flow: ZCC → DDC

```
ZCC (Admin)
    │
    ├── Cria/gerencia Tenant via TenantManagement
    │
    ▼
BANCO DE DADOS (Prisma)
    │
    ├── Table: Tenant { id, name, plan, status }
    ├── Table: Property { tenantId, name, ... }
    ├── Table: AgentConfig { tenantId, agentId, ... }
    │
    ▼
DDC (Dashboard do Cliente)
    │
    ├── Lê dados via tenantId (vem da sessão auth)
    ├── GET /api/ddc/metrics?tenantId=xxx
    ├── GET /api/ddc/guests?tenantId=xxx
    ├── GET /api/ddc/bookings?tenantId=xxx
    └── Todas as APIs filtram por tenantId
```

**Arquivos que precisam de `tenantId` injection:**
- `src/app/api/ddc/metrics/route.ts` → adicionar `tenantId` filter
- `src/app/api/ddc/guests/route.ts` → adicionar `tenantId` filter
- `src/app/api/ddc/live-feed/route.ts` → filtrar por tenant
- `src/app/api/ddc/bookings/route.ts` → filtrar por tenant
- Todos os outros endpoints DDC

### 4.3 Metrics Feedback Flow: DDC → ZCC

```
DDC (Cliente)
    │
    ├── Gera métricas: receita, reservas, atendimentos
    ├── Grava em: PerformanceSnapshot { tenantId, date, metrics }
    │
    ▼
BANCO DE DADOS
    │
    ▼
ZCC (Admin)
    │
    ├── Agrega dados de TODOS os tenants
    ├── DashboardCards mostra: total de receita, total de reservas
    ├── ClientOverview mostra: métricas por tenant
    └── RevenueReportElite mostra: diagnósticos individuais
```

**Implementação:**
- DDC: `POST /api/ddc/metrics/snapshot` → grava snapshot diário
- ZCC: `GET /api/leads` (já agrega) + `GET /api/roi` (já calcula)

### 4.4 Auth Across All Three

```
                    ┌──────────────────────┐
                    │  next-auth session    │
                    │  - userId             │
                    │  - role (admin/client)│
                    │  - tenantId           │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         LANDING (/)     DDC (/dashboard)    ZCC (/zcc)
         - Público       - role: client     - role: admin
         - Sem auth      - tenantId check   - admin check
```

**Estratégia:**
1. Criar `src/middleware.ts` com Next.js middleware
2. Rotas `/dashboard` e `/zcc` exigem sessão
3. `/zcc` exige `role === 'admin'`
4. `/dashboard` exige `role === 'client'` + `tenantId`
5. `/` é pública

### 4.5 Navigation

**Multi-page com layout consistente:**

```
/ (Landing) ──▶ /dashboard (DDC) ──▶ /zcc (Admin)
     │                 │                   │
     │  Links:         │  Links:            │  Links:
     │  - "Entrar" ──▶│  - "ZCC" ────────▶│  - "Voltar" ──▶ /
     │                 │  - "Sair" ────────▶│  - "Dashboard"
     │                 │  - Logo ──────────▶│
```

---

## 5. Ordem de Execução (Sprint by Sprint)

### Sprint 1: DDC — "Tornar o Dashboard Vale R$697/mês"
**Duração estimada: 3-4 dias**
**Objetivo:** O DDC precisa IMPRESSIONAR. Cada pixel conta.

#### Tarefas (em ordem de execução):

**T1: Corrigir tipos e conectar dados reais** (2h)
```
Arquivos:
  - src/types/ddc.ts           → unificar tipos RevenueMetrics
  - src/lib/ddc/mock-data.ts   → alinhar mockData com tipos do componente
  - src/app/dashboard/page.tsx → corrigir prop drilling

Ação:
  1. O componente RevenueMetrics espera:
     { today: { generated: number, reservations: number, aiAttended: number, conversionRate: number } }
  2. O hook useDDCMetrics retorna:
     { attendedToday: number, bookingsClosed: number, revenue: number, ... }
  3. SOLUÇÃO: Criar adapter function em mock-data.ts que transforma o formato
```

**T2: Adicionar QueryClientProvider** (30min)
```
Arquivos:
  - src/app/layout.tsx → adicionar <QueryClientProvider>
  - src/providers/query-provider.tsx → NOVO

Ação:
  1. Criar src/providers/query-provider.tsx com QueryClient
  2. Envolver {children} em layout.tsx
  3. Agora todos os hooks React Query funcionam
```

**T3: Conectar AILiveFeed ao SSE real** (3h)
```
Arquivos:
  - src/components/ddc/AILiveFeed.tsx → refatorar para usar useAILiveFeed
  - src/lib/ddc/use-ai-live-feed.ts → verificar conexão SSE
  - src/lib/ddc/api.ts → verificar connectToLiveFeed()

Ação:
  1. Substituir mock data interno pelo hook useAILiveFeed
  2. O hook já faz fetch inicial + SSE streaming
  3. Adicionar indicator visual de "conectando..." e "ao vivo"
  4. Adicionar pulse animation quando nova mensagem chega
  5. Testar abrindo /dashboard e verificando se mensagens aparecem em tempo real
```

**T4: Conectar GuestCRMPipeline ao hook** (2h)
```
Arquivos:
  - src/components/ddc/GuestCRMPipeline.tsx → usar useGuestPipeline
  - src/components/ddc/PipelineStage.tsx → aceitar props dinâmicas

Ação:
  1. Substituir mockGuests import pelo hook useGuestPipeline
  2. Pipeline agora tem dados dinâmicos organizados por status
  3. onStatusChange chama updateGuestStatus (mutation)
  4. Adicionar loading skeleton enquanto busca dados
```

**T5: Criar BookingsPanel** (4h)
```
Arquivo NOVO:
  - src/components/ddc/BookingsPanel.tsx

Conteúdo:
  1. Lista de reservas com status badges
  2. Filtros: data, status, hóspede
  3. Card de reserva: hóspede, quarto, check-in/out, valor, status pagamento
  4. Quick actions: confirmar, cancelar, enviar mensagem
  5. Mini-chart de reservas por dia da semana
```

**T6: Melhorar RevenueMetrics visual** (3h)
```
Arquivos:
  - src/components/ddc/RevenueMetrics.tsx

Melhorias:
  1. Adicionar sparkline mini-gráfico em cada card (usar recharts)
  2. Animação de contagem (countUp) nos números
  3. Gradient border glow nos cards principais
  4. "Oscilando" no número da receita (simula tempo real)
  5. Badge "🤖 100% IA" com pulse animation
  6. Linha do tempo "Ultima atualização: há 3 segundos"
```

**T7: Mobile responsive completo** (4h)
```
Arquivos:
  - src/app/dashboard/page.tsx → grid responsivo
  - src/components/ddc/DDCHeader.tsx → collapse em mobile
  - src/components/ddc/RevenueMetrics.tsx → 2 cols em mobile
  - src/components/ddc/AILiveFeed.tsx → full width em mobile
  - src/components/ddc/GuestCRMPipeline.tsx → bottom sheet em mobile
  - src/components/ddc/QuickActionsBar.tsx → horizontal scroll

Validação:
  - Abrir no Chrome DevTools com iPhone 14 (390px)
  - Verificar que todos os componentes são visíveis e usáveis
  - Testar scroll horizontal em QuickActionsBar
  - Verificar que AILiveFeed ocupa full-width no mobile
```

**Critérios de Validação Sprint 1:**
- [ ] Dashboard carrega sem erros no console
- [ ] RevenueMetrics mostra "R$ 8.500" com animação
- [ ] AI Live Feed mostra conversas atualizando a cada 3 segundos
- [ ] Pipeline CRM mostra hóspedes organizados por estágio
- [ ] Training Center permite criar/testar prompts
- [ ] Tudo funciona em mobile (390px width)
- [ ] "Parece que vale R$697/mês" — pergunta para validação visual

---

### Sprint 2: Landing Page — Conversão Máxima
**Duração estimada: 2-3 dias**
**Objetivo:** Maximizar taxa de conversão visitante → trial → pago

#### Tarefas:

**T1: Importar CTASection** (5min)
```
Arquivo: src/app/page.tsx
Ação: Adicionar <CTASection /> entre HowItWorksSection e BetaFounderSection
```

**T2: Integrar Pricing com Checkout** (3h)
```
Arquivos:
  - src/components/landing/PricingSection.tsx → handlePlanSelect
  - src/app/api/checkout/create/route.ts → já existe

Ação:
  1. Quando clica em "Assinar LITE via PIX":
     - Abre dialog/modal com form: nome, email, WhatsApp
     - Valida campos
     - POST /api/checkout/create { email, name, planType: 'lite', paymentMethod: 'pix' }
     - Se sucesso, redireciona para checkoutUrl
     - Se gratuito, redireciona para /dashboard direto
  2. Adicionar loading state no botão
  3. Adicionar feedback visual (checkmark + "Redirecionando...")
```

**T3: Lead Magnet — Captura de Email** (3h)
```
Arquivo NOVO:
  - src/components/landing/LeadCaptureSection.tsx
  - src/app/api/leads/route.ts (JÁ EXISTE — POST cria lead)

Posição: Entre PricingSection e FAQSection

Conteúdo:
  1. Headline: "Quer saber quanto a IA pode gerar para sua pousada?"
  2. Form: Nome, Email, WhatsApp, Nome da Pousada
  3. CTA: "Receber Simulação Gratuita"
  4. Ao submit → POST /api/leads + POST /api/roi (calcula ROI na hora)
  5. Mostra resultado: "Sua pousada pode economizar R$ X.XXX/mês"
  6. CTA secundário: "Começar Trial Agora →"
```

**T4: UTM Tracking** (2h)
```
Arquivos:
  - src/app/page.tsx → capturar UTM params
  - src/lib/utm.ts → NOVO: parse e store UTM
  - src/app/api/checkout/create/route.ts → salvar UTM no metadata

Ação:
  1. Ler ?utm_source, ?utm_medium, ?utm_campaign da URL
  2. Salvar em localStorage
  3. Incluir no POST /api/checkout/create
  4. Salvar no metadata do Tenant e Subscription
```

**T5: Testar Checkout Flow E2E** (2h)
```
Cenários:
  1. Gratuito: Clica → preenche form → redireciona /dashboard
  2. Pago PIX: Clica → preenche form → redireciona checkout → success → /dashboard
  3. Cancelado: Clica → cancela → volta para landing com ?checkout=cancelled
  4. Erro: API fora → mostra toast de erro + "Tente novamente"
```

---

### Sprint 3: ZCC — Operações Completas
**Duração estimada: 3-4 dias**
**Objetivo:** O ZCC precisa ser o painel de controle operacional completo

#### Tarefas:

**T1: Auth Middleware** (2h)
```
Arquivo NOVO:
  - src/middleware.ts

Lógica:
  1. Verifica session (next-auth JWT)
  2. /zcc → exige role === 'admin'
  3. /dashboard → exige role === 'client'
  4. Se não autenticado → redirect /login
  5. Se sem permissão → redirect /
```

**T2: TenantManagement com CRUD real** (4h)
```
Arquivos:
  - src/components/zcc/TenantManagement.tsx → conectar ao Prisma
  - Criar API: GET/POST/PUT/DELETE /api/tenants (usar Tenant model)

Ação:
  1. Listar tenants do banco
  2. Criar novo tenant com wizard
  3. Editar dados do tenant
  4. Suspender/reativar tenant
  5. Ver detalhes: propriedade, plano, usage
```

**T3: Importar componentes órfãos** (1h)
```
Arquivo: src/app/zcc/page.tsx

Ação:
  1. Na aba 'cerebro': adicionar SwarmOverview, CognitiveObservability
  2. Na aba 'settings': adicionar ScaleMetrics, FintechHub, ApiKeysPanel
  3. Organizar em sub-grid layout
```

**T4: HunterConsole funcional** (4h)
```
Arquivo: src/components/zcc/HunterConsole.tsx

Ação:
  1. Conectar POST /api/hunt (simula busca de leads)
  2. Conectar SSE /api/hunt-stream (mostra progresso da busca)
  3. Mostra resultados em tempo real (leads encontrados)
  4. Botão "Salvar todos" que cria leads no banco
```

**T5: CampaignPanel com criação** (4h)
```
Arquivo: src/components/zcc/CampaignPanel.tsx

Ação:
  1. Form de criação: nome, tipo, audiência, template
  2. Preview da mensagem
  3. Agendar campanha
  4. Status dashboard: enviados, entregues, lidos, respondidos
  5. Conectar POST/GET /api/campaigns
```

---

### Sprint 4: Integração Final
**Duração estimada: 2-3 dias**
**Objetivo:** Tudo funciona junto, sem arestas

#### Tarefas:

**T1: tenantId injection em todas APIs DDC** (3h)
```
Arquivos:
  - src/app/api/ddc/metrics/route.ts
  - src/app/api/ddc/guests/route.ts
  - src/app/api/ddc/live-feed/route.ts
  - src/app/api/ddc/bookings/route.ts
  - src/app/api/ddc/conversations/route.ts
  - src/app/api/ddc/training/route.ts
  - src/app/api/ddc/notifications/route.ts

Ação:
  1. Ler tenantId do session/auth header
  2. Filtrar todos os dados por tenantId
  3. Quando mock data, usar tenantId para simular dados diferentes por tenant
```

**T2: PerformanceSnapshots DDC → ZCC** (3h)
```
Arquivo NOVO:
  - src/app/api/ddc/metrics/snapshot/route.ts

Ação:
  1. DDC grava snapshot diário por tenant
  2. ZCC agrega e mostra em DashboardCards
  3. ClientOverview mostra métricas por tenant
```

**T3: Navigation polish** (2h)
```
Arquivos:
  - src/components/ddc/DDCHeader.tsx → link para /zcc se admin
  - src/components/zcc/ZCCLayout → link para /dashboard (vizualizar tenant)
  - src/components/landing/Footer.tsx → links atualizados

Ação:
  1. Adicionar "Admin" link no header DDC (visível só para admins)
  2. ZCC: botão "Ver como Tenant" em cada card
  3. Breadcrumb: ZCC > Tenant X > Dashboard
```

**T4: Responsive testing final** (4h)
```
Dispositivos:
  - iPhone SE (375px)
  - iPhone 14 (390px)
  - iPad Mini (768px)
  - iPad Pro (1024px)
  - Desktop (1440px)
  - Ultrawide (1920px)

Módulos:
  - Landing: scroll suave, seções visíveis
  - DDC: bento grid adaptativo, cards empilham em mobile
  - ZCC: tabelas scrollam horizontalmente em mobile
```

**T5: Cleanup de arquivos legados** (1h)
```
ARQUIVOS PARA DELETAR:
  - src/app/page-download.tsx
  - src/app/page.download-backup.tsx
  - src/app/downloads/page.tsx
  - src/app/api/download/[filename]/route.ts
  - src/app/api/route.ts (root API sem propósito)
  - src/app/api/ddc/guests/route.ts.backup
  - landing_extracted/ (pasta inteira)
  - extract-ddc/ (pasta inteira)
  - dist/ (pasta inteira)
  - upload/ (arquivos backup — mover para backup/ se necessário)
```

---

## 6. Dependências Técnicas

### 6.1 Pacotes Necessários (Já Instalados ✅)

| Pacote | Versão | Uso |
|--------|--------|-----|
| `next` | 16.1.1 | Framework principal |
| `react` | 19.0.0 | UI library |
| `@prisma/client` | 6.11.1 | ORM |
| `framer-motion` | 12.23.2 | Animações |
| `@tanstack/react-query` | 5.82.0 | Data fetching |
| `recharts` | 2.15.4 | Gráficos |
| `lucide-react` | 0.525.0 | Ícones |
| `next-auth` | 4.24.11 | Autenticação |
| `zustand` | 5.0.6 | State management |
| `date-fns` | 4.1.0 | Formatação de datas |
| `zod` | 4.0.2 | Validação |
| `react-hook-form` | 7.60.0 | Forms |
| `@dnd-kit/core` | 6.3.1 | Drag and drop |
| `sonner` | 2.0.6 | Toasts |

### 6.2 Pacotes a Instalar

```bash
# Necessários para melhorias
bun add @tremor/react  # Para sparkline charts (ou usar recharts diretamente)
bun add next-themes    # Para dark/light mode (já instalado)
```

### 6.3 Environment Variables

```env
# Banco de dados
DATABASE_URL="file:./db/custom.db"

# NextAuth (quando implementar auth real)
NEXTAUTH_SECRET="gerar-uma-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"

# AI Providers (ZCC router)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."
GOOGLE_GENERATIVE_AI_API_KEY="AI..."

# Mercado Pago (quando implementar checkout real)
MP_ACCESS_TOKEN="TEST-..."
MP_PUBLIC_KEY="TEST-..."

# WhatsApp Business API
WHATSAPP_API_TOKEN="EAAG..."
WHATSAPP_PHONE_NUMBER_ID="..."
WHATSAPP_BUSINESS_ACCOUNT_ID="..."
```

### 6.4 Serviços Externos (para produção)

| Serviço | Uso | Status |
|---------|-----|--------|
| Mercado Pago | Checkout de pagamentos | ⏳ Precisa integrar |
| WhatsApp Cloud API | Mensagens WhatsApp | ⏳ Precisa integrar |
| Vercel / Railway | Deploy | ✅ Ready |
| OpenRouter / AI Providers | Roteamento de IA | ⏳ Configurar keys |

### 6.5 Database Schema Changes Necessárias

O schema `prisma/schema.prisma` já tem 30 modelos completos. Mudanças necessárias:

```prisma
// ADICIONAR em model Tenant:
// (nenhuma mudança necessária — modelo já está completo)

// VERIFICAR: Lead model não tem tenantId — leads são globais (correto para ZCC prospecção)

// ADICIONAR em model Guest:
// Campo source já existe ✅

// NENHUMA MIGRAÇÃO NECESSÁRIA para o MVP
```

---

## 7. Critérios de Qualidade por Módulo

### 7.1 DDC Quality Criteria — "Parece que vale R$697/mês?"

#### Visual:
- [ ] **Fundo escuro premium**: `bg-[#0a0a0f]` com glassmorphism `bg-white/[0.02]`
- [ ] **Gradientes vibrantes**: emerald/cyan/blue com `border-white/[0.06]`
- [ ] **Animações suaves**: framer-motion em todos os componentes (fadeIn, stagger, pulse)
- [ ] **Tipografia clara**: hierarquia visual com 3 tamanhos (2xl bold, sm regular, 10px mono)
- [ ] **Spacing consistente**: `gap-4` entre cards, `p-4` interno, `max-w-[1920px]`
- [ ] **Zero dead space**: bento grid preenche toda a largura

#### Funcional:
- [ ] **RevenueMetrics mostra**: "R$ 8.500 gerados hoje • 45 atendimentos IA • 12 reservas"
- [ ] **AI Live Feed**: mensagens atualizam a cada 3 segundos com typing indicator
- [ ] **CRM Pipeline**: hóspedes organizados em hot/warm/cold/booked/lost com drag
- [ ] **Training Center**: criar, testar, ativar/desativar prompts
- [ ] **Notificações**: badge count, dropdown, mark as read
- [ ] **Busca global**: ⌘K abre busca

#### Performance:
- [ ] **FCP < 1.5s**: First Contentful Paint
- [ ] **TTI < 3s**: Time to Interactive
- [ ] **Bundle size < 200KB gzipped**: por rota
- [ ] **Zero layout shift**: CLS < 0.1

#### Responsivo:
- [ ] **375px (iPhone SE)**: tudo empilhado verticalmente
- [ ] **768px (iPad)**: grid 2 colunas
- [ ] **1440px (Desktop)**: bento grid 3 colunas completo
- [ ] **1920px (Ultrawide)**: max-w-[1920px] centered

---

### 7.2 ZCC Quality Criteria

- [ ] **LeadsTable**: sort por coluna, filtro por status, busca, seleção múltipla
- [ ] **CampaignPanel**: criar campanha → agendar → ver métricas de envio
- [ ] **CerebroZella**: Thompson Sampling visualization atualiza em tempo real
- [ ] **TenantManagement**: CRUD completo de tenants
- [ ] **DispararEliteButton**: seleciona leads → dispara → mostra resultado
- [ ] **Auth protegida**: só admins acessam /zcc

---

### 7.3 Landing Page Quality Criteria

- [ ] **Conversion funnel funciona**: Hero CTA → Pricing → Checkout → Dashboard
- [ ] **Loading states**: botões mostram spinner durante checkout
- [ ] **Error handling**: API errors mostram toast amigável
- [ ] **Mobile-first**: Landing 100% funcional em 375px
- [ ] **Pricing accuracy**: valores batem com checkout API
- [ ] **SEO básico**: meta title, description, OG tags

---

## 8. Arquivo de Estrutura Final

```
src/
├── app/
│   ├── layout.tsx                          # Layout global (com QueryClientProvider)
│   ├── page.tsx                            # Landing Page
│   ├── globals.css                         # Estilos globais
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                      # Layout DDC (auth check)
│   │   └── page.tsx                        # Dashboard DDC principal
│   │
│   ├── zcc/
│   │   └── page.tsx                        # ZCC Console (4 abas)
│   │
│   ├── checkout/
│   │   ├── success/page.tsx                # Pós-pagamento sucesso
│   │   └── cancel/page.tsx                # Pagamento cancelado
│   │
│   ├── login/
│   │   └── page.tsx                        # Página de login (NOVO - SPRINT 3)
│   │
│   └── api/
│       ├── ddc/
│       │   ├── metrics/route.ts            # GET métricas com tenantId
│       │   ├── metrics/snapshot/route.ts   # POST snapshot diário (NOVO - SPRINT 4)
│       │   ├── live-feed/route.ts          # SSE conversas
│       │   ├── conversations/route.ts      # GET conversas
│       │   ├── guests/route.ts              # GET/POST hóspedes
│       │   ├── guests/[id]/route.ts         # GET/PUT/DELETE hóspede
│       │   ├── bookings/route.ts           # GET/POST reservas
│       │   ├── ai-status/route.ts          # GET status IA
│       │   ├── training/route.ts            # GET/POST treinamentos
│       │   ├── training/[id]/route.ts      # GET/PUT/DELETE treino
│       │   ├── notifications/route.ts      # GET notificações
│       │   └── notifications/read-all/route.ts # PUT marcar todas lidas
│       │
│       ├── checkout/
│       │   ├── create/route.ts             # POST criar checkout
│       │   ├── success/route.ts            # POST webhook sucesso
│       │   └── cancel/route.ts             # POST webhook cancelamento
│       │
│       ├── leads/
│       │   ├── route.ts                    # GET/POST leads (Prisma)
│       │   └── [id]/route.ts              # GET/PUT/DELETE lead
│       │
│       ├── targets/
│       │   ├── route.ts                    # GET/POST alvos
│       │   └── [id]/route.ts              # GET/PUT/DELETE alvo
│       │
│       ├── campaigns/
│       │   ├── route.ts                    # GET/POST campanhas
│       │   └── [id]/route.ts              # GET/PUT/DELETE campanha
│       │
│       ├── hunt/route.ts                   # POST buscar leads
│       ├── hunt-stream/route.ts           # SSE progresso busca
│       ├── roi/route.ts                   # POST calcular ROI
│       ├── agent-logs/route.ts            # GET logs de agentes
│       ├── readiness/route.ts             # GET health check
│       ├── diagnose/route.ts              # GET diagnóstico
│       ├── swipe-templates/route.ts       # GET templates WhatsApp
│       ├── bulk-whatsapp/route.ts         # POST disparo em massa
│       │
│       ├── brain/
│       │   ├── route.ts                   # GET/POST status cérebro
│       │   ├── health/route.ts            # GET health check
│       │   └── intents/route.ts           # GET intenções
│       │
│       ├── router/
│       │   ├── providers/route.ts         # GET/PUT providers AI
│       │   └── budget/route.ts            # GET/PUT orçamento
│       │
│       └── tenants/route.ts               # GET/POST/PUT/DELETE tenants (NOVO - SPRINT 3)
│
├── components/
│   ├── ddc/
│   │   ├── index.ts                       # Barrel exports
│   │   ├── DDCHeader.tsx                  # Header com IA status
│   │   ├── RevenueMetrics.tsx             # Cards KPI (R$ 8.500, 45, 12)
│   │   ├── AILiveFeed.tsx                 # Feed WhatsApp ao vivo
│   │   ├── GuestCRMPipeline.tsx           # Pipeline CRM
│   │   ├── TrainingCenter.tsx             # Centro de treinamento
│   │   ├── QuickActionsBar.tsx            # Barra de ações
│   │   ├── BookingsPanel.tsx              # Painel de reservas (NOVO - SPRINT 1)
│   │   ├── AnalyticsPanel.tsx             # Analytics com gráficos (NOVO - SPRINT 1)
│   │   ├── MetricCard.tsx                 # Card genérico
│   │   ├── ConversationCard.tsx           # Card de conversa
│   │   ├── GuestCard.tsx                  # Card de hóspede
│   │   ├── PipelineStage.tsx             # Estágio pipeline
│   │   ├── TrainingCard.tsx               # Card de treino
│   │   └── AIStatusBadge.tsx             # Badge status IA
│   │
│   ├── zcc/
│   │   ├── ZCCLayout.tsx                  # Layout wrapper
│   │   ├── DashboardCards.tsx             # Cards KPI operacionais
│   │   ├── CerebroZella.tsx              # Thompson Sampling brain
│   │   ├── ClientOverview.tsx            # Visão dos 10 clientes
│   │   ├── TargetsPanel.tsx               # Painel de alvos
│   │   ├── HunterConsole.tsx             # Console de caça
│   │   ├── LeadsTable.tsx                 # Tabela de leads
│   │   ├── CampaignPanel.tsx             # Painel de campanhas
│   │   ├── DispararEliteButton.tsx        # Botão disparo
│   │   ├── RevenueReportElite.tsx         # Diagnóstico receita
│   │   ├── SwarmOverview.tsx              # Overview swarm agentes
│   │   ├── ScaleMetrics.tsx              # Métricas escala
│   │   ├── ApiKeysPanel.tsx              # API keys
│   │   ├── CognitiveObservability.tsx     # Observabilidade
│   │   ├── TenantManagement.tsx          # Gerenciamento tenants
│   │   └── FintechHub.tsx               # Hub financeiro
│   │
│   ├── landing/
│   │   ├── HeroSection.tsx               # Hero com CTA
│   │   ├── TrustBadgesSection.tsx        # Badges confiança
│   │   ├── PainPointsSection.tsx         # Dores mercado
│   │   ├── FeaturesSection.tsx           # Features
│   │   ├── HowItWorksSection.tsx         # Como funciona
│   │   ├── SavingsCalculator.tsx          # Calculadora ROI
│   │   ├── TestimonialsSection.tsx        # Depoimentos
│   │   ├── ArchitectureSection.tsx        # Arquitetura
│   │   ├── BookingPlatformsMarquee.tsx    # Marquee plataformas
│   │   ├── SecuritySection.tsx           # Segurança
│   │   ├── IntegrationsSection.tsx        # Integrações
│   │   ├── BetaFounderSection.tsx         # CTA beta
│   │   ├── PricingSection.tsx            # Pricing 4 planos
│   │   ├── FAQSection.tsx                # FAQ
│   │   ├── CTASection.tsx                # CTA intermediário
│   │   ├── FinalCTASection.tsx           # CTA final
│   │   ├── Footer.tsx                    # Footer
│   │   └── LeadCaptureSection.tsx        # Lead magnet (NOVO - SPRINT 2)
│   │
│   └── ui/                               # shadcn/ui components (40+ files)
│
├── lib/
│   ├── db.ts                             # Prisma client
│   ├── utils.ts                          # Utility functions
│   ├── numberFormat.ts                   # Formatação BRL
│   │
│   ├── ddc/
│   │   ├── api.ts                        # API client completo (283 linhas)
│   │   ├── mock-data.ts                  # Mock data realista (~800 linhas)
│   │   ├── use-ddc-metrics.ts            # Hook métricas
│   │   ├── use-ai-live-feed.ts           # Hook SSE live feed
│   │   ├── use-guest-pipeline.ts         # Hook CRM pipeline
│   │   ├── use-training-center.ts        # Hook treinamentos
│   │   └── use-ddc-notifications.ts      # Hook notificações
│   │
│   ├── ai/
│   │   ├── zaos-neuro-router.ts          # Thompson Sampling router
│   │   ├── budget-guard.ts               # Budget guard
│   │   ├── circuit-breaker.ts            # Circuit breaker
│   │   ├── semantic-cache.ts             # Cache semântico
│   │   ├── headroom-client.ts            # Headroom client
│   │   └── context-discretizer.ts        # Context discretizer
│   │
│   ├── zcc-mock-data.ts                 # Mock ZCC
│   ├── zcc-clients-data.ts              # 10 clientes beta
│   ├── mock-data.ts                     # Mock genérico
│   ├── leads-types.ts                   # Tipos leads
│   └── api-hooks.ts                     # Hooks API
│
├── types/
│   └── ddc.ts                           # Tipos DDC (449 linhas)
│
├── hooks/
│   ├── ddc.ts                           # 12 custom hooks
│   ├── use-toast.ts                     # Toast hook
│   └── use-mobile.ts                    # Mobile detection
│
├── providers/
│   └── query-provider.tsx               # React Query provider (NOVO - SPRINT 1)
│
└── middleware.ts                         # Auth middleware (NOVO - SPRINT 3)
```

### Arquivos a DELETAR (cleanup):

```
ARQUIVOS LEGADOS A REMOVER:
├── src/app/page-download.tsx              # ❌ Download page legada
├── src/app/page.download-backup.tsx       # ❌ Backup da landing
├── src/app/downloads/page.tsx             # ❌ Downloads page
├── src/app/api/download/[filename]/route.ts # ❌ Download API
├── src/app/api/route.ts                   # ❌ Root API sem propósito
├── src/app/api/ddc/guests/route.ts.backup # ❌ Backup
├── landing_extracted/                     # ❌ Pasta de extração
├── extract-ddc/                           # ❌ Pasta de extração
├── dist/                                  # ❌ Builds antigos
└── ddc-project.zip / landing-page.zip     # ❌ Zips temporários (em root)
```

---

## 9. Plano de Testes por Módulo

### 9.1 DDC — Testes Manuais

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Dashboard carrega | Abrir `/dashboard` | Todos os cards visíveis sem erro |
| 2 | RevenueMetrics mostra dados | Verificar cards de métricas | "R$ 8.500 gerados hoje" visível |
| 3 | AI Live Feed conecta | Esperar 5 segundos | Badge "Ao Vivo" verde, mensagens aparecem |
| 4 | Pipeline carrega hóspedes | Verificar pipeline | Hóspedes em hot/warm/cold/booked/lost |
| 5 | Filtro pipeline funciona | Clicar em "Quentes" | Só mostra hóspedes hot |
| 6 | Busca pipeline funciona | Digitar nome no search | Filtra resultados |
| 7 | Training Center lista prompts | Verificar lista | Prompts aparecem com badges |
| 8 | Criar treinamento | Clicar "Novo Treino" → preencher → salvar | Prompt aparece na lista |
| 9 | Testar treinamento | Selecionar prompt → "Testar Prompt" | Resultado aparece (passed/failed) |
| 10 | QuickActions navega | Clicar em cada ícone | Navegação ou ação visual |
| 11 | Notificações abre | Clicar sininho | Dropdown com notificações |
| 12 | Mobile 375px | Redimensionar para 375px | Layout empilhado, legível |
| 13 | Mobile 768px | Redimensionar para 768px | Grid 2 colunas |
| 14 | Refresh automático | Esperar 30 segundos | Métricas atualizam |

### 9.2 ZCC — Testes Manuais

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Overview carrega | Abrir `/zcc` → aba Visão Geral | DashboardCards + ClientOverview |
| 2 | ClientOverview mostra 10 | Ver lista | 10 clientes beta com métricas |
| 3 | Cérebro carrega | Clicar aba Cérebro | CerebroZella com Thompson Sampling |
| 4 | Prospecção carrega | Clicar aba Prospecção | Targets + Hunter + Campaigns + Leads |
| 5 | LeadsTable filtra | Selecionar target no sidebar | Leads filtram |
| 6 | LeadsTable seleciona | Marcar checkbox leads | Contador no DispararEliteButton |
| 7 | Disparar funciona | Selecionar leads → clicar disparar | Feedback de envio |
| 8 | Revenue Diagnosis | Clicar diagnóstico em lead | Modal com análise |
| 9 | Settings mostra | Clicar aba Configurações | 6 cards de configuração |
| 10 | Navegação mobile | Testar em 375px | Tabs scrollam horizontalmente |

### 9.3 Landing Page — Testes Manuais

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Hero CTA | Clicar "Começar Trial" | Scroll para pricing |
| 2 | Pricing mostra | Scroll até seção | 4 planos visíveis |
| 3 | Calculadora ROI | Preencher dados → calcular | Resultado mostrado |
| 4 | Checkout gratuito | Selecionar gratuito → preencher → enviar | Redirect /dashboard |
| 5 | Checkout pago PIX | Selecionar LITE → preencher → enviar | Redirect checkout URL |
| 6 | Checkout cancel | Acessar /checkout/cancel | Mensagem de cancelamento |
| 7 | Checkout success | Acessar /checkout/success | Mensagem de sucesso |
| 8 | FAQ accordion | Clicar perguntas | Expand/colapse |
| 9 | Mobile landing | Abrir em 375px | Tudo legível, scroll suave |
| 10 | Todos os links | Clicar Footer links | Navegam corretamente |

### 9.4 Integração — Testes Cruzados

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Lead → Tenant → Dashboard | Landing → Trial → Dashboard | Dashboard mostra dados do tenant |
| 2 | ZCC vê novo tenant | ZCC → Overview → refrescar | Novo tenant aparece |
| 3 | DDC metrics → ZCC | DDC gera receita → ZCC overview | ZCC mostra receita agregada |
| 4 | Auth redirect | Acessar /dashboard sem login | Redirect para /login |
| 5 | Auth redirect admin | Acessar /zcc como client | Redirect para / |
| 6 | Cross-navigation | DDC → ZCC link | Navega para ZCC |
| 7 | Back navigation | ZCC → "Voltar" | Volta para landing |

---

## Resumo Executivo

| Módulo | Componentes | APIs | Status Geral | Prioridade |
|--------|-------------|------|-------------|-----------|
| **DDC** | 12 + 2 novos | 12 | 80% pronto, precisa polish | 🔴 #1 |
| **Landing** | 16 + 1 novo | 3 | 90% pronto, precisa checkout real | 🟡 #2 |
| **ZCC** | 16 | 18 | 85% pronto, precisa auth + CRUD real | 🟢 #3 |

**Tempo total estimado: 10-14 dias de trabalho concentrado**

**Sprint 1 (DDC):** 3-4 dias → **RESULTADO: Dashboard que impressiona**
**Sprint 2 (Landing):** 2-3 dias → **RESULTADO: Funil de conversão completo**
**Sprint 3 (ZCC):** 3-4 dias → **RESULTADO: Operações centralizadas**
**Sprint 4 (Integração):** 2-3 dias → **RESULTADO: Sistema integrado e polido**

---

> *Este documento é vivo. Atualizar conforme o progresso dos sprints.*
> *Próxima revisão: após Sprint 1 completo.*
