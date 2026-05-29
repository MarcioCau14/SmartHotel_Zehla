# SPEC — Domínio de Financeiro (Finance & Payments)

## 1. Bounded Context

| Campo | Valor |
|---|---|
| **Domínio** | Core Business de Gestão Financeira — faturamento, pagamentos, conciliação e auditoria |
| **Aggregate Roots** | `Invoice`, `Payment` |
| **Linguagem** | Português (ubíqua) |
| **Stakeholders** | Financeiro, Recepção, Hóspedes, Revenue Management |
| **Eventos publicados** | `InvoiceGenerated`, `InvoiceIssued`, `InvoicePaid`, `InvoiceCancelled`, `InvoiceOverdue`, `PaymentInitiated`, `PaymentConfirmed`, `PaymentFailed`, `PaymentRefunded`, `PixReceived`, `PixQrCodeExpired` |

### Relações com outros Contextos

| Contexto | Tipo de Relação |
|---|---|
| Reservation | Consome dados da reserva (roomPrice, services, guestName) para gerar Invoice |
| Room | Consome preço calculado do Room via PricingRules para compor itens da fatura |
| Property | Tenant dono da fatura e das configurações financeiras (PIX key, tax profile) |
| Lead | Notificado de eventos de pagamento para acionar fluxos de conversão |

---

## 2. Linguagem Ubíqua

| Termo | Definição |
|---|---|
| **Fatura** | Documento financeiro que lista todos os débitos de uma reserva (diárias, serviços, taxas) |
| **Pagamento** | Transação de quitação de valor contra uma fatura, podendo ser parcial ou total |
| **Transação PIX** | Pagamento instantâneo brasileiro com QR Code, endToEndId e expiração |
| **Estorno** | Devolução total ou parcial de um pagamento confirmado |
| **Chargeback** | Contestação de pagamento iniciada pelo banco do hóspede |
| **Conciliação** | Processo de conferência entre pagamentos registrados e extratos do gateway |
| **Nota Fiscal** | Documento fiscal brasileiro (NFS-e) emitido para a estadia |
| **Baixa** | Registro contábil de que um valor foi recebido |
| **Split de Pagamento** | Divisão automática do valor entre proprietário e plataforma |
| **Remaining Balance** | Saldo remanescente de uma fatura após pagamentos parciais |
| **Due Date** | Data de vencimento da fatura (geralmente checkIn - N dias) |
| **EndToEndId** | Identificador único de ponta a ponta de uma transação PIX no BACEN |
| **QR Code** | Código bidimensional que codifica os dados de pagamento PIX |
| **Webhook** | Chamada HTTP do gateway de pagamento notificando mudança de status |
| **Idempotência** | Garantia de que uma notificação duplicada não gera duplicidade contábil |
| **Audit Trail** | Trilha de auditoria imutável de todas as operações financeiras |
| **Gateway** | Serviço externo de processamento de pagamentos (abstraído por porta) |

---

## 3. Value Objects

### 3.1 Money

```typescript
interface MoneyProps {
  amount: number       // Em reais (BRL), máximo 2 casas decimais, >= 0
  currency: string     // default "BRL" (ISO 4217)
}

// Invariantes:
// - amount >= 0
// - amount truncado para 2 casas decimais (Math.round * 100 / 100)
// - currency é string de 3 caracteres (ISO 4217, uppercase)
// - currency === "BRL" por padrão (valores aceitos: qualquer ISO 4217)

// Métodos:
// - add(other: Money): Result<Money, Error>  — moedas devem ser iguais
// - subtract(other: Money): Result<Money, Error>  — moedas iguais, result >= 0
// - multiply(factor: number): Money  — factor >= 0
// - percentage(pct: number): Money  — pct entre 0 e 100
// - isGreaterThan(other: Money): boolean
// - isZero(): boolean
// - equals(other: Money): boolean  — amount e currency iguais
```

### 3.2 InvoiceNumber

```typescript
interface InvoiceNumberProps {
  value: string        // Padrão: INV-{YYYYMM}-{sequential:6}
}

// Invariantes:
// - Formato: INV-YYYYMM-NNNNNN (ex: INV-202506-000001)
// - YYYM = ano + mês vigente
// - sequential = 6 dígitos com zero padding
// - Regex: /^INV-\d{6}-\d{6}$/

// Métodos:
// - generate(month: number, year: number, sequential: number): Result<InvoiceNumber, Error>
// - getMonth(): number
// - getYear(): number
// - getSequential(): number
```

### 3.3 PixKey

```typescript
interface PixKeyProps {
  type: PixKeyType     // CPF | CNPJ | EMAIL | PHONE | RANDOM
  value: string
}

// Invariantes:
// - CPF: 11 dígitos numéricos (validar DV)
// - CNPJ: 14 dígitos numéricos (validar DV)
// - EMAIL: formato email válido
// - PHONE: +55XXXXXXXXXXX (13 dígitos com DDD)
// - RANDOM: UUID v4
// - Normalizado: sem pontuação, lowercase para email
```

### 3.4 PaymentMethod

```typescript
enum PaymentMethod {
  PIX
  CREDIT_CARD
  DEBIT_CARD
  CASH
  BANK_TRANSFER
}
```

### 3.5 Installment

```typescript
interface InstallmentProps {
  quantity: number     // 1 a 12
  value: Money
  interestRate: number // 0.0 a 100.0 (percentual ao mês)
  dueDate: Date
}

// Invariantes:
// - quantity >= 1 e <= 12
// - interestRate >= 0
// - dueDate > now
// - valorTotal = value * quantity
```

### 3.6 Discount

