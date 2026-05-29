# SPEC — Domínio de Lead / Funil de Vendas

## 1. Bounded Context

| Campo | Valor |
|---|---|
| **Domínio** | Core Business de Aquisição B2B (ZEHLA como produto) |
| **Aggregate Root** | `Lead` |
| **Linguagem** | Português (ubíqua) |
| **Stakeholders** | Time Comercial, Secretaria-IA, Agentes IA, Marketing, ZCC |
| **Eventos publicados** | `LeadCaptured`, `LeadQualified`, `LeadConverted`, `LeadStageChanged`, `InteractionAdded` |

### Relações com outros Contextos

| Contexto | Tipo de Relação |
|---|---|
| Property | Tenant de destino do lead (opcional — lead pode ser capturado sem propertyId) |
| Reservation | Conversão: lead → reserva quando propertyId é vinculado |
| CRM (CrmContact/CrmDeal) | Projeção lateral quando lead se torna cliente |
| EmailTracking | Sub-aggregate de rastreamento de abertura de e-mails |
| ActionLog | Log de ações automáticas executadas no lead |
| SwipeTemplate | Modelo de abordagem comercial associado ao perfil do lead |

---

## 2. Linguagem Ubíqua

| Termo | Definição |
|---|---|
| **Lead** | Potencial cliente B2B (pousada, hotel, hostel) capturado por qualquer canal |
| **Score** | Pontuação de 0 a 100 que indica o potencial de conversão do lead |
| **Funil (Funnel)** | Jornada do lead desde o primeiro contato até a conversão |
| **Origem (Source)** | Canal de captura: SECRETARIA_AI, LANDING_PAGE, WHATSAPP, INSTAGRAM, JUNTA, etc. |
| **Interação** | Evento ou ação que o lead realizou (abriu e-mail, clicou em link, respondeu WhatsApp) |
| **Cluster** | Classificação agregada do lead: HOT (score ≥ 60), WARM (≥ 30), COLD (< 30) |
| **Tier** | Segmentação comercial: MAX, PRO, LITE (corresponde ao plano que o lead pode contratar) |
| **Qualificação** | Processo de enriquecimento dos dados do lead via IA (Secretaria-IA) |
| **Conversão** | Lead que se tornou cliente (assinou plano ZEHLA) |
| **Pain Point** | Dor operacional identificada no lead (ex: "check-in manual", "sem integração WhatsApp") |
| **PII** | Dados pessoais do lead (nome, telefone, e-mail) — mascarados em logs |
| **Secretaria-IA** | Módulo de IA que prospecta, enriquece e qualifica leads automaticamente |
| **Swipe** | Template de abordagem comercial pré-escrito para venda consultiva |
| **Blast** | Campanha de disparo em massa (WhatsApp) |
| **Raio-X** | Análise aprofundada de lead com dados de Google Business, Reclame Aqui, redes sociais |

---

## 3. Value Objects

### 3.1 LeadContactInfo

```typescript
interface LeadContactInfoProps {
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  phoneSecondary?: string
  socialMedia?: string
  site?: string
}

// Invariantes:
// - name é obrigatório (mín. 2 caracteres)
// - Pelo menos um de {phone, whatsapp, email} deve ser fornecido
// - email valida formato se fornecido
// - phone/whatsapp valida dígitos mínimos se fornecido
// - PII é mascarado em logs
```

### 3.2 BusinessProfile

```typescript
interface BusinessProfileProps {
  property?: string                 // Nome da pousada/hotel
  category?: 'pousada' | 'hotel' | 'hostel' | 'outro'
  city?: string
  state?: string                    // default "SC"
  region?: string
  location?: string
  latitude?: number
  longitude?: number
  localPraia?: string
  roomsCount?: number
  instagramFollowers?: number
  googleReviewsCount?: number
  googleRating?: number
  otaDependenceLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
  otaCommissionLost?: number
  hasWebsite: boolean
}

// Invariantes:
// - roomsCount ≥ 0 se fornecido
// - googleRating entre 0 e 5 se fornecido
// - otaCommissionLost ≥ 0 se fornecido
```

### 3.3 BehaviorSignals

