# ZEHLA PRIME — SPEC_FRONTEND.md (A Pele do Sistema)

Especificação Mestra da Camada de Apresentação do ZEHLA SmartHotel.
Todo desenvolvimento frontend DEVE seguir as leis aqui estabelecidas.
Violações são rejeitadas em code review automaticamente.

---

## 1. Princípios Arquiteturais (Desacoplamento Inegociável)

### 1.1 Separação Estado vs Visualização

```
┌─────────────────────────────────────────────────────────────┐
│                    Smart Layer (Hooks)                       │
│  useState, useEffect, fetch, axios, React Query,            │
│  localStorage, cookies, WebSocket                           │
│  Toda regra de interface, chamada HTTP, cache, estado       │
└─────────────────────┬───────────────────────────────────────┘
                      │ Props imutáveis + Callbacks
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Dumb Layer (Components)                   │
│  Apenas JSX, Tailwind, animações CSS                        │
│  Sem fetch, sem axios, sem hooks de efeito                  │
│  useState permitido APENAS para UI efêmera (dropdown, tab)  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Proibições Absolutas

- ❌ `fetch()` ou `axios` dentro de qualquer arquivo `.tsx`
- ❌ `useEffect` para carregar dados da API dentro de componente visual
- ❌ Importar `cookies`, `localStorage` em Dumb Components
- ❌ Acoplamento de hook a framework específico (o hook DEVE funcionar sem React)
- ❌ Componente visual fazendo `JSON.parse` ou validação de response HTTP

### 1.3 Regras de Ouro

- **Smart Hooks**: Contêm 100% do estado, 100% das chamadas de rede, 100% dos efeitos colaterais
- **Dumb Components**: Recebem `Props` tipadas, emitem `callbacks`, renderizam visual
- **Estado local (`useState`)**: Permitido APENAS em Dumb Components para UI ephemeral (abrir/fechar painel, hover, aba ativa)
- **Compartilhamento de estado**: Hooks consomem React Query ou contexto global — componentes burros NUNCA acessam contexto diretamente

---

## 2. Mapeamento de Custom Hooks (State Managers)

### 2.1 `useAuth()`

Gerencia sessão, JWT e isolamento de tenant. Consome `POST /api/auth/login`.

```typescript
interface TenantSession {
  pousadaId: string
  userId: string
  email: string
  role: 'admin' | 'hoteleiro' | 'operador'
  token: string
}

export function useAuth(): {
  session: TenantSession | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<Result<TenantSession, Error>>
  logout: () => void
  getToken: () => string | null
}
```

### 2.2 `useZehlaBrain()`

Comunicação com o CognitiveTerminal — orquestra o radar neural e tomada de decisões da IA.

Consome: `POST /api/brain/chat`, `GET /api/brain/health`.

```typescript
interface CognitiveEvent {
  eventId: string
  timestamp: Date
  intent: string
  origem: string
  needsEscalation: boolean
  handoffRequired: boolean
  responseText: string
  confidenceScore: number
}

export function useZehlaBrain(): {
  events: CognitiveEvent[]
  isThinking: boolean
  triggerManualIntent: (intent: string, payload: Record<string, unknown>) => Promise<Result<void, Error>>
  escalateToHuman: (eventId: string) => Promise<Result<void, Error>>
  sendMessage: (text: string) => Promise<Result<CognitiveEvent, Error>>
}
```

### 2.3 `useLeadsKanban()`

Consumo dos endpoints comerciais SB28 + SB27. Gerencia o funil FSM de 17 estados.

**Endpoints consumidos:**
- `GET /api/comercial/leads/[id]/escada-valor?tierAtual=xxx`
- `POST /api/comercial/leads/[id]/qualificar`
- `POST /api/comercial/leads/[id]/handoff`

```typescript
type EstadoLead =
  | 'entrada' | 'primeira_interacao' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3'
  | 'agendado' | 'reagendado' | 'no_show' | 'transferido_sdr'
  | 'em_negociacao' | 'venda_sinal' | 'venda_concluida'
  | 'perdido' | 'em_onboarding' | 'acompanhamento' | 'renovacao' | 'sales_farming'

type GrupoFunil =
  | 'topo' | 'qualificacao' | 'agendamento' | 'negociacao' | 'fechado' | 'perdido' | 'farming'

interface LeadCard {
  id: string
  nome: string
  estado: EstadoLead
  grupo: GrupoFunil
  score: number
  icpFit: 'ideal' | 'minimo' | 'fora_icp'
  origem: string
  ultimaInteracao: Date | null
  diasSemInteracao: number
  tierAtual: string
}

