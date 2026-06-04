# ZEHLA PRIME SB22 — Spec-Driven Frontend (A Pele do Sistema)

> **Propósito único:** Definir o contrato arquitetural da Camada de Apresentação do ZEHLA Control Center (ZCC) antes de escrever qualquer componente. Nenhuma tag `<div>` será escrita até que este documento seja aprovado.
>
> **Stack declarada:** Next.js (App Router) + TypeScript + Tailwind CSS + React Query (TanStack Query) + Axios + Shadcn/UI.
>
> **Dogma nuclear:** Clean Architecture no frontend. Nenhuma regra de negócio, chamada HTTP ou instância de serviço dentro de JSX/TSX. Componentes são peles burras; Hooks (via React Query) são o cérebro da UI.

---

## 0. Stack Tecnológica (Decisões Vinculantes)

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 14+ (App Router) | SSR híbrido, layouts aninhados, proteção de rotas |
| Estilização | Tailwind CSS + Shadcn/UI | Utility-first + componentes acessíveis headless |
| Data Fetching | TanStack React Query v5 | Cache, refetch em background, retry, devtools |
| HTTP Client | Axios (instância configurada) | Interceptors globais, timeout, token injection |
| State Container | React Query (server state) + useReducer (UI state) | Nenhum estado global (Redux/Zustand) |
| Forms | React Hook Form + Zod | Validação tipada, schema-driven |
| Ícones | Lucide React | Árvore shakeable, padrão Shadcn |

### 0.1 Padrão Híbrido: Server Components → Client Components

```
ZCCLayout (Server Component — shell estático)
  ├── Sidebar (Server — menu items injected)
  ├── Header (Server — user info injected)
  └── <Content> (Client Component — wrapper)
       └── [página dinâmica] (Client — React Query)
```

**Regra:** A casca do ZCC (sidebar, header, layout, auth guard) é Server Component. Todo conteúdo dinâmico (tabelas, kanbans, gráficos, timelines) é Client Component com React Query. Nenhum `'use client'` em átomos — apenas em features que usam hooks.

---

## 1. Regras de Componentização (State vs. View)

### 1.1 Componentes Burros (Dumb / Presentational)

Localização: `src/components/ui/` (átomos — Shadcn) e `src/components/features/` (moléculas/organismos).

**Regras inegociáveis:**

- **Zero imports de infraestrutura** — proibido importar `apiClient`, `services/`, prisma, bullmq, socket.io.
- **Zero efeitos colaterais** — proibido usar `useEffect`, `useState` para dados remotos.
- **Zero lógica de domínio** — proibido calcular scores, filtrar arrays, validar regras de negócio.
- **Tudo entra por props** — o componente recebe `data` (já processada) e `callbacks` (já amarrados).
- **Renderização de erro por props** — recebe `error?: string | null` e renderiza, não decide.
- **Imutabilidade nas props** — props são `Readonly<T>`; nunca mutar entrada.
- **Server-first** — componentes burros estáticos NÃO levam `'use client'`.
- **Shadcn/UI components** — componentes de formulário, botão, card, skeleton vêm do Shadcn (customizados via `tailwind.config`).

**Exemplo de contrato:**

```tsx
// components/features/LeadKanban/LeadCard.tsx
// NOTE: 'use client' NÃO — este componente é puramente presentacional
interface LeadCardProps {
  readonly lead: LeadCardData
  readonly onDragStart: (id: string) => void
  readonly onQualify: (id: string) => void
  readonly error?: string | null
}

export function LeadCard({ lead, onDragStart, onQualify, error }: LeadCardProps) {
  if (error) return <ErrorMessage message={error} />
  return ( /* TSX puro, sem import de api, sem useEffect, sem fetch */ )
}
```

### 1.2 Smart Hooks (Container / Lógica)

Localização: `src/hooks/`

**Responsabilidades exclusivas:**

- Usar **React Query** (`useQuery`, `useMutation`, `useQueryClient`) para toda comunicação com o backend.
- Gerenciar estado local da UI com `useReducer` (nunca `useState` para lógica complexa).
- Chamar adaptadores HTTP (`apiClient`) que retornam `Result<T,E>`.
- Mapear respostas da API para o formato esperado pelos componentes burros.
- Toda mutation (POST/PATCH/DELETE) retorna `Promise<Result<T, Error>>` e invalida queries relacionadas via `queryClient.invalidateQueries`.

**Proibido:**

- Importar componentes React dentro de hooks.
- Acessar `localStorage`, `sessionStorage`, `cookies` diretamente (usar adaptador via React Query).
- Acoplar-se a bibliotecas de terceiros (d3, chart.js) diretamente — encapsular em adaptador.
- Usar `try/catch` genérico — o `apiClient` já normaliza tudo em `Result<T,E>`.