```typescript
interface BehaviorSignalsProps {
  painPoints?: string
  observacoes?: string
  notes?: string
  estimatedValues?: string
  intentSignals?: string
  buyingBehavior?: string
  conversionProbability?: number
  objectKeywords?: string
  recommendedPitch?: string
}

// Invariantes:
// - conversionProbability entre 0 e 100 se fornecido
// - Máximo 500 caracteres por campo de texto livre
```

### 3.4 LeadScore

```typescript
interface LeadScoreProps {
  score: number                     // 0-100
  scoreValid?: number               // 0-100
  validationScore?: number          // 0-100
  conversionScore?: number          // 0-100
  validationStatus?: 'pendente' | 'validado' | 'rejeitado'
  qualification?: string
}

// Invariantes:
// - score está sempre entre 0 e 100
// - scoreValid, validationScore, conversionScore entre 0 e 100
// - cluster é DERIVADO do score, nunca armazenado como campo independente
```

### 3.5 FunnelPosition

```typescript
interface FunnelPositionProps {
  status: LeadStatus
  funnelStage: FunnelStage
  source: LeadSource
  cluster: Cluster
  previousCluster?: Cluster
  leadTier?: 'COLD' | 'WARM' | 'HOT'
  tierSugerido?: 'COLD' | 'WARM' | 'HOT'
  tierConfidence?: number
  behavioralProfile?: BehaviorProfile
}

enum LeadStatus {
  PROSPECT          // Recém-capturado, não qualificado
  QUALIFIED         // Qualificado com score mínimo
  TRIAL_STARTED     // Iniciou trial
  CONVERTED         // Tornou-se cliente
  BLACKLISTED       // Bloqueado
}

type FunnelStage =
  | 'NEUTRAL'       // Sem interações
  | 'AWARE'         // Abriu e-mail ou visitou landing
  | 'INTERESTED'    // Clicou em link
  | 'ENGAGED'       // Respondeu WhatsApp
  | 'TRIAL'         // Iniciou trial
  | 'CONVERTED'     // Tornou-se cliente

type Cluster = 'HOT' | 'WARM' | 'COLD'

type BehaviorProfile =
  | 'analítico' | 'urgente' | 'curioso' | 'resistente' | 'conservador'

// Invariantes:
// - Transições de LeadStatus são unidirecionais (PROSPECT → QUALIFIED → TRIAL_STARTED → CONVERTED)
// - Transições de FunnelStage são progressivas (NEUTRAL → ... → CONVERTED)
// - Cluster é derivado: HOT (score ≥ 60), WARM (score ≥ 30), COLD (score < 30)
// - leadTier SEMPRE corresponde a cluster
// - behavioralProfile é opcional, detectado por IA
```

### 3.6 SwipeTracking

```typescript
interface SwipeTrackingProps {
  lastSwipeAction?: string
  lastSwipeUsedId?: string
  swipeUsages: SwipeUsage[]
}

// Invariantes:
// - Apenas rastreamento, sem regras de negócio
```

### 3.7 LeadSource

```typescript
type LeadSource =
  | 'SECRETARIA_AI'     // Prospecção automática via IA
  | 'LANDING_PAGE'      // Captura via site
  | 'WHATSAPP'          // Contato via WhatsApp
  | 'INSTAGRAM'         // Contato via Instagram
  | 'JUNTA'             // Dados de Junta Comercial
  | 'WHATSAPP_EXTRACT'  // Extraído de grupos
  | 'OTA'               // Guest de Booking/Airbnb
  | 'MANUAL'            // Cadastro manual
  | 'REFERRAL'          // Indicação
```

### 3.8 UTMParams

```typescript
interface UTMParams {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}
```

### 3.9 InteractionScore

```typescript
interface InteractionScore {
  score: number                      // 0-100
  cluster: Cluster                   // Derivado do score
  events: LeadEvent[]
}

// Invariantes:
// - score entre 0 e 100
// - cluster derivado: HOT (≥60), WARM (≥30), COLD (<30)
```

---

## 4. Entities

### 4.1 Lead (Aggregate Root)

