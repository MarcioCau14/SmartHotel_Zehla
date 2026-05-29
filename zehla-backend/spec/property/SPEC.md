# SPEC — Domínio de Property (Pousada / Tenant)

## 1. Bounded Context

| Campo | Valor |
|---|---|
| **Domínio** | Core Business de Tenant — a pousada é a raiz de todos os outros domínios |
| **Aggregate Root** | `Property` (o único AR — toda entidade pertence a uma Property) |
| **Linguagem** | Português (ubíqua) |
| **Stakeholders** | Dono da Pousada, Recepção, Financeiro, Agentes IA, ZCC System |
| **Eventos publicados** | `PropertyCreated`, `PropertyActivated`, `PropertySuspended`, `PropertyReactivated`, `PropertyChurned`, `PropertyPlanChanged`, `TrialStarted`, `TrialExpiring`, `TrialExpired`, `CadasturExpiring`, `VoiceTokensExhausted`, `PropertyConfigurationUpdated` |

### Relações com outros Contextos

| Contexto | Tipo de Relação |
|---|---|
| Reservation | Property é o tenant dono da reserva |
| Room | Property possui quartos |
| Financeiro | Property configura PIX key, plan determina feature set financeiro |
| Lead | Property recebe leads |
| ZCC | Sistema externo que gerencia múltiplas Properties |
| Agent | Agentes IA operam dentro de uma Property |

---

## 2. Linguagem Ubíqua

| Termo | Definição |
|---|---|
| **Property** | A pousada como entidade raiz de locação — todo registro no sistema pertence a uma Property |
| **Pousada** | Sinônimo de Property no contexto de negócio |
| **Plano** | Tier de assinatura (LITE, PRO, MAX) que determina features disponíveis |
| **Trial** | Período de teste gratuito de 7 dias ao criar a pousada |
| **Feature Gate** | Mecanismo que libera/bloqueia funcionalidades conforme o plano |
| **Registration Number** | Identificador único da pousada no formato NNNN/PLAN/UF |
| **Cadastur** | Cadastro oficial do Ministério do Turismo para meios de hospedagem |
| **FNRH** | Ficha Nacional de Registro de Hóspedes (obrigatório por lei) |
| **Assinatura** | Vínculo contratual de pagamento recorrente (abstraído por Subscription VO) |
| **Honeypot / IsCanary** | Flag que marca pousadas de teste (canary) para agentes IA |
| **Canal de Distribuição** | Origem do cadastro (utmSource, refSource) |
| **Janela Operacional** | Configurações de tempo para check-in (padrão 24h) e limpeza (padrão 3h) |
| **Token de Voz** | Unidade de consumo do serviço de síntese de voz (por caractere) |
| **Período de Teste** | Intervalo de 7 dias desde a ativação até trialEndsAt |
| **Churn** | Cancelamento definitivo da assinatura — estado terminal |
| **UF** | Unidade Federativa brasileira (sigla de 2 letras) |
| **PIX Key** | Chave de pagamento instantâneo brasileiro (CPF/CNPJ/EMAIL/PHONE/RANDOM) |
| **External Subscription ID** | Identificador genérico da assinatura no gateway de pagamento (não Stripe-specific) |

---

## 3. Value Objects

### 3.1 Address

```typescript
interface AddressProps {
  street: string
  city: string
  state: string            // UF brasileiro (2 letras, maiúsculo)
  zipCode: string          // CEP: formato NNNNN-NNN
  latitude?: number        // Opcional
  longitude?: number       // Opcional
}

// Invariantes:
// - state é UF válida brasileira (AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO)
// - zipCode no formato NNNNN-NNN (regex: /^\d{5}-\d{3}$/)
// - street não vazio
// - city não vazio

// Métodos:
// - static create(props): Result<Address, Error>
// - static restore(props): Address
// - equals(other: Address): boolean
// - fullAddress(): string  // "Rua X, Cidade - UF"
```

### 3.2 ContactInfo

```typescript
interface ContactInfoProps {
  phone: string            // +55XXXXXXXXXXX (13 dígitos com DDD)
  whatsapp: string         // +55XXXXXXXXXXX (13 dígitos com DDD)
  email: string            // Formato email válido
  website?: string         // URL opcional
  supplierContact?: string // Contato de fornecedor (opcional)
}

// Invariantes:
// - phone e whatsapp: formato +55XXXXXXXXXXX (regex: /^\+55\d{10,11}$/)
// - email: regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// - website: se definido, URL válida (regex simples de URL)
// - supplierContact: se definido, entre 3 e 200 caracteres

// Métodos:
// - static create(props): Result<ContactInfo, Error>
// - static restore(props): ContactInfo
// - equals(other: ContactInfo): boolean
```

### 3.3 PixKey (REUSADO do domínio Financeiro)

```
REUSAR src/domain/financeiro/value-objects/PixKey.ts

PixKey.create(type, value): Result<PixKey, Error>
  - CPF: 11 dígitos numéricos (validar DV)
  - CNPJ: 14 dígitos numéricos (validar DV)
  - EMAIL: formato email válido
  - PHONE: +55XXXXXXXXXXX (13 dígitos com DDD)
  - RANDOM: UUID v4

Mover para src/domain/shared/value-objects/ se o domínio Property for
o dono natural da chave PIX (a pousada tem a chave).
```

### 3.4 PropertyStatus (Enum-like VO com state machine interna)

```typescript
enum PropertyStatus {
  PENDING_SETUP     // Recém-criada, aguardando ativação
  ACTIVE            // Operacional (trial ou paga)
  SUSPENDED         // Suspensa por inadimplência
  CHURNED           // Cancelada definitivamente (terminal)
  TRIAL_EXPIRED     // Trial expirou sem assinatura (terminal)
}

// Transições válidas:
// PENDING_SETUP  → ACTIVE (ativação / início de trial)
// ACTIVE          → SUSPENDED, TRIAL_EXPIRED, CHURNED
// SUSPENDED       → ACTIVE (reativação)
// ACTIVE/SUSPENDED → CHURNED

// Invariantes:
// - CHURNED é terminal
// - TRIAL_EXPIRED é terminal (só sai via nova assinatura com cartão)
// - PENDING_SETUP → CHURNED não é permitido (precisa ativar primeiro)
```

### 3.5 Plan

