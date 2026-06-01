import { describe, it, expect, beforeEach } from 'vitest'
import { Invoice } from '../../../../src/domain/financeiro/entities/Invoice'
import { InvoiceItem } from '../../../../src/domain/financeiro/entities/InvoiceItem'
import { InvoiceNumber } from '../../../../src/domain/financeiro/value-objects/InvoiceNumber'
import { BillingPeriod } from '../../../../src/domain/financeiro/value-objects/BillingPeriod'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'
import { Discount } from '../../../../src/domain/financeiro/value-objects/Discount'
import { InvoiceStatus, DiscountType, InvoiceItemType } from '../../../../src/domain/financeiro/enums'

function createValidInvoice() {
  const number = InvoiceNumber.generate(3, 2026, 1).value
  const period = BillingPeriod.create(new Date('2026-03-01'), new Date('2026-03-05')).value
  return Invoice.create({
    id: 'inv-1',
    number,
    guestId: 'guest-1',
    reservationId: 'res-1',
    billingPeriod: period,
  }).value
}

function createItem(overrides: Partial<{ id: string; description: string; type: InvoiceItemType; unitPrice: Money; quantity: number }> = {}) {
  return InvoiceItem.create({
    id: overrides.id ?? 'item-1',
    description: overrides.description ?? 'Diária',
    type: overrides.type ?? InvoiceItemType.ROOM,
    unitPrice: overrides.unitPrice ?? Money.create(200).value,
    quantity: overrides.quantity ?? 3,
  }).value
}

function createDiscount(percentage: number, reason: string) {
  return Discount.create({
    type: DiscountType.PERCENTAGE,
    percentage,
    reason,
  }).value
}