```typescript
interface DiscountProps {
  type: DiscountType   // PERCENTAGE | FIXED
  value: Money         // Se FIXED: valor absoluto; Se PERCENTAGE: percentage(100%) do total original
  percentage?: number  // Só se type === PERCENTAGE (0 a 100)
  reason: string       // Ex: "Cortesia", "Promoção Checkout Antecipado"
}

// Invariantes:
// - Se PERCENTAGE: percentage > 0 e <= 100
// - Se FIXED: value.amount > 0
// - reason entre 3 e 200 caracteres
// - discount.amount <= invoice.totalAmount (validado na entidade)
```

### 3.7 BillingPeriod

```typescript
interface BillingPeriodProps {
  startDate: Date
  endDate: Date
  reference: string    // "YYYY-MM" (derivado de startDate)
}

// Invariantes:
// - startDate < endDate
// - Ambos sem time (apenas date portion)
// - reference === format(startDate, "YYYY-MM")
// - nights(): number = dias corridos entre startDate e endDate
```

### 3.8 TransactionReference

```typescript
interface TransactionReferenceProps {
  externalId: string   // ID da transação no gateway (Stripe txn, Asaas id, etc.)
  internalId: string   // Nosso Payment.id
  type: TransactionType // PAYMENT | REFUND | CHARGEBACK
}

// Invariantes:
// - externalId não vazio
// - internalId não vazio
// - type é um dos valores do enum TransactionType
```

---

## 4. Entities

### 4.1 Invoice (Aggregate Root)

```typescript
interface Invoice {
  // Identity & Core Data
  id: string
  number: InvoiceNumber | null       // Gerado ao emitir (DRAFT → ISSUED)
  propertyId: string
  reservationId?: string
  guestName: string
  
  // Período & Vencimento
  billingPeriod: BillingPeriod       // ← VO
  dueDate: Date                      // Geralmente checkIn - N dias
  
  // Valores (nunca Float — sempre Money)
  items: InvoiceItem[]               // ← Entity (parte do aggregate)
  discounts: Discount[]              // ← VO
  totalAmount: Money                 // Calculado: sum(items) - sum(discounts)
  paidAmount: Money                  // Acumulado de pagamentos
  
  // Status & Timestamps
  status: InvoiceStatus              // DRAFT | ISSUED | PARTIALLY_PAID | PAID | CANCELLED | OVERDUE
  issuedAt?: Date
  paidAt?: Date
  cancelledAt?: Date
  overdueAt?: Date
  
  // Audit
  createdAt: Date
  updatedAt: Date
  
  // Domain methods
  addItem(item: InvoiceItem): Result<void, Error>
  removeItem(itemId: string): Result<void, Error>
  applyDiscount(discount: Discount): Result<void, Error>
  issue(): Result<Invoice, Error>               // DRAFT → ISSUED
  registerPayment(amount: Money): Result<void, Error>
  cancel(reason: string): Result<void, Error>
  markOverdue(): Result<void, Error>            // ISSUED/PARTIALLY_PAID → OVERDUE
  remainingBalance(): Money                     // totalAmount - paidAmount
  isFullyPaid(): boolean
}

// Invariantes:
// - totalAmount = sum(items.totalPrice) - sum(discounts.value)
// - paidAmount <= totalAmount
// - discounts somados < totalAmount (saldosempre positivo)
// - DRAFT não pode ser paga (precisa ser ISSUED first)
// - PAID ou CANCELLED são terminais
// - PARTIALLY_PAID só quando paidAmount < totalAmount e paidAmount > 0
```

**State Machine:**

```
DRAFT ──issue()──→ ISSUED ──────────registerPayment(total)──→ PAID
                    │                       │
                    │ registerPayment(parcial)               
                    ↓                       │
              PARTIALLY_PAID ──registerPayment(restante)──→ PAID
                    │                       │
                    ↓                       ↓
              OVERDUE ←──markOverdue()── ISSUED/PARTIALLY_PAID
              
CANCELLED ←──cancel()── DRAFT | ISSUED | PARTIALLY_PAID | OVERDUE
```

### 4.2 InvoiceItem (Entity — parte do aggregate Invoice)

```typescript
interface InvoiceItem {
  id: string
  description: string                  // Ex: "Diária 05/06 - Suíte Master", "Café da Manhã"
  quantity: number                     // Ex: 3 noites, 2 serviços
  unitPrice: Money                     // ← VO
  totalPrice: Money                    // = unitPrice * quantity (invariante)
  type: InvoiceItemType                // ROOM | SERVICE | TAX | DISCOUNT | OTHER
  metadata?: Record<string, unknown>   // Ex: { reservationItemId, date }
  
  // Invariantes:
  // - totalPrice = unitPrice * quantity
  // - quantity > 0
  // - description entre 3 e 200 caracteres
}
```

### 4.3 Payment (Aggregate Root)

```typescript
interface Payment {
  // Identity & Core Data
  id: string
  invoiceId: string
  amount: Money                          // ← VO (nunca Float)
  method: PaymentMethod                  // PIX | CREDIT_CARD | DEBIT_CARD | CASH | BANK_TRANSFER
  status: PaymentStatus                  // PENDING | PROCESSING | CONFIRMED | FAILED | REFUNDED | CANCELLED
  
  // Gateway (apenas referência — detalhes no infra via port)
  gatewayTransactionId?: string          // ID genérico do gateway
  gatewayResponse?: string               // JSON opaco do gateway (armazenado, não interpretado no domínio)
  
  // PixTransaction (só se method === PIX)
  pixTransaction?: PixTransaction        // ← Entity
  
  // Timestamps
  paidAt?: Date
  refundedAt?: Date
  cancelledAt?: Date
  failedAt?: Date
  
  // Metadata
  metadata?: Record<string, unknown>
  
  // Audit
  createdAt: Date
  updatedAt: Date
  
  // Domain methods
  initiate(method: PaymentMethod): Result<Payment, Error>   // PENDING → PROCESSING
  confirm(gatewayTxnId: string): Result<Payment, Error>     // PROCESSING → CONFIRMED
  fail(reason: string): Result<Payment, Error>               // PROCESSING → FAILED
  refund(): Result<Payment, Error>                           // CONFIRMED → REFUNDED
  cancel(): Result<Payment, Error>                           // PENDING/PROCESSING → CANCELLED
  isTerminal(): boolean                                      // REFUNDED | CANCELLED
}

// Invariantes CRÍTICAS:
// - FAILED → CONFIRMED não é permitido (criar novo Payment)
// - REFUNDED é terminal (não transiciona)
// - amount > 0
// - invoiceId não vazio
```