```typescript
enum Plan {
  LITE            // Trial / entrada
  PRO             // Profissional
  MAX             // Premium
  BETA_TESTER     // Testadores (gratuito, features experimentais)
  EARLY_ADOPTER   // Adotantes iniciais (plano legado congelado)
}

// Cada Plan mapeia para um FeatureSet (derivado, nunca armazenado)
```

### 3.6 FeatureSet

```typescript
// Set imutável de Feature flags derivado do Plan

enum Feature {
  COMMISSION_DISCOUNT    // LITE+
  IA_PERSONA             // PRO+
  WHATSAPP_LEARNING      // PRO+
  ADVANCED_REPORTS       // PRO+
  SUPPLIER_MANAGEMENT    // MAX
  NEURAL_VOICE           // MAX
  CADASTUR_AUTO          // PRO+
  FNRH_AUTO              // MAX
}

interface FeatureSetProps {
  features: Set<Feature>
}

// Invariantes:
// - FeatureSet é derivado de Plan, nunca armazenado separadamente
// - PlanFeatureService mapeia Plan → FeatureSet

// Métodos:
// - hasFeature(feature: Feature): boolean
// - getFeatures(): Feature[]
// - static fromPlan(plan: Plan): FeatureSet

// Mapeamento:
// LITE:           [COMMISSION_DISCOUNT]
// PRO:            [COMMISSION_DISCOUNT, IA_PERSONA, WHATSAPP_LEARNING, ADVANCED_REPORTS, CADASTUR_AUTO]
// MAX:            [COMMISSION_DISCOUNT, IA_PERSONA, WHATSAPP_LEARNING, ADVANCED_REPORTS, SUPPLIER_MANAGEMENT, NEURAL_VOICE, CADASTUR_AUTO, FNRH_AUTO]
// BETA_TESTER:    [todas as features]
// EARLY_ADOPTER:  [COMMISSION_DISCOUNT, IA_PERSONA, WHATSAPP_LEARNING]  (plano congelado)
```

### 3.7 TrialPeriod

```typescript
interface TrialPeriodProps {
  startDate: Date
  endDate: Date                         // startDate + 7 dias (default)
  notificationSent: boolean             // Flag de notificação do dia 6
  isExpired: boolean                    // Computado ou explícito
}

// Invariantes:
// - endDate = startDate + 7 dias
// - endDate > startDate
// - startDate <= now (data passada ou presente)
// - isExpired = true se endDate < now OU explicitamente marcado

// Métodos:
// - static create(startDate: Date, days?: number): Result<TrialPeriod, Error>
// - static restore(props): TrialPeriod
// - isActive(): boolean              // !isExpired && now between startDate and endDate
// - isExpired(): boolean
// - daysRemaining(): number          // dias entre now e endDate (negativo se expirado)
// - shouldNotifyDay6(): boolean      // daysRemaining === 2 && !notificationSent
// - markNotificationSent(): TrialPeriod      // Retorna nova instância com notificationSent = true
// - expire(): TrialPeriod                    // Retorna nova instância com isExpired = true
// - equals(other: TrialPeriod): boolean

// IMUTÁVEL: toda mutação retorna nova instância
```

### 3.8 Subscription

```typescript
interface SubscriptionProps {
  plan: Plan                              // Plano contratado
  status: SubscriptionStatus              // ACTIVE | PAST_DUE | CANCELED | TRIALING
  currentPeriodEnd: Date                  // Fim do período vigente
  cancelAtPeriodEnd: boolean              // Solicitou cancelamento?
  externalSubscriptionId: string          // ID genérico no gateway (NUNCA "stripeSubscriptionId")
}

// Invariantes:
// - currentPeriodEnd > createdAt
// - externalSubscriptionId não vazio
// - NENHUM campo específico de Stripe (stripeCustomerId, stripePriceId PROIBIDOS)

// Métodos:
// - static create(props): Result<Subscription, Error>
// - static restore(props): Subscription
// - isActive(): boolean                  // status === ACTIVE ou TRIALING
// - isPastDue(): boolean
// - isCanceled(): boolean
// - cancel(): Subscription               // cancelAtPeriodEnd = true
// - changePlan(newPlan: Plan): Subscription
```

### 3.9 RegistrationNumber

```typescript
interface RegistrationNumberProps {
  value: string            // Formato: NNNN/PLAN/UF  (ex: "0001/LITE/SC")
}

// Invariantes:
// - Formato: 4 dígitos + "/" + PLAN + "/" + UF
// - Regex: /^\d{4}\/(LITE|PRO|MAX|BETA_TESTER|EARLY_ADOPTER)\/(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/

// Métodos:
// - static create(value: string): Result<RegistrationNumber, Error>
// - static generate(sequential: number, plan: Plan, uf: string): Result<RegistrationNumber, Error>
// - static restore(value: string): RegistrationNumber
// - getSequential(): number      // extrai NNNN
// - getPlan(): string            // extrai PLAN
// - getUf(): string             // extrai UF
// - equals(other): boolean
```

### 3.10 VoiceTokenBudget

```typescript
interface VoiceTokenBudgetProps {
  used: number               // Tokens consumidos (default 0)
  limit: number              // Limite máximo (default 100000)
}

// Invariantes:
// - used >= 0
// - limit > 0
// - used <= limit (SEMPRE — validado em toda mutação)

// Métodos:
// - static create(limit?: number): Result<VoiceTokenBudget, Error>
// - static restore(used: number, limit: number): Result<VoiceTokenBudget, Error>
// - consume(tokens: number): Result<VoiceTokenBudget, Error>
//     Se used + tokens > limit → Result.fail("Limite de tokens de voz excedido")
//     Senão → nova instância com used incrementado
// - isExhausted(): boolean     // used >= limit
// - remaining(): number        // limit - used
// - reset(): VoiceTokenBudget  // used = 0
// - equals(other): boolean

// IMUTÁVEL: consume() retorna nova instância ou erro
```

### 3.11 OperationalWindow

```typescript
interface OperationalWindowProps {
  checkInHours: number       // Janela de check-in em horas (default 24)
  cleaningHours: number      // Janela de limpeza em horas (default 3)
}

// Invariantes:
// - checkInHours > 0
// - cleaningHours > 0
// - checkInHours máximo 168 (7 dias)
// - cleaningHours máximo 48

// Métodos:
// - static create(props): Result<OperationalWindow, Error>
// - static restore(props): OperationalWindow
// - equals(other): boolean
```