```typescript
interface Lead {
  id: string
  contact: LeadContactInfo           // ← VO
  business: BusinessProfile          // ← VO
  behavior: BehaviorSignals          // ← VO
  score: LeadScore                   // ← VO
  funnel: FunnelPosition             // ← VO
  swipe: SwipeTracking               // ← VO
  utm?: UTMParams                    // ← VO
  
  propertyId?: string
  lastInteractionAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Children
  emailTracking: EmailTracking[]
  events: LeadEvent[]
  actionLogs: ActionLog[]
}
```

### 4.2 LeadEvent (Entity — parte do Aggregate Lead)

```typescript
interface LeadEvent {
  id: string
  leadId: string
  type: LeadEventType
  scoreImpact: number               // Pontos adicionados/removidos do score
  dedupHash?: string                // SHA-256 para deduplicação
  sessionId?: string
  fingerprint?: string
  eventSource: string               // "api" | "webhook" | "sync_fallback"
  status: string                    // "received" | "classified"
  metadata?: any
  timestamp: Date
  
  lead: Lead
}

enum LeadEventType {
  EMAIL_OPEN
  LINK_CLICK
  LANDING_VISIT
  WHATSAPP_OPEN
  WHATSAPP_REPLY
  WHATSAPP_SENT
  WHATSAPP_DELIVERED
  WHATSAPP_BLOCKED
  WHATSAPP_OPTED_OUT
  WHATSAPP_LINK_CLICKED
  AD_VIEW
  TRIAL_STARTED
  PAYMENT_MADE
  CONVERSION
}
```

### 4.3 EmailTracking (Entity — sub-aggregate vinculado ao Lead)

```typescript
interface EmailTracking {
  id: string
  leadId: string
  campaignId?: string
  openedAt: Date
  ip?: string
  userAgent?: string
  lead: Lead
}
```

### 4.4 ActionLog (Entity — sub-aggregate)

```typescript
interface ActionLog {
  id: string
  leadId: string
  actionType: string                // Ex: "send_nurture_email", "activate_whatsapp_sequence"
  trigger: string                   // Ex: "CLUSTER_TRANSITION", "MANUAL"
  cluster: string
  payload?: any
  status: string                    // "pending" | "completed" | "failed"
  error?: string
  retriedAt?: Date
  createdAt: Date
  
  lead: Lead
}
```

### 4.5 SwipeUsage (Entity — sub-aggregate)

```typescript
interface SwipeUsage {
  id: string
  swipeId: string
  leadId: string
  wasUsed: boolean
  converted?: boolean
  agentId?: string
  responseTimeMs?: number
  feedback?: string
  createdAt: Date
  
  swipe: SwipeTemplate
  lead: Lead
}
```

### 4.6 FunnelEvent (Entity — log avulso de funil)

```typescript
interface FunnelEvent {
  id: string
  leadId?: string
  email?: string
  eventType: string
  campaignId?: string
  campaignName?: string
  metadata?: any
  ip?: string
  userAgent?: string
  scoreDelta: number
  createdAt: Date
}
```

---

## 5. Invariantes do Domínio

1. **Identificação mínima:** Um lead não pode ser criado sem pelo menos `name` OU `phone`/`whatsapp`.
2. **Score range:** `score`, `conversionScore`, `validationScore` devem estar entre 0 e 100.
3. **Score default:** Um lead recém-criado tem `score = 0` (ou score calculado pelo LIS).
4. **Transição de status:** As transições de `LeadStatus` são unidirecionais:
   ```
   PROSPECT → QUALIFIED → TRIAL_STARTED → CONVERTED
      ↓           ↓
   BLACKLISTED  BLACKLISTED
   ```
   Um lead CONVERTED não pode voltar a PROSPECT.
5. **Transição de funil:** `funnelStage` segue progressão:
   ```
   NEUTRAL → AWARE → INTERESTED → ENGAGED → TRIAL → CONVERTED
   ```
   Um lead não pode regredir de CONVERTED para NEUTRAL.
6. **Unicidade de email:** `email` é unique no schema (deve ser tratado com upsert em fontes concorrentes).
7. **Unicidade de telefone:** `phone` e `whatsapp` são unique no schema.
8. **Deduplicação:** Um mesmo evento (mesmo `dedupHash` na janela de 1h) não pode ser processado duas vezes.
9. **Transição de cluster:** Quando o score cruza thresholds (60, 30), ações automáticas são disparadas via `CLUSTER_ACTIONS`.
10. **PII:** `name` é mascarado em logs via PII Scanner; `email`, `phone`, `whatsapp` são PII sensíveis.
11. **Rate limiting:** Máximo de 50 req/min para GET /api/leads e 10 req/min para POST /api/leads por IP.
12. **Cluster cleaning:** Um lead não pode estar em cluster HOT com score < 60.