**State Machine:**

```
PENDING ──initiate()──→ PROCESSING ──confirm()──→ CONFIRMED ──refund()──→ REFUNDED
                           │                                              (terminal)
                           │ fail()
                           ↓
                        FAILED
                        (terminal — criar novo Payment)
                           
PENDING ──cancel()──→ CANCELLED
PROCESSING ──cancel()──→ CANCELLED
```

### 4.4 PixTransaction (Entity — parte do aggregate Payment quando method=PIX)

```typescript
interface PixTransaction {
  id: string
  paymentId: string
  
  // QR Code data (gerado via port de gateway, armazenado aqui)
  qrCode: string                        // Payload BRCode (copia e cola)
  qrCodeBase64?: string                 // Imagem do QR em base64
  copyPasteKey: string                  // Código PIX copia-e-cola
  
  // Validade
  expiration: Date                      // Default: criado + 15 min
  amount: Money
  
  // Status
  status: PixStatus                     // AWAITING_PAYMENT | RECEIVED | CONFIRMED | EXPIRED | REFUNDED
  endToEndId?: string                   // ID do BACEN (preenchido ao receber)
  
  // Events
  receivedAt?: Date
  confirmedAt?: Date
  webhookReceivedAt?: Date
  
  // Domain methods
  generateQrCode(key: PixKey, expirationMinutes: number): Result<void, Error>
  markReceived(endToEndId: string): Result<void, Error>     // AWAITING_PAYMENT → RECEIVED
  confirm(): Result<void, Error>                             // RECEIVED → CONFIRMED
  expire(): Result<void, Error>                              // AWAITING_PAYMENT → EXPIRED
  isExpired(): boolean                                       // now > expiration
}

// Invariantes:
// - expiration > createdAt (mínimo 1 minuto, default 15 min)
// - endToEndId é UUID válido quando preenchido
// - AWAITING_PAYMENT → CONFIRMED não pode pular RECEIVED
// - EXPIRED é terminal (PIX expirado precisa de novo QR Code)
```

**State Machine:**

```
AWAITING_PAYMENT ──markReceived(endToEndId)──→ RECEIVED ──confirm()──→ CONFIRMED
       │                                                                    │
       │ expire()                                                           │ refund()
       ↓                                                                    ↓
    EXPIRED                                                              REFUNDED
    (terminal — novo QR)
```

---

## 5. Enums & Type Unions

```typescript
enum InvoiceStatus {
  DRAFT            // Sendo montada, ainda não emitida
  ISSUED           // Emitida, aguardando pagamento
  PARTIALLY_PAID   // Pagamento parcial recebido
  PAID             // Totalmente paga
  CANCELLED        // Cancelada (sem pagamentos ou todos estornados)
  OVERDUE          // Vencida e não paga
}

// Transições válidas de InvoiceStatus:
// DRAFT              → ISSUED, CANCELLED
// ISSUED             → PARTIALLY_PAID, PAID, CANCELLED, OVERDUE
// PARTIALLY_PAID     → PAID, CANCELLED, OVERDUE
// PAID               → (terminal — apenas estorno externo gera refund, não transição de status)
// CANCELLED          → (terminal)
// OVERDUE            → PAID, CANCELLED

enum PaymentStatus {
  PENDING           // Criado, aguardando ação
  PROCESSING        // Em processamento no gateway
  CONFIRMED         // Confirmado pelo gateway
  FAILED            // Falhou no gateway (terminal)
  REFUNDED          // Estornado (terminal)
  CANCELLED         // Cancelado antes de confirmar (terminal)
}

// Transições válidas de PaymentStatus:
// PENDING     → PROCESSING, CANCELLED
// PROCESSING  → CONFIRMED, FAILED, CANCELLED
// CONFIRMED   → REFUNDED
// FAILED      → (terminal)
// REFUNDED    → (terminal)
// CANCELLED   → (terminal)

enum PixStatus {
  AWAITING_PAYMENT   // QR Code gerado, aguardando pagamento
  RECEIVED           // Pagamento detectado (endToEndId recebido)
  CONFIRMED          // Confirmado (settled)
  EXPIRED            // QR Code venceu sem pagamento (terminal)
  REFUNDED           // Estornado (terminal)
}

// Transições válidas de PixStatus:
// AWAITING_PAYMENT  → RECEIVED, EXPIRED
// RECEIVED           → CONFIRMED
// CONFIRMED          → REFUNDED
// EXPIRED            → (terminal)
// REFUNDED           → (terminal)

enum PaymentMethod {
  PIX
  CREDIT_CARD
  DEBIT_CARD
  CASH
  BANK_TRANSFER
}

enum InvoiceItemType {
  ROOM
  SERVICE
  TAX
  DISCOUNT
  OTHER
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

enum TransactionType {
  PAYMENT
  REFUND
  CHARGEBACK
  ADJUSTMENT
}

enum BillingStatus {
  CURRENT
  OVERDUE
  PAID
  CANCELLED
}
```

---

## 6. Invariantes do Domínio

