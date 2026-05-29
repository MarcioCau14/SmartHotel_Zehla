import { describe, it, expect, beforeEach } from 'vitest'
import { ListarFaturamentoUseCase } from '../../../../src/application/financeiro/use-cases/ListarFaturamentoUseCase'
import { GerarFaturaUseCase } from '../../../../src/application/financeiro/use-cases/GerarFaturaUseCase'
import { EmitirFaturaUseCase } from '../../../../src/application/financeiro/use-cases/EmitirFaturaUseCase'
import { InMemoryInvoiceRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InvoiceItemType, InvoiceStatus } from '../../../../src/domain/financeiro/enums'

describe('ListarFaturamentoUseCase', () => {
  let invoiceRepo: InMemoryInvoiceRepository
  let gerarUseCase: GerarFaturaUseCase
  let emitirUseCase: EmitirFaturaUseCase
  let useCase: ListarFaturamentoUseCase

  beforeEach(async () => {
    invoiceRepo = new InMemoryInvoiceRepository()
    gerarUseCase = new GerarFaturaUseCase(invoiceRepo)
    emitirUseCase = new EmitirFaturaUseCase(invoiceRepo)
    useCase = new ListarFaturamentoUseCase(invoiceRepo)

    const r1 = await gerarUseCase.execute({
      reservationId: 'res-1',
      guestId: 'guest-1',
      propertyId: 'prop-1',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-05'),
      items: [{ description: 'Diária', type: InvoiceItemType.ROOM, unitPrice: 200, quantity: 3 }],
    })
    await emitirUseCase.execute({ invoiceId: r1.value.id })

    await gerarUseCase.execute({
      reservationId: 'res-2',
      guestId: 'guest-2',
      propertyId: 'prop-1',
      startDate: new Date('2025-06-10'),
      endDate: new Date('2025-06-15'),
      items: [{ description: 'Suite', type: InvoiceItemType.ROOM, unitPrice: 500, quantity: 5 }],
    })
    await gerarUseCase.execute({
      reservationId: 'res-3',
      guestId: 'guest-3',
      propertyId: 'prop-2',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-03'),
      items: [{ description: 'Diária', type: InvoiceItemType.ROOM, unitPrice: 150, quantity: 2 }],
    })
  })

  it('should list invoices for a property', async () => {
    const result = await useCase.execute({ propertyId: 'prop-1' })
    expect(result.isOk).toBe(true)
    expect(result.value.items.length).toBe(2)
    expect(result.value.total).toBe(2)
  })

  it('should return empty list for property with no invoices', async () => {
    const result = await useCase.execute({ propertyId: 'prop-3' })
    expect(result.isOk).toBe(true)
    expect(result.value.items.length).toBe(0)
    expect(result.value.total).toBe(0)
  })

  it('should filter by status', async () => {
    const result = await useCase.execute({
      propertyId: 'prop-1',
      status: InvoiceStatus.ISSUED,
    })
    expect(result.isOk).toBe(true)
    expect(result.value.items.length).toBe(1)
  })

  it('should return summary with totals', async () => {
    const result = await useCase.execute({ propertyId: 'prop-1' })
    expect(result.isOk).toBe(true)
    expect(result.value.summary.totalFaturado).toBe(3100)
    expect(result.value.summary.totalPago).toBe(0)
    expect(result.value.summary.totalPendente).toBe(3100)
  })
})