---

## 6. Regras de Negócio (Given/When/Then)

### UC-01: Capturar Lead (SECRETARIA_AI, Landing Page, WhatsApp, Instagram) (SECRETARIA_AI, Landing Page, WhatsApp, Instagram)

```
Given dados mínimos de contato (name + phone ou name + email)
  And source informado (default: SECRETARIA_AI)
When o sistema captura o lead
Then o lead é persistido com status PROSPECT
  And score inicial = 0 (ou calculado pelo LIS)
  And funnelStage = NEUTRAL
  And leadTier = "COLD"
  And cluster = "COLD"
  And um evento LeadCaptured é emitido
  And se propertyId está presente, o lead é vinculado à propriedade

Given um lead com mesmo email já existe
When o sistema tenta capturar novamente
Then deve usar upsert (atualizar dados, não duplicar)

Given dados SEM name E SEM phone/whatsapp
When o sistema tenta capturar
Then retorna erro 400 "Nome e WhatsApp são obrigatórios"
```

### UC-02: Qualificar Lead (Atualizar Score)

```
Given um lead existente
When o sistema qualifica via LeadScorer (IA)
Then o score é atualizado com base em:
  - Análise de perfil (nome + descrição)
  - Pain points identificados
  - Quantidade de quartos (roomsCount > 10 → +20)
  - Sinais de booking/pain → +15
  - Boom/crash signals da cidade (trendSignal) → +25 / -10
And o cluster é recalculado (HOT ≥ 60, WARM ≥ 30, COLD < 30)
And se cluster mudou, ações automáticas são disparadas

Given um lead com eventos registrados
When o sistema recalcula o score por eventos
Then scoreImpact é somado ao score atual
  E o resultado é limitado a max(100)
  E cluster é reavaliado
```

### UC-03: Mover Lead no Funil

```
Given um lead com evento registrado
When o sistema detecta funnelStage apropriado
Then:
  - EVENT_OPEN → AWARE
  - LINK_CLICK → INTERESTED
  - WHATSAPP_REPLY → ENGAGED
  - TRIAL_STARTED → TRIAL
  - CONVERSION → CONVERTED

Given um lead em estágio avançado (ex: CONVERTED)
When ocorre um evento de estágio anterior (ex: EMAIL_OPEN)
Then o estágio não regride
  And o evento é registrado sem alterar funnelStage
```

### UC-04: Converter Lead em Cliente

```
Given um lead QUALIFIED ou TRIAL_STARTED
When o lead assina um plano ZEHLA
Then status muda para CONVERTED
  And funnelStage muda para CONVERTED
  And cluster muda para HOT
  And um evento LeadConverted é emitido
  And cria-se um CrmContact vinculado (se propertyId definido)

Given um lead CONVERTED
When o sistema tenta qualificar novamente
Then nenhuma alteração de status é permitida (invariante)
```

### UC-05: Identificar Lead Duplicado

```
Given um lead com email ou phone já existente no banco
When o sistema tenta criar um novo lead
Then o upsert deve:
  - Atualizar dados se email for igual
  - Ou atualizar dados se phone for igual
  - Retornar o registro existente atualizado, não um novo

Given um batch de leads com possíveis duplicatas
When o sistema processa o lote
Then cada lead é upsertado individualmente
```

### UC-06: Rastrear Interação (Evento no Lead)

```
Given um lead existente
  And um evento válido (LeadEventType)
When o sistema registra a interação
Then um LeadEvent é criado com scoreImpact correspondente
  And scoreImpact é somado ao conversionScore do lead
  And behavioralProfile é recalculado
  And funnelStage é recalculado
  And dedupHash é calculado (SHA-256) para prevenir duplicatas
  And rate limiting por email é aplicado (100 eventos/hora)

Given um evento duplicado (mesmo dedupHash na janela de 1h)
When o sistema processa
Then o evento é rejeitado como duplicata
  And score não é alterado
```