### 3.12 CadasturInfo

```typescript
interface CadasturInfoProps {
  number: string                  // Número do cadastro (formato livre)
  status: CadasturStatus          // VALID | EXPIRING | EXPIRED | PENDING
  expiryDate: Date                // Data de validade
}

// Invariantes:
// - number não vazio
// - expiryDate > createdAt
// - status === EXPIRED quando expiryDate < now
// - status === EXPIRING quando expiryDate entre now e now + 30 dias

// Métodos:
// - static create(props): Result<CadasturInfo, Error>
// - static restore(props): CadasturInfo
// - isValid(): boolean                          // status === VALID
// - isExpiringSoon(days?: number): boolean      // days até expiryDate <= days (default 30)
// - needsRenewal(): boolean                     // status === EXPIRED || status === EXPIRING
// - checkExpiry(referenceDate?: Date): CadasturInfo   // Atualiza status baseado em referenceDate
// - equals(other): boolean
```

### 3.13 UTMTracking

```typescript
interface UTMTrackingProps {
  source?: string          // utmSource
  medium?: string          // utmMedium
  campaign?: string        // utmCampaign
  content?: string         // utmContent
  term?: string            // utmTerm
}

// Invariantes:
// - Todos opcionais
// - Se presentes, máximo 200 caracteres cada

// Métodos:
// - static create(props): Result<UTMTracking, Error>
// - isEmpty(): boolean     // todos undefined
// - equals(other): boolean
```

---

## 4. Entities

### 4.1 Property (Aggregate Root — o ÚNICO AR do domínio)

```typescript
interface PropertyData {
  // Identity
  id: string
  name: string
  slug: string
  description?: string

  // Value Objects
  address: Address
  contactInfo: ContactInfo
  pixKey?: PixKey              // Reusado de Financeiro
  status: PropertyStatus
  plan: Plan
  trialPeriod?: TrialPeriod
  subscription?: Subscription
  registrationNumber: RegistrationNumber
  voiceBudget: VoiceTokenBudget
  operationalWindow: OperationalWindow
  cadastur?: CadasturInfo
  utmTracking: UTMTracking

  // Scalar fields
  fnrhEnabled: boolean
  fnrhManagerCpf?: string
  capacity: number
  isCanary: boolean
  refSource?: string
  currencyCode: string          // default "BRL"
  locale: string                // default "pt-BR"
  timezone: string              // default "America/Sao_Paulo"
  whatsappChannelType: WhatsappChannelType

  // Audit
  createdAt: Date
  updatedAt: Date
}

// ===== DOMAIN METHODS =====

// --- Lifecycle ---

// Cria property com status PENDING_SETUP, trial de 7 dias, registrationNumber gerado
static create(props: CreatePropertyProps): Result<Property, Error>

// Restaura do banco (persistência)
static restore(data: PropertyData): Property

// Ativa: PENDING_SETUP → ACTIVE, inicia trial
activate(): Result<PropertyEvents, Error>

// Suspende: ACTIVE → SUSPENDED
suspend(reason: string): Result<PropertyEvents, Error>

// Reativa: SUSPENDED → ACTIVE
reactivate(): Result<PropertyEvents, Error>

// Churn: → CHURNED (terminal)
churn(): Result<PropertyEvents, Error>

// --- Plano & Trial ---

// Muda de plano, atualiza subscription
changePlan(newPlan: Plan, subscription: Subscription): Result<PropertyEvents, Error>

// Verifica trial — expira se necessário, retorna eventos
checkTrial(): Result<PropertyEvents, Error>

// --- Voice ---

// Consome tokens de voz, valida budget
consumeVoiceTokens(count: number): Result<PropertyEvents, Error>

// --- Cadastur ---

// Atualiza informações do Cadastur
updateCadastur(info: CadasturInfo): Result<PropertyEvents, Error>

// --- FNRH ---

enableFnrh(managerCpf: string): Result<void, Error>
disableFnrh(): void

// --- Configuração ---

// Atualiza configurações mutáveis (address, contact, operationalWindow, etc.)
updateConfiguration(props: UpdateConfigProps): Result<PropertyEvents, Error>

// Atualiza capacidade
updateCapacity(newCapacity: number): Result<void, Error>

// --- Queries ---

hasFeature(feature: Feature): boolean
isTrial(): boolean
isOperational(): boolean           // ACTIVE ou TRIAL em período
canUsePaidFeatures(): boolean      // Não está TRIAL_EXPIRED nem CHURNED

// --- Events ---
get events(): DomainEvent[]
clearEvents(): void

// Invariantes:
// - slug é único no sistema (validado por repositório)
// - registrationNumber é gerado automaticamente no formato NNNN/PLAN/UF
// - TRIAL_EXPIRED → CHURNED não é transição válida
// - capacity > 0
// - currencyCode ISO 4217 (3 letras maiúsculas)
// - locale formato RFC 5646 (ex: "pt-BR")
// - timezone IANA válida (ex: "America/Sao_Paulo")
```

**State Machine:**

```
PENDING_SETUP ──activate()──→ ACTIVE ──suspend()──→ SUSPENDED ──reactivate()──→ ACTIVE
                                  │                       │
                                  │ checkTrial() (se trial expirou)
                                  ↓                       │
                            TRIAL_EXPIRED                 │
                                  │                       │
                                  └─── churn() ───────────┘
                                                          ↓
                                                      CHURNED
                                                      (terminal)
```

### 4.2 PropertyConfiguration (Value Object — parte do aggregate Property)

```typescript
interface PropertyConfigurationProps {
  operationalWindow: OperationalWindow
  currencyCode: string           // ISO 4217, default "BRL"
  locale: string                 // RFC 5646, default "pt-BR"
  timezone: string               // IANA, default "America/Sao_Paulo"
  whatsappChannelType: WhatsappChannelType
}

// Invariantes:
// - currencyCode: 3 letras maiúsculas (ISO 4217) — validado por lista
// - locale: formato RFC 5646 (ex: "pt-BR", "en-US")
// - timezone: IANA timezone válida (validado por lista)
// - whatsappChannelType: um dos valores do enum

// Métodos:
// - static create(props): Result<PropertyConfiguration, Error>
// - static restore(props): PropertyConfiguration
// - update(props: Partial<PropertyConfigurationProps>): Result<PropertyConfiguration, Error>
// - equals(other): boolean
```

