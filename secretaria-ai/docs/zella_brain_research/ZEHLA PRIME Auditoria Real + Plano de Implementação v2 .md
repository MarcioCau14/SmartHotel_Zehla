# 🔬 ZEHLA PRIME — Auditoria Real + Plano de Implementação v2
**Data:** 15 de Junho de 2026 | **Fonte:** Código real do repositório `/Users/marciocau/zehla-backend`

> Cada alerta dos notebooks NotebookLM foi verificado diretamente no código. ✅ = Confirmado | ❌ = Falso Alarme | ⚠️ = Parcialmente verdadeiro

---

## 🔍 RESULTADO DA AUDITORIA: ALERTAS vs. REALIDADE

### 🚨 ALERTA 1 — "138 erros TypeScript ignorados via `ignoreBuildErrors: true`"
**Veredicto: ⚠️ PARCIALMENTE VERDADEIRO — mais nuançado que o alarme**

| Item | Realidade |
|---|---|
| `ignoreBuildErrors: true` no next.config.ts | **❌ NÃO EXISTE** — o flag foi removido. O next.config.ts está limpo |
| Erros TS no log `tsc-errors.log` | **✅ EXISTEM — 130 erros reais** |
| Erros em arquivos `temp_api/` (pasta descartável) | **38 erros** — pasta temporária, não afeta produção |
| Erros em `src/` ativo (código de produção) | **✅ 92 erros reais** em arquivos ativos |

**Arquivos críticos com erros em `src/` ativo:**
```
src/app/api/leads/route.ts           → 14 erros (imports ausentes: NextRequest, NextResponse, prisma)
src/app/api/config/keys/route.ts     → 6 erros (prisma.tenant / prisma.apiConfig não tipados)
src/app/api/help/chat/route.ts       → 5 erros (interface de validação desatualizada)
src/app/api/tenant/route.ts          → 5 erros (mesma causa que help/chat)
src/app/dashboard/page.tsx           → 5 erros (useSession, Brain, ClientTopNavProps ausentes)
src/lib/brain/agent-closing-engine.ts → 5 erros (prisma.weatherSignal / holidaySignal ausentes)
src/components/onboarding/           → 4 erros (campos obrigatórios faltando em types)
```

---

### 🚨 ALERTA 2 — "Modelos Prisma ausentes causam falha de testes"
**Veredicto: ✅ CONFIRMADO — dois modelos críticos ausentes**

```bash
# Modelos usados no código mas AUSENTES no schema.prisma:
prisma.weatherSignal   → usados em: agent-closing-engine.ts, enricher.ts, trends/collector.ts
prisma.holidaySignal   → usados em: agent-closing-engine.ts, trends/forecast/route.ts

# Modelos que JÁ EXISTEM (falso alarme dos notebooks):
prisma.Tenant          ✅ EXISTS (model Tenant)
prisma.ApiConfig       ✅ EXISTS (model ApiConfig)
# → Erro real: Prisma Client não foi regenerado após adição dos modelos
```

**Causa raiz:** Os modelos `Tenant` e `ApiConfig` existem no schema mas o **Prisma Client está desatualizado** — não reflete os modelos adicionados recentemente. Basta rodar `prisma generate`.

---

### 🚨 ALERTA 3 — "BudgetCircuitBreaker stateless — zera ao reiniciar"
**Veredicto: ❌ FALSO ALARME — arquitetura melhor que o descrito**

O sistema usa `VoiceTokenBudget` como **Value Object imutável** dentro da entidade `Property`, persistida no Postgres via `PrismaPropertyRepository`. O budget **não está em RAM** — é lido e salvo no banco a cada operação.

> ✅ O budget de tokens é durável. Não zera ao reiniciar o servidor.

**O que REALMENTE falta:** Um Cron Job de reset mensal/diário do orçamento por tenant (não existe no BullMQ ainda).

---

### 🚨 ALERTA 4 — "Rate Limiting ausente na rota de campanhas"
**Veredicto: ❌ FALSO ALARME — já implementado**

```typescript
// src/app/api/marketing/campaigns/dispatch/route.ts
import { rateLimit } from '../../../../../lib/security/rate-limit'
const DISPATCH_WINDOW_SECONDS = 600  // 10 minutos
const DISPATCH_MAX_PER_WINDOW = 1    // 1 disparo por janela ✅
```

