# PLANO DE DOMÍNIO — FASE 1 (Semanas 1-12)

## MVP Freemium Competitivo — ZEHLA SmartHotel

> **Data:** 2026-05-21
> **Duração:** 12 semanas (3 Sprints)
> **Objetivo:** Fundar o MVP Freemium competitivo atacando cirurgicamente os gaps dos concorrentes
> **Base de Leads:** 10.175 contatos consolidados e enriquecidos

---

## Sprint 1 — Fundação e Ingestão (Semanas 1-4)

### Semana 1: Consolidação do Banco de Dados
**Objetivo:** Efetivar schemas Prisma e consolidar PostgreSQL

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Adicionar modelos de funil ao schema | `prisma/schema.prisma` | TODO |
| Rodar migração | `npx prisma migrate dev` | TODO |
| Importar 10.175 leads consolidados | `scripts/import-leads.ts` | TODO |
| Validar integridade dos dados | `scripts/validate-leads.ts` | TODO |
| Configurar SQLite → PostgreSQL (produção) | `.env` | TODO |

**Modelos novos no Prisma:**
- `FunnelEvent` — Eventos do funil (abertura, clique, visita, resposta)
- `Campaign` — Campanhas de outreach
- `WebhookLog` — Log de todos os webhooks recebidos
- `FunnelScore` — Score dinâmico do lead no funil

### Semana 2: ZEHLA Connect (Link-in-Bio + Booking)
**Objetivo:** Transformar lógica de link-in-bio em componentes modulares

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Criar componente LinkInBio | `src/components/connect/LinkInBio.tsx` | TODO |
| Criar página pública da pousada | `src/app/connect/[slug]/page.tsx` | TODO |
| Integrar com booking engine básico | `src/lib/connect/booking.ts` | TODO |
| Resolver Gaps S-07 e SH-05 | — | TODO |
| Criar admin de configuração | `src/app/dashboard/connect/page.tsx` | TODO |

**Gaps resolvidos:** S-07 (Silbeck), SH-05 (SimplesHotel), QV-03 (QuartoVerde)

### Semana 3: Pipeline Freemium
**Objetivo:** Fluxo de aquisição completo (Landing → Raio-X → Teste Grátis)

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Landing page principal | `src/app/page.tsx` | TODO |
| Página de Raio-X | `src/app/raio-x/page.tsx` | TODO |
| Wizard de signup (5 min) | `src/components/onboarding/Wizard.tsx` | TODO |
| Middleware de rate limiting | `src/middleware.ts` | TODO |
| Validação de plano por propriedade | `src/lib/auth/plan-guard.ts` | TODO |
| Bloqueio/liberação de features | `src/lib/auth/feature-flag.ts` | TODO |

### Semana 4: Onboarding Mágico
**Objetivo:** Wizard de 5 minutos com componentização

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Step 1: Dados da pousada | `src/components/onboarding/Step1.tsx` | TODO |
| Step 2: Configurar WhatsApp | `src/components/onboarding/Step2.tsx` | TODO |
| Step 3: Importar reservas | `src/components/onboarding/Step3.tsx` | TODO |
| Step 4: Configurar templates | `src/components/onboarding/Step4.tsx` | TODO |
| Step 5: Primeiro disparo | `src/components/onboarding/Step5.tsx` | TODO |
| Tutorial interativo | `src/components/onboarding/Tutorial.tsx` | TODO |

**Gap resolvido:** SB-02 (Silbeck — onboarding leva horas → ZEHLA: 5 minutos)

---

## Sprint 2 — Inteligência e Classificação (Semanas 5-8)

### Semana 5: ZEHLA Brain — Motor de Classificação
**Objetivo:** Classificar leads nos clusters HOT, WARM, COLD

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Criar módulo de classificação | `src/lib/brain/classifier.ts` | TODO |
| Implementar scoring dinâmico | `src/lib/brain/scorer.ts` | TODO |
| Configurar LLM local (Ollama) | `src/lib/brain/llm-router.ts` | TODO |
| Criar endpoints de classificação | `src/app/api/brain/classify/route.ts` | TODO |
| Atualizar cluster no PostgreSQL | `prisma/schema.prisma` (Lead.cluster) | TODO |

