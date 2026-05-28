# SPEC — Domínio de Room (Quarto) & PricingRule (Regra de Precificação)

## 1. Bounded Context

| Campo | Valor |
|---|---|
| **Domínio** | Core Business de Operação Hoteleira — o quarto é o ativo central |
| **Aggregate Roots** | `Room`, `PricingRule` |
| **Linguagem** | Português (ubíqua) |
| **Stakeholders** | Time de Operações, Recepção, Secretaria-IA, Agentes IA, Revenue Management |
| **Eventos publicados** | `RoomCreated`, `RoomStatusChanged`, `RoomPricingUpdated`, `RoomAvailabilityChanged`, `RoomMaintenanceScheduled` |

### Relações com outros Contextos

| Contexto | Tipo de Relação |
|---|---|
| Reservation | Consome Room para definir disponibilidade e calcular preço de estadia |
| Property | Tenant dono do quarto |
| Service | Serviços adicionais vinculados à propriedade, não ao quarto individual |
| Revenue | Consome Pricing Rules para ajuste dinâmico de preços |
| Financeiro | Consome preço final calculado do Room para gerar invoices |

---

## 2. Linguagem Ubíqua

| Termo | Definição |
|---|---|
| **Room** | Unidade física de hospedagem (quarto, suíte, chalé) com identidade própria |
| **PricingRule** | Regra de precificação que altera o preço base de um quarto em um período (alta temporada, feriado, etc.) |
| **Availability** | Disponibilidade calculada: se o quarto está livre para reserva em um dado período |
| **Capacidade** | Número máximo de hóspedes que o quarto comporta |
| **PricingType** | Tipo de cobrança: POR QUARTO (PER_ROOM) ou POR PESSOA (PER_PERSON) |
| **Status do Quarto** | Estado operacional: AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE, BLOCKED |
| **Amenity** | Comodidade do quarto (ar condicionado, TV, frigobar, etc.) |
| **Diária** | Preço de uma noite de hospedagem |
| **Multiplicador** | Fator de ajuste de preço (1.0 = preço base, 2.0 = dobro) |
| **Ocupação** | Percentual de quartos ocupados em um período |
| **Revenue Management** | Estratégia de precificação dinâmica baseada em ocupação e sazonalidade |
| **Rooms Inventory** | Conjunto de todos os quartos de uma propriedade |
| **Tipo de Quarto** | Classificação: STANDARD, DELUXE, SUITE, MASTER, FAMILY |

---

## 3. Value Objects

### 3.1 MonetaryValue (compartilhável com Reservation)

```typescript
interface MonetaryValueProps {
  amount: number       // Em reais (BRL), máximo 2 casas decimais
  currency: string     // default "BRL"
}

// Invariantes:
// - amount >= 0
// - amount truncado para 2 casas decimais
// - currency é string de 3 caracteres (ISO 4217)
```

### 3.2 Capacity

```typescript
interface CapacityProps {
  maxAdults: number       // Padrão 2
  maxChildren: number     // Padrão 0
  maxTotal: number        // maxAdults + maxChildren (derivado)
}

// Invariantes:
// - maxAdults >= 1
// - maxChildren >= 0
// - maxTotal <= maxAdults + maxChildren
```

### 3.3 Amenities

```typescript
// Set de strings normalizadas (lowercase, trimmed)
// Invariantes:
// - Cada amenity tem entre 2 e 50 caracteres
// - Amenities são únicas (sem duplicatas)
// - Máximo de 20 amenities por quarto
```

### 3.4 RoomDateRange

```typescript
interface RoomDateRangeProps {
  startDate: Date
  endDate: Date
}

// Invariantes:
// - startDate < endDate
// - Diferença mínima de 1 dia
// - Ambos sem time (apenas date portion)
// - overlapWith(other): boolean
// - contains(date): boolean
// - nights(): number
//   lanes: dias corridos entre startDate e endDate
```

