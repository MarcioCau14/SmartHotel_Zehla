import { describe, it, expect, beforeEach } from 'vitest'
import { ProcessarPagamentoPixUseCase } from '../../../../src/application/financeiro/use-cases/ProcessarPagamentoPixUseCase'
import { GerarFaturaUseCase } from '../../../../src/application/financeiro/use-cases/GerarFaturaUseCase'
import { EmitirFaturaUseCase } from '../../../../src/application/financeiro/use-cases/EmitirFaturaUseCase'
import { InMemoryInvoiceRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InMemoryPaymentRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryPaymentRepository'
import { InMemoryPixTransactionRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryPixTransactionRepository'
import { InvoiceItemType, PaymentMethod } from '../../../../src/domain/financeiro/enums'
import { PixKeyType } from '../../../../src/domain/financeiro/value-objects/PixKey'
import { Result } from '../../../../src/domain/shared/Result'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'
import { PixKey } from '../../../../src/domain/financeiro/value-objects/PixKey'

class MockPixGateway {
  generateQrCode = async (_amount: Money, _pixKey: PixKey, _expirationMinutes: number) => {
    return Result.ok({
      qrCode: 'pixdata://qr-code-string',
      qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUg...',
      copyPasteKey: '00020126580014br.gov.bcb.pix0136abc123',
      expiration: new Date(Date.now() + 30 * 60 * 1000),
    })
  }
  checkTransactionStatus = async (_endToEndId: string) => {
    return Result.ok({ status: 'CONFIRMED', settled: true })
  }
}

describe('ProcessarPagamentoPixUseCase', () => {
  let invoiceRepo: InMemoryInvoiceRepository
  let paymentRepo: InMemoryPaymentRepository
  let pixTransactionRepo: InMemoryPixTransactionRepository
  let pixGateway: MockPixGateway
  let gerarUseCase: GerarFaturaUseCase
  let emitirUseCase: EmitirFaturaUseCase
  let useCase: ProcessarPagamentoPixUseCase

  beforeEach(() => {
    invoiceRepo = new InMemoryInvoiceRepository()
    paymentRepo = new InMemoryPaymentRepository()
    pixTransactionRepo = new InMemoryPixTransactionRepository()
    pixGateway = new MockPixGateway()
    gerarUseCase = new GerarFaturaUseCase(invoiceRepo)
    emitirUseCase = new EmitirFaturaUseCase(invoiceRepo)
    useCase = new ProcessarPagamentoPixUseCase(invoiceRepo, paymentRepo, pixTransactionRepo, pixGateway)
  })

  async function createIssuedInvoice(amount: number = 600): Promise<string> {
    const gerarResult = await gerarUseCase.execute({
      reservationId: 'res-1',
      guestId: 'guest-1',
      propertyId: 'prop-1',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-04'),
      items: [
        { description: 'Diária', type: InvoiceItemType.ROOM, unitPrice: amount / 3, quantity: 3 },
      ],
    })
    const emitirResult = await emitirUseCase.execute({ invoiceId: gerarResult.value.id })
    return emitirResult.value.id
  }

  it('should create PIX payment with QR code', async () => {
    const invoiceId = await createIssuedInvoice()
    const result = await useCase.execute({
      invoiceId,
      amount: 600,
      pixKeyType: PixKeyType.EMAIL,
      pixKeyValue: 'cliente@email.com',
      description: 'Pagamento de fatura',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.paymentId).toBeDefined()
    expect(result.value.qrCode).toBe('pixdata://qr-code-string')
    expect(result.value.copyPasteKey).toContain('000201')
    expect(result.value.status).toBe('PROCESSING')
  })

  it('should fail if invoice not found', async () => {
    const result = await useCase.execute({
      invoiceId: 'non-existent',
      amount: 100,
      pixKeyType: PixKeyType.EMAIL,
      pixKeyValue: 'cliente@email.com',
      description: 'Teste',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrada')
  })

  it('should fail if amount exceeds remaining balance', async () => {
    const invoiceId = await createIssuedInvoice(300)
    const result = await useCase.execute({
      invoiceId,
      amount: 500,
      pixKeyType: PixKeyType.EMAIL,
      pixKeyValue: 'cliente@email.com',
      description: 'Pagamento acima do saldo',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('excede')
  })

  it('should process partial payment', async () => {
    const invoiceId = await createIssuedInvoice(600)
    const result = await useCase.execute({
      invoiceId,
      amount: 200,
      pixKeyType: PixKeyType.EMAIL,
      pixKeyValue: 'cliente@email.com',
      description: 'Pagamento parcial',
    })
    expect(result.isOk).toBe(true)
    const savedInvoice = await invoiceRepo.findById(invoiceId)
    expect(savedInvoice).not.toBeNull()
    expect(savedInvoice!.paidAmount.toNumber()).toBe(200)
  })

  it('should fail with invalid Pix key', async () => {
    const invoiceId = await createIssuedInvoice()
    const result = await useCase.execute({
      invoiceId,
      amount: 100,
      pixKeyType: PixKeyType.CPF,
      pixKeyValue: '123',
      description: 'Chave inválida',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('CPF')
  })

  it('should persist payment and pix transaction', async () => {
    const invoiceId = await createIssuedInvoice()
    const result = await useCase.execute({
      invoiceId,
      amount: 600,
      pixKeyType: PixKeyType.EMAIL,
      pixKeyValue: 'cliente@email.com',
      description: 'Pagamento total',
    })
    expect(result.isOk).toBe(true)
    const savedPayment = await paymentRepo.findById(result.value.paymentId)
    expect(savedPayment).not.toBeNull()
    expect(savedPayment!.method).toBe(PaymentMethod.PIX)
    expect(savedPayment!.status).toBe('PROCESSING')
  })

  it('should emit events during payment flow', async () => {
    const invoiceId = await createIssuedInvoice()
    const result = await useCase.execute({
      invoiceId,
      amount: 600,
      pixKeyType: PixKeyType.EMAIL,
      pixKeyValue: 'cliente@email.com',
      description: 'Pagamento',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.events.length).toBeGreaterThan(0)
    const eventNames = result.value.events.map(e => e.eventName)
    expect(eventNames).toContain('InvoicePaymentRegistered')
  })
})
