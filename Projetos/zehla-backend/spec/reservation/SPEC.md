# SPEC — Domínio de Reservas (Reservation)

## 1. Bounded Context

| Campo | Valor |
|---|---|
| **Domínio** | Core Business Hoteleiro |
| **Aggregate Root** | `Reservation` |
| **Linguagem** | Português (ubíqua) |
| **Stakeholders** | Hóspede, Recepção, Agentes IA, Financeiro, FNRH |
| **Eventos publicados** | `ReservationCreated`, `ReservationCancelled`, `CheckInDone`, `CheckOutDone`, `PaymentLinked` |

### Relações com outros Contextos

| Contexto | Tipo de Relação |
|---|---|
| Property | Dono do aggregate (tenant raiz) |
| Room | Recurso alocado pela reserva |
| Payment | Sub-aggregate de pagamento (1:1) |
| GuestMemory | Projeção lateral para CRM |
| FiscalInvoice | Gerada no check-out |
| Revenue | KPIs calculados a partir de reservas confirmadas |

---

## 2. Linguagem Ubíqua

| Termo | Definição |
|---|---|
| **Reserva** | Contrato entre hóspede e propriedade para ocupação de um quarto em um período |
| **Check-in** | Ato de entrada do hóspede; quarto passa a OCCUPIED |
| **Check-out** | Ato de saída; quarto vai para CLEANING e fatura é gerada |
| **No-Show** | Hóspede não compareceu no check-in; reserva é cancelada automaticamente |
| **Noites** | Diferença em dias entre checkOut e checkIn |
| **Room Price** | Preço-base diário do quarto no momento da criação |
| **Diária** | Preço por noite (pode incluir regras de sazonalidade) |
| **Hóspede** | Pessoa física identificada por telefone (único por propriedade) |
| **Disponibilidade** | Quarto sem reservas CONFIRMED/CHECKED_IN no período solicitado |
| **PII** | Dados pessoais sensíveis (CPF, telefone, email) — criptografados em repouso |
| **Código FNRH** | Identificador de registro obrigatório na Ficha Nacional de Registro de Hóspedes |

---

## 3. Entities

### 3.1 Reservation (Aggregate Root)

```typescript
interface Reservation {
  id: string
  code: string                    // Código amigável, ex: ZEH-1715000000000
  propertyId: string
  roomId: string
  
  // Hóspede
  guestName: string
  guestEmail?: string
  guestPhone: string              // Identificador único (PII)
  guestCpf?: string               // PII
  guestCount: number              // ≥ 1

  // Período
  checkIn: Date
  checkOut: Date
  nights: number                  // Calculado: ceil((checkOut - checkIn) / dias)

  // Financeiro
  roomPrice: number               // Preço-base do quarto no momento da criação
  discount: number                // Desconto concedido
  totalAmount: number             // Calculado: (roomPrice × nights) - discount
  paidAmount: number              // Total já pago

  // Estado
  status: ReservationStatus
  checkInStatus: CheckInStatus
  source: string                  // WHATSAPP, DIRECT, OTA, INSTAGRAM
  notes?: string
  
  // FNRH
  fnrhSubmittedAt?: Date
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

enum ReservationStatus {
  PENDING         // Aguardando confirmação
  CONFIRMED       // Confirmada, quarto bloqueado
  CHECKED_IN      // Hóspede em casa
  CHECKED_OUT     // Hóspede saiu
  CANCELLED       // Cancelada pelo hóspede ou admin
  NO_SHOW         // Não compareceu
}

enum CheckInStatus {
  PENDING         // Check-in não realizado
  READY           // Quarto pronto para check-in
  DONE            // Check-in concluído
  DELAYED         // Hóspede atrasado
}
```

### 3.2 ReservationItem (Entity — parte do Aggregate Reservation)

```typescript
interface ReservationItem {
  id: string
  reservationId: string
  serviceItemId: string
  quantity: number
  unitPrice: number
  totalPrice: number              // Calculado: quantity × unitPrice
  status: 'pending' | 'delivered'
  notes?: string
  deliveredAt?: Date
}
```

### 3.3 Payment (Entity — sub-aggregate vinculado)

```typescript
interface Payment {
  id: string
  reservationId: string
  propertyId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  pixQrCode?: string
  pixCode?: string
  pixExpiration?: Date
  externalId?: string             // ID no gateway (Pagar.me, Stripe)
  paidAt?: Date
  refundedAt?: Date
}

enum PaymentMethod {
  PIX, CREDIT_CARD, DEBIT_CARD, CASH, BANK_TRANSFER
}

enum PaymentStatus {
  PENDING, PAID, FAILED, REFUNDED, CANCELLED
}
```

---

## 4. Value Objects