### 3.5 OccupancyRate

```typescript
interface OccupancyRateProps {
  rate: number           // 0.0 a 1.0
  totalRooms: number
  occupiedRooms: number
}

// Invariantes:
// - rate between 0.0 and 1.0
// - totalRooms > 0
// - occupiedRooms <= totalRooms
// - rate == occupiedRooms / totalRooms
```

---

## 4. Entities

### 4.1 Room (Aggregate Root)

```typescript
interface Room {
  // Identity & Core Data
  id: string
  number: string                      // Número do quarto (unique por property)
  name?: string                       // Nome amigável (ex: "Suíte Lua de Mel")
  type: RoomType                      // STANDARD | DELUXE | SUITE | MASTER | FAMILY
  
  // Value Objects
  capacity: Capacity                  // ← VO
  pricing: PricingInfo                // ← VO (basePrice + pricingType)
  amenities: Amenities                // ← VO (unique sorted)
  
  // Operational
  status: RoomStatus                  // AVAILABLE | OCCUPIED | CLEANING | MAINTENANCE | BLOCKED
  description?: string
  images: string[]                    // URLs
  
  // Audit
  createdAt: Date
  updatedAt: Date
  propertyId: string
  
  // Domain methods
  changeStatus(newStatus: RoomStatus, reason?: string): Result<RoomStatusChange, Error>
  isAvailable(dateRange: RoomDateRange, existingReservations: Reservation[]): boolean
  calculateNightlyPrice(date: Date, rules: PricingRule[]): MonetaryValue
  updatePricing(basePrice: MonetaryValue, pricingType: PricingType): void
}
```

### 4.2 PricingRule (Aggregate Root)

```typescript
interface PricingRule {
  id: string
  name: string                         // Ex: "Réveillon 2025", "Baixa Temporada Março"
  description?: string
  roomType?: RoomType                  // null = aplica a todos os tipos
  dateRange: RoomDateRange             // ← VO período de vigência
  multiplier: number                   // 1.0 = preço base, 2.0 = dobro
  fixedAmount?: MonetaryValue          // Se definido, sobrescreve o preço (não multiplica)
  isActive: boolean
  overridePriority: number             // Maior número = maior prioridade se regras conflitarem
  createdAt: Date
  propertyId: string
  
  // Domain methods
  applyTo(basePrice: MonetaryValue): MonetaryValue
  isActiveOn(date: Date): boolean
  conflictsWith(other: PricingRule): boolean
}

// Invariantes:
// - multiplier > 0 (mínimo 0.01)
// - fixedAmount.amount >= 0 se definido
// - dateRange.startDate < dateRange.endDate
// - multiplier ou fixedAmount, nunca ambos (optional)
// - overridePriority >= 0
```

### 4.3 RoomStatusLog (Entity — parte do Aggregate Room)

```typescript
interface RoomStatusLog {
  id: string
  roomId: string
  previousStatus: RoomStatus
  newStatus: RoomStatus
  reason?: string
  changedBy: string                    // "system" | "reception" | "agent" | userId
  createdAt: Date
}
```

### 4.4 RoomMaintenance (Entity — parte do Aggregate Room)

```typescript
interface RoomMaintenance {
  id: string
  roomId: string
  reason: string
  description?: string
  scheduledStart: Date
  scheduledEnd: Date
  status: MaintenanceStatus            // SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
  createdAt: Date
  completedAt?: Date
  
  // Invariantes:
  // - scheduledStart < scheduledEnd
  // - Se MAINTENANCE, data atual está entre scheduledStart e scheduledEnd
}

enum MaintenanceStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

## 5. Enums & Type Unions

```typescript
enum RoomType {
  STANDARD
  DELUXE
  SUITE
  MASTER
  FAMILY
}

