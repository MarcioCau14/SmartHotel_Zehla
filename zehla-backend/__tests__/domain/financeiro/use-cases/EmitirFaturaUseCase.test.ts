import { describe, it, expect, beforeEach } from 'vitest'
import { EmitirFaturaUseCase } from '../../../../src/application/financeiro/use-cases/EmitirFaturaUseCase'
import { GerarFaturaUseCase } from '../../../../src/application/financeiro/use-cases/GerarFaturaUseCase'
import { InMemoryInvoiceRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InvoiceItemType } from '../../../../src/domain/financeiro/enums'

describe('EmitirFaturaUseCase', () => {
  let invoiceRepo: InMemoryInvoiceRepository
  let gerarUseCase: GerarFaturaUseCase
  let useCase: EmitirFaturaUseCase

  beforeEach(() => {
    invoiceRepo = new InMemoryInvoiceRepository()
    gerarUseCase = new GerarFaturaUseCase(invoiceRepo)
    useCase = new EmitirFaturaUseCase(invoiceRepo)
  })

  async function createDraftInvoice(): Promise<string> {
    const result = await gerarUseCase.execute({
      reservationId: 'res-1',
      guestId: 'guest-1',
      propertyId: 'prop-1',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-05'),
      items: [
        { description: 'Diária', type: InvoiceItemType.ROOM, unitPrice: 200, quantity: 3 },
      ],
    })
    return result.value.id
  }

  it('should issue a draft invoice', async () => {
    const invoiceId = await createDraftInvoice()
    const result = await useCase.execute({ invoiceId })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('ISSUED')
    expect(result.value.issuedAt).toBeInstanceOf(Date)
    expect(result.value.events.length).toBeGreaterThan(0)
    expect(result.value.events[0].eventName).toBe('InvoiceIssued')
  })

  it('should fail if invoice not found', async () => {
    const result = await useCase.execute({ invoiceId: 'non-existent' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrada')
  })

  it('should fail if invoice has no items', async () => {
    const idResult = await invoiceRepo.save(
      (await import('../../../../src/domain/financeiro/entities/Invoice')).Invoice.create({
        id: crypto.randomUUID(),
        number: (await import('../../../../src/domain/financeiro/value-objects/InvoiceNumber')).InvoiceNumber.generate(6, 2025, 1).value,
        guestId: 'guest-1',
        reservationId: 'res-empty',
        billingPeriod: (await import('../../../../src/domain/financeiro/value-objects/BillingPeriod')).BillingPeriod.create(
          new Date('2025-06-01'), new Date('2025-06-05')
        ).value,
      }).value,
      'prop-1'
    )
    const result = await useCase.execute({ invoiceId: idResult.id })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('items')
  })

  it('should fail if already issued', async () => {
    const invoiceId = await createDraftInvoice()
    await useCase.execute({ invoiceId })
    const result = await useCase.execute({ invoiceId })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Cannot issue')
  })

  it('should persist changes after issuing', async () => {
    const invoiceId = await createDraftInvoice()
    await useCase.execute({ invoiceId })
    const saved = await invoiceRepo.findById(invoiceId)
    expect(saved).not.toBeNull()
    expect(saved!.status).toBe('ISSUED')
    expect(saved!.issuedAt).toBeInstanceOf(Date)
  })
})
