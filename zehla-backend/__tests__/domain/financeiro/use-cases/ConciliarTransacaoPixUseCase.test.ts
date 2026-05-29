import { describe, it, expect, beforeEach } from 'vitest'
import { ConciliarTransacaoPixUseCase } from '../../../../src/application/financeiro/use-cases/ConciliarTransacaoPixUseCase'
import { GerarFaturaUseCase } from '../../../../src/application/financeiro/use-cases/GerarFaturaUseCase'
import { EmitirFaturaUseCase } from '../../../../src/application/financeiro/use-cases/EmitirFaturaUseCase'
import { InMemoryInvoiceRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InMemoryPaymentRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryPaymentRepository'
import { InMemoryPixTransactionRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryPixTransactionRepository'
import { InvoiceItemType, PaymentMethod } from '../../../../src/domain/financeiro/enums'
import { PixKeyType } from '../../../../src/domain/financeiro/value-objects/PixKey'
import { PixKey } from '../../../../src/domain/financeiro/value-objects/PixKey'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'
import { PixTransaction } from '../../../../src/domain/financeiro/entities/PixTransaction'
import { Payment } from '../../../../src/domain/financeiro/entities/Payment'

describe('ConciliarTransacaoPixUseCase', () => {
  let invoiceRepo: InMemoryInvoiceRepository
  let paymentRepo: InMemoryPaymentRepository
  let pixTransactionRepo: InMemoryPixTransactionRepository
  let gerarUseCase: GerarFaturaUseCase
  let emitirUseCase: EmitirFaturaUseCase
  let useCase: ConciliarTransacaoPixUseCase

  beforeEach(() => {
    invoiceRepo = new InMemoryInvoiceRepository()
    paymentRepo = new InMemoryPaymentRepository()
    pixTransactionRepo = new InMemoryPixTransactionRepository()
    gerarUseCase = new GerarFaturaUseCase(invoiceRepo)
    emitirUseCase = new EmitirFaturaUseCase(invoiceRepo)
    useCase = new ConciliarTransacaoPixUseCase(pixTransactionRepo, paymentRepo, invoiceRepo)
  })

  async function createPaymentWithPixPreConfirmed(): Promise<{
    invoiceId: string
    paymentId: string
    pixTransactionId: string
    gatewayTransactionId: string
  }> {
    const gerarResult = await gerarUseCase.execute({
      reservationId: 'res-1',
      guestId: 'guest-1',
      propertyId: 'prop-1',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-04'),
      items: [
        { description: 'Diária', type: InvoiceItemType.ROOM, unitPrice: 200, quantity: 3 },
      ],
    })
    const invoiceId = gerarResult.value.id
    await emitirUseCase.execute({ invoiceId })

    const amount = Money.create(600).value
    const pixKey = PixKey.create(PixKeyType.EMAIL, 'teste@email.com').value
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    const pixTx = PixTransaction.create({
      id: crypto.randomUUID(),
      pixKey,
      amount,
      description: 'Pagamento',
      qrCode: 'pixdata://qr',
      expiresAt,
    }).value
    await pixTransactionRepo.save(pixTx)

    const payment = Payment.create({
      id: crypto.randomUUID(),
      invoiceId,
      method: PaymentMethod.PIX,
      amount,
      pixTransaction: pixTx,
    }).value
    payment.initiate()
    payment.clearEvents()
    const gatewayTxnId = `gtxn-${Date.now()}`
    await paymentRepo.save(payment)

    const paymentAny = payment as any
    paymentAny.data.gatewayTransactionId = gatewayTxnId

    return { invoiceId, paymentId: payment.id, pixTransactionId: pixTx.id, gatewayTransactionId: gatewayTxnId }
  }

  it('should reconcile a PIX webhook', async () => {
    const { invoiceId, gatewayTransactionId } = await createPaymentWithPixPreConfirmed()
    const result = await useCase.execute({
      endToEndId: 'E2E123456789',
      gatewayTransactionId,
      amount: 600,
      status: 'CONFIRMED',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.result).toBe('conciliated')

    const savedInvoice = await invoiceRepo.findById(invoiceId)
    expect(savedInvoice!.paidAmount.toNumber()).toBe(600)
    expect(savedInvoice!.status).toBe('PAID')
  })

  it('should be idempotent for duplicate endToEndId', async () => {
    const { gatewayTransactionId } = await createPaymentWithPixPreConfirmed()
    await useCase.execute({
      endToEndId: 'E2E-DUP',
      gatewayTransactionId,
      amount: 600,
      status: 'CONFIRMED',
    })
    const result = await useCase.execute({
      endToEndId: 'E2E-DUP',
      gatewayTransactionId,
      amount: 600,
      status: 'CONFIRMED',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.result).toBe('duplicate_ignored')
  })

  it('should fail if payment not found for gatewayTransactionId', async () => {
    const result = await useCase.execute({
      endToEndId: 'E2E-XYZ',
      gatewayTransactionId: 'non-existent',
      amount: 600,
      status: 'CONFIRMED',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrado')
  })

  it('should fail for expired QR code', async () => {
    const amount = Money.create(600).value
    const pixKey = PixKey.create(PixKeyType.EMAIL, 'teste@email.com').value
    const expiredDate = new Date(Date.now() - 60 * 60 * 1000)
    const pixTx = PixTransaction.create({
      id: crypto.randomUUID(),
      pixKey,
      amount,
      description: 'Expirado',
      qrCode: 'pixdata://qr',
      expiresAt: expiredDate,
    }).value
    await pixTransactionRepo.save(pixTx)

    const gerarResult = await gerarUseCase.execute({
      reservationId: 'res-2',
      guestId: 'guest-1',
      propertyId: 'prop-1',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-04'),
      items: [
        { description: 'Diária', type: InvoiceItemType.ROOM, unitPrice: 200, quantity: 3 },
      ],
    })
    const invoiceId = gerarResult.value.id
    await emitirUseCase.execute({ invoiceId })

    const payment = Payment.create({
      id: crypto.randomUUID(),
      invoiceId,
      method: PaymentMethod.PIX,
      amount,
      pixTransaction: pixTx,
    }).value
    payment.initiate()
    const gatewayTxnId = 'gtxn-expired'
    const paymentAny = payment as any
    paymentAny.data.gatewayTransactionId = gatewayTxnId
    await paymentRepo.save(payment)

    const result = await useCase.execute({
      endToEndId: 'E2E-EXPIRED',
      gatewayTransactionId: gatewayTxnId,
      amount: 600,
      status: 'CONFIRMED',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('expirado')
  })

  it('should emit events on successful reconciliation', async () => {
    const { gatewayTransactionId } = await createPaymentWithPixPreConfirmed()
    const result = await useCase.execute({
      endToEndId: 'E2E-EVENTS',
      gatewayTransactionId,
      amount: 600,
      status: 'CONFIRMED',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.events.length).toBeGreaterThan(0)
    const eventNames = result.value.events.map(e => e.eventName)
    expect(eventNames).toContain('PixTransactionReceived')
    expect(eventNames).toContain('PixTransactionConfirmed')
    expect(eventNames).toContain('PaymentConfirmed')
    expect(eventNames).toContain('InvoicePaymentRegistered')
  })

  it('should update payment and invoice status', async () => {
    const { paymentId, invoiceId, gatewayTransactionId } = await createPaymentWithPixPreConfirmed()
    const result = await useCase.execute({
      endToEndId: 'E2E-STATUS',
      gatewayTransactionId,
      amount: 600,
      status: 'CONFIRMED',
    })
    expect(result.isOk).toBe(true)
    const savedPayment = await paymentRepo.findById(paymentId)
    expect(savedPayment!.status).toBe('CONFIRMED')
    expect(savedPayment!.gatewayTransactionId).toBe(gatewayTransactionId)

    const savedInvoice = await invoiceRepo.findById(invoiceId)
    expect(savedInvoice!.status).toBe('PAID')
  })
})