### UC-07: Disparar Ações Automáticas por Transição de Cluster

```
Given um lead cujo score mudou
When o cluster resultante é diferente do anterior
Then o sistema executa as ações definidas em CLUSTER_ACTIONS para a transição
  Ex: COLD→HOT → ["send_sales_alert_urgent", "sugerir_swipe_zcc", ...]
  And cada ação é registrada como ActionLog
  And as ações são enfileiradas na fila ACT do BullMQ

Given um lead que não mudou de cluster
When o score é atualizado
Then nenhuma ação automática é disparada
```

### UC-08: Processar Webhook de Evento Externo

```
Given um webhook recebido de fonte externa (n8n, Make, Segment, Z-API)
  And HMAC signature válida (se configurada)
When o sistema processa o webhook
Then o evento externo é mapeado para LeadEventType interno
  And o evento é enfileirado na captureQueue
  And um log de webhook é registrado para auditoria

Given um evento externo sem mapeamento interno
When o sistema processa
Then o webhook é ignorado e logado com status "ignored"

Given um webhook sem email no payload
When o sistema processa
Then retorna erro 400 "Email não encontrado no payload"
```

---

## 7. Domain Services

### 7.1 LeadScoringService

```typescript
interface LeadScoringService {
  scoreLead(name: string, about: string): Promise<LeadScoreResult>
  calculateEventScore(events: LeadEvent[]): number
  getGeographicWeight(city: string, state: string): number
  determineCluster(score: number): Cluster
}
```

### 7.2 LeadIntelligenceEngine

```typescript
interface LeadIntelligenceEngine {
  processEventAsync(data: LeadEventData): Promise<{ async: boolean }>
  trackEvent(data: LeadEventData): Promise<void>
  refreshBrain(lead: Lead): Promise<void>
  detectBehaviorProfile(events: LeadEvent[]): BehaviorProfile
  detectFunnelStage(events: LeadEvent[]): string
}
```

### 7.3 DuplicateDetectionService

```typescript
interface DuplicateDetectionService {
  findByEmail(email: string): Promise<Lead | null>
  findByPhone(phone: string): Promise<Lead | null>
  findDuplicate(contactInfo: LeadContactInfo): Promise<Lead | null>
  isDuplicate(contactInfo: LeadContactInfo): Promise<boolean>
}
```

### 7.4 FunnelTransitionService

```typescript
interface FunnelTransitionService {
  canTransition(from: FunnelStage, to: FunnelStage): boolean
  transition(lead: Lead, targetStage: FunnelStage): Promise<Lead>
  detectStageFromEvents(events: LeadEvent[]): FunnelStage
}
```

### 7.5 ClusterActionService

```typescript
interface ClusterActionService {
  getActionsForTransition(from: Cluster, to: Cluster): string[]
  executeActions(leadId: string, actions: string[]): Promise<void>
  logAction(leadId: string, actionType: string, trigger: string, cluster: string, status: string): Promise<void>
}
```

### 7.6 PixelService (Email Tracking)

```typescript
interface PixelService {
  generateTag(leadId: string, campaignId?: string): string
  // Gera <img> tag with tracking pixel URL
}
```

### 7.7 LeadCaptureService

```typescript
interface LeadCaptureService {
  capture(data: RawLeadData, propertyId?: string): Promise<Lead>
  captureBatch(leads: RawLeadData[]): Promise<BatchResult>
  captureFromWhatsApp(instanceName: string, groupId?: string): Promise<Lead[]>
}
```

---

## 8. Repository Interfaces (Ports)

