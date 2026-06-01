import { describe, it, expect, beforeEach } from 'vitest'
import { MarcarFaturaVencidaUseCase } from '../../../../src/application/financeiro/use-cases/MarcarFaturaVencidaUseCase'
import { GerarFaturaUseCase } from '../../../../src/application/financeiro/use-cases/GerarFaturaUseCase'
import { EmitirFaturaUseCase } from '../../../../src/application/financeiro/use-cases/EmitirFaturaUseCase'
import { InMemoryInvoiceRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InvoiceItemType, InvoiceStatus } from '../../../../src/domain/financeiro/enums'

describe('MarcarFaturaVencidaUseCase', () => {
  let invoiceRepo: InMemoryInvoiceRepository
  let gerarUseCase: GerarFaturaUseCase
  let emitirUseCase: EmitirFaturaUseCase
  let useCase: MarcarFaturaVencidaUseCase

  beforeEach(() => {
    invoiceRepo = new InMemoryInvoiceRepository()
    gerarUseCase = new GerarFaturaUseCase(invoiceRepo)
    emitirUseCase = new EmitirFaturaUseCase(invoiceRepo)
    useCase = new MarcarFaturaVencidaUseCase(invoiceRepo)
  })

  async function createInvoiceWithPastBilling(): Promise<string> {
    const pastStart = new Date('2025-01-01')
    const pastEnd = new Date('2025-01-05')
    const gerarResult = await gerarUseCase.execute({
      reservationId: 'res-1',
      guestId: 'guest-1',
      propertyId: 'prop-1',
      startDate: pastStart,
      endDate: pastEnd,
      items: [
        { description: 'Diária', type: InvoiceItemType.ROOM, unitPrice: 200, quantity: 3 },
      ],
    })
    const invoiceId = gerarResult.value.id
    await emitirUseCase.execute({ invoiceId })
    return invoiceId
  }

  it('should mark a specific invoice as overdue', async () => {
    const invoiceId = await createInvoiceWithPastBilling()
    const result = await useCase.execute({ invoiceId })
    expect(result.isOk).toBe(true)
    expect(result.value.processed).toBe(1)

    const saved = await invoiceRepo.findById(invoiceId)
    expect(saved!.status).toBe(InvoiceStatus.OVERDUE)
    expect(saved!.overdueAt).toBeInstanceOf(Date)
  })

  it('should fail if invoice not found', async () => {
    const result = await useCase.execute({ invoiceId: 'non-existent' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrada')
  })

  it('should not mark paid invoices as overdue', async () => {
    const invoiceId = await createInvoiceWithPastBilling()
    await useCase.execute({ invoiceId })
    const result = await useCase.execute({ invoiceId })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Cannot mark overdue')
  })
})