enum RoomStatus {
  AVAILABLE       // Livre para reserva
  OCCUPIED        // Hóspede presente
  CLEANING        // Sendo limpa
  MAINTENANCE     // Em manutenção
  BLOCKED         // Bloqueada (não disponível por decisão operacional)
}

// Transições válidas de RoomStatus:
// AVAILABLE  → OCCUPIED, CLEANING, MAINTENANCE, BLOCKED
// OCCUPIED   → CLEANING
// CLEANING   → AVAILABLE
// MAINTENANCE → AVAILABLE
// BLOCKED    → AVAILABLE
// NOTA: OCCUPIED não pode ir direto para AVAILABLE — precisa passar por CLEANING

enum PricingType {
  PER_ROOM       // Preço fixo independente de hóspedes
  PER_PERSON     // Preço por hóspede (basePrice * guestCount)
}
```

---

## 6. Invariantes do Domínio

1. **Identidade única:** `number` é unique dentro de uma `propertyId` (garantido pelo schema).
2. **Status Transitions:** Segue o grafo de transições definido na seção 5 — um quarto OCCUPIED não pode virar AVAILABLE sem passar por CLEANING.
3. **Capacidade positiva:** `maxAdults >= 1` sempre.
4. **Preço base positivo:** `basePrice > 0`.
5. **Multiplicador positivo:** Toda PricingRule tem `multiplier > 0`.
6. **Regras não conflitantes:** Duas PricingRules ativas no mesmo período e mesmo roomType não podem coexistir (validação no repositório).
7. **Disponibilidade é computada, não armazenada:** `Availability` é derivada das reservas + manutenções + status do quarto. Não existe tabela de disponibilidade.
8. **Preço final é sempre calculado:** O preço de uma diária nunca vem de um campo estático — é `basePrice * multiplier` (ou `fixedAmount` se definido).
9. **Manutenção bloqueia:** Um quarto em MAINTENANCE não pode receber reservas no período agendado.
10. **Preço mínimo:** Nenhum preço final pode ser menor que 50% do `basePrice` (proteção contra multiplier < 0.5).

---

## 7. Regras de Negócio (Given/When/Then)

### UC-01: Criar Quarto

```
Given dados válidos de quarto (number, type, capacity, basePrice, pricingType, propertyId)
When o sistema cria o quarto
Then o quarto é persistido com status AVAILABLE
  And um evento RoomCreated é emitido
  And pricingInfo.basePrice > 0

Given um número de quarto já existente na mesma propriedade
When o sistema tenta criar
Then retorna erro "Já existe um quarto com este número nesta propriedade"

Given capacity.maxAdults < 1
When o sistema tenta criar
Then retorna erro "Capacidade mínima é de 1 adulto"
```

### UC-02: Alterar Status do Quarto

```
Given um quarto no status AVAILABLE
When a recepção checkout o hóspede
Then o quarto transiciona para OCCUPIED
  And um evento RoomStatusChanged é emitido

Given um quarto OCCUPIED
When o hóspede faz checkout
Then o quarto transiciona para CLEANING
  And um evento RoomStatusChanged(previous: OCCUPIED, new: CLEANING) é emitido
  And a limpeza é agendada (evento assíncrono)

Given um quarto CLEANING
When a limpeza é concluída
Then o quarto transiciona para AVAILABLE
  And um evento RoomStatusChanged(previous: CLEANING, new: AVAILABLE) é emitido

Given um quarto OCCUPIED
When o sistema tenta mudar para AVAILABLE diretamente
Then retorna erro "Quarto ocupado deve passar por limpeza antes de ficar disponível"

Given um quarto com reservas futuras
When o sistema tenta mudar para MAINTENANCE no período das reservas
Then retorna erro "Quarto com reservas no período não pode entrar em manutenção"
```

### UC-03: Calcular Preço de Diária

```
Given um quarto com basePrice = R$ 200
  And uma PricingRule ativa com multiplier = 2.0 para a data X
When o sistema calcula o preço para a data X
Then o preço final é R$ 400