1. **Money nunca é Float:** Todo valor monetário é `Money` VO com 2 casas decimais e moeda obrigatória. `number` é proibido para amounts.
2. **Invoice total é calculado, não armazenado:** `totalAmount = sum(items.totalPrice) - sum(discounts.value)`. Qualquer alteração em items ou discounts recalcula.
3. **Saldo sempre positivo:** `sum(discounts.value) < totalAmount` — desconto nunca pode zerar ou negativar a fatura.
4. **Pagamento não excede saldo:** `payment.amount <= invoice.remainingBalance()` — ninguém pode pagar mais que o devido.
5. **PIX QR Code expira:** Toda transação PIX tem `expiration` com default de 15 minutos (configurável por propriedade).
6. **Failed PIX = novo Payment:** Um pagamento PIX com status FAILED não pode ser "retentado" — um novo `Payment` deve ser criado.
7. **Fatura paga é terminal:** `Invoice` com status PAID não pode ser cancelada diretamente — pagamentos devem ser estornados primeiro.
8. **Payment CONFIRMED é irreversível (quase):** A única saída de CONFIRMED é REFUNDED via `refund()`, que cria uma transação de estorno separada.
9. **Audit trail imutável:** Toda operação financeira (criação, emissão, pagamento, estorno, cancelamento) gera um registro em `FinancialAudit` que nunca é alterado.
10. **Gateway é invisível ao domínio:** Nomes específicos de gateway (Stripe, Asaas, MercadoPago) NÃO aparecem no domínio. Portas usam `IGatewayTransactionPort`, `IPixGatewayPort`.
11. **Idempotência de webhook:** Webhooks duplicados com mesmo `endToEndId` ou `gatewayTransactionId` são ignorados (idempotent key).
12. **Invoice sem itens não é emitida:** `totalAmount` precisa ser > 0 para emitir (DRAFT → ISSUED).

---

## 7. Regras de Negócio (Given/When/Then)

### UC-01: Gerar Fatura da Reserva

```
Given uma reserva CONFIRMED com roomPrice = R$ 600 e 2 serviços de R$ 50 cada
When o sistema gera a fatura
Then uma Invoice é criada com status DRAFT
  And items contém: 1 item ROOM (R$ 600) + 2 items SERVICE (R$ 50 cada)
  And totalAmount = R$ 700
  And paidAmount = R$ 0

Given uma reserva que já possui fatura
When o sistema tenta gerar nova fatura
Then retorna erro "Reserva já possui fatura"

Given uma reserva com checkIn em 15/06/2025
When o sistema gera a fatura em 01/06/2025
Then dueDate = 08/06/2025 (checkIn - 7 dias)

Given uma reserva CANCELLED
When o sistema tenta gerar fatura
Then retorna erro "Reserva cancelada não pode gerar fatura"
```

### UC-02: Emitir Fatura (DRAFT → ISSUED)

```
Given uma fatura DRAFT com items e totalAmount = R$ 700
When o sistema emite a fatura
Then status muda para ISSUED
  And InvoiceNumber é gerado (ex: INV-202506-000001)
  And um evento InvoiceIssued é emitido
  And issuedAt é registrado

Given uma fatura DRAFT sem items (totalAmount = 0)
When o sistema tenta emitir
Then retorna erro "Fatura sem itens não pode ser emitida"

Given uma fatura já ISSUED
When o sistema tenta emitir novamente
Then retorna erro "Fatura já foi emitida"
```

### UC-03: Processar Pagamento PIX

```
Given uma fatura ISSUED com remainingBalance = R$ 500
When o hóspede paga R$ 500 via PIX
Then um Payment é criado com status PENDING, method = PIX, amount = R$ 500
  And um evento PaymentInitiated é emitido
  And o Payment transiciona para PROCESSING
  When o gateway confirma
  Then Payment → CONFIRMED, Invoice → PAID, PaymentConfirmed emitido

Given uma fatura ISSUED com remainingBalance = R$ 500
When o hóspede paga R$ 300 via PIX (parcial)
And o pagamento é confirmado
Then Invoice → PARTIALLY_PAID
  And paidAmount = R$ 300
  And remainingBalance = R$ 200

Given um pagamento PROCESSING
When o webhook do gateway chega com status de falha
Then Payment → FAILED
  And Invoice não muda de status
  And um evento PaymentFailed é emitido

Given um pagamento FAILED
When o sistema tenta confirmar
Then retorna erro "Pagamento falhou — crie um novo pagamento"
```

### UC-04: Processar Estorno

```
Given um pagamento CONFIRMED de R$ 500
  And Invoice está PAID
When o sistema estorna o pagamento
Then Payment → REFUNDED
  And um evento PaymentRefunded é emitido
  And Invoice.paidAmount = R$ 0
  And Invoice → ISSUED (se paidAmount = 0)

Given uma fatura com 2 pagamentos CONFIRMED (R$ 300 + R$ 200 = R$ 500)
When o sistema estorna apenas R$ 300
Then Payment de R$ 300 → REFUNDED
  And Invoice.paidAmount = R$ 200
  And Invoice permanece PARTIALLY_PAID

Given um pagamento PENDING
When o sistema tenta estornar
Then retorna erro "Pagamento não confirmado não pode ser estornado"
```

### UC-05: Cancelar Fatura

```
Given uma fatura ISSUED sem pagamentos
When o sistema cancela
Then Invoice → CANCELLED
  And um evento InvoiceCancelled é emitido
  And cancelledAt é registrado

Given uma fatura PARTIALLY_PAID (paidAmount = R$ 200)
When o sistema tenta cancelar
Then retorna erro "Fatura com pagamentos deve ser estornada antes"

Given uma fatura PAID
When o sistema tenta cancelar
Then retorna erro "Fatura com pagamentos deve ser estornada antes"
```

### UC-06: Conciliar Transação PIX (Webhook)