```typescript
interface LeadRepository {
  save(lead: Lead): Promise<Lead>                           // Create or Upsert
  update(id: string, data: Partial<Lead>): Promise<Lead>
  findById(id: string): Promise<Lead | null>
  findByEmail(email: string): Promise<Lead | null>
  findByPhone(phone: string): Promise<Lead | null>
  findByProperty(propertyId: string, filters?: LeadFilters): Promise<Lead[]>
  findMany(filters?: LeadFilters): Promise<Lead[]>
  count(filters?: LeadFilters): Promise<number>
  groupBy(field: string): Promise<GroupResult[]>
  aggregate(filters?: LeadFilters): Promise<LeadAggregate>
  delete(id: string): Promise<void>
}

interface LeadFilters {
  region?: string
  state?: string
  city?: string
  status?: LeadStatus
  minScore?: number
  maxScore?: number
  search?: string
  cluster?: string
  source?: string
  propertyId?: string
  limit?: number
  offset?: number
}

interface LeadAggregate {
  total: number
  avgScore: number
  avgValidationScore: number
  byRegion: Array<{ name: string; count: number }>
}

interface LeadEventRepository {
  save(event: LeadEvent): Promise<LeadEvent>
  findByLeadId(leadId: string): Promise<LeadEvent[]>
  findByDedupHash(dedupHash: string): Promise<LeadEvent | null>
  findByEmail(email: string): Promise<LeadEvent[]>
}

interface EmailTrackingRepository {
  save(tracking: EmailTracking): Promise<EmailTracking>
  findByLeadId(leadId: string): Promise<EmailTracking[]>
  countByLeadId(leadId: string): Promise<number>
  countByCampaignId(campaignId: string): Promise<number>
}

interface ActionLogRepository {
  save(log: ActionLog): Promise<ActionLog>
  findByLeadId(leadId: string): Promise<ActionLog[]>
  findByActionType(actionType: string): Promise<ActionLog[]>
}
```

---

## 9. API Contracts

### GET /api/leads (Listar Leads)

```typescript
// Query params
// ?region=SC&state=SC&minScore=50&search=Pousada&limit=100

// Response 200
{
  leads: Array<{
    id: string
    name: string
    city: string
    state: string
    latitude: number | null
    longitude: number | null
    score: number | null
    validationScore: number | null
    status: LeadStatus
    whatsapp: string | null
    intentSignals: string
    qualification: string | null
  }>,
  stats: {
    total: number
    avgScore: number
    avgValidation: number
    byRegion: Array<{ name: string; count: number }>
  }
}

// Response 429
{ error: "Too many requests" }

// Response 401
{ error: "Unauthorized" }
```

### POST /api/leads (Capturar Lead)

```typescript
// Request
{
  name: string
  email?: string
  whatsapp?: string
  city?: string
  state?: string
  source?: string              // default: "LANDING_PAGE"
  propertyId?: string
}

// Response 201
{
  success: true
  message: "Lead capturado e enviado para qualificação neural."
  leadId: string
}

// Response 400
{ error: "Nome e WhatsApp são obrigatórios" }

// Response 429
{ error: "Too many requests. Please try again later." }
```

### GET /api/leads/analytics (Dashboard Analytics)

```typescript
// Response 200
{
  total: number
  hotLeads: number              // score ≥ 90
  byState: Array<{ uf: string; count: number }>
  recent: Array<{
    name: string
    city: string
    score: number | null
    updatedAt: Date
  }>
}
```

### POST /api/leads/batch (Ingestão em Lote)

```typescript
// Request
{
  leads: RawLeadData[]           // Máximo 300 leads
  apiKey: string
}

// Response 200
{
  success: true
  processed: number
  validated: number
  message: string
}

// Response 429
{ error: "Rate limit exceeded for batch ingestion." }

// Response 401
{ error: "Unauthorized operational request." }
```

### GET /api/zcc/leads (Leads via ZCC)

```typescript
// Query params
// ?region=SC

// Response 200
{
  leads: Array<Lead>,
  stats: {
    total: number
    qualified: number
    converted: number
    inCampaign: number
    totalOpens: number
  }
}
```

### POST /api/zcc/leads (Upsert Lote via ZCC)

```typescript
// Request
{
  leads: Array<{
    nome?: string
    name?: string
    email?: string
    telefone?: string
    phone?: string
    cidade?: string
    city?: string
    estado?: string
    state?: string
    categoria?: string
    category?: string
    score?: number
    status?: string
    dores?: string
    painPoints?: string
  }>,
  region: string
}

// Response 200
{ success: true, count: number }
```

### POST /api/events/track (Event Tracking Genérico)

```typescript
// Request
{
  email?: string
  eventType: LeadEventType       // Obrigatório
  sessionId?: string
  fingerprint?: string
  metadata?: any
}

// Response 202
{
  success: true
  trackingId: string
  message: "Evento enfileirado para processamento"
}

// Response 400
{ error: "eventType é obrigatório" }
```