Given um quarto com basePrice = R$ 200
  And uma PricingRule com fixedAmount = R$ 500 para a data X
When o sistema calcula o preço para a data X
Then o preço final é R$ 500 (fixedAmount sobrescreve)

Given um quarto com basePrice = R$ 200
  And nenhuma PricingRule ativa para a data X
When o sistema calcula o preço para a data X
Then o preço final é R$ 200 (preço base)

Given um quarto com basePrice = R$ 200
  E PricingRule com multiplier = 0.3
When o sistema calcula o preço
Then retorna erro "Preço final não pode ser menor que 50% do preço base"
```

### UC-04: Calcular Preço de Estadia (Múltiplas Noites)

```
Given um quarto com basePrice = R$ 200
  And uma PricingRule de fim de semana (sex/sáb) com multiplier = 1.5
  And checkIn = quinta, checkOut = domingo (3 noites)
When o sistema calcula o preço da estadia
Then noite 1 (qui): R$ 200 (preço base)
  And noite 2 (sex): R$ 300 (com multiplier)
  And noite 3 (sáb): R$ 300 (com multiplier)
  And total: R$ 800

Given pricingType = PER_PERSON
  And basePrice = R$ 100
  And 3 hóspedes (2 adultos + 1 criança)
When o sistema calcula o preço
Then total = R$ 100 * 3 = R$ 300 por noite
```

### UC-05: Verificar Disponibilidade

```
Given um quarto AVAILABLE
  E sem reservas no período X
When o sistema verifica disponibilidade para o período X
Then o quarto está disponível

Given um quarto com reserva CONFIRMED no período X
When o sistema verifica disponibilidade para o período X
Then o quarto NÃO está disponível

Given um quarto em MAINTENANCE no período X
When o sistema verifica disponibilidade para o período X
Then o quarto NÃO está disponível (sobreposição com manutenção)

Given um quarto AVAILABLE
  E uma reserva CHECKED_OUT no período X (já finalizada)
When o sistema verifica disponibilidade para período Y (após checkout)
Then o quarto está disponível (checkout liberou)
```

### UC-06: Criar Regra de Precificação

```
Given dados válidos (name, dateRange, multiplier, propertyId)
When o sistema cria a PricingRule
Then a regra é persistida com isActive = true
  And se multiplier < 0.5, retorna erro "Multiplicador não pode ser menor que 0.5"

Given uma PricingRule com mesmo roomType e período sobreposto a uma regra existente ativa
When o sistema tenta criar
Then retorna erro "Já existe uma regra de precificação ativa neste período"
  And a nova regra não é criada

Given uma PricingRule sem roomType (aplica a todos)
When o sistema cria
Then a regra é aplicável a qualquer tipo de quarto na propriedade
```

### UC-07: Listar Quartos com Disponibilidade Agregada

```
Given uma propriedade com 10 quartos
  E 3 quartos ocupados hoje
When o sistema lista quartos com stats
Then retorna 10 quartos com seus dados
  And stats.total = 10
  And stats.available = 7
  And stats.occupied = 3
  And stats.occupancyRate = 0.3

Given filtro de disponibilidade para uma data específica
When o sistema lista
Then retorna apenas quartos SEM reservas conflitantes na data
```

### UC-08: Bloquear Quarto por Decisão Operacional

```
Given um quarto AVAILABLE (sem hóspedes)
When a recepção bloqueia o quarto
Then status muda para BLOCKED
  And motivo é registrado no log
  And reservas futuras no período são notificadas

Given um quarto OCCUPIED
When a recepção tenta bloquear
Then retorna erro "Quarto ocupado não pode ser bloqueado"
```

---

## 8. Domain Services

### 8.1 PricingCalculatorService

```typescript
interface PricingCalculatorService {
  calculateNightlyPrice(
    basePrice: MonetaryValue,
    pricingType: PricingType,
    date: Date,
    rules: PricingRule[],
    guestCount: number
  ): Result<MonetaryValue, Error>