---

### 🚨 ALERTA 5 — "CampaignOutboundWorker não está conectado à Evolution API"
**Veredicto: ❌ FALSO ALARME — já conectado**

```typescript
// src/workers/campaignOutboundWorker.ts
import { EvolutionApiMessagingGateway } from '../infrastructure/messaging/EvolutionApiMessagingGateway'
const gateway = new EvolutionApiMessagingGateway()  // ✅ Gateway real, não mock
```

---

### 🚨 ALERTA 6 — "Cobertura de testes 0%"
**Veredicto: ⚠️ PARCIALMENTE VERDADEIRO**

| Item | Realidade |
|---|---|
| Arquivos `.test.ts` existentes | **40 arquivos** em `src/__tests__/` |
| Vitest configurado | ✅ `vitest.config.ts` presente e configurado |
| Testes de domínio (hospitalidade, comercial, operacional) | ✅ Existem |
| Testes E2E Playwright | ⚠️ Config existe mas specs ausentes |
| Cobertura real medida | **Não foi rodado ainda** |

---

### 🚨 ALERTA 7 — "InMemoryDigitalGuideRepository em produção"
**Veredicto: ✅ CONFIRMADO — mas em webhook, não em guidebook**

```typescript
// src/app/api/webhooks/mercado-pago/route.ts  ← PROBLEMA REAL
import { InMemorySubscriptionRepository } from '...'
const subscriptionRepo = new InMemorySubscriptionRepository()  // ❌ mock em produção
```

O webhook do Mercado Pago usa repositório em memória. **Pagamentos processados não persistem** se o servidor reiniciar durante o processo.

---

### 🚨 ALERTA 8 — "middleware.ts ausente / proxy.ts desatualizado"
**Veredicto: ✅ CONFIRMADO**

```bash
middleware.ts      → NÃO EXISTE (só existe middleware.ts.bak)
middleware.ts.bak  → existe mas desativado (renomeado para .bak)
```
O projeto está rodando **sem middleware de borda** ativo no Next.js.

---

## 📊 SCORECARD REAL DO PROJETO

| Dimensão | Status | Criticidade |
|---|---|---|
| TypeScript (92 erros em src/ ativo) | 🔴 Crítico | ALTA |
| Prisma Client desatualizado | 🔴 Crítico | ALTA |
| weatherSignal/holidaySignal ausentes no schema | 🔴 Crítico | ALTA |
| InMemorySubscriptionRepository no webhook MP | 🔴 Crítico | ALTA |
| middleware.ts ausente | 🟡 Importante | MÉDIA |
| Cron de reset de budget ausente | 🟡 Importante | MÉDIA |
| Testes E2E Playwright sem specs | 🟡 Importante | MÉDIA |
| Rate Limiting campanhas | 🟢 OK | — |
| Evolution API conectada | 🟢 OK | — |
| VoiceToken Budget (durável no Postgres) | 🟢 OK | — |
| Multi-Tenant RLS | 🟢 OK | — |
| Segurança PII AES-GCM-256 | 🟢 OK | — |
| 40 arquivos de teste existentes | 🟢 OK | — |

---

## 🎯 PLANO DE IMPLEMENTAÇÃO v2 — VALIDADO

### FASE 0 — CORREÇÃO CIRÚRGICA (1-2 dias)
> [!CAUTION]
> Executar em ordem. Cada item bloqueia o próximo.

#### 0.1 — Regenerar Prisma Client (30min)
```bash
cd /Users/marciocau/zehla-backend
npx prisma generate
```
Resolve: erros de `prisma.tenant`, `prisma.apiConfig`, `prisma.auditLog` nos arquivos de config/keys.

#### 0.2 — Adicionar modelos ausentes ao schema.prisma (2h)
Adicionar ao `schema.prisma`:
```prisma
model WeatherSignal {
  id         String   @id @default(cuid())
  propertyId String
  temp       Float
  condition  String
  city       String
  createdAt  DateTime @default(now())
}

model HolidaySignal {
  id        String   @id @default(cuid())
  name      String
  date      DateTime
  daysUntil Int
  region    String?
  createdAt DateTime @default(now())
}
```
Depois: `npx prisma migrate dev --name add-weather-holiday-signals`