### 4.1 DateRange

```typescript
interface DateRange {
  checkIn: Date
  checkOut: Date
  // Invariantes:
  // - checkOut > checkIn
  // - (checkOut - checkIn) ≥ 1 noite
  // - Datas no futuro (para criação)
  nights(): number                // ceil((checkOut - checkIn) / dias)
  overlaps(other: DateRange): boolean
  contains(date: Date): boolean
}
```

### 4.2 Money

```typescript
interface Money {
  amount: number
  currency: string                // sempre BRL
  // Invariantes:
  // - amount ≥ 0
  add(other: Money): Money
  subtract(other: Money): Money
  multiply(factor: number): Money
}
```

### 4.3 PricingBreakdown

```typescript
interface PricingBreakdown {
  roomPrice: Money                // Preço-base do quarto por noite
  nights: number
  subtotal: Money                 // roomPrice × nights
  pricingRulesApplied: Array<{
    ruleId: string
    name: string
    type: 'multiplier' | 'fixed'
    value: number
  }>
  discount: Money
  total: Money                    // subtotal + regras - discount
}
```

### 4.4 GuestInfo

```typescript
interface GuestInfo {
  name: string
  email?: string
  phone: string                   // Único por property + guest
  cpf?: string                    // Obrigatório para FNRH
  // Invariante: phone e cpf são PII — criptografados em repouso
}
```

### 4.5 RoomStatus

```typescript
enum RoomStatus {
  AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE, BLOCKED
}
```

---

## 5. Invariantes do Domínio

1. **Disponibilidade:** Um quarto não pode ter duas reservas CONFIRMED ou CHECKED_IN com períodos sobrepostos.
2. **Capacidade:** `guestCount ≤ room.capacity`.
3. **Período:** `checkOut > checkIn` e duração ≥ 1 noite.
4. **Preço:** `totalAmount ≥ 0`, `discount ≤ totalAmount`.
5. **Pagamento:** Check-in só pode ocorrer se `paidAmount ≥ totalAmount` (a menos que isenta).
6. **Estado:** Transições de status são irreversíveis (ex: CHECKED_IN não volta a CONFIRMED).
7. **Identidade:** `guestPhone` é identificador único por propriedade (via GuestMemory).
8. **PII:** `guestCpf`, `guestPhone`, `guestEmail` são criptografados em repouso (PiiGuard).
9. **Quarto:** Quartos MAINTENANCE ou BLOCKED não recebem reservas.
10. **No-Show:** Se `checkIn` passou e status ainda é CONFIRMED, o sistema deve marcar NO_SHOW (automação).

### Diagrama de Transição de Status

```
PENDING ──confirm──▶ CONFIRMED ──checkin──▶ CHECKED_IN ──checkout──▶ CHECKED_OUT
  │                    │                                                │
  └──cancel──▶ CANCELLED  └──cancel──▶ CANCELLED      └──complete──▶ (fechado)
                                                   └──noshow──▶ NO_SHOW
```

---

## 6. Regras de Negócio (Given/When/Then)

### UC-01: Criar Reserva

```
Given um quarto DISPONÍVEL no período solicitado
  And guestCount ≤ room.capacity
  And checkOut > checkIn
When o sistema cria a reserva
Then o status é CONFIRMED
  And o quarto permanece AVAILABLE (apenas bloqueado, não ocupado)
  And o código é gerado no formato ZEH-{timestamp}
  And os dados PII são criptografados
  And a reserva é vinculada ao propertyId do tenant
  And o totalAmount é calculado como (roomPrice × nights) - discount
  And um evento ReservationCreated é emitido

Given um quarto INDISPONÍVEL no período (outra reserva CONFIRMED/CHECKED_IN)
When o sistema tenta criar a reserva
Then retorna erro 409 "Quarto não disponível"
```

### UC-02: Cancelar Reserva

```
Given uma reserva CONFIRMED ou CHECKED_IN
When o sistema cancela a reserva
Then o status muda para CANCELLED
  And o quarto volta a AVAILABLE (se estava bloqueado/ocupado)
  And um evento ReservationCancelled é emitido

Given uma reserva CHECKED_OUT ou NO_SHOW
When o sistema tenta cancelar
Then retorna erro 400 "Reserva já finalizada"
```

### UC-03: Realizar Check-in

```
Given uma reserva CONFIRMED
  And paidAmount ≥ totalAmount
When o sistema realiza check-in
Then o status muda para CHECKED_IN
  And checkInStatus muda para DONE
  And o quarto muda para OCCUPIED
  And um evento CheckInDone é emitido

Given uma reserva CONFIRMED com pagamento pendente
When o sistema tenta realizar check-in
Then retorna erro 402 "Pagamento pendente"
```