---

## 5. Enums & Type Unions

```typescript
enum PropertyStatus {
  PENDING_SETUP = 'PENDING_SETUP',  // Recém-criada
  ACTIVE = 'ACTIVE',                // Operacional
  SUSPENDED = 'SUSPENDED',          // Inadimplente
  CHURNED = 'CHURNED',              // Cancelada (terminal)
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',  // Trial expirou (terminal)
}

// Transições válidas:
// PENDING_SETUP → ACTIVE
// ACTIVE → SUSPENDED, TRIAL_EXPIRED, CHURNED
// SUSPENDED → ACTIVE, CHURNED
// TRIAL_EXPIRED → ACTIVE (apenas com subscription ativa + cartão)
// CHURNED → (terminal)

const PROPERTY_STATUS_TRANSITIONS: Map<PropertyStatus, PropertyStatus[]> = new Map([
  [PropertyStatus.PENDING_SETUP, [PropertyStatus.ACTIVE]],
  [PropertyStatus.ACTIVE, [PropertyStatus.SUSPENDED, PropertyStatus.TRIAL_EXPIRED, PropertyStatus.CHURNED]],
  [PropertyStatus.SUSPENDED, [PropertyStatus.ACTIVE, PropertyStatus.CHURNED]],
  [PropertyStatus.TRIAL_EXPIRED, [PropertyStatus.ACTIVE]],  // Nova assinatura com pagamento
  [PropertyStatus.CHURNED, []],  // Terminal
])

enum Plan {
  LITE = 'LITE',
  PRO = 'PRO',
  MAX = 'MAX',
  BETA_TESTER = 'BETA_TESTER',
  EARLY_ADOPTER = 'EARLY_ADOPTER',
}

enum Feature {
  COMMISSION_DISCOUNT = 'COMMISSION_DISCOUNT',
  IA_PERSONA = 'IA_PERSONA',
  WHATSAPP_LEARNING = 'WHATSAPP_LEARNING',
  ADVANCED_REPORTS = 'ADVANCED_REPORTS',
  SUPPLIER_MANAGEMENT = 'SUPPLIER_MANAGEMENT',
  NEURAL_VOICE = 'NEURAL_VOICE',
  CADASTUR_AUTO = 'CADASTUR_AUTO',
  FNRH_AUTO = 'FNRH_AUTO',
}

enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  TRIALING = 'TRIALING',
}

enum CadasturStatus {
  VALID = 'VALID',
  EXPIRING = 'EXPIRING',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

enum WhatsappChannelType {
  GUESTS_ONLY = 'GUESTS_ONLY',
  GUESTS_AND_SUPPLIERS = 'GUESTS_AND_SUPPLIERS',
}

export const FEATURE_MAP: Record<Plan, Feature[]> = {
  [Plan.LITE]: [Feature.COMMISSION_DISCOUNT],
  [Plan.PRO]: [
    Feature.COMMISSION_DISCOUNT,
    Feature.IA_PERSONA,
    Feature.WHATSAPP_LEARNING,
    Feature.ADVANCED_REPORTS,
    Feature.CADASTRUR_AUTO,
  ],
  [Plan.MAX]: [
    Feature.COMMISSION_DISCOUNT,
    Feature.IA_PERSONA,
    Feature.WHATSAPP_LEARNING,
    Feature.ADVANCED_REPORTS,
    Feature.SUPPLIER_MANAGEMENT,
    Feature.NEURAL_VOICE,
    Feature.CADASTRUR_AUTO,
    Feature.FNRH_AUTO,
  ],
  [Plan.BETA_TESTER]: Object.values(Feature),
  [Plan.EARLY_ADOPTER]: [
    Feature.COMMISSION_DISCOUNT,
    Feature.IA_PERSONA,
    Feature.WHATSAPP_LEARNING,
  ],
}
```

---

## 6. Invariantes do Domínio

1. **Slug único** — `slug` é único em todo o sistema (validado por repositório).
2. **Registration number auto-gerado** — formato `NNNN/PLAN/UF`, sequencial por UF.
3. **Trial dura exatamente 7 dias** — de `createdAt` até `trialEndsAt` (configurável, default 7).
4. **Trial expirado bloqueia funcionalidades pagas** — `canUsePaidFeatures()` retorna false quando `TRIAL_EXPIRED` ou `CHURNED`.
5. **Voice token budget respeitado** — `voiceTokensUsed <= voiceTokensLimit` é validado na criação do VO e em toda mutação (`consume()`).
6. **Stripe invisível no domínio** — o domínio conhece `Subscription` com `externalSubscriptionId`. Nenhum campo `stripeCustomerId`, `stripePriceId` ou `stripeSubscriptionId` existe no domínio.
7. **Capacidade positiva** — `capacity > 0` na criação e atualização.
8. **Janela operacional positiva** — `checkInWindow > 0` e `cleaningWindow > 0`.
9. **Cadastur com expiração monitorada** — alerta emitido 30 dias antes do vencimento.
10. **PIX key validada** — formato validado por tipo (CPF/CNPJ/EMAIL/PHONE/RANDOM), reusa `PixKey` do Financeiro.
11. **FeatureSet é derivado de Plan** — nunca armazenado como campo separado; sempre computado por `FEATURE_MAP`.
12. **Estado terminal não retrocede** — `CHURNED` e `TRIAL_EXPIRED` não transicionam sem nova assinatura.
13. **Property é o tenant raiz** — todo aggregate em outros domínios referencia `propertyId`.

---

## 7. Regras de Negócio (Given/When/Then)

### UC-01: Criar Property (Onboarding)

```
Given dados completos de cadastro (nome, slug, endereço, contato, UF)
When o sistema cria a property
Then status = PENDING_SETUP
  And trialPeriod = 7 dias a partir de hoje
  And registrationNumber é gerado no formato NNNN/PLAN/UF
  And um evento PropertyCreated é emitido
  And slug é único no sistema

Given um slug já existente em outra property
When o sistema tenta criar com o mesmo slug
Then retorna erro "Slug já está em uso"

Given capacity = 0
When o sistema tenta criar
Then retorna erro "Capacidade deve ser maior que zero"

Given CEP inválido
When o sistema valida o Address
Then retorna erro "CEP deve estar no formato NNNNN-NNN"
```