**Exemplo de contrato (React Query):**

```tsx
// hooks/useLeadsKanban.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api/apiClient'

const LEADS_KEY = ['crm', 'leads']

export function useLeadsKanban() {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: LEADS_KEY,
    queryFn: () => apiGet<LeadCard[]>('/api/comercial/leads'),
    staleTime: 1000 * 60 * 2,    // 2 min cache
    retry: 2,
  })

  const qualificarLead = useMutation({
    mutationFn: (leadId: string) => apiPost<LeadCard>(`/api/comercial/leads/${leadId}/qualificar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  })

  return {
    leads: data ?? [],
    isLoading,
    error: error?.message ?? null,
    refresh: refetch,
    qualificarLead: qualificarLead.mutateAsync,
  }
}
```

---

## 2. Mapeamento dos Custom Hooks (React Query)

### 2.1 `useFarmerCandidates` (Tese 8 — Reativação de Leads Frios)

**Propósito:** Buscar candidatos elegíveis para reativação Farmer IA.

| Chave | Query / Mutation | Endpoint |
|-------|-----------------|----------|
| `['farmer', 'candidates']` | `useQuery` | `GET /api/crm/farmer/candidates` |
| `['farmer', 'reactivate']` | `useMutation` | `POST /api/crm/farmer/reactivate` |

```ts
// Retorno do hook
{
  candidates: ReactivationCandidate[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  reactivateLead: (leadId: string) => Promise<Result<{ messageId: string }, Error>>
}
```

### 2.2 `useLeadsKanban`

**Propósito:** Kanban de leads do CRM com drag-and-drop e transições de estágio.

| Chave | Tipo | Endpoint |
|-------|------|----------|
| `['crm', 'leads']` | `useQuery` | `GET /api/comercial/leads` |
| — | `useMutation` | `POST /api/comercial/leads/:id/qualificar` |
| — | `useMutation` | `POST /api/comercial/leads/:id/handoff` |
| — | `useMutation` | `PATCH /api/comercial/leads/:id/stage` |

**Estado gerenciado** (via React Query + `useReducer` para UI local):
```ts
// React Query cache
{ leads: LeadCard[], isLoading, error }

// UI state (useReducer — não polui o React Query)
{ draggingId: string | null, filterGrupo: GrupoFunil | null }
```

### 2.3 `useReservations`

**Propósito:** CRUD de reservas, grid de quartos e timeline de ocupação.

| Chave | Tipo | Endpoint |
|-------|------|----------|
| `['reservations', { date }]` | `useQuery` | `GET /api/reservations?date=...` |
| — | `useMutation` | `POST /api/reservations` |
| — | `useMutation` | `PATCH /api/reservations/:id/cancel` |

### 2.4 `useDashboardMetrics`

**Propósito:** Métricas agregadas do painel principal (receita, ocupação, conversão).

| Chave | Tipo | Endpoint |
|-------|------|----------|
| `['dashboard', 'metrics', { period }]` | `useQuery` | `GET /api/dashboard/metrics?period={week\|month\|quarter}` |

### 2.5 `useZehlaBrain`

**Propósito:** Observabilidade cognitiva — consumo de tokens, latência, auditoria D+1, Quality Proxy.

| Chave | Tipo | Endpoint |
|-------|------|----------|
| `['brain', 'metrics']` | `useQuery` | `GET /api/brain/metrics` |
| `['brain', 'audit', { date }]` | `useQuery` | `GET /api/brain/audit/d1?date=YYYY-MM-DD` |
| `['brain', 'quality', { bucket }]` | `useQuery` | `GET /api/brain/quality-proxy?bucket={id}&limit=50` |

### 2.6 `useSocialCapture` (Tese 6)

**Propósito:** Monitorar captura de leads via Instagram/Facebook e fila BullMQ.

| Chave | Tipo | Endpoint |
|-------|------|----------|
| `['social', 'queue']` | `useQuery` | `GET /api/social/queue/stats` |
| `['social', 'captured']` | `useQuery` | `GET /api/social/captured?limit=20` |

---

## 3. Arquitetura do ZCC (Zehla Control Center)

### 3.1 Estrutura de Pastas (Next.js App Router)

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (Server — providers wrapper)
│   ├── (dashboard)/
│   │   ├── layout.tsx                # ZCCLayout (Server — sidebar + header)
│   │   ├── crm/
│   │   │   ├── page.tsx              # Página Kanban (Client — usa useLeadsKanban)
│   │   │   └── leads/
│   │   │       └── [id]/
│   │   │           └── page.tsx      # Detalhe do lead
│   │   ├── farmer/
│   │   │   └── page.tsx              # Farmer IA dashboard (Client — usa useFarmerCandidates)
│   │   ├── reservas/
│   │   │   └── page.tsx              # Grid de reservas
│   │   ├── brain/
│   │   │   └── page.tsx              # Cognitive Terminal (Client — usa useZehlaBrain)
│   │   ├── social/
│   │   │   └── page.tsx              # Social Capture feed
│   │   └── page.tsx                  # Dashboard principal (métricas agregadas)
│   └── api/                          # API route handlers (backend)
│       ├── auth/
│       └── ...
│
├── components/
│   ├── ui/                           # Átomos (Shadcn + custom)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── error-message.tsx
│   │   └── ...
│   │
│   ├── features/                     # Moléculas e Organismos (Dumb)
│   │   ├── LeadKanban/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── lead-card.tsx
│   │   │   └── lead-card-skeleton.tsx
│   │   ├── FarmerDashboard/
│   │   │   ├── farmer-dashboard.tsx
│   │   │   ├── candidate-card.tsx
│   │   │   └── reactivation-modal.tsx
│   │   ├── Dashboard/
│   │   │   ├── kpi-card.tsx
│   │   │   └── revenue-chart.tsx
│   │   ├── Reservations/
│   │   │   ├── reservation-calendar.tsx
│   │   │   ├── reservation-card.tsx
│   │   │   └── reservation-form.tsx
│   │   ├── SocialCapture/
│   │   │   ├── social-feed.tsx
│   │   │   └── captured-lead-row.tsx
│   │   └── BrainAudit/
│   │       ├── audit-report-panel.tsx
│   │       ├── quality-score-bar.tsx
│   │       └── violation-row.tsx
│   │
│   └── zcc/                          # Páginas do ZCC (composição)
│       └── zcc-layout.tsx            # Sidebar + Header shell
│
├── hooks/                            # Smart Hooks (React Query)
│   ├── use-farmer-candidates.ts
│   ├── use-leads-kanban.ts
│   ├── use-reservations.ts
│   ├── use-dashboard-metrics.ts
│   ├── use-zehla-brain.ts
│   ├── use-social-capture.ts
│   └── use-auth.ts
│
├── lib/
│   └── api/
│       ├── api-client.ts             # Axios instance + Result<T,E> wrapper
│       └── api-routes.ts             # Constantes de rotas
│
└── types/                            # Contratos de dados (consumidos do backend)
    ├── lead.ts
    ├── reservation.ts
    ├── dashboard.ts
    ├── brain.ts
    └── farmer.ts
```

### 3.2 Árvore de Componentes — Farmer IA Dashboard (Tese 8)

```
<ZCCLayout>                           # Server Component
  ├── <Sidebar />                     # Server
  ├── <Header />                      # Server
  └── <Content>                       # Client wrapper
      └── <FarmerDashboardPage />     # Client — usa useFarmerCandidates()
          ├── isLoading → <Skeleton /> (Shadcn)
          ├── error → <ErrorMessage message={error} onRetry={refresh} />
          └── data →
              <CandidateGrid candidates={candidates}>
                  ├── <CandidateCard candidate={c} onReactivate={handleReactivate} />
                  ├── <CandidateCard candidate={c} ... />
                  └── ...
              </CandidateGrid>
```

### 3.3 Árvore de Componentes — LeadKanban (Tese 1+2+3)

```
<ZCCLayout>
  └── <Content>
      └── <LeadKanbanPage />          # Client — useLeadsKanban()
          ├── isLoading → <LoadingSpinner />
          ├── error → <ErrorMessage message={error} onRetry={refresh} />
          └── data →
              <KanbanBoard leads={leads} onDrop={handleDrop}>
                  ├── <KanbanColumn grupo="topo" leads={...} />
                  ├── <KanbanColumn grupo="qualificacao" leads={...} />
                  └── <KanbanColumn grupo="negociacao" leads={...} />
      <!-- Modal de qualificação (fora da árvore principal) -->
      <QualifyModal lead={selectedLead} onConfirm={qualificarLead} />
```

### 3.4 Fluxo de Dados (React Query)

1. Componente página monta → `useLeadsKanban()` → `useQuery` dispara automaticamente.
2. `queryFn` → `apiClient.get()` → Axios faz GET → retorna `Result<T,E>`.
3. React Query gerencia cache, `isLoading`, `error`, `refetch`.
4. Mutations (`qualificarLead`) → `useMutation` → POST → `onSuccess` invalida cache → refetch automático.
5. Componente renderiza tríade: `isLoading ? <Skeleton /> : error ? <ErrorMessage /> : <KanbanBoard />`.

### 3.5 Contrato do Adaptador HTTP (Axios + Result)

```ts
// lib/api/api-client.ts
import axios, { AxiosError } from 'axios'
import { Result } from '@/types/result'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zcc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function apiGet<T>(path: string): Promise<Result<T, Error>> {
  try {
    const { data } = await api.get<T>(path)
    return Result.ok(data)
  } catch (err) {
    const msg = err instanceof AxiosError
      ? err.response?.data?.error ?? err.message
      : 'Erro de rede'
    return Result.fail(new Error(msg))
  }
}

// Mesmo padrão para apiPost, apiPatch, apiDelete
```

**Regras:**
- TODO erro HTTP (4xx, 5xx, timeout) é convertido em `Result.fail(Error)` com a mensagem de domínio do backend.
- Nenhum `try/catch` solto nos hooks ou componentes — o `apiClient` normaliza.
- O `Result` type é importado de `@/types/result` (espelho do backend).

---

## 4. Configuração de Providers

### 4.1 Layout Raiz (Server Component)

```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### 4.2 Providers (Client Component)

```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        retry: 2,
        refetchOnWindowFocus: true,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## 5. Padrões de Renderização

### 5.1 Tríade de Estado (Dogma)

TODO componente que recebe dados remotos deve tratar EXATAMENTE 3 estados:

```tsx
function FarmerDashboardPage() {
  const { candidates, isLoading, error, refresh } = useFarmerCandidates()

  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (error) return <ErrorMessage message={error} onRetry={refresh} />
  return <CandidateGrid candidates={candidates} />
}
```

### 5.2 Shadcn/UI Skeleton para Loading

Usar `<Skeleton />` do Shadcn para todos os estados de carregamento — nunca texto "Carregando..." solto.

### 5.3 ErrorMessage com Retry

```tsx
<ErrorMessage message={error} onRetry={refresh} />
```

O botão "Tentar novamente" chama `refresh` (que é `refetch` do React Query).

### 5.4 Otimização

- `React.memo` em componentes de lista (`LeadCard`, `CandidateCard`, `KanbanColumn`).
- `useCallback` nos callbacks passados para componentes filhos.
- `useMemo` para derivações computacionalmente caras (agrupamentos por estágio, filtros).

---

## 6. Checklist de Conformidade

- [ ] Nenhum `fetch`, `axios` (fora do `api-client.ts`), `socket.io` dentro de `components/`
- [ ] Nenhum `useState` ou `useEffect` dentro de `components/ui/` (átomos)
- [ ] Todo hook usa React Query (`useQuery`/`useMutation`) + `apiClient` via `Result<T,E>`
- [ ] Nenhum `try/catch` solto — toda exceção passa por `apiClient`
- [ ] Todo componente burro exporta `interface XxxProps` com `Readonly<T>`
- [ ] Toda página (container) trata a tríade: loading → error → data
- [ ] Toda mutation invalida queries relacionadas via `queryClient.invalidateQueries`
- [ ] Erros de domínio do backend (`Result.fail`) são renderizados como `ErrorMessage` no frontend
- [ ] Zero imports de `../domain/` ou `../infrastructure/` no frontend
- [ ] Componentes estáticos NÃO levam `'use client'`
- [ ] Shadcn/UI components são customizados via `tailwind.config`, não via CSS avulso
- [ ] `staleTime` configurado por hook (nunca global hardcoded)

---

## 7. Plano de Implementação (Ordem de Execução)

| Fase | O que fazer | Arquivos |
|------|------------|----------|
| 0 | Setup Next.js + Tailwind + Shadcn + React Query + Axios | `npx create-next-app`, `npx shadcn@latest init` |
| 1 | `apiClient` + `Result<T,E>` type | `lib/api/api-client.ts`, `types/result.ts` |
| 2 | Providers + Layout raiz | `app/providers.tsx`, `app/layout.tsx` |
| 3 | Dumb: `KanbanBoard`, `KanbanColumn`, `LeadCard` | `components/features/LeadKanban/*` |
| 4 | Smart: `useLeadsKanban` | `hooks/use-leads-kanban.ts` |
| 5 | Página: Kanban (Tese 1+2+3) | `app/(dashboard)/crm/page.tsx` |
| 6 | Dumb: `FarmerDashboard`, `CandidateCard` | `components/features/FarmerDashboard/*` |
| 7 | Smart: `useFarmerCandidates` (Tese 8) | `hooks/use-farmer-candidates.ts` |
| 8 | Dumb: `KpiCard`, `RevenueChart` | `components/features/Dashboard/*` |
| 9 | Smart: `useDashboardMetrics` | `hooks/use-dashboard-metrics.ts` |
| 10 | Cognitive Terminal (Tese 7) + Social Capture (Tese 6) | demais features |

---

*Documento SPEC_FRONTEND.md v2.0 — ZEHLA PRIME SB22*  
*Stack: Next.js App Router + Tailwind CSS + React Query + Axios + Shadcn/UI*  
*Spec-Driven Development — Nenhuma tag `<div>` foi escrita até que este contrato seja aprovado.*
