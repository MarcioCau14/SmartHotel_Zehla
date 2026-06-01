import { describe, it, expect, beforeEach } from 'vitest'
import { ProcessarEstornoUseCase } from '../../../../src/application/financeiro/use-cases/ProcessarEstornoUseCase'
import { GerarFaturaUseCase } from '../../../../src/application/financeiro/use-cases/GerarFaturaUseCase'
import { EmitirFaturaUseCase } from '../../../../src/application/financeiro/use-cases/EmitirFaturaUseCase'
import { InMemoryInvoiceRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InMemoryPaymentRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryPaymentRepository'
import { InvoiceItemType, PaymentMethod, PaymentStatus } from '../../../../src/domain/financeiro/enums'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'
import { Payment } from '../../../../src/domain/financeiro/entities/Payment'

describe('ProcessarEstornoUseCase', () => {
  let invoiceRepo: InMemoryInvoiceRepository
  let paymentRepo: InMemoryPaymentRepository
  let gerarUseCase: GerarFaturaUseCase
  let emitirUseCase: EmitirFaturaUseCase
  let useCase: ProcessarEstornoUseCase

  beforeEach(() => {
    invoiceRepo = new InMemoryInvoiceRepository()
    paymentRepo = new InMemoryPaymentRepository()
    gerarUseCase = new GerarFaturaUseCase(invoiceRepo)
    emitirUseCase = new EmitirFaturaUseCase(invoiceRepo)
    useCase = new ProcessarEstornoUseCase(paymentRepo, invoiceRepo)
  })

  async function createConfirmedPayment(): Promise<{ paymentId: string; invoiceId: string }> {
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
    const payment = Payment.create({
      id: crypto.randomUUID(),
      invoiceId,
      method: PaymentMethod.CREDIT_CARD,
      amount,
    }).value
    payment.initiate()
    payment.confirm('gateway-txn-123')
    payment.clearEvents()
    await paymentRepo.save(payment)
    const invoice = await invoiceRepo.findById(invoiceId)!
    const invoiceAny = invoice as any
    invoiceAny.data.paidAmount = amount
    await invoiceRepo.save(invoice!)

    return { paymentId: payment.id, invoiceId }
  }

  it('should refund a confirmed payment and reduce invoice paid amount', async () => {
    const { paymentId, invoiceId } = await createConfirmedPayment()

    const result = await useCase.execute({ paymentId })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(PaymentStatus.REFUNDED)

    const savedPayment = await paymentRepo.findById(paymentId)
    expect(savedPayment!.status).toBe(PaymentStatus.REFUNDED)

    const savedInvoice = await invoiceRepo.findById(invoiceId)
    expect(savedInvoice!.paidAmount.toNumber()).toBe(0)
  })

  it('should fail if payment not found', async () => {
    const result = await useCase.execute({ paymentId: 'non-existent' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrado')
  })

  it('should fail if payment is already refunded', async () => {
    const { paymentId } = await createConfirmedPayment()
    await useCase.execute({ paymentId })
    const result = await useCase.execute({ paymentId })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Cannot refund')
  })

  it('should emit refund event', async () => {
    const { paymentId } = await createConfirmedPayment()
    const result = await useCase.execute({ paymentId })
    expect(result.isOk).toBe(true)
    expect(result.value.events.length).toBeGreaterThan(0)
    expect(result.value.events[0].eventName).toBe('PaymentRefunded')
  })
})