```
Given uma PixTransaction AWAITING_PAYMENT
When o webhook do gateway recebe confirmação com endToEndId = "E123456789"
Then PixTransaction → RECEIVED
  And endToEndId = "E123456789"
  And receivedAt é registrado
  And um evento PixReceived é emitido
  Then PixTransaction → CONFIRMED
  And Payment → CONFIRMED
  And Invoice.paidAmount += amount
  And Invoice → PAID ou PARTIALLY_PAID

Given um webhook com endToEndId já processado
When o webhook chega novamente
Then a transação é ignorada (idempotente)
  Nenhuma mudança de estado ocorre

Given uma PixTransaction EXPIRED
When o webhook chega após expiração
Then retorna erro "QR Code expirado — gere um novo pagamento"
  E a PixTransaction permanece EXPIRED
```

### UC-07: Marcar Fatura como Vencida

```
Given uma fatura ISSUED com dueDate = 01/06/2025
  And hoje = 02/06/2025
  And remainingBalance > 0
When o job diário de detecção de vencimento executa
Then Invoice → OVERDUE
  And um evento InvoiceOverdue é emitido
  And overdueAt é registrado

Given uma fatura OVERDUE
When o hóspede paga o valor total
Then Invoice → PAID (fluxo normal de pagamento UC-03)

Given uma fatura PAID
When o job diário executa
Then a fatura não é alterada
```

### UC-08: Listar Faturamento por Período

```
Given uma propriedade com 3 faturas em Junho/2025:
  - Fatura A: total = R$ 700, PAID
  - Fatura B: total = R$ 500, OVERDUE
  - Fatura C: total = R$ 300, PARTIALLY_PAID (paid = R$ 100)
When o sistema lista faturamento para mês 06/2025
Then retorna:
  - totalFaturado = R$ 1.500
  - totalPago = R$ 800
  - totalPendente = R$ 700
  - taxaInadimplencia = 46.67% (700/1500)

Given filtro de status = OVERDUE
When o sistema lista
Then retorna apenas faturas com status OVERDUE
```

---

## 8. Domain Services

### 8.1 InvoiceCalculationService

```typescript
interface InvoiceCalculationService {
  calculateTotal(items: InvoiceItem[]): Money
  applyDiscounts(total: Money, discounts: Discount[]): Result<Money, Error>
  calculateTaxes(total: Money, taxProfile: TaxProfile): Money
  generateInvoiceFromReservation(reservation: Reservation, services: ServiceItem[], billingPeriod: BillingPeriod): Result<Invoice, Error>
}
```

### 8.2 PaymentReconciliationService

```typescript
interface PaymentReconciliationService {
  reconcilePendingPayments(propertyId: string): Promise<Result<ReconciliationSummary, Error>>
  processWebhook(gatewayPayload: unknown): Promise<Result<void, Error>>
  handleIdempotency(key: string): Promise<Result<'processed' | 'duplicate', Error>>
}

interface ReconciliationSummary {
  totalPending: number
  reconciled: number
  failures: number
  details: Array<{ paymentId: string; status: string; reason?: string }>
}
```

### 8.3 OverdueDetectionService

```typescript
interface OverdueDetectionService {
  findOverdueInvoices(propertyId: string, referenceDate: Date): Promise<Invoice[]>
  markInvoicesAsOverdue(invoices: Invoice[]): Promise<Result<Invoice[], Error>>
}
```

### 8.4 PixQrCodeGenerationService (Domain Service que orquestra)

```typescript
interface PixQrCodeGenerationService {
  generatePixPayment(invoice: Invoice, pixKey: PixKey, expirationMinutes?: number): Promise<Result<Payment, Error>>
  // Orquestra: cria Payment + PixTransaction, chama IPixGatewayPort.generateQrCode
}
```

---

## 9. Repository Interfaces (Ports)

```typescript
interface IInvoiceRepository {
  save(invoice: Invoice): Promise<Invoice>
  findById(id: string): Promise<Invoice | null>
  findByProperty(propertyId: string, filters?: InvoiceFilters): Promise<Invoice[]>
  findByReservation(reservationId: string): Promise<Invoice | null>
  findByStatus(propertyId: string, status: InvoiceStatus): Promise<Invoice[]>
  findOverdue(referenceDate: Date): Promise<Invoice[]>
  findDraft(propertyId: string): Promise<Invoice[]>
  findDueInPeriod(propertyId: string, startDate: Date, endDate: Date): Promise<Invoice[]>
  countByProperty(propertyId: string, filters?: InvoiceFilters): Promise<number>
}

interface InvoiceFilters {
  status?: InvoiceStatus
  month?: number
  year?: number
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

interface IPaymentRepository {
  save(payment: Payment): Promise<Payment>
  findById(id: string): Promise<Payment | null>
  findByInvoice(invoiceId: string): Promise<Payment[]>
  findByStatus(status: PaymentStatus): Promise<Payment[]>
  findByGatewayTransactionId(gatewayTxnId: string): Promise<Payment | null>
  findPendingByProperty(propertyId: string): Promise<Payment[]>
}

interface IPixTransactionRepository {
  save(tx: PixTransaction): Promise<PixTransaction>
  findById(id: string): Promise<PixTransaction | null>
  findByEndToEndId(endToEndId: string): Promise<PixTransaction | null>
  findExpired(): Promise<PixTransaction[]>
  findByPaymentId(paymentId: string): Promise<PixTransaction | null>
}

interface IFinancialAuditRepository {
  save(entry: FinancialAuditEntry): Promise<FinancialAuditEntry>
  findByProperty(propertyId: string, filters?: AuditFilters): Promise<FinancialAuditEntry[]>
  findByDateRange(propertyId: string, startDate: Date, endDate: Date): Promise<FinancialAuditEntry[]>
}

// Porta de gateway (NÃO específica de Stripe/Asaas):
interface IGatewayTransactionPort {
  processPayment(payment: Payment, gatewayConfig: GatewayConfig): Promise<Result<GatewayResponse, Error>>
  refundTransaction(gatewayTxnId: string, amount: Money): Promise<Result<GatewayResponse, Error>>
  getTransactionStatus(gatewayTxnId: string): Promise<Result<GatewayTransactionStatus, Error>>
}

interface IPixGatewayPort {
  generateQrCode(amount: Money, pixKey: PixKey, expirationMinutes: number): Promise<Result<PixQrCodeData, Error>>
  checkTransactionStatus(endToEndId: string): Promise<Result<PixTransactionStatus, Error>>
}

interface PixQrCodeData {
  qrCode: string
  qrCodeBase64: string
  copyPasteKey: string
  expiration: Date
}

interface GatewayConfig {
  // Propriedades genéricas de configuração (NUNCA secrets/chaves — isso fica no infra)
  allowInstallments: boolean
  maxInstallments: number
  interestFreeLimit: number
}
```