### UC-04: Realizar Check-out

```
Given uma reserva CHECKED_IN
When o sistema realiza check-out
Then o status muda para CHECKED_OUT
  And o quarto muda para CLEANING
  And um evento CheckOutDone é emitido
```

### UC-05: Calcular Preço com Regras de Precificação

```
Given uma propriedade com PricingRules ativas
  And uma nova reserva no período {data}
When o sistema calcula o preço
Then busca todas PricingRules ativas que cobrem roomType + data
  And aplica o multiplier ou fixedAmount sequencialmente
  And retorna PricingBreakdown com regras aplicadas

Given nenhuma PricingRule aplicável
When o sistema calcula o preço
Then totalAmount = room.basePrice × nights
  And discount = 0
```

### UC-06: Vincular Pagamento

```
Given uma reserva CONFIRMED
When um pagamento é criado e confirmado
Then Payment é vinculado a reservationId
  And reservation.paidAmount é incrementado
  And um evento PaymentLinked é emitido
```

### UC-07: Processar Comprovante (Veda-Fraude 2.0)

```
Given um comprovante recebido (phone, propertyId, amount, transactionId)
  And contextReservationId fornecido
When o sistema processa
Then busca a reserva por ID
  And cria Payment PAID em transação ACID
  And atualiza reservation.paidAmount

Given contextReservationId = UNKNOWN
When o sistema processa
Then busca a última reserva PENDING (não CONFIRMED) para phone + propertyId
  And se encontrada, processa pagamento
  And se não encontrada, retorna erro 404 "Reserva não encontrada"
```

### UC-08: Atualizar Dados da Reserva

```
Given uma reserva existente (não CHECKED_OUT, CANCELLED, NO_SHOW)
When dados do hóspede são atualizados
Then novos dados PII são criptografados antes de persistir
  And campos não fornecidos permanecem inalterados
  And checkIn/checkOut podem ser alterados (sujeito a disponibilidade)
```

---

## 7. Domain Services

### 7.1 AvailabilityService

```typescript
interface AvailabilityService {
  isRoomAvailable(
    roomId: string,
    period: DateRange,
    excludeReservationId?: string
  ): Promise<boolean>
  
  findAvailableRooms(
    propertyId: string,
    period: DateRange,
    capacity?: number
  ): Promise<Room[]>
}
```

### 7.2 PricingService

```typescript
interface PricingService {
  calculatePrice(
    room: Room,
    period: DateRange,
    guestCount: number,
    propertyId: string
  ): Promise<PricingBreakdown>
  
  applyPricingRules(
    basePrice: Money,
    roomType: RoomType,
    propertyId: string,
    period: DateRange
  ): Promise<{ multiplier: number; fixedAmount: number }>
}
```

### 7.3 GuestMemoryService

```typescript
interface GuestMemoryService {
  trackGuest(info: GuestInfo, propertyId: string): Promise<void>
  findByPhone(phone: string, propertyId: string): Promise<GuestMemory | null>
}
```

### 7.4 OverbookingGuard

```typescript
interface OverbookingGuard {
  canAcceptReservation(
    propertyId: string,
    period: DateRange
  ): Promise<{ allowed: boolean; reason?: string }>
}
```

---

## 8. Repository Interfaces (Ports)

```typescript
interface ReservationRepository {
  save(reservation: Reservation): Promise<Reservation>
  update(id: string, data: Partial<Reservation>): Promise<Reservation>
  findById(id: string): Promise<Reservation | null>
  findByCode(code: string): Promise<Reservation | null>
  findByProperty(propertyId: string, filters?: ReservationFilters): Promise<Reservation[]>
  findOverlapping(roomId: string, period: DateRange, excludeId?: string): Promise<Reservation[]>
  findByGuestPhone(phone: string, propertyId: string, status?: ReservationStatus[]): Promise<Reservation[]>
  delete(id: string): Promise<void>
}

interface RoomRepository {
  findById(id: string): Promise<Room | null>
  findByProperty(propertyId: string): Promise<Room[]>
  updateStatus(id: string, status: RoomStatus): Promise<void>
}

interface PaymentRepository {
  save(payment: Payment): Promise<Payment>
  findByReservationId(reservationId: string): Promise<Payment | null>
  updateStatus(id: string, status: PaymentStatus): Promise<void>
}
```

---

## 9. API Contracts

### POST /api/reservations (Criar)

```typescript
// Request
{
  propertyId: string
  roomId: string
  guestName: string
  guestEmail?: string
  guestPhone: string
  guestCpf?: string
  guestCount: number
  checkIn: string              // ISO date
  checkOut: string             // ISO date
  source?: string              // default: "DIRECT"
  notes?: string
}

// Response 201
{
  id: string
  code: string
  status: "CONFIRMED"
  totalAmount: number
  nights: number
  room: { id, number, type }
}

// Response 409
{ error: "Quarto não disponível para as datas selecionadas" }

// Response 422
{ error: string, details: string[] }  // Violação de invariantes
```