### UC-02: Ativar Property (Iniciar Trial)

```
Given uma property com status PENDING_SETUP
When o dono confirma o onboarding
Then status → ACTIVE
  And trialPeriod inicia com startDate = now, endDate = now + 7 dias
  And um evento TrialStarted é emitido
  And um evento PropertyActivated é emitido

Given uma property já ACTIVE
When o sistema tenta ativar novamente
Then retorna erro "Property já está ativa"

Given uma property CHURNED
When o sistema tenta ativar
Then retorna erro "Property cancelada não pode ser ativada"
```

### UC-03: Verificar Trial (Job Diário)

```
Given uma property ACTIVE com trial ativo e faltando 2 dias (daysRemaining = 2)
  And notificationSent = false
When o job diário de trial check executa
Then trialPeriod.notificationSent → true
  And um evento TrialExpiring é emitido (dia 6 de 7)

Given uma property ACTIVE com trial expirado (daysRemaining < 0)
When o job diário executa
Then status → TRIAL_EXPIRED
  And trialPeriod.isExpired → true
  And um evento TrialExpired é emitido
  E agentes IA são bloqueados (consumidores assinem TrialExpired)

Given uma property ACTIVE com subscription ativa (não está em trial)
When o job diário executa
Then nada muda — property permanece ACTIVE

Given uma property TRIAL_EXPIRED
When o job executa novamente
Then nada muda — estado já é terminal para trial
```

### UC-04: Alterar Plano

```
Given uma property ACTIVE com plano LITE
When o dono faz upgrade para PRO
Then plan = PRO
  And subscription.plan = PRO
  And um evento PropertyPlanChanged(previousPlan: LITE, newPlan: PRO) é emitido
  And featureSet agora inclui IA_PERSONA, WHATSAPP_LEARNING, ADVANCED_REPORTS

Given uma property TRIAL_EXPIRED
When o dono assina plano PRO com cartão de crédito
Then status → ACTIVE
  And plan = PRO
  And subscription criada com status ACTIVE e externalSubscriptionId
  And trialPeriod finalizado (isExpired = true)
  And um evento PropertyActivated + PropertyPlanChanged emitidos

Given uma property CHURNED
When o sistema tenta mudar o plano
Then retorna erro "Property cancelada não pode mudar de plano"
```

### UC-05: Suspender / Reativar Property

```
Given uma property ACTIVE com subscription PAST_DUE
When o sistema de cobrança suspende
Then status → SUSPENDED
  And um evento PropertySuspended(reason: "Pagamento atrasado") é emitido
  E agentes IA são bloqueados

Given uma property SUSPENDED
When o pagamento é regularizado
Then status → ACTIVE
  And um evento PropertyReactivated é emitido
  E agentes IA são reativados

Given uma property SUSPENDED
When o dono solicita cancelamento definitivo
Then status → CHURNED
  And um evento PropertyChurned é emitido

Given uma property ACTIVE sem subscription ativa
When o sistema tenta suspender
Then retorna erro "Property sem assinatura ativa não pode ser suspensa"
```

### UC-06: Consumir Token de Voz

```
Given uma property ACTIVE com voiceBudget.used = 5000, voiceBudget.limit = 100000
When o sistema de voz consome 100 tokens
Then voiceBudget.used = 5100, voiceBudget.limit = 100000
  And voiceBudget.remaining() = 94900

Given uma property ACTIVE com voiceBudget.used = 99900, voiceBudget.limit = 100000
When o sistema tenta consumir 200 tokens
Then retorna erro "Limite de tokens de voz excedido"
  And voiceBudget.used permanece 99900
  E um evento VoiceTokensExhausted é emitido

Given uma property CHURNED
When o sistema tenta consumir tokens de voz
Then retorna erro "Property cancelada não pode consumir tokens"
```

### UC-07: Atualizar Configuração

```
Given uma property ACTIVE
When o dono atualiza endereço e contato
Then address e contactInfo são atualizados
  And um evento PropertyConfigurationUpdated é emitido

Given checkInWindow = 0
When o sistema tenta atualizar operationalWindow
Then retorna erro "Janela de check-in deve ser positiva"

Given cleaningWindow = -1
When o sistema tenta atualizar
Then retorna erro "Janela de limpeza deve ser positiva"

Given uma property CHURNED
When o sistema tenta atualizar configuração
Then retorna erro "Property cancelada não pode ser atualizada"
```

### UC-08: Verificar Cadastur

```
Given uma property com cadastur válido e expiryDate em 25 dias
When o job diário de verificação executa
Then cadastur.status = EXPIRING (alerta 30 dias antes)
  And um evento CadasturExpiring(daysUntilExpiry: 25) é emitido

Given uma property com cadastur expirado (expiryDate < now)
When o job diário executa
Then cadastur.status = EXPIRED
  E funcionalidades que dependem de Cadastur são restritas

Given uma property sem cadastur (undefined)
When o job diário executa
Then nada muda — nenhum evento emitido

Given uma property com cadastur válido e expiryDate em 60 dias
When o job diário executa
Then nada muda — status permanece VALID
```

---

## 8. Domain Services

### 8.1 TrialService

```typescript
interface TrialService {
  startTrial(property: Property): Result<Property, Error>
  checkExpiration(property: Property): Result<{ property: Property; events: DomainEvent[] }, Error>
  sendExpiryNotification(property: Property): Result<Property, Error>
  findExpiringTrials(): Promise<Property[]>      // daysRemaining === 2
  findExpiredTrials(): Promise<Property[]>       // daysRemaining < 0
}
```

### 8.2 PlanFeatureService

```typescript
interface PlanFeatureService {
  getFeatures(plan: Plan): FeatureSet
  hasFeature(plan: Plan, feature: Feature): boolean
  getFeatureList(): Feature[]
  validatePlanUpgrade(currentPlan: Plan, newPlan: Plan): Result<void, Error>
  // Downgrade não é permitido (apenas upgrade)
}
```

### 8.3 VoiceTokenService