### POST /api/events/webhook (Webhook Receiver)

```typescript
// Request (body varia por plataforma)
{
  event?: string
  eventType?: string
  type?: string
  email?: string
  userId?: string
  properties?: any
  // ...
}

// Response 200
{
  status: "processed" | "ignored"
  mappedTo?: string
  webhookLogId?: string
}

// Response 401
{ error: "Invalid signature" }

// Response 400
{ error: "Email não encontrado no payload" }
```

### POST /api/marketing/send-email (Disparo de Campanha)

```typescript
// Request
{
  leadIds: string[]
  campaignType: string
}

// Response 200
{
  success: true
  message: string
  count: number
}
```

---

## 10. Eventos de Domínio

```typescript
interface LeadCaptured {
  leadId: string
  name: string
  email?: string
  phone?: string
  source: string
  propertyId?: string
  timestamp: Date
}

interface LeadQualified {
  leadId: string
  previousScore: number
  newScore: number
  previousCluster: Cluster
  newCluster: Cluster
  timestamp: Date
}

interface LeadConverted {
  leadId: string
  propertyId?: string
  plan: string                    // LITE | PRO | MAX
  timestamp: Date
}

interface LeadStageChanged {
  leadId: string
  previousStage: FunnelStage
  newStage: FunnelStage
  triggerEvent: LeadEventType
  timestamp: Date
}

interface InteractionAdded {
  leadId: string
  eventType: LeadEventType
  scoreImpact: number
  timestamp: Date
}

interface LeadClusterTransition {
  leadId: string
  previousCluster: Cluster
  newCluster: Cluster
  actions: string[]               // Ações disparadas
  timestamp: Date
}

interface EmailOpened {
  leadId: string
  email: string
  campaignId?: string
  ip?: string
  userAgent?: string
  timestamp: Date
}
```

---

## 11. Erros Conhecidos no Código Atual (a serem corrigidos)

| # | Problema | Localização | Impacto |
|---|---|---|---|
| 1 | `LeadScorer.calculateEventScore()` é chamado em `lead-intelligence-engine.ts:79` mas não existe na classe `LeadScorer` | `lead-scorer.ts` vs `lead-intelligence-engine.ts` | **Runtime error** — método ausente causa crash no refreshBrain |
| 2 | `lead-service.ts` cria lead com `status: 'PROSPECT'` e `funnelStage: 'AWARE'` mas `funnelStage` não é um campo do schema Prisma como enum | `lead-service.ts:69` | Inconsistência — funnelStage é String livre, sem validação |
| 3 | `lead-service.ts` usa `prisma.lead.create` com `funnelStage: 'AWARE'` mas o default no schema é `"NEUTRAL"` | `lead-service.ts:69` | Inconsistência de valor padrão |
| 4 | `GET /api/leads` não filtra leads por `propertyId` quando o tenant tem propriedade | `src/app/api/leads/route.ts` | Vaza dados entre tenants se middleware não filtrar |
| 5 | `GET /api/zcc/leads` expõe `_count.emailTracking` sem filtrar por tenant | `src/app/api/zcc/leads/route.ts:18-22` | Potencial vazamento de métricas |
| 6 | `POST /api/leads` cria lead com `status: 'NEW'` mas `LeadStatus` enum não contém `NEW` | `src/app/api/leads/route.ts:118` | **Erro em runtime** — valor inválido para enum Prisma |
| 7 | `POST /api/leads` insere `region: 'OUTROS'` sem validação | `src/app/api/leads/route.ts:116` | Dado solto sem correspondência no domínio |
| 8 | `marketing/leads/route.ts` usa `b2bLeads` mock em vez de consultar o banco | `src/app/api/marketing/leads/route.ts` | API não funcional em produção |
| 9 | `temp_api/marketing/leads/route.ts` é cópia morta com erro de sintaxe (void em vez de Response) | `temp_api/marketing/leads/route.ts` | Dead code com bug |
| 10 | `lead-service.ts` importa `addEmailJob` de `@/lib/queue/client` mas `addEmailJob` não é definido em `queues.ts` | `lead-service.ts:3` | **Import inválido** — provável runtime error |
| 11 | `captureWorker.ts` tem bloco `try` sem `catch` adequado (linha 22-29) | `captureWorker.ts:22` | Estrutura try sem catch para o rate limit |
| 12 | `scoreValid` e `validationScore` coexistem sem definição clara de propósito | Schema + lead-service | Duplicidade semântica |
| 13 | Dois modelos de evento: `LeadEvent` (consolidado) e `funnel_events` (tabela separada sem FK) | Schema | Fragmentação — eventos de lead estão em duas tabelas |
| 14 | `convertionScore` (typo) deveria ser `conversionScore` | Schema: `conversionScore` | Nome correto, mas inconsistência em outros lugares |
| 15 | `marketing/leads/route.ts` DEVOLVE `b2bLeads` sem autenticação | `src/app/api/marketing/leads/route.ts:5` | Dados mock expostos publicamente |
| 16 | `POST /api/marketing/send-email` aceita qualquer array de leadIds sem validação de propriedade | `src/app/api/marketing/send-email/route.ts:17-24` | Pode enviar e-mails para leads de outros tenants |
| 17 | `validateQueue` importada mas usada apenas no worker — sem listener no worker | `captureWorker.ts:4` | Queue orphan — eventos enfileirados mas nunca processados |