  calculateStayPrice(
    basePrice: MonetaryValue,
    pricingType: PricingType,
    checkIn: Date,
    checkOut: Date,
    rules: PricingRule[],
    guestCount: number
  ): Result<StayPriceBreakdown, Error>

  getActiveRulesForDate(
    rules: PricingRule[],
    date: Date,
    roomType: RoomType
  ): PricingRule[]
}

interface StayPriceBreakdown {
  nightlyBreakdown: Array<{
    date: Date
    basePrice: number
    multiplier: number
    finalPrice: number
  }>
  total: number
}
```

### 8.2 AvailabilityService

```typescript
interface AvailabilityService {
  isRoomAvailable(
    room: Room,
    dateRange: RoomDateRange,
    reservations: Reservation[],
    maintenance: RoomMaintenance[]
  ): boolean

  findAvailableRooms(
    rooms: Room[],
    dateRange: RoomDateRange,
    reservationsByRoom: Map<string, Reservation[]>,
    maintenanceByRoom: Map<string, RoomMaintenance[]>
  ): Room[]

  getAvailabilitySummary(
    rooms: Room[],
    date: Date,
    reservations: Reservation[]
  ): AvailabilitySummary
}

interface AvailabilitySummary {
  total: number
  available: number
  occupied: number
  cleaning: number
  maintenance: number
  blocked: number
  occupancyRate: number
}
```

### 8.3 RoomTransitionService

```typescript
interface RoomTransitionService {
  canTransition(room: Room, newStatus: RoomStatus): boolean
  transition(room: Room, newStatus: RoomStatus, reason?: string): Result<Room, Error>
  // Valida as regras de transição de status
}
```

---

## 9. Repository Interfaces (Ports)

```typescript
interface RoomRepository {
  save(room: Room): Promise<Room>
  update(id: string, data: Partial<Room>): Promise<Room>
  findById(id: string): Promise<Room | null>
  findByNumber(propertyId: string, number: string): Promise<Room | null>
  findByProperty(propertyId: string, filters?: RoomFilters): Promise<Room[]>
  findByStatus(propertyId: string, status: RoomStatus): Promise<Room[]>
  findByType(propertyId: string, type: RoomType): Promise<Room[]>
  count(propertyId: string, filters?: RoomFilters): Promise<number>
  delete(id: string): Promise<void>
}

interface RoomFilters {
  type?: RoomType
  status?: RoomStatus
  minCapacity?: number
  pricingType?: PricingType
  search?: string           // Busca por number ou name
  limit?: number
  offset?: number
}

interface PricingRuleRepository {
  save(rule: PricingRule): Promise<PricingRule>
  update(id: string, data: Partial<PricingRule>): Promise<PricingRule>
  findById(id: string): Promise<PricingRule | null>
  findByProperty(propertyId: string): Promise<PricingRule[]>
  findActiveByDate(propertyId: string, date: Date): Promise<PricingRule[]>
  findConflicting(rule: PricingRule): Promise<PricingRule | null>
  // Retorna regra conflitante (mesmo roomType e período sobreposto)
  delete(id: string): Promise<void>
}

interface RoomStatusLogRepository {
  save(log: RoomStatusLog): Promise<RoomStatusLog>
  findByRoomId(roomId: string): Promise<RoomStatusLog[]>
  findLastByRoomId(roomId: string): Promise<RoomStatusLog | null>
}

interface RoomMaintenanceRepository {
  save(maintenance: RoomMaintenance): Promise<RoomMaintenance>
  update(id: string, data: Partial<RoomMaintenance>): Promise<RoomMaintenance>
  findById(id: string): Promise<RoomMaintenance | null>
  findByRoomId(roomId: string): Promise<RoomMaintenance[]>
  findActiveByRoomId(roomId: string): Promise<RoomMaintenance | null>
  findScheduledInPeriod(propertyId: string, dateRange: RoomDateRange): Promise<RoomMaintenance[]>
}
```

---

## 10. API Contracts

### GET /api/rooms

```typescript
// Query params
// ?propertyId=xxx&type=SUITE&status=AVAILABLE&minCapacity=4&search=101