```typescript
interface VoiceTokenService {
  consume(property: Property, count: number): Result<Property, Error>
  checkBudget(property: Property): Result<VoiceTokenBudget, Error>
  getUsageStats(property: Property): VoiceTokenStats
}

interface VoiceTokenStats {
  used: number
  limit: number
  remaining: number
  percentageUsed: number      // 0.0 a 1.0
  isExhausted: boolean
}
```

### 8.4 CadasturService

```typescript
interface CadasturService {
  validate(number: string): Result<CadasturInfo, Error>
  checkExpiry(info: CadasturInfo, referenceDate?: Date): CadasturInfo
  notifyRenewal(info: CadasturInfo): boolean    // isExpiringSoon(30)
  findExpiringCadastur(days?: number): Promise<Property[]>   // 30 dias default
  findExpiredCadastur(): Promise<Property[]>
}
```

### 8.5 RegistrationNumberGenerator

```typescript
interface RegistrationNumberGenerator {
  generate(propertyCount: number, plan: Plan, uf: string): Result<RegistrationNumber, Error>
  // propertyCount + 1 = sequential number (4 dígitos, zero-padded)
  // Formato: NNNN/PLAN/UF
}
```

---

## 9. Repository Interfaces (Ports)

```typescript
interface IPropertyRepository {
  save(property: Property): Promise<Property>
  findById(id: string): Promise<Property | null>
  findBySlug(slug: string): Promise<Property | null>
  findByRegistrationNumber(registrationNumber: string): Promise<Property | null>
  findByStatus(status: PropertyStatus): Promise<Property[]>
  findExpiringTrials(): Promise<Property[]>                // trial daysRemaining === 2
  findExpiredTrials(): Promise<Property[]>                 // trial expirado sem subscription
  findCadasturExpiring(days?: number): Promise<Property[]>  // cadastur expirando em N dias
  findCadasturExpired(): Promise<Property[]>
  findSuspended(): Promise<Property[]>
  count(filters?: PropertyFilters): Promise<number>
  existsBySlug(slug: string): Promise<boolean>
}

interface PropertyFilters {
  status?: PropertyStatus
  plan?: Plan
  isTrial?: boolean
  isCanary?: boolean
  search?: string            // busca por name ou slug
  limit?: number
  offset?: number
}
```

---

## 10. API Contracts

### GET /api/properties

```typescript
// Query params
// ?status=ACTIVE&plan=PRO&search=Mar&limit=10&offset=0

// Response 200
{
  success: true,
  data: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    status: PropertyStatus
    plan: Plan
    registrationNumber: string
    address: { street: string; city: string; state: string; zipCode: string }
    contactInfo: { phone: string; whatsapp: string; email: string }
    capacity: number
    isTrial: boolean
    trialEndsAt: string | null
    createdAt: string
  }>,
  meta: {
    total: number
    limit: number
    offset: number
  }
}
```

### POST /api/properties

```typescript
// Request
{
  name: string
  slug: string
  description?: string
  address: {
    street: string
    city: string
    state: string                // UF
    zipCode: string
    latitude?: number
    longitude?: number
  }
  contactInfo: {
    phone: string
    whatsapp: string
    email: string
    website?: string
  }
  capacity?: number              // default 10
  isCanary?: boolean             // default false
  refSource?: string
  utmTracking?: {
    source?: string
    medium?: string
    campaign?: string
    content?: string
    term?: string
  }
}

// Response 201
{
  success: true,
  data: {
    id: string
    name: string
    slug: string
    status: "PENDING_SETUP"
    plan: "LITE"
    registrationNumber: string      // "0001/LITE/SC"
    trialEndsAt: string             // now + 7 days
    createdAt: string
  }
}

// Response 400
{ success: false, error: "Slug já está em uso" }
// ou
{ success: false, error: "CEP deve estar no formato NNNNN-NNN" }
```

### GET /api/properties/[id]

```typescript
// Response 200
{
  success: true,
  data: {
    id: string
    name: string
    slug: string
    description: string | null
    status: PropertyStatus
    plan: Plan
    registrationNumber: string
    address: { street: string; city: string; state: string; zipCode: string; latitude?: number; longitude?: number }
    contactInfo: { phone: string; whatsapp: string; email: string; website?: string }
    pixKey?: { type: string; value: string }
    capacity: number
    isCanary: boolean
    refSource?: string
    currencyCode: string
    locale: string
    timezone: string
    whatsappChannelType: string
    operationalWindow: { checkInHours: number; cleaningHours: number }
    trialPeriod?: { startDate: string; endDate: string; isExpired: boolean }
    subscription?: { plan: string; status: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean }
    cadastur?: { number: string; status: string; expiryDate: string }
    voiceBudget: { used: number; limit: number; remaining: number }
    fnrhEnabled: boolean
    fnrhManagerCpf?: string
    utmTracking?: { source?: string; medium?: string; campaign?: string }
    createdAt: string
    updatedAt: string
  }
}

// Response 404
{ success: false, error: "Property não encontrada" }
```

### PATCH /api/properties/[id]

```typescript
// Request (todos opcionais — apenas campos enviados são atualizados)
{
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    latitude?: number
    longitude?: number
  }
  contactInfo?: {
    phone?: string
    whatsapp?: string
    email?: string
    website?: string
  }
  capacity?: number
  currencyCode?: string
  locale?: string
  timezone?: string
  whatsappChannelType?: WhatsappChannelType
  operationalWindow?: {
    checkInHours?: number
    cleaningHours?: number
  }
}

// Response 200
{
  success: true,
  data: Property (atualizada)
}

// Response 400
{ success: false, error: "Janela de check-in deve ser positiva" }
```

### POST /api/properties/[id]/activate

```typescript
// Response 200
{
  success: true,
  data: {
    id: string
    status: "ACTIVE"
    trialPeriod: { startDate: string; endDate: string; isExpired: false }
  }
}

// Response 400
{ success: false, error: "Property já está ativa" }
// ou
{ success: false, error: "Property cancelada não pode ser ativada" }
```

### POST /api/properties/[id]/plan

```typescript
// Request
{
  plan: Plan
  subscription: {
    status: SubscriptionStatus
    currentPeriodEnd: string
    externalSubscriptionId: string
  }
}

// Response 200
{
  success: true,
  data: {
    id: string
    plan: Plan
    features: string[]
    subscription: { status: string; currentPeriodEnd: string }
  }
}

// Response 400
{ success: false, error: "Property cancelada não pode mudar de plano" }
```