interface RecomendacaoEscada {
  tipoRecomendacao: 'upsell' | 'cross_sell' | 'downsell' | 'manter' | 'isca'
  tierRecomendado: string
  justificativa: string
  confidenceScore: number
}

export function useLeadsKanban(): {
  leads: Record<GrupoFunil, LeadCard[]>
  isLoading: boolean
  qualificarLead: (leadId: string) => Promise<Result<LeadCard, Error>>
  realizarHandoff: (leadId: string, closerId: string, summaryPackage: SummaryPackage) => Promise<Result<LeadCard, Error>>
  calcularEscada: (leadId: string, tierAtual: string) => Promise<Result<RecomendacaoEscada, Error>>
  refetch: () => Promise<void>
}
```

### 2.4 `useRoomsGrid()`

Consumo do status operacional de quartos. Atualização em tempo real via polling ou WebSocket.

**Endpoints:** `GET /api/rooms?propertyId=xxx`, `GET /api/rooms/availability?propertyId=xxx`.

```typescript
type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED' | 'CLEANING'

interface RoomCard {
  id: string
  number: string
  status: RoomStatus
  type: string
  basePrice: number
  guestName?: string
  checkIn?: Date
  checkOut?: Date
  cleaningTimer?: number  // minutos restantes da higienização de 3h
  govBrVerified?: boolean
}

export function useRoomsGrid(propertyId: string): {
  rooms: RoomCard[]
  isLoading: boolean
  ocupacao: number  // percentual
  changeStatus: (roomId: string, novoStatus: RoomStatus) => Promise<Result<void, Error>>
  refetch: () => Promise<void>
}
```

### 2.5 `useOperationsTasks()`

Gerencia tickets de limpeza e manutenção predial.

**Endpoints:** `GET /api/operacional/tarefas`, `POST /api/operacional/tarefas`, `PATCH /api/operacional/tarefas/[id]`.

```typescript
interface TaskItem {
  id: string
  quartoId: string
  tipo: 'limpeza' | 'manutencao'
  status: 'pendente' | 'em_progresso' | 'concluido'
  responsavel?: string
  criadoEm: Date
  prioridade: 'baixa' | 'media' | 'alta'
}

export function useOperationsTasks(): {
  tasks: TaskItem[]
  pendentes: TaskItem[]
  isLoading: boolean
  criarTarefa: (payload: { quartoId: string; tipo: 'limpeza' | 'manutencao'; prioridade?: string }) => Promise<Result<void, Error>>
  atualizarStatus: (id: string, status: 'pendente' | 'em_progresso' | 'concluido') => Promise<Result<void, Error>>
  refetch: () => Promise<void>
}
```

### 2.6 `useDashboardMetrics()`

Consome a inteligência analítica — precificação dinâmica, faturamento, Break-Even.

**Endpoints:** `GET /api/revenue/kpis`, `GET /api/revenue/tarifas`.

```typescript
interface YieldMetrics {
  faturamentoTotal: number
  taxaOcupacao: number
  revPar: number
  diariaMedia: number
  breakEvenStatus: 'safe' | 'warning' | 'danger'
}

export function useDashboardMetrics(periodo: { inicio: Date; fim: Date }): {
  metrics: YieldMetrics | null
  isLoading: boolean
  recalcularBreakEven: (valorPretendido: number) => Promise<Result<boolean, Error>>
}
```

### 2.7 `useReservations()`

Interface do motor de hospitalidade — check-in mobile, Gov.br, FNRH.

**Endpoints:** `GET /api/v2/reservations`, `GET /api/v2/reservations/[id]`, `POST /api/v2/reservations/[id]/payment`.

```typescript
interface Reservation {
  id: string
  hospedeNome: string
  status: 'reservado' | 'checkin_mobile' | 'in_house' | 'checkout'
  govBrVerified: boolean
  roomNumber?: string
  checkIn: Date
  checkOut: Date
}