---

## 10. API Contracts

### POST /api/financeiro/invoices

```typescript
// Request
{
  reservationId: string               // Obrigatório
  propertyId: string                  // Obrigatório
  additionalItems?: Array<{            // Opcional: serviços extras
    description: string
    quantity: number
    unitPrice: number
    type: InvoiceItemType             // default: SERVICE
  }>
}

// Response 201
{
  success: true,
  data: {
    id: string
    number: string | null
    propertyId: string
    reservationId: string
    guestName: string
    billingPeriod: { startDate: string; endDate: string; reference: string }
    dueDate: string
    items: Array<{
      id: string
      description: string
      quantity: number
      unitPrice: number
      totalPrice: number
      type: string
    }>
    totalAmount: number
    paidAmount: number
    discounts: Array<{ type: string; value: number; reason: string }>
    status: string
    createdAt: string
  }
}

// Response 400
{ success: false, error: "Reserva já possui fatura" }
// ou
{ success: false, error: "Reserva não encontrada" }
```

### PATCH /api/financeiro/invoices/[id]/issue

```typescript
// Response 200
{
  success: true,
  data: {
    id: string
    number: string          // INV-202506-000001
    status: "ISSUED"
    issuedAt: string
  }
}

// Response 400
{ success: false, error: "Fatura sem itens não pode ser emitida" }
// ou
{ success: false, error: "Fatura já foi emitida" }
```

### GET /api/financeiro/invoices

```typescript
// Query params
// ?propertyId=xxx&status=ISSUED&month=6&year=2025&limit=10&offset=0

// Response 200
{
  success: true,
  data: Array<{
    id: string
    number: string | null
    propertyId: string
    reservationId: string | null
    guestName: string
    billingPeriod: { startDate: string; endDate: string; reference: string }
    totalAmount: number
    paidAmount: number
    status: string
    dueDate: string
    issuedAt: string | null
    paidAt: string | null
    createdAt: string
  }>,
  meta: {
    total: number
    limit: number
    offset: number
  },
  summary?: {             // Se ?includeSummary=true
    totalFaturado: number
    totalPago: number
    totalPendente: number
    taxaInadimplencia: number
  }
}

// Response 400
{ success: false, error: "propertyId é obrigatório" }
```

### GET /api/financeiro/invoices/[id]

```typescript
// Response 200
{
  success: true,
  data: {
    id: string
    number: string | null
    propertyId: string
    reservationId: string | null
    guestName: string
    billingPeriod: { startDate: string; endDate: string; reference: string }
    items: Array<{
      id: string
      description: string
      quantity: number
      unitPrice: number
      totalPrice: number
      type: InvoiceItemType
    }>
    totalAmount: number
    paidAmount: number
    discounts: Array<{ type: string; value: number; reason: string }>
    status: InvoiceStatus
    dueDate: string
    issuedAt: string | null
    paidAt: string | null
    cancelledAt: string | null
    overdueAt: string | null
    createdAt: string
    payments: Array<{
      id: string
      amount: number
      method: string
      status: string
      paidAt: string | null
    }>
  }
}

// Response 404
{ success: false, error: "Fatura não encontrada" }
```

### POST /api/financeiro/invoices/[id]/cancel

```typescript
// Request
{
  reason: string    // Obrigatório, 10-500 caracteres
}

// Response 200
{
  success: true,
  data: {
    id: string
    status: "CANCELLED"
    cancelledAt: string
  }
}

// Response 400
{ success: false, error: "Fatura com pagamentos deve ser estornada antes" }
```

### POST /api/financeiro/payments/pix/initiate

```typescript
// Request
{
  invoiceId: string
  propertyId: string
  amount: number                      // Deve ser <= remainingBalance
}

// Response 201
{
  success: true,
  data: {
    paymentId: string
    pixTransaction: {
      qrCode: string
      qrCodeBase64: string
      copyPasteKey: string
      expiration: string
      amount: number
      status: "AWAITING_PAYMENT"
    }
    invoiceId: string
    amount: number
    status: "PROCESSING"
    expiresAt: string
  }
}

// Response 400
{ success: false, error: "Valor excede saldo remanescente da fatura" }
// ou
{ success: false, error: "Fatura não está em status de pagamento" }
```

### POST /api/financeiro/payments/[id]/refund

```typescript
// Response 200
{
  success: true,
  data: {
    id: string
    status: "REFUNDED"
    refundedAt: string
  }
}

// Response 400
{ success: false, error: "Pagamento não confirmado não pode ser estornado" }
```

### POST /api/webhooks/pix

```typescript
// Request (formato genérico — adaptado por adapter do gateway)
{
  gateway: string                       // "ASAAS" | "STRIPE" | "MERCADO_PAGO"
  event: string                         // "PAYMENT_CONFIRMED" | "PAYMENT_RECEIVED"
  payload: {
    endToEndId?: string
    gatewayTransactionId: string
    amount: number
    status: string
    externalReference?: string          // Nosso Payment.id
  }
}

// Response 200 (sempre 200 — webhook não deve retornar erro ao gateway)
{ success: true, status: "processed" }
// ou
{ success: true, status: "duplicate_ignored" }

// Response 200 também para erros de domínio:
{ success: true, status: "ignored", reason: "QR Code expirado" }
```