### POST /api/properties/[id]/suspend

```typescript
// Request
{
  reason: string       // Obrigatório
}

// Response 200
{
  success: true,
  data: {
    id: string
    status: "SUSPENDED"
  }
}

// Response 400
{ success: false, error: "Property sem assinatura ativa não pode ser suspensa" }
```

### POST /api/properties/[id]/reactivate

```typescript
// Response 200
{
  success: true,
  data: {
    id: string
    status: "ACTIVE"
  }
}

// Response 400
{ success: false, error: "Property não está suspensa" }
```

### GET /api/properties/[id]/usage

```typescript
// Response 200
{
  success: true,
  data: {
    voiceTokens: {
      used: number
      limit: number
      remaining: number
      percentageUsed: number
    }
    capacity: {
      current: number
    }
    trial?: {
      daysRemaining: number
      isExpired: boolean
    }
    cadastur?: {
      status: string
      daysUntilExpiry: number | null
      needsRenewal: boolean
    }
  }
}
```

---

## 11. Eventos de Domínio

```typescript
interface PropertyCreated {
  propertyId: string
  name: string
  slug: string
  registrationNumber: string
  plan: Plan
  uf: string
  timestamp: Date
}

interface PropertyActivated {
  propertyId: string
  previousStatus: PropertyStatus
  newStatus: PropertyStatus.ACTIVE
  activationType: 'TRIAL_START' | 'REACTIVATION' | 'NEW_SUBSCRIPTION'
  timestamp: Date
}

interface PropertySuspended {
  propertyId: string
  reason: string
  timestamp: Date
}

interface PropertyReactivated {
  propertyId: string
  timestamp: Date
}

interface PropertyChurned {
  propertyId: string
  previousPlan: Plan
  reason: string
  timestamp: Date
}

interface PropertyPlanChanged {
  propertyId: string
  previousPlan: Plan
  newPlan: Plan
  timestamp: Date
}

interface TrialStarted {
  propertyId: string
  trialEndDate: Date
  durationDays: number
  timestamp: Date
}

interface TrialExpiring {
  propertyId: string
  daysRemaining: number
  trialEndDate: Date
  timestamp: Date
}

interface TrialExpired {
  propertyId: string
  trialEndDate: Date
  timestamp: Date
}

interface VoiceTokensExhausted {
  propertyId: string
  used: number
  limit: number
  timestamp: Date
}

interface CadasturExpiring {
  propertyId: string
  cadasturNumber: string
  daysUntilExpiry: number
  expiryDate: Date
  timestamp: Date
}

interface PropertyConfigurationUpdated {
  propertyId: string
  changedFields: string[]      // Ex: ["address", "contactInfo", "operationalWindow"]
  timestamp: Date
}
```

---

## 12. Erros Conhecidos no Código Atual (a serem corrigidos)

| # | Problema | Localização | Impacto |
|---|---|---|---|
| 1 | **Trial lifecycle espalhado** — lógica em `src/lib/ml/trial-manager.ts`, `TrialValidator.ts`, `agent-orchestrator.ts` | Múltiplos arquivos | Regra de trial duplicada em 3+ lugares, inconsistência |
| 2 | **Feature gate em infra** — `src/lib/brain/feature-guard.ts` mapeia Plan → Feature[] fora do domínio | `src/lib/brain/feature-guard.ts` | Lógica de negócio no infra, difícil de testar |
| 3 | **Stripe fields no schema** — `stripeCustomerId`, `stripePriceId`, `stripeSubscriptionId` no model Property | `schema.prisma:105-107` | Acoplamento a gateway específico no schema do domínio |
| 4 | **Voice token sem enforcement** — `voiceTokensUsed` é incrementado mas NUNCA validado contra `voiceTokensLimit` | `src/services/voice/VoiceSynthesisRouter.ts` | Property pode exceder limite sem bloqueio |
| 5 | **Capacity sem validação** — `capacity: Int` existe mas nenhuma regra de negócio o valida | `schema.prisma:85` | Pode ser 0 ou negativo |
| 6 | **Operational windows não utilizados** — `checkInWindow` e `cleaningWindow` existem mas NUNCA são lidos | `schema.prisma:122-123` | Campos mortos sem função |
| 7 | **Cadastur sem validação** — campos existem mas nenhuma lógica de validação ou renovação | `schema.prisma:117-119` | Cadastur expirado não é detectado |
| 8 | **FNRH no domínio errado** — `Reservation.submitFnrh()` está no contexto errado | `src/domain/reservation/` | FNRH é obrigação legal da Property, não da Reservation |
| 9 | **Registration number gerado inline** — lógica em `src/app/api/onboarding/route.ts` | `src/app/api/onboarding/route.ts` | Regra de geração de ID perdida em controller |
| 10 | **44 campos planos sem agrupamento** — Property é Big Ball of Mud com 44 campos no Prisma | `schema.prisma:74-163` | Sem coesão, sem VOs, sem validação |
| 11 | **Z-Router com regras de plano** — `src/lib/zmg/z-router.ts` controla AI model por plan | `src/lib/zmg/z-router.ts` | Feature gating duplicado em 2 lugares |
| 12 | **isTrial + trialEndsAt sem VO** — campos soltos sem validação de consistência | `schema.prisma:88-89` | isTrial pode ficar inconsistente com trialEndsAt |
| 13 | **Sem eventos de domínio** — nenhum Domain Event emitido no lifecycle atual da Property | Ausente | Outros contextos não reagem a mudanças |
| 14 | **Sem state machine de PropertyStatus** — status muda livremente sem validação de transições | `schema.prisma:86` | Transições inválidas (CHURNED → ACTIVE) possíveis |

---

## 13. Critérios de Aceitação para Refatoração