// Response 200
{
  success: true,
  data: Array<{
    id: string
    number: string
    name: string | null
    type: RoomType
    capacity: { maxAdults: number; maxChildren: number; maxTotal: number }
    basePrice: number
    pricingType: PricingType
    amenities: string[]
    status: RoomStatus
    description: string | null
    images: string[]
    propertyId: string
    createdAt: string
    updatedAt: string
  }>,
  stats: {                        // Opcional — se ?includeStats=true
    total: number
    available: number
    occupied: number
    occupancyRate: number
  }
}

// Response 400
{ success: false, error: "propertyId é obrigatório" }
```

### POST /api/rooms

```typescript
// Request
{
  number: string
  name?: string
  type: RoomType                  // default: STANDARD
  capacity: { maxAdults?: number; maxChildren?: number }
  basePrice: number
  pricingType: PricingType        // default: PER_ROOM
  amenities?: string[]
  description?: string
  images?: string[]
  propertyId: string
}

// Response 201
{ success: true, data: Room }

// Response 400
{ success: false, error: "Já existe um quarto com este número nesta propriedade" }
// ou
{ success: false, error: "Capacidade mínima é de 1 adulto" }
```

### PATCH /api/rooms/[id]

```typescript
// Request (parcial)
{
  name?: string
  type?: RoomType
  capacity?: { maxAdults?: number; maxChildren?: number }
  basePrice?: number
  pricingType?: PricingType
  amenities?: string[]
  description?: string
  images?: string[]
  status?: RoomStatus              // Com validação de transição
  statusReason?: string            // Obrigatório se mudando para MAINTENANCE ou BLOCKED
}

// Response 200
{ success: true, data: Room }

// Response 400
{ success: false, error: "Quarto ocupado deve passar por limpeza antes de ficar disponível" }
```

### GET /api/rooms/availability

```typescript
// Query params
// ?propertyId=xxx&checkIn=2025-06-01&checkOut=2025-06-05&guestCount=2

// Response 200
{
  success: true,
  data: Array<{
    room: Room
    nightlyBreakdown: Array<{
      date: string
      basePrice: number
      multiplier: number
      finalPrice: number
    }>
    totalPrice: number
  }>,
  stats: {
    totalRooms: number
    availableRooms: number
    occupancyRate: number
  }
}

// Response 400
{ success: false, error: "propertyId, checkIn e checkOut são obrigatórios" }
```

### GET /api/pricing-rules

```typescript
// Query params
// ?propertyId=xxx

// Response 200
{
  success: true,
  data: Array<PricingRule>
}
```

### POST /api/pricing-rules

```typescript
// Request
{
  name: string
  description?: string
  roomType?: RoomType               // null = aplica a todos
  startDate: string                 // ISO date
  endDate: string                   // ISO date
  multiplier?: number               // default 1.0 (ignorado se fixedAmount definido)
  fixedAmount?: number              // Se definido, sobrescreve
  propertyId: string
}

// Response 201
{ success: true, data: PricingRule }

// Response 409
{ success: false, error: "Já existe uma regra de precificação ativa neste período" }
```

### DELETE /api/pricing-rules/[id]

```typescript
// Response 200
{ success: true, message: "Regra de precificação removida" }
```

---

## 11. Eventos de Domínio

```typescript
interface RoomCreated {
  roomId: string
  number: string
  type: RoomType
  basePrice: number
  capacity: number
  propertyId: string
  timestamp: Date
}

interface RoomStatusChanged {
  roomId: string
  previousStatus: RoomStatus
  newStatus: RoomStatus
  reason?: string
  timestamp: Date
}