### PATCH /api/reservations/:id (Atualizar status)

```typescript
// Request
{ status: ReservationStatus }

// Response 200
{ success: true, data: Reservation }

// Response 400
{ error: "Transição de status inválida" }
```

### POST /api/reservations/:id/check-in

```typescript
// Response 200
{ success: true, data: Reservation, roomStatus: "OCCUPIED" }

// Response 402
{ error: "Pagamento pendente" }
```

### POST /api/reservations/:id/check-out

```typescript
// Response 200
{ success: true, data: Reservation, roomStatus: "CLEANING" }
```

### GET /api/reservations

```typescript
// Query params
// ?status=CONFIRMED&propertyId=xxx&startDate=2025-01-01&endDate=2025-12-31

// Response 200
[
  {
    id, code, guestName, guestPhone,
    room: { number, type },
    checkIn, checkOut, status,
    totalAmount, paidAmount
  }
]
```

### POST /api/reservations/:id/payment (Vincular pagamento)

```typescript
// Request
{
  method: PaymentMethod
  amount: number
  externalId?: string
}

// Response 200
{ success: true, data: Payment }
```

---

## 10. Eventos de Domínio

```typescript
interface ReservationCreated {
  reservationId: string
  propertyId: string
  roomId: string
  guestPhone: string
  period: DateRange
  totalAmount: number
  timestamp: Date
}

interface ReservationCancelled {
  reservationId: string
  propertyId: string
  roomId: string
  reason?: string
  timestamp: Date
}

interface CheckInDone {
  reservationId: string
  propertyId: string
  roomId: string
  guestName: string
  timestamp: Date
}

interface CheckOutDone {
  reservationId: string
  propertyId: string
  roomId: string
  totalAmount: number
  timestamp: Date
}

interface PaymentLinked {
  reservationId: string
  paymentId: string
  amount: number
  method: PaymentMethod
  timestamp: Date
}
```

---

## 11. Erros Conhecidos no Código Atual (a serem corrigidos)

| # | Problema | Localização | Impacto |
|---|---|---|---|
| 1 | `reservations/route.ts` não filtra por `propertyId` | API route GET | Vaza dados entre tenants |
| 2 | `checkAvailability` não detecta todos os overlaps | Agent route | Permite overbooking parcial |
| 3 | `totalAmount` multiplica por `guestCount` sem validação de capacidade | Agent route, linha 61 | Preço incorreto para PER_ROOM |
| 4 | Quarto marcado `OCCUPIED` na criação (deveria ser no check-in) | Agent route, linha 91 | Inconsistência de estado |
| 5 | `status: 'PENDING_PAYMENT'` não existe no enum Prisma | ProcessPaymentProofUseCase.ts:31 | Erro em runtime |
| 6 | `reservation_items` existe no schema mas nunca usado | Schema + nenhum service | Dead code |
| 7 | `PricingRule` existe mas nunca aplicada | Schema + nenhum service | Perda de receita |
| 8 | Sem validação de `guestCount ≤ room.capacity` | Nenhum lugar | Permite overcapacity |
| 9 | `discount` nunca é validado | Nenhum lugar | Pode exceder totalAmount |
| 10 | `PATCH /api/reservations` sem validação de transição | API route PATCH | Permite transições inválidas |

---

## 12. Critérios de Aceitação para Refatoração

- [x] Todas as invariantes (seção 5) são validadas antes de persistir
- [x] `ReservationRepository` não conhece Prisma — usa interface
- [x] `PricingRule` é consultada e aplicada em toda criação de reserva
- [x] Quarto só vai a `OCCUPIED` no check-in, não na criação
- [x] `propertyId` é obrigatório e filtrado em TODAS as queries
- [x] Transições de status seguem o diagrama (seção 5)
- [x] PII é criptografado em toda operação de escrita
- [x] Pagamento integrado ao ciclo de vida (check-in bloqueado sem pagamento)
- [x] Eventos de domínio são emitidos para cada transição
- [x] Capacidade do quarto é respeitada
- [x] `totalAmount` usa `PricingService`, não multiplica raw por `guestCount`

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
| **ACID** | Propriedade de transação: Atomicidade, Consistência, Isolamento, Durabilidade |
| **PII** | Personally Identifiable Information — dados que identificam uma pessoa |
| **Tenant** | Propriedade (cada pousada é um tenant isolado) |
| **FNRH** | Ficha Nacional de Registro de Hóspedes — obrigação legal |