---

## 11. Eventos de Domínio

```typescript
interface InvoiceGenerated {
  invoiceId: string
  propertyId: string
  reservationId: string
  totalAmount: number
  itemCount: number
  timestamp: Date
}

interface InvoiceIssued {
  invoiceId: string
  invoiceNumber: string
  propertyId: string
  reservationId: string
  totalAmount: number
  dueDate: string
  timestamp: Date
}

interface InvoicePaid {
  invoiceId: string
  invoiceNumber: string
  propertyId: string
  reservationId: string
  totalAmount: number
  paidAmount: number
  paymentMethod: string
  paidAt: Date
  timestamp: Date
}

interface InvoiceCancelled {
  invoiceId: string
  invoiceNumber: string | null
  propertyId: string
  reservationId: string
  reason: string
  timestamp: Date
}

interface InvoiceOverdue {
  invoiceId: string
  invoiceNumber: string
  propertyId: string
  reservationId: string
  totalAmount: number
  remainingBalance: number
  dueDate: string
  overdueAt: Date
  timestamp: Date
}

interface PaymentInitiated {
  paymentId: string
  invoiceId: string
  propertyId: string
  amount: number
  method: string
  timestamp: Date
}

interface PaymentConfirmed {
  paymentId: string
  invoiceId: string
  propertyId: string
  amount: number
  method: string
  gatewayTransactionId: string
  paidAt: Date
  timestamp: Date
}

interface PaymentFailed {
  paymentId: string
  invoiceId: string
  propertyId: string
  amount: number
  method: string
  reason: string
  timestamp: Date
}

interface PaymentRefunded {
  paymentId: string
  invoiceId: string
  propertyId: string
  amount: number
  refundedAt: Date
  timestamp: Date
}

interface PixReceived {
  pixTransactionId: string
  paymentId: string
  endToEndId: string
  amount: number
  receivedAt: Date
  timestamp: Date
}

interface PixQrCodeExpired {
  pixTransactionId: string
  paymentId: string
  amount: number
  expiration: Date
  timestamp: Date
}
```

---

## 12. Erros Conhecidos no Código Atual (a serem corrigidos)

| # | Problema | Localização | Impacto |
|---|---|---|---|
| 1 | `Payment.amount` é `Float` no schema Prisma | `schema.prisma:247` | Perda de precisão, operações financeiras inseguras |
| 2 | `Invoice.totalAmount` é `Float` sem validação | `schema.prisma:478` | Fatura pode ter valor inconsistente com items |
| 3 | `Payment` não tem state machine — qualquer status transiciona pra qualquer outro | `schema.prisma` + código | Transições inválidas (FAILED → PAID) possíveis |
| 4 | `PaymentStatus` legacy: `PAID` em vez de `CONFIRMED` | `schema.prisma:1382` | Nomenclatura ambígua com Invoice.PAID |
| 5 | `Invoice.status` legacy: `PENDING` em vez de `DRAFT`/`ISSUED` | `schema.prisma:1401-1405` | Sem suporte a draft, parcial, overdue |
| 6 | `Invoice` sem `InvoiceNumber` — não gera identificação fiscal | `schema.prisma:472-484` | Fatura sem número de documento |
| 7 | `Invoice` sem `dueDate` | `schema.prisma:472-484` | Sem controle de vencimento |
| 8 | `Invoice` sem `paidAmount`, `discounts`, `items` calculados | Modelo anêmico | Domínio não valida total = soma dos itens |
| 9 | `Payment.reservationId` (unique) em vez de `invoiceId` | `schema.prisma:258` | Relacionamento errado — pagamento deve ser contra fatura |
| 10 | `PixTransaction` é modelo avulso sem relação com Payment | `schema.prisma:359-368` | Sem rastreabilidade PIX → Pagamento |
| 11 | `PixTransaction.status` é `String` sem enum | `schema.prisma:363` | Status livre sem validação |
| 12 | Nenhum audit trail financeiro integrado ao domínio | Ausente | Sem trilha de auditoria imutável |
| 13 | Sem idempotência para webhooks | Ausente | Webhooks duplicados podem gerar duplicidade |
| 14 | Sem suporte a pagamento parcial | Código atual | `paidAmount` no Payment não reflete na Invoice |
| 15 | `Invoice.totalAmount` nunca é validado contra `sum(InvoiceItem.amount)` | Modelo anêmico | Inconsistências silenciosas |
| 16 | `InvoiceItem.amount` é `Float`, `InvoiceItemType` é `PACKAGE_FEE`/`BOOKING_COMMISSION` | `schema.prisma:491,1408-1410` | Tipos inadequados para domínio de hospedagem |
| 17 | Sem split de pagamento ou parcelamento no domínio | Ausente | Expansão futura requerida |

---

## 13. Critérios de Aceitação para Refatoração