### Semana 6: ZEHLA Hermes — WhatsApp IA
**Objetivo:** Automação de conversação via WhatsApp

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Integrar Z-API | `src/lib/hermes/zapi-client.ts` | TODO |
| Integrar Evolution API (fallback) | `src/lib/hermes/evolution-client.ts` | TODO |
| Criar template engine | `src/lib/hermes/templates.ts` | TODO |
| Implementar swipe templates | `src/lib/hermes/swipe-engine.ts` | TODO |
| Webhook de respostas | `src/app/api/webhooks/whatsapp/route.ts` | TODO |
| Auto-respostas com IA | `src/lib/hermes/auto-reply.ts` | TODO |

**Gaps resolvidos:** SB-06, IN-02, SH-03, CB-04 (WhatsApp nativo)

### Semana 7: Funil Adaptativo — Webhooks e Eventos
**Objetivo:** Infraestrutura de captura e processamento de eventos

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Configurar Resend/SendGrid | `src/lib/email/provider.ts` | TODO |
| Webhook de email (abertura/clique) | `src/app/api/webhooks/email/route.ts` | TODO |
| BullMQ setup | `src/lib/queue/queue.ts` | TODO |
| Processador de eventos | `src/lib/queue/event-processor.ts` | TODO |
| Dead Letter Queue | `src/lib/queue/dlq.ts` | TODO |
| Retry exponencial | `src/lib/queue/retry.ts` | TODO |

### Semana 8: Landing Pages Dinâmicas (SSR)
**Objetivo:** Páginas customizadas baseadas no perfil do lead

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Middleware de detecção de lead | `src/middleware.ts` | TODO |
| LP variante financeira | `src/app/landing/financeira/page.tsx` | TODO |
| LP variante operacional | `src/app/landing/operacional/page.tsx` | TODO |
| LP variante ocupação | `src/app/landing/ocupacao/page.tsx` | TODO |
| Calculadora de economia | `src/components/calculator/EconomyCalc.tsx` | TODO |
| Pixel de tracking | `src/components/tracking/Pixel.tsx` | TODO |

**Gaps resolvidos:** SB-01 (complexidade), SH-01 (interface complexa)

---

## Sprint 3 — Conversão e Flywheel (Semanas 9-12)

### Semana 9: Raio-X Automatizado
**Objetivo:** Produto-isca que entrega valor real

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Motor de análise de OTA | `src/lib/ray-x/ota-analysis.ts` | TODO |
| Score de maturidade digital | `src/lib/ray-x/digital-maturity.ts` | TODO |
| Benchmark regional | `src/lib/ray-x/benchmark.ts` | TODO |
| Gerador de PDF | `src/lib/ray-x/pdf-generator.ts` | TODO |
| Entrega via WhatsApp | `src/lib/ray-x/delivery.ts` | TODO |
| Endpoint de solicitação | `src/app/api/ray-x/route.ts` | TODO |

### Semana 10: Checkout e Pagamento
**Objetivo:** Integração com Stripe/Asaas para conversão

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Integrar Stripe | `src/lib/payments/stripe.ts` | TODO |
| Integrar Asaas (Pix/Boleto) | `src/lib/payments/asaas.ts` | TODO |
| Página de checkout | `src/app/checkout/page.tsx` | TODO |
| Webhook de pagamento | `src/app/api/webhooks/payment/route.ts` | TODO |
| Gestão de subscrições | `src/lib/payments/subscriptions.ts` | TODO |
| Trial de 14 dias | `src/lib/payments/trial.ts` | TODO |

### Semana 11: CRM Cognitivo
**Objetivo:** CRM que prevê e antecipa preferências

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| PredictGuestPreferencesUseCase | `src/lib/brain/use-cases/PredictGuestPreferencesUseCase.ts` | TODO |
| cognitiveTags no ConnectProfile | `prisma/schema.prisma` | TODO |
| Dashboard CRM | `src/app/dashboard/crm/page.tsx` | TODO |
| Timeline do hóspede | `src/components/crm/GuestTimeline.tsx` | TODO |
| Upsell suggestions | `src/lib/brain/use-cases/UpsellSuggestionsUseCase.ts` | TODO |
| Segmentação automática | `src/lib/crm/segmentation.ts` | TODO |