#### 0.3 — Corrigir `src/app/api/leads/route.ts` (1h)
- Adicionar imports ausentes: `NextRequest`, `NextResponse` de `next/server`
- Importar `prisma` de `@/lib/prisma`
- Corrigir parâmetro `r` com tipo explícito

#### 0.4 — Corrigir `src/app/api/help/chat/route.ts` e `tenant/route.ts` (1h)
- Atualizar interface do validador de segurança para incluir `allowed`, `reason`, `sanitized`

#### 0.5 — Corrigir `src/app/dashboard/page.tsx` (1h)
- Importar `useSession` de `next-auth/react`
- Importar `Brain` do componente correto
- Ajustar props de `ClientTopNav`

#### 0.6 — Substituir InMemorySubscriptionRepository no webhook MP (1h)
```typescript
// ANTES (src/app/api/webhooks/mercado-pago/route.ts):
import { InMemorySubscriptionRepository } from '...'

// DEPOIS:
import { PrismaSubscriptionRepository } from '...'
```

#### 0.7 — Restaurar middleware.ts (30min)
- Renomear `middleware.ts.bak` → `middleware.ts`
- Validar se as regras de rota ainda fazem sentido

---

### FASE 1 — ESTABILIZAÇÃO (3-4 dias)

#### 1.1 — Rodar suite de testes e medir cobertura real
```bash
npx vitest run --coverage
```
Mapear quais dos 40 arquivos de teste passam/falham após as correções da Fase 0.

#### 1.2 — Cron Job de reset de budget no BullMQ
- Criar `BudgetResetCron` que roda todo dia às 00:00 UTC
- Reseta `voiceTokensUsed` de todas as propriedades no Postgres

#### 1.3 — Corrigir erros remanescentes de TypeScript (2h)
- `src/lib/brain/agent-closing-engine.ts` — tipos de retorno Prisma
- `src/components/onboarding/` — campos obrigatórios faltando
- `src/app/vendas/pro/page.tsx` — props de componente incorretas

---

### FASE 2 — EXPANSÃO DE DOMÍNIO (5-8 dias)

#### 2.1 — Zé-Ops: Automação Operacional
- Checklists de limpeza automáticos por quarto
- SLA de manutenção com alertas
- Notificações push no Dashboard

#### 2.2 — Zé-Analyst: Yield Management
- Motor de precificação dinâmica por sazonalidade
- Dashboard visual de Lead Scoring no ZCC
- Integração do `ROICalculator` com priorização de leads

#### 2.3 — Conectar DigitalGuide ao Vector DB (GraphRAG)
- Alimentar SmartAI com conteúdo do Guia Digital
- Respostas automáticas a hóspedes via WhatsApp

---

### FASE 3 — GO-LIVE (aguarda CNPJ)

| Ação | Dependência |
|---|---|
| Evolution API com QR Code real | CNPJ + Chip físico |
| Mercado Pago / Stripe produção | CNPJ |
| Campanha "Trauma da Comissão" | Fase 1 concluída |
| 10 pousadas BETA onboarding | CNPJ + Fase 2 |

---

## 📅 Cronograma Ajustado

```
DIA 1     → Fase 0.1 + 0.2 (Prisma: gerar + migrar)
DIA 2     → Fase 0.3 + 0.4 + 0.5 (92 erros TS — arquivos src/)
DIA 3     → Fase 0.6 + 0.7 (Mock MP + Middleware)
DIA 4-5   → Fase 1.1 + 1.2 (Testes + BudgetCron)
DIA 6-7   → Fase 1.3 (TS remanescentes)
DIA 8-12  → Fase 2 (Zé-Ops, Zé-Analyst, GraphRAG)
CNPJ      → Fase 3 (Go-Live físico)
```

---

## ✅ Por onde começar agora

**Comando 1 — Imediato (30 segundos):**
```bash
cd /Users/marciocau/zehla-backend && npx prisma generate
```

**Comando 2 — Verificar quantos erros TS restam após regenerar Prisma:**
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

Quer que eu execute a Fase 0 completa agora?