- [ ] `Property` é aggregate root com `static create()`, private constructor, `Result` return
- [ ] `PropertyStatus` tem state machine rigorosa (transições inválidas retornam erro)
- [ ] `TrialPeriod` é VO imutável com `isActive()`, `isExpired()`, `daysRemaining()`, `shouldNotifyDay6()`
- [ ] `VoiceTokenBudget` é VO imutável que valida `used <= limit` em 100% das mutações
- [ ] `CadasturInfo` é VO com `isValid()`, `isExpiringSoon()`, `needsRenewal()`
- [ ] `FeatureSet` é derivado de `Plan` via `FEATURE_MAP` — nunca armazenado
- [ ] `RegistrationNumber` é VO auto-gerado no formato `NNNN/PLAN/UF`
- [ ] `Subscription` usa `externalSubscriptionId` genérico — NENHUM campo Stripe no domínio
- [ ] `PixKey` reusado do domínio Financeiro (ou movido para shared)
- [ ] Nenhum `@prisma/client` importado em `src/domain/property/` ou `src/application/property/`
- [ ] Nenhum nome de gateway (Stripe, Asaas, MercadoPago) aparece em arquivos de domínio
- [ ] Trial lifecycle centralizado no domínio — `TrialService` + `Property.checkTrial()`
- [ ] Feature gating vive no domínio — `PlanFeatureService.getFeatures(plan)`
- [ ] Voice token budget é validado no domínio antes de qualquer consumo externo
- [ ] Todos os 12 Domain Events são emitidos nas transições corretas
- [ ] Capacidade é validada > 0 na criação e atualização
- [ ] Janelas operacionais são validadas > 0
- [ ] Cadastur expirado dispara evento com 30 dias de antecedência
- [ ] FNRH movido da Reservation para Property
- [ ] 100% dos testes de domínio rodam sem banco (InMemory repositories)
- [ ] `Property` existente no banco (44 campos flat) é migrável via `Property.restore()` com adaptadores
- [ ] `POST /api/properties` valida todos os VOs antes de persistir

---

## 14. Plano de Small Batches

### SB1: Value Objects + Enums + Entity + Events + domain tests (~15 arquivos, ~75 testes)

- `src/domain/property/enums.ts` — PropertyStatus, Plan, Feature, SubscriptionStatus, CadasturStatus, WhatsappChannelType, FEATURE_MAP
- `src/domain/property/value-objects/Address.ts`
- `src/domain/property/value-objects/ContactInfo.ts`
- `src/domain/property/value-objects/PropertyStatus.ts` (state machine)
- `src/domain/property/value-objects/Plan.ts`
- `src/domain/property/value-objects/FeatureSet.ts`
- `src/domain/property/value-objects/TrialPeriod.ts`
- `src/domain/property/value-objects/Subscription.ts`
- `src/domain/property/value-objects/RegistrationNumber.ts`
- `src/domain/property/value-objects/VoiceTokenBudget.ts`
- `src/domain/property/value-objects/OperationalWindow.ts`
- `src/domain/property/value-objects/CadasturInfo.ts`
- `src/domain/property/value-objects/UTMTracking.ts`
- `src/domain/property/value-objects/PropertyConfiguration.ts`
- `src/domain/property/entities/Property.ts` — aggregate root
- `src/domain/property/events.ts` — todos os 12 eventos
- `__tests__/domain/property/` — VOs + entity + state machines + eventos

### SB2: Domain Services + Ports + 8 Use Cases + InMemory repos (~12 arquivos, ~50 testes)

- `TrialService`
- `PlanFeatureService`
- `VoiceTokenService`
- `CadasturService`
- `RegistrationNumberGenerator`
- `IPropertyRepository`
- InMemoryPropertyRepository
- 8 Use Cases (CriarProperty, AtivarProperty, VerificarTrial, AlterarPlano, SuspenderReativar, ConsumirTokenVoz, AtualizarConfiguracao, VerificarCadastur)
- `__tests__/application/property/` — Use Cases com InMemory

### SB3: Prisma adapters + ControllerFactory + Route refactoring + Webhooks (~8 arquivos, ~5 testes integração)

- `PrismaPropertyRepository`
- `src/application/property/factories/PropertyControllerFactory.ts`
- `src/app/api/properties/route.ts` (GET + POST)
- `src/app/api/properties/[id]/route.ts` (GET + PATCH)
- `src/app/api/properties/[id]/activate/route.ts` (POST)
- `src/app/api/properties/[id]/plan/route.ts` (POST)
- `src/app/api/properties/[id]/suspend/route.ts` (POST)
- `src/app/api/properties/[id]/reactivate/route.ts` (POST)
- `src/app/api/properties/[id]/usage/route.ts` (GET)
- Migração Prisma: refatorar Property model para usar VOs (opcional — adapters podem mapear)

---

## 15. Glossário de Termos Técnicos

| Termo | Significado |
|---|---|
| **Aggregate Root** | Entidade raiz que garante consistência do aggregate (Property) |
| **Value Object** | Objeto imutável definido por seus atributos, não por identidade |
| **Domain Event** | Algo que aconteceu no domínio que outros contextos precisam saber |
| **Port** | Interface que define contrato com o mundo externo (repositório, serviço) |
| **Use Case** | Fluxo de interação que orquestra entidades e serviços |
| **InMemory Repository** | Implementação fake de repositório para testes sem banco |
| **Feature Gate** | Mecanismo que libera/bloqueia funcionalidades conforme o plano |
| **Honeypot / IsCanary** | Flag que marca pousadas de teste para agentes IA |
| **Cadastur** | Cadastro do Ministério do Turismo para meios de hospedagem |
| **FNRH** | Ficha Nacional de Registro de Hóspedes (obrigatório por lei) |
| **External Subscription ID** | Identificador genérico da assinatura no gateway de pagamento |
| **UF** | Unidade Federativa brasileira (sigla de 2 letras) |
| **CEP** | Código de Endereçamento Postal brasileiro (formato NNNNN-NNN) |
| **PIX** | Sistema de pagamento instantâneo brasileiro |
| **Trial** | Período de teste gratuito de 7 dias |
| **Churn** | Cancelamento definitivo da assinatura |
| **State Machine** | Grafo de transições de estado com regras explícitas de transições válidas |
| **SB (Small Batch)** | Lote pequeno de implementação com entrega atômica |
| **Registration Number** | Identificador único da pousada (NNNN/PLAN/UF) |
| **Token de Voz** | Unidade de consumo do serviço de síntese de voz |
| **Janela Operacional** | Configurações de tempo para check-in e limpeza |
| **IAM** | International Astronomical Union — referência para timezones IANA |
| **RFC 5646** | Formato de código de idioma (ex: "pt-BR", "en-US") |
| **ISO 4217** | Padrão internacional de código de moedas (ex: "BRL") |
