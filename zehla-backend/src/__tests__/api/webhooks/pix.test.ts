import { describe, it, expect, beforeEach } from 'vitest'
import { FinanceiroControllerFactory } from '../../../infrastructure/http/financeiro/FinanceiroControllerFactory'
import { InMemoryInvoiceRepository } from '../../../infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InMemoryPaymentRepository } from '../../../infrastructure/persistence/financeiro/InMemoryPaymentRepository'
import { InMemoryPixTransactionRepository } from '../../../infrastructure/persistence/financeiro/InMemoryPixTransactionRepository'
import { FakePixGateway } from '../../../infrastructure/persistence/financeiro/FakePixGateway'
import { buildPost, parseResponse } from '../../helpers/http-test'
import { POST as webhookPOST } from '../../../app/api/webhooks/pix/route'
import { Invoice } from '../../../domain/financeiro/entities/Invoice'
import { InvoiceNumber } from '../../../domain/financeiro/value-objects/InvoiceNumber'
import { BillingPeriod } from '../../../domain/financeiro/value-objects/BillingPeriod'
import { PixTransaction } from '../../../domain/financeiro/entities/PixTransaction'
import { Payment } from '../../../domain/financeiro/entities/Payment'
import { PixKey, PixKeyType } from '../../../domain/financeiro/value-objects/PixKey'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { PaymentMethod, PaymentStatus, InvoiceItemType } from '../../../domain/financeiro/enums'
import { InvoiceItem } from '../../../domain/financeiro/entities/InvoiceItem'

async function createInvoice(): Promise<Invoice> {
  const numberResult = InvoiceNumber.generate(6, 2026, 1)
  const number = numberResult.value
  const bpResult = BillingPeriod.create(new Date('2026-06-01'), new Date('2026-06-05'))
  const bp = bpResult.value
  const result = Invoice.create({ id: crypto.randomUUID(), number, guestId: 'guest-w-1', reservationId: 'res-w-1', billingPeriod: bp })
  const invoice = result.value
  const itemResult = InvoiceItem.create({
    id: crypto.randomUUID(), description: 'Diária',
    type: InvoiceItemType.ROOM, unitPrice: Money.create(200).value, quantity: 4,
  })
  invoice.addItem(itemResult.value)
  invoice.issue()
  return invoice
}

describe('POST /api/webhooks/pix', () => {
  const invoiceRepo = new InMemoryInvoiceRepository()
  const paymentRepo = new InMemoryPaymentRepository()
  const pixTxRepo = new InMemoryPixTransactionRepository()

  beforeEach(() => {
    invoiceRepo.clear()
    paymentRepo.clear()
    pixTxRepo.clear()
    FinanceiroControllerFactory.configure({ invoiceRepo, paymentRepo, pixTxRepo })
  })

  it('deve retornar 200 com invalid_payload quando payload estiver incompleto', async () => {
    const req = buildPost('/api/webhooks/pix', { gateway: 'fake', event: 'pix.received', payload: {} })
    const res = await webhookPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.status).toBe('invalid_payload')
  })

  it('deve retornar 200 com processed quando transação for conciliada', async () => {
    const invoice = await createInvoice()
    await invoiceRepo.save(invoice)

    const pixKeyResult = PixKey.create(PixKeyType.EMAIL, 'teste@example.com')
    const pixKey = pixKeyResult.value
    const amount = Money.create(800).value

    const pixTxResult = PixTransaction.create({
      id: crypto.randomUUID(),
      pixKey,
      amount,
      description: 'Pagamento via PIX',
      qrCode: 'fake-qr',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    })
    const pixTx = pixTxResult.value
    await pixTxRepo.save(pixTx)

    const payment = Payment.restore({
      id: crypto.randomUUID(),
      invoiceId: invoice.id,
      status: PaymentStatus.PROCESSING,
      method: PaymentMethod.PIX,
      amount,
      gatewayTransactionId: 'gtx-webhook-test',
      failureReason: null,
      pixTransaction: pixTx,
      processedAt: null,
      createdAt: new Date(),
    })
    await paymentRepo.save(payment)

    const webReq = buildPost('/api/webhooks/pix', {
      gateway: 'fake', event: 'pix.received',
      payload: {
        endToEndId: 'E2E123',
        gatewayTransactionId: 'gtx-webhook-test',
        amount: 800,
        status: 'CONFIRMED',
      },
    })
    const res = await webhookPOST(webReq)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.status).toBe('processed')
  })
})