export function useReservations(): {
  reservations: Reservation[]
  isLoading: boolean
  realizarCheckInMobile: (id: string, qrCodeData: string) => Promise<Result<void, Error>>
  alocarQuarto: (id: string, quartoId: string) => Promise<Result<void, Error>>
  refetch: () => Promise<void>
}
```

---

## 3. Hierarquia do Zehla Control Center (ZCC)

### 3.1 Árvore de Componentes

```
<ZCCDashboard>
  ├── <CognitiveTerminal>          ← useZehlaBrain()
  │     ├── <RadarNeuralFeed>
  │     │     └── <CognitiveNode>  (cada evento com status, cor, ação)
  │     ├── <ChatInput>            (dispara triggerManualIntent)
  │     └── <EscalationPanel>      (needsEscalation === true)
  │
  ├── <LeadKanban>                 ← useLeadsKanban()
  │     ├── <KanbanColumn>         (grupo: topo | qualificacao | agendamento | ...)
  │     │     └── <LeadCard>       (score colorido, ações de transição)
  │     ├── <HandoffModal>         (formulário de SummaryPackage + closerId)
  │     └── <EscadaPanel>          (exibe recomendação de upsell/downsell)
  │
  ├── <RoomsGrid>                  ← useRoomsGrid()
  │     ├── <RoomCard>             (status, hóspede, timer de limpeza)
  │     └── <CleaningTimer>        (cronômetro regressivo 3h)
  │
  ├── <OperationsPanel>            ← useOperationsTasks()
  │     └── <TaskList>
  │           └── <TaskItem>       (tipo, status, responsável)
  │
  └── <MetricsBar>                 ← useDashboardMetrics()
        ├── <KPIOverview>          (RevPAR, ocupação, faturamento)
        └── <BreakEvenGauge>       (indicador visual safe/warning/danger)
```

### 3.2 `CognitiveTerminal`

- **Estética**: Fundo pitch-black (`#0F172A`), bordas laranja sutis (`#F97316`), tipografia Outfit
- **Comportamento**: Feed em cascata (Radar Neural) com eventos em tempo real
- **Nós críticos**: `needsEscalation: true` piscam vermelho e exibem botão `Escalar para Humano`
- **Entrada de texto**: Campo de texto que dispara `sendMessage()` ou `triggerManualIntent()`

### 3.3 `LeadKanban`

- **Estética**: Colunas Slate 800 (`#1E293B`) com divisores Slate 700 (`#334155`)
- **Colunas**: 7 grupos mapeados dos 17 estados FSM
  | Grupo | Estados | Cor |
  |---|---|---|
  | `topo` | entrada, primeira_interacao | Slate 500 |
  | `qualificacao` | follow_up_1..3 | Blue 500 |
  | `agendamento` | agendado, reagendado | Violet 500 |
  | `negociacao` | em_negociacao, transferido_sdr | Orange 500 |
  | `fechado` | venda_sinal, venda_concluida | Emerald 500 |
  | `perdido` | perdido, no_show | Red 500 |
  | `farming` | sales_farming | Amber 500 |
- **Cards**: Borda colorida por score
  - Score >= 70: borda verde (`#10B981`)
  - Score 30-69: borda laranja (`#F97316`)
  - Score < 30: sem destaque
- **Ações por estado**:
  - `entrada` → botão **Qualificar** (POST /api/comercial/leads/[id]/qualificar)
  - `agendado`/`reagendado` → botão **Handoff** (abre modal com SummaryPackage)
  - `em_negociacao` → botão **Ver Escada** (GET /api/comercial/leads/[id]/escada-valor)
- **Drag-and-drop**: Movimentação visual apenas — a transição real de estado sempre passa pelo backend

### 3.4 `RoomsGrid`

- **Estética**: Grid modular de cards de quarto
- **Inovações Regulatórias 2026**:
  - Timer de higienização de 3 horas (pós-checkout)
  - Selo visual de validação Gov.br / Cadastur
  - Alerta de check-in pendente com botão de QR Code FNRH

---

## 4. Gestão de Retornos e Erros de Domínio no Frontend

### 4.1 Contrato de Resposta das APIs

Todas as APIs do ZEHLA seguem o padrão:

**Sucesso (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erro de negócio (400/422):**
```json
{
  "error": "TRANSICAO_INVALIDA: não é possível transitar de 'entrada' via 'iniciar_negociacao'"
}
```

**Erro de autenticação (401):**
```json
{
  "error": "Missing authorization header"
}
```

### 4.2 Mapeamento HTTP → Ação no Frontend

| HTTP Status | Significado | Ação no Frontend |
|---|---|---|
| 200 | Sucesso | Atualizar estado local, exibir toast verde de confirmação |
| 400 | Erro de validação/negócio | Exibir `error` como toast vermelho. NÃO redirecionar |
| 401 | Token ausente/inválido | Disparar `logout()`, redirecionar para `/login` |
| 422 | Violação de FSM | Exibir `error` como toast laranja. Sugerir ação corretiva |
| 500 | Erro interno | Exibir toast genérico "Erro interno. Tente novamente." |

### 4.3 Padrão de Tratamento em Hooks

```typescript
// Todo hook DEVE seguir este padrão de tratamento de erro:
async function qualificarLead(leadId: string): Promise<Result<LeadCard, Error>> {
  try {
    const token = getToken()
    const response = await fetch(`/api/comercial/leads/${leadId}/qualificar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    const body = await response.json()

    if (!response.ok) {
      // 401 → login expirado
      if (response.status === 401) {
        logout()
        return Result.fail(new Error('Sessão expirada'))
      }
      // 400/422 → erro de negócio
      return Result.fail(new Error(body.error || 'Erro desconhecido'))
    }

    return Result.ok(body.data)
  } catch (err) {
    // Erro de rede (fetch exception)
    return Result.fail(new Error('Erro de conexão. Verifique sua internet.'))
  }
}
```

### 4.4 Toast de Notificação (Feedback Visual)

Dumb Component `<Toast>` recebe:
```typescript
interface ToastProps {
  mensagem: string
  tipo: 'success' | 'error' | 'warning' | 'info'
  duration?: number  // ms, default 4000
  onClose: () => void
}
```

Regras de exibição:
- `success`: Toast verde, auto-dismiss 3s
- `error`/`warning`: Toast vermelho/laranja, auto-dismiss 6s ou até clique
- `info`: Toast azul, auto-dismiss 4s
- NUNCA usar `alert()` ou `confirm()` nativos do browser

### 4.5 Estados de Carregamento

- `isLoading: boolean` — presente em todo hook que faz chamada de rede
- Dumb Component DEVE renderizar skeleton/spinner enquanto `isLoading === true`
- NUNCA bloquear a UI inteira com loading — usar loading localizado (skeleton do card, não tela branca)

---

## 5. Invariantes de Interface (Guardrails)

1. **Proibição de Rede Direta**: Nenhum `.tsx` pode importar `fetch`, `axios`, `axiosInstance`. Toda comunicação externa passa por Smart Hooks.
2. **Coesão Cromática**: Cores seguem ESTRITAMENTE `DESIGN.md`. Proibido `bg-red-300`, `text-blue-500` avulsos.
3. **Formulários com Validação**: Usar `react-hook-form` + `zod` para validação no cliente antes de disparar requests.
4. **Imutabilidade**: Dumb Components tratam props como `Readonly<>`. Nenhuma mutação direta — sempre via callback do hook.
5. **Fallback de Erro**: Todo Dumb Component que recebe dados DEVE ter estado de `erro` na props e renderizar fallback visual (não quebrar a página inteira por um card com falha).
6. **Responsividade**: ZCC é desktop-first (1920×1080 mínimo), mas componentes individuais devem funcionar em 1366×768 sem quebrar layout.

---

## 6. Mapa de Endpoints Consumidos pelo Frontend

| Método | Rota | Hook | Propósito |
|---|---|---|---|
| POST | `/api/auth/login` | useAuth | Autenticação JWT |
| GET | `/api/brain/health` | useZehlaBrain | Status do motor cognitivo |
| POST | `/api/brain/chat` | useZehlaBrain | Envio de mensagem ao cérebro |
| POST | `/api/comercial/leads` | useLeadsKanban (indireto) | Capturar novo lead |
| POST | `/api/comercial/leads/[id]/qualificar` | useLeadsKanban | Qualificar lead via FSM |
| POST | `/api/comercial/leads/[id]/handoff` | useLeadsKanban | Handoff para closer |
| GET | `/api/comercial/leads/[id]/escada-valor` | useLeadsKanban | Calcular upsell/downsell |
| GET | `/api/rooms?propertyId=` | useRoomsGrid | Listar quartos |
| GET | `/api/rooms/availability?propertyId=` | useRoomsGrid | Disponibilidade |
| GET | `/api/v2/reservations` | useReservations | Listar reservas |
| GET | `/api/operacional/tarefas` | useOperationsTasks | Listar tarefas |
| POST | `/api/operacional/tarefas` | useOperationsTasks | Criar tarefa |
| GET | `/api/revenue/kpis` | useDashboardMetrics | Métricas de receita |
| GET | `/api/revenue/tarifas` | useDashboardMetrics | Tarifas dinâmicas |
