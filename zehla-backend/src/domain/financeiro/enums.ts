export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PixStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  RECEIVED = 'RECEIVED',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum InvoiceItemType {
  ROOM = 'ROOM',
  SERVICE = 'SERVICE',
  TAX = 'TAX',
  DISCOUNT = 'DISCOUNT',
  OTHER = 'OTHER',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  CHARGEBACK = 'CHARGEBACK',
  ADJUSTMENT = 'ADJUSTMENT',
}

export const INVOICE_STATUS_TRANSITIONS: Map<InvoiceStatus, InvoiceStatus[]> = new Map([
  [InvoiceStatus.DRAFT, [InvoiceStatus.ISSUED, InvoiceStatus.CANCELLED]],
  [InvoiceStatus.ISSUED, [InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED]],
  [InvoiceStatus.PARTIALLY_PAID, [InvoiceStatus.PAID, InvoiceStatus.OVERDUE]],
  [InvoiceStatus.PAID, []],
  [InvoiceStatus.CANCELLED, []],
  [InvoiceStatus.OVERDUE, []],
])

export const PAYMENT_STATUS_TRANSITIONS: Map<PaymentStatus, PaymentStatus[]> = new Map([
  [PaymentStatus.PENDING, [PaymentStatus.PROCESSING, PaymentStatus.CANCELLED]],
  [PaymentStatus.PROCESSING, [PaymentStatus.CONFIRMED, PaymentStatus.FAILED, PaymentStatus.CANCELLED]],
  [PaymentStatus.CONFIRMED, [PaymentStatus.REFUNDED]],
  [PaymentStatus.FAILED, []],
  [PaymentStatus.REFUNDED, []],
  [PaymentStatus.CANCELLED, []],
])

export const PIX_STATUS_TRANSITIONS: Map<PixStatus, PixStatus[]> = new Map([
  [PixStatus.AWAITING_PAYMENT, [PixStatus.RECEIVED, PixStatus.EXPIRED]],
  [PixStatus.RECEIVED, [PixStatus.CONFIRMED]],
  [PixStatus.CONFIRMED, [PixStatus.REFUNDED]],
  [PixStatus.EXPIRED, []],
  [PixStatus.REFUNDED, []],
])

export function canTransitionInvoiceStatus(
  current: InvoiceStatus,
  target: InvoiceStatus
): boolean {
  return INVOICE_STATUS_TRANSITIONS.get(current)?.includes(target) ?? false
}

export function canTransitionPaymentStatus(
  current: PaymentStatus,
  target: PaymentStatus
): boolean {
  return PAYMENT_STATUS_TRANSITIONS.get(current)?.includes(target) ?? false
}

export function canTransitionPixStatus(
  current: PixStatus,
  target: PixStatus
): boolean {
  return PIX_STATUS_TRANSITIONS.get(current)?.includes(target) ?? false
}
