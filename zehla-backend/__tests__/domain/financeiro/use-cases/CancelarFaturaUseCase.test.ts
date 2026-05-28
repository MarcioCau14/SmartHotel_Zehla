import { describe, it, expect, beforeEach } from 'vitest'
import { CancelarFaturaUseCase } from '../../../../src/application/financeiro/use-cases/CancelarFaturaUseCase'
import { GerarFaturaUseCase } from '../../../../src/application/financeiro/use-cases/GerarFaturaUseCase'
import { EmitirFaturaUseCase } from '../../../../src/application/financeiro/use-cases/EmitirFaturaUseCase'
import { InMemoryInvoiceRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InMemoryPaymentRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryPaymentRepository'
import { InvoiceItemType, PaymentMethod } from '../../../../src/domain/financeiro/enums'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'
import { Payment } from '../../../../src/domain/financeiro/entities/Payment'

describe('CancelarFaturaUseCase', () => {
  let invoiceRepo: InMemoryInvoiceRepository
  let paymentRepo: InMemoryPaymentRepository
  let gerarUseCase: GerarFaturaUseCase
  let emitirUseCase: EmitirFaturaUseCase
  let useCase: CancelarFaturaUseCase

  beforeEach(() => {
    invoiceRepo = new InMemoryInvoiceRepository()
    paymentRepo = new InMemoryPaymentRepository()
    gerarUseCase = new GerarFaturaUseCase(invoiceRepo)
    emitirUseCase = new EmitirFaturaUseCase(invoiceRepo)
    useCase = new CancelarFaturaUseCase(invoiceRepo, paymentRepo)
  })

  async function createIssuedInvoice(): Promise<string> {
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
    const emitirResult = await emitirUseCase.execute({ invoiceId: gerarResult.value.id })
    return emitirResult.value.id
  }

  it('should cancel an issued invoice', async () => {
    const invoiceId = await createIssuedInvoice()
    const result = await useCase.execute({ invoiceId, reason: 'Cancelamento por solicitação do hóspede' })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('CANCELLED')
    expect(result.value.events.length).toBeGreaterThan(0)
    expect(result.value.events[0].eventName).toBe('InvoiceCancelled')
  })

  it('should fail if invoice not found', async () => {
    const result = await useCase.execute({ invoiceId: 'non-existent', reason: 'Motivo' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrada')
  })

  it('should fail if invoice has active payments', async () => {
    const invoiceId = await createIssuedInvoice()
    const amount = Money.create(600).value
    const payment = Payment.create({
      id: crypto.randomUUID(),
      invoiceId,
      method: PaymentMethod.CREDIT_CARD,
      amount,
    }).value
    payment.initiate()
    payment.confirm('gateway-123')
    await paymentRepo.save(payment)

    const result = await useCase.execute({ invoiceId, reason: 'Motivo qualquer' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('pagamentos')
  })

  it('should fail with short cancel reason', async () => {
    const invoiceId = await createIssuedInvoice()
    const result = await useCase.execute({ invoiceId, reason: 'ab' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('reason')
  })
})
