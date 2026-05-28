import { describe, it, expect, beforeEach } from 'vitest'
import { GerarFaturaUseCase } from '../../../../src/application/financeiro/use-cases/GerarFaturaUseCase'
import { InMemoryInvoiceRepository } from '../../../../src/infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InvoiceItemType } from '../../../../src/domain/financeiro/enums'

describe('GerarFaturaUseCase', () => {
  let invoiceRepo: InMemoryInvoiceRepository
  let useCase: GerarFaturaUseCase

  const validInput = {
    reservationId: 'res-1',
    guestId: 'guest-1',
    propertyId: 'prop-1',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-05'),
    items: [
      { description: 'Diária Standard', type: InvoiceItemType.ROOM, unitPrice: 200, quantity: 4 },
      { description: 'Café da manhã', type: InvoiceItemType.SERVICE, unitPrice: 50, quantity: 2 },
    ],
  }

  beforeEach(() => {
    invoiceRepo = new InMemoryInvoiceRepository()
    useCase = new GerarFaturaUseCase(invoiceRepo)
  })

  it('should create invoice from reservation', async () => {
    const result = await useCase.execute(validInput)
    expect(result.isOk).toBe(true)
    expect(result.value.id).toBeDefined()
    expect(result.value.number).toMatch(/^INV-\d{6}-\d{6}$/)
    expect(result.value.totalAmount).toBe(900)
    expect(result.value.status).toBe('DRAFT')
  })

  it('should fail if reservation already has invoice', async () => {
    await useCase.execute(validInput)
    const result = await useCase.execute(validInput)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('já possui fatura')
  })

  it('should fail with invalid data - missing guestId', async () => {
    const result = await useCase.execute({ ...validInput, guestId: '' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Guest ID')
  })

  it('should fail with invalid billing period', async () => {
    const result = await useCase.execute({
      ...validInput,
      startDate: new Date('2025-06-10'),
      endDate: new Date('2025-06-05'),
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('startDate')
  })

  it('should fail with zero unit price for non-discount item', async () => {
    const result = await useCase.execute({
      ...validInput,
      items: [{ description: 'Item Grátis', type: InvoiceItemType.ROOM, unitPrice: 0, quantity: 1 }],
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Unit price')
  })

  it('should fail with negative quantity', async () => {
    const result = await useCase.execute({
      ...validInput,
      items: [{ description: 'Item', type: InvoiceItemType.ROOM, unitPrice: 100, quantity: 0 }],
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Quantity')
  })

  it('should persist invoice in repository', async () => {
    await useCase.execute(validInput)
    const found = await invoiceRepo.findByReservation('res-1')
    expect(found).not.toBeNull()
    expect(found!.guestId).toBe('guest-1')
    expect(found!.items.length).toBe(2)
  })

  it('should generate sequential invoice numbers', async () => {
    const r1 = await useCase.execute({ ...validInput, reservationId: 'res-1' })
    const r2 = await useCase.execute({ ...validInput, reservationId: 'res-2', guestId: 'guest-2' })
    expect(r1.isOk).toBe(true)
    expect(r2.isOk).toBe(true)
    const seq1 = parseInt(r1.value.number.split('-')[2], 10)
    const seq2 = parseInt(r2.value.number.split('-')[2], 10)
    expect(seq2).toBeGreaterThan(seq1)
  })
})