describe('Invoice', () => {
  describe('create', () => {
    it('should create valid invoice as DRAFT', () => {
      const inv = createValidInvoice()
      expect(inv.status).toBe(InvoiceStatus.DRAFT)
      expect(inv.id).toBe('inv-1')
      expect(inv.guestId).toBe('guest-1')
    })

    it('should fail without id', () => {
      const number = InvoiceNumber.generate(3, 2026, 1).value
      const period = BillingPeriod.create(new Date('2026-03-01'), new Date('2026-03-05')).value
      const result = Invoice.create({ id: '', number, guestId: 'g-1', reservationId: 'r-1', billingPeriod: period })
      expect(result.isFail).toBe(true)
    })
  })

  describe('items', () => {
    it('should add item', () => {
      const inv = createValidInvoice()
      const item = createItem()
      const result = inv.addItem(item)
      expect(result.isOk).toBe(true)
      expect(inv.items).toHaveLength(1)
    })

    it('should remove item', () => {
      const inv = createValidInvoice()
      const item = createItem()
      inv.addItem(item)
      const result = inv.removeItem('item-1')
      expect(result.isOk).toBe(true)
      expect(inv.items).toHaveLength(0)
    })

    it('should fail to remove non-existent item', () => {
      const inv = createValidInvoice()
      const result = inv.removeItem('non-existent')
      expect(result.isFail).toBe(true)
    })
  })

  describe('discounts', () => {
    it('should apply discount', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem())
      const disc = createDiscount(10, 'Promoção')
      const result = inv.applyDiscount(disc)
      expect(result.isOk).toBe(true)
      expect(inv.discounts).toHaveLength(1)
    })
  })

  describe('issue', () => {
    it('should issue DRAFT invoice', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem())
      const result = inv.issue()
      expect(result.isOk).toBe(true)
      expect(inv.status).toBe(InvoiceStatus.ISSUED)
      expect(inv.issuedAt).toBeInstanceOf(Date)
    })

    it('should fail to issue without items', () => {
      const inv = createValidInvoice()
      const result = inv.issue()
      expect(result.isFail).toBe(true)
    })

    it('should fail to issue already issued invoice', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem())
      inv.issue()
      const result = inv.issue()
      expect(result.isFail).toBe(true)
    })
  })

  describe('totalAmount', () => {
    it('should calculate totalAmount = sum(items) - sum(discounts)', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem({ unitPrice: Money.create(200).value, quantity: 3 })) // 600
      inv.addItem(createItem({ id: 'item-2', description: 'Café', type: InvoiceItemType.SERVICE, unitPrice: Money.create(50).value, quantity: 1 })) // 50
      const disc = createDiscount(10, '10% off')
      inv.applyDiscount(disc)
      // total = (600 + 50) - 10% of 650 = 650 - 65 = 585
      expect(inv.totalAmount.amount).toBe(585)
    })

    it('should be zero for empty invoice', () => {
      const inv = createValidInvoice()
      expect(inv.totalAmount.amount).toBe(0)
    })
  })

  describe('registerPayment', () => {
    it('should register partial payment (ISSUED → PARTIALLY_PAID)', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem({ unitPrice: Money.create(200).value, quantity: 3 })) // 600
      inv.issue()
      const result = inv.registerPayment(Money.create(200).value)
      expect(result.isOk).toBe(true)
      expect(inv.status).toBe(InvoiceStatus.PARTIALLY_PAID)
      expect(inv.paidAmount.amount).toBe(200)
    })

    it('should register full payment (ISSUED → PAID)', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem({ unitPrice: Money.create(200).value, quantity: 3 })) // 600
      inv.issue()
      const result = inv.registerPayment(Money.create(600).value)
      expect(result.isOk).toBe(true)
      expect(inv.status).toBe(InvoiceStatus.PAID)
    })

    it('should fail when payment exceeds remaining balance', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem({ unitPrice: Money.create(200).value, quantity: 3 })) // 600
      inv.issue()
      const result = inv.registerPayment(Money.create(700).value)
      expect(result.isFail).toBe(true)
    })

    it('should fail when registering payment on DRAFT invoice', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem())
      const result = inv.registerPayment(Money.create(100).value)
      expect(result.isFail).toBe(true)
    })

    it('should fail with zero payment', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem())
      inv.issue()
      const result = inv.registerPayment(Money.zero())
      expect(result.isFail).toBe(true)
    })
  })

  describe('cancel', () => {
    it('should cancel ISSUED invoice', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem())
      inv.issue()
      const result = inv.cancel('Guest cancelled reservation')
      expect(result.isOk).toBe(true)
      expect(inv.status).toBe(InvoiceStatus.CANCELLED)
      expect(inv.cancelReason).toBe('Guest cancelled reservation')
    })

    it('should fail to cancel PAID invoice', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem({ unitPrice: Money.create(200).value, quantity: 3 }))
      inv.issue()
      inv.registerPayment(Money.create(600).value)
      const result = inv.cancel('Need refund first')
      expect(result.isFail).toBe(true)
    })

    it('should fail with short reason', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem())
      inv.issue()
      const result = inv.cancel('AB')
      expect(result.isFail).toBe(true)
    })
  })

  describe('markOverdue', () => {
    it('should mark ISSUED invoice as overdue', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem())
      inv.issue()
      const result = inv.markOverdue()
      expect(result.isOk).toBe(true)
      expect(inv.status).toBe(InvoiceStatus.OVERDUE)
    })

    it('should mark PARTIALLY_PAID invoice as overdue', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem({ unitPrice: Money.create(200).value, quantity: 3 }))
      inv.issue()
      inv.registerPayment(Money.create(200).value)
      const result = inv.markOverdue()
      expect(result.isOk).toBe(true)
      expect(inv.status).toBe(InvoiceStatus.OVERDUE)
    })

    it('should fail to mark DRAFT as overdue', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem())
      const result = inv.markOverdue()
      expect(result.isFail).toBe(true)
    })
  })

  describe('utility methods', () => {
    it('should check if fully paid', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem({ unitPrice: Money.create(200).value, quantity: 3 }))
      inv.issue()
      expect(inv.isFullyPaid()).toBe(false)
      inv.registerPayment(Money.create(600).value)
      expect(inv.isFullyPaid()).toBe(true)
    })

    it('should calculate remaining balance', () => {
      const inv = createValidInvoice()
      inv.addItem(createItem({ unitPrice: Money.create(200).value, quantity: 3 })) // 600
      inv.issue()
      expect(inv.remainingBalance().amount).toBe(600)
      inv.registerPayment(Money.create(200).value)
      expect(inv.remainingBalance().amount).toBe(400)
    })
  })
})