interface RoomPricingUpdated {
  roomId: string
  previousBasePrice: number
  newBasePrice: number
  previousPricingType: PricingType
  newPricingType: PricingType
  timestamp: Date
}

interface RoomAvailabilityChanged {
  roomId: string
  propertyId: string
  wasAvailable: boolean
  isAvailable: boolean
  dateRange: RoomDateRange
  reason: string              // "reservation" | "maintenance" | "status_change"
  timestamp: Date
}

interface PricingRuleCreated {
  ruleId: string
  name: string
  roomType?: RoomType
  dateRange: RoomDateRange
  multiplier: number
  propertyId: string
  timestamp: Date
}

interface PricingRuleDeactivated {
  ruleId: string
  name: string
  propertyId: string
  timestamp: Date
}

interface RoomMaintenanceScheduled {
  roomId: string
  reason: string
  scheduledStart: Date
  scheduledEnd: Date
  propertyId: string
  timestamp: Date
}
```

---

## 12. Erros Conhecidos no Código Atual (a serem corrigidos)

| # | Problema | Localização | Impacto |
|---|---|---|---|
| 1 | `POST /api/rooms` aceita qualquer body sem validação | `src/app/api/rooms/route.ts:27` | Dados inválidos persistem no banco |
| 2 | `basePrice` é `Float` sem validação de valor mínimo | Schema + route | Preço pode ser 0 ou negativo |
| 3 | `capacity` é `Int` sem validação (`maxAdults` vs `maxChildren`) | Schema | Capacidade sem semântica de adultos/crianças |
| 4 | `GET /api/rooms` não filtra por status, tipo ou capacidade | `src/app/api/rooms/route.ts:13-16` | Sem suporte a queries específicas |
| 5 | Nenhum endpoint de disponibilidade existe | Ausente | Frontend calcula disponibilidade manualmente |
| 6 | `PricingRule` exposta diretamente sem validação de conflito | Schema + route | Regras conflitantes podem coexistir |
| 7 | `multiplier` sem limite inferior no schema | `schema.prisma:273` | Pode criar multiplier = 0 ou negativo |
| 8 | `isActive` nunca é verificado nas queries de room (integração com reserva) | Route | Quartos em MAINTENANCE podem receber reservas |
| 9 | Nenhum log de alteração de status é mantido | Ausente | Sem audit trail de mudanças operacionais |
| 10 | `amenities` é array plano sem normalização | Schema + route | Duplicatas e inconsistências no texto |
| 11 | `Room` e `PricingRule` sem integração com domínio Reservation | Arquitetura | Preço de estadia é calculado em duas camadas diferentes |
| 12 | `revenue_pricing_logs` e `revenue_settings` desconectados de Room/PricingRule | Schema | Revenue management opera em paralelo sem integração |

---

## 13. Critérios de Aceitação para Refatoração

- [ ] `RoomRepository` não conhece Prisma — usa interface de port
- [ ] `PricingRuleRepository` não conhece Prisma — usa interface de port
- [ ] `POST /api/rooms` valida todos os campos obrigatórios antes de persistir
- [ ] `basePrice` é tratado como `MonetaryValue` (≥ 0, 2 casas decimais)
- [ ] `capacity` é tratado como VO com `maxAdults` e `maxChildren`
- [ ] `amenities` é normalizado (lowercase, trimmed, unique, max 20)
- [ ] Transições de `RoomStatus` seguem o grafo definido (AVAILABLE ↔ OCCUPIED → CLEANING → AVAILABLE)
- [ ] `GET /api/rooms/availability` existe e calcula disponibilidade + preço por noite
- [ ] `POST /api/pricing-rules` valida conflito de períodos antes de criar
- [ ] `multiplier` não pode ser < 0.5 (proteção de preço mínimo)
- [ ] `isActive` é respeitado em todos os cálculos de preço
- [ ] `RoomStatusLogRepository` persiste todas as transições de status
- [ ] Regras de precificação são aplicadas corretamente no cálculo de estadia (noite a noite)
- [ ] Quarto em MAINTENANCE não aparece como disponível
- [ ] PricingRules sem `roomType` (null) aplicam-se a todos os tipos
- [ ] `fixedAmount` sobrescreve `basePrice * multiplier` quando definido
- [ ] Eventos de domínio são emitidos para `RoomCreated`, `RoomStatusChanged`, `RoomPricingUpdated`
- [ ] 100% dos testes de domínio rodam sem banco (InMemory repositories)
- [ ] Nenhum `@prisma/client` importado em arquivos de domínio ou aplicação (domain/ e application/)

---

## 14. Plano de Small Batches

### SB1: Value Objects + Enums + Entities (14 arquivos, ~60 testes)
- `src/domain/room/value-objects/MonetaryValue.ts`
- `src/domain/room/value-objects/Capacity.ts`
- `src/domain/room/value-objects/Amenities.ts`
- `src/domain/room/value-objects/RoomDateRange.ts` (compartilhado com Reservation)
- `src/domain/room/value-objects/OccupancyRate.ts`
- `src/domain/room/entities/Room.ts`
- `src/domain/room/entities/PricingRule.ts`
- `src/domain/room/entities/RoomStatusLog.ts`
- `src/domain/room/entities/RoomMaintenance.ts`
- `src/domain/room/enums.ts` (RoomType, RoomStatus, PricingType, MaintenanceStatus)
- `src/domain/room/events.ts`
- `__tests__/domain/room/` (VOs + entities)

### SB2: Domain Services + Ports + Use Cases + InMemory repos
- `PricingCalculatorService` + `AvailabilityService` + `RoomTransitionService`
- `IRoomRepository`, `IPricingRuleRepository`, `IRoomStatusLogRepository`, `IRoomMaintenanceRepository`
- 6 Use Cases (CreateRoom, UpdateRoomStatus, CalculateStayPrice, CheckAvailability, CreatePricingRule, ListRooms)
- InMemory repositories
- Testes de integração de domínio (Use Cases)

### SB3: Prisma adapters + Controllers + Route refactoring
- `PrismaRoomRepository`, `PrismaPricingRuleRepository`
- `RoomControllerFactory`
- `src/app/api/rooms/route.ts` refatorado
- `src/app/api/rooms/[id]/route.ts` (PATCH)
- `src/app/api/rooms/availability/route.ts` (GET)
- `src/app/api/pricing-rules/route.ts` (GET + POST)
- `src/app/api/pricing-rules/[id]/route.ts` (DELETE)

---

## 15. Glossário de Termos Técnicos

| Termo | Significado |
|---|---|
| **Aggregate Root** | Entidade raiz que garante consistência do aggregate |
| **Value Object** | Objeto imutável definido por seus atributos, não por identidade |
| **PricingRule** | Regra que altera preço base em um período específico |
| **Availability** | Estado computado de disponibilidade (não armazenado) |
| **Occupancy Rate** | Percentual de quartos ocupados |
| **Revenue Management** | Conjunto de estratégias para maximizar receita por quarto |
| **Port** | Interface que define contrato com o mundo externo (ex: repositório) |
| **Use Case** | Fluxo de interação que orquestra entidades e serviços |
| **Domain Event** | Algo que aconteceu no domínio que outros contextos precisam saber |
| **InMemory Repository** | Implementação fake de repositório para testes sem banco |
| **PricingType** | PER_ROOM (preço fixo) ou PER_PERSON (preço por hóspede) |
| **Override Priority** | Prioridade de uma PricingRule sobre outra em caso de conflito |
| **Status Transition** | Grafo de mudanças de estado operacional do quarto |
| **StayPriceBreakdown** | Decomposição de preço noite a noite para uma estadia |