**Gaps resolvidos:** IN-01 (CRM estático), SB-05 (CRM genérico), SB-10 (análise de intenção)

### Semana 12: Flywheel e Métricas
**Objetivo:** Loop de retroalimentação + dashboard completo

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Sistema de indicação | `src/lib/referrals/engine.ts` | TODO |
| NPS automatizado | `src/lib/nps/engine.ts` | TODO |
| Cases de sucesso | `src/app/cases/page.tsx` | TODO |
| Dashboard de métricas | `src/app/dashboard/metrics/page.tsx` | TODO |
| Alertas de churn | `src/lib/churn/alerts.ts` | TODO |
| Upsell detector | `src/lib/brain/use-cases/UpsellDetectorUseCase.ts` | TODO |

---

## Arquitetura de Referência

### Clean Architecture Lite
```
src/
├── lib/
│   ├── brain/              # ZEHLA Brain — IA cognitiva
│   │   ├── ai/
│   │   │   └── LlmRouterService.ts
│   │   ├── use-cases/
│   │   │   ├── PredictGuestPreferencesUseCase.ts
│   │   │   ├── UpsellSuggestionsUseCase.ts
│   │   │   └── UpsellDetectorUseCase.ts
│   │   ├── classifier.ts
│   │   └── scorer.ts
│   ├── connect/            # ZEHLA Connect — Link-in-bio + Booking
│   ├── hermes/             # ZEHLA Hermes — WhatsApp IA
│   ├── pms/                # PMS — Property Management
│   ├── revenue/            # Revenue AI — Precificação dinâmica
│   ├── funnel/             # Funil Adaptativo
│   ├── ray-x/              # Raio-X Automatizado
│   ├── payments/           # Stripe/Asaas
│   ├── crm/                # CRM Cognitivo
│   ├── referrals/          # Sistema de indicação
│   ├── nps/                # NPS automatizado
│   ├── churn/              # Alertas de churn
│   ├── email/              # Provedor de email
│   └── queue/              # BullMQ + Redis
├── app/
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── email/route.ts
│   │   │   ├── whatsapp/route.ts
│   │   │   └── payment/route.ts
│   │   ├── brain/
│   │   │   └── classify/route.ts
│   │   ├── funnel/
│   │   ├── ray-x/
│   │   └── checkout/
│   ├── landing/
│   │   ├── financeira/
│   │   ├── operacional/
│   │   └── ocupacao/
│   ├── connect/[slug]/
│   ├── raio-x/
│   ├── checkout/
│   └── dashboard/
└── components/
    ├── onboarding/
    ├── connect/
    ├── calculator/
    ├── tracking/
    └── crm/
```

---

## Métricas de Sucesso por Sprint

| Sprint | Métrica | Meta |
|--------|---------|------|
| 1 | Leads importados e válidos | 10.175 |
| 1 | Onboarding < 5 minutos | ✅ |
| 2 | Classificação HOT/WARM/COLD | > 90% precisão |
| 2 | Resposta WhatsApp < 30s | ✅ |
| 3 | Raio-X gerado em < 2 min | ✅ |
| 3 | Trial → Conversão | > 15% |
| 3 | MRR ao final da Fase 1 | R$ 10.000+ |

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| BullMQ/Redis indisponível | CRÍTICO | DLQ + retry + fallback síncrono |
| Z-API bloqueia números | ALTO | Rotação de números + Evolution API fallback |
| PostgreSQL downtime | CRÍTICO | Redis cache + requeuing |
| Baixa taxa de abertura | MÉDIO | A/B testing de subject lines |
| Churn alto no trial | ALTO | Onboarding guiado + suporte proativo |
| Concorrente lança feature similar | MÉDIO | Velocidade de execução + ecossistema coeso |

---

## Próximas Ações Imediatas

1. **Hoje:** Atualizar schema Prisma com modelos de funil
2. **Hoje:** Importar 10.175 leads consolidados no banco
3. **Hoje:** Criar módulo de inteligência do funil em `src/lib/intelligence/funnel/`
4. **Amanhã:** Configurar Resend/SendGrid e testar webhooks
5. **Semana 1:** Iniciar Sprint 1 — Fundação e Ingestão