---

## 12. Critérios de Aceitação para Refatoração

- [ ] `LeadScorer` implementa `calculateEventScore()` e `getGeographicWeight()` conforme assinatura consumida por `LeadIntelligenceEngine`
- [ ] Todos os imports (`addEmailJob`, `validateQueue`) são resolvidos ou removidos
- [ ] `POST /api/leads` usa `LeadStatus.PROSPECT` em vez de `'NEW'` (string inválida)
- [ ] `funnelStage` usa valores consistentes entre ingestão (lead-service) e engine (lead-intelligence-engine)
- [ ] `LeadEvent` é a única tabela de eventos de lead; `funnel_events` é migrada ou removida
- [ ] `propertyId` é obrigatório e filtrado em TODAS as queries de lead (multitenancy)
- [ ] Transições de status seguem o diagrama unidirecional (seção 5)
- [ ] Transições de funil seguem a progressão (NEUTRAL → ... → CONVERTED), sem regressão
- [ ] Score é sempre limitado a [0, 100]
- [ ] Cluster é recalculado automaticamente após qualquer alteração de score
- [ ] Ações automáticas (CLUSTER_ACTIONS) são disparadas em transições de cluster
- [ ] Deduplicação de eventos via SHA-256 hash com janela de 1h
- [ ] Rate limiting por IP e por email está ativo nos endpoints
- [ ] PII é mascarado em todos os logs (PII Scanner)
- [ ] `LeadRepository` não conhece Prisma — usa interface de port
- [ ] Eventos de domínio são emitidos para cada transição de estado
- [ ] APIs de marketing consultam o banco de dados, não mocks
- [ ] `temp_api/marketing/leads` é removido (dead code)

---

## 13. Glossário de Termos Técnicos

| Termo | Significado |
|---|---|
| **Aggregate** | Cluster de entidades tratado como unidade transacional |
| **Value Object** | Objeto imutável definido por seus atributos, não por identidade |
| **Invariante** | Regra de negócio que deve ser sempre verdadeira |
| **Port** | Interface que define contrato com mundo externo (ex: repositório) |
| **Use Case** | Fluxo de interação que orquestra entidades e serviços |
| **Domain Event** | Algo que aconteceu no domínio que outros contextos precisam saber |
| **PII** | Personally Identifiable Information — dados que identificam uma pessoa |
| **Tenant** | Propriedade (cada pousada é um tenant isolado) |
| **LIS** | Lead Intelligence System — sistema de scoring e qualificação de leads |
| **BullMQ** | Fila de mensageria baseada em Redis para processamento assíncrono |
| **Deduplicação** | Impedir que o mesmo evento seja processado múltiplas vezes |
| **Upsert** | Operação que cria ou atualiza um registro (update + insert) |
| **Cluster** | Grupo térmico: HOT (quente), WARM (morno), COLD (frio) |
| **Swipe** | Template de mensagem de vendas pré-escrito |
| **HMAC** | Hash-based Message Authentication Code — usado para validar webhooks |
| **ZCC** | ZEHLA Command Center — painel de controle do produto |