- [ ] `Money` VO implementado com `Result` para criação, operações aritméticas e validação de moeda
- [ ] `Invoice` é aggregate root com `static create()`, private constructor, `Result` return
- [ ] `Payment` é aggregate root com state machine rigorosa (FAILED → CONFIRMED bloqueado)
- [ ] `PixTransaction` parte do aggregate Payment com state machine própria
- [ ] `IInvoiceRepository` usa `findByGatewayTransactionId` genérico (não `findByStripeId`/`findByAsaasId`)
- [ ] `IPaymentRepository` não menciona gateway específico
- [ ] `IGatewayTransactionPort` é interface genérica (não `StripePort`)
- [ ] `POST /api/financeiro/invoices` gera fatura com items calculados da reserva
- [ ] `POST /api/financeiro/invoices/[id]/issue` valida DRAFT → ISSUED com InvoiceNumber
- [ ] `POST /api/financeiro/payments/pix/initiate` gera QR Code com expiração
- [ ] `POST /api/webhooks/pix` é idempotente (endToEndId duplicado ignorado)
- [ ] `Invoice.totalAmount` é calculado = `sum(items.totalPrice) - sum(discounts.value)` (nunca armazenado como Float)
- [ ] `Invoice.registerPayment()` acumula `paidAmount` e transiciona status corretamente
- [ ] Pagamento parcial funciona: Invoice → PARTIALLY_PAID, remainingBalance correto
- [ ] Estorno reduz `paidAmount` da Invoice e transiciona status
- [ ] `InvoiceOverdue` é detectado por job e dispara evento
- [ ] `FinancialAudit` registra toda operação (criação, emissão, pagamento, estorno, cancelamento)
- [ ] 100% dos testes de domínio rodam sem banco (InMemory repositories)
- [ ] Nenhum `@prisma/client` importado em arquivos de domínio (`src/domain/financeiro/`) ou aplicação (`src/application/financeiro/`)
- [ ] Nenhum nome de gateway (Stripe, Asaas, MercadoPago) aparece em arquivos de domínio
- [ ] PIX QR Code expirado não pode ser pago (validação na entidade)
- [ ] Fatura PAID não pode ser cancelada sem estornar

---

## 14. Plano de Small Batches

### SB1: Value Objects + Enums + Entities + Events + domain tests (~10 arquivos, ~60 testes)
- `src/domain/financeiro/value-objects/Money.ts` (reutiliza conceitos de MonetaryValue)
- `src/domain/financeiro/value-objects/InvoiceNumber.ts`
- `src/domain/financeiro/value-objects/PixKey.ts`
- `src/domain/financeiro/value-objects/Discount.ts`
- `src/domain/financeiro/value-objects/Installment.ts`
- `src/domain/financeiro/value-objects/BillingPeriod.ts`
- `src/domain/financeiro/value-objects/TransactionReference.ts`
- `src/domain/financeiro/entities/Invoice.ts` + `InvoiceItem.ts`
- `src/domain/financeiro/entities/Payment.ts` + `PixTransaction.ts`
- `src/domain/financeiro/enums.ts` (InvoiceStatus, PaymentStatus, PixStatus, etc.)
- `src/domain/financeiro/events.ts` (todos os 11 eventos)
- `__tests__/domain/financeiro/` (VOs + entities + state machines)

### SB2: Domain Services + Ports + Use Cases + InMemory repos (~12 arquivos)
- `InvoiceCalculationService`
- `PaymentReconciliationService`
- `OverdueDetectionService`
- `PixQrCodeGenerationService`
- `IInvoiceRepository`, `IPaymentRepository`, `IPixTransactionRepository`, `IFinancialAuditRepository`
- `IGatewayTransactionPort`, `IPixGatewayPort`
- 8 Use Cases (GerarFatura, EmitirFatura, ProcessarPagamentoPIX, ProcessarEstorno, CancelarFatura, ConciliarTransacaoPIX, MarcarVencida, ListarFaturamento)
- InMemory repositories
- Testes de integração de domínio (Use Cases com InMemory)

### SB3: Prisma adapters + Controllers + Route refatoração + Webhook handlers (~8 arquivos)
- `PrismaInvoiceRepository` + `PrismaPaymentRepository` + `PrismaPixTransactionRepository`
- Novos modelos Prisma (ou migração dos existentes) para refletir o domínio rico
- `InvoiceControllerFactory`, `PaymentControllerFactory`
- `src/app/api/financeiro/invoices/route.ts` (GET + POST)
- `src/app/api/financeiro/invoices/[id]/route.ts` (GET + PATCH + cancel)
- `src/app/api/financeiro/payments/pix/initiate/route.ts` (POST)
- `src/app/api/financeiro/payments/[id]/refund/route.ts` (POST)
- `src/app/api/webhooks/pix/route.ts` (POST)
- Migração do schema: Payment → invoiceId (FK), Invoice → dueDate + InvoiceNumber + status expandido

---

## 15. Glossário de Termos Técnicos

| Termo | Significado |
|---|---|
| **Aggregate Root** | Entidade raiz que garante consistência do aggregate (Invoice, Payment) |
| **Value Object** | Objeto imutável definido por seus atributos, não por identidade |
| **Domain Event** | Algo que aconteceu no domínio que outros contextos precisam saber |
| **Port** | Interface que define contrato com o mundo externo (repositório, gateway) |
| **Use Case** | Fluxo de interação que orquestra entidades e serviços |
| **Gateway** | Serviço externo de processamento de pagamentos (abstraído por port) |
| **InMemory Repository** | Implementação fake de repositório para testes sem banco |
| **EndToEndId** | Identificador único de ponta a ponta de uma transação PIX no BACEN |
| **QR Code** | Código bidimensional que codifica dados de pagamento instantâneo |
| **Idempotência** | Garantia de que uma operação processada múltiplas vezes tem o mesmo efeito |
| **Audit Trail** | Trilha de auditoria imutável de todas as operações financeiras |
| **State Machine** | Grafo de transições de estado com regras explícitas de transições válidas |
| **Remaining Balance** | Saldo remanescente = totalAmount - paidAmount |
| **BRL** | Código ISO 4217 para Real Brasileiro |
| **Conciliação** | Processo de conferência entre registros internos e dados do gateway |
| **SB (Small Batch)** | Lote pequeno de implementação com entrega atômica |
| **InvoiceNumber** | Identificador fiscal da fatura (INV-YYYYMM-NNNNNN) |
| **Copy-Paste Key** | Código PIX copia-e-cola (BR Code payload) |
