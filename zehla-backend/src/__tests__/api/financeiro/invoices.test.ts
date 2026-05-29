import { describe, it, expect, beforeEach } from 'vitest'
import { FinanceiroControllerFactory } from '../../../infrastructure/http/financeiro/FinanceiroControllerFactory'
import { InMemoryInvoiceRepository } from '../../../infrastructure/persistence/financeiro/InMemoryInvoiceRepository'
import { InMemoryPaymentRepository } from '../../../infrastructure/persistence/financeiro/InMemoryPaymentRepository'
import { InMemoryPixTransactionRepository } from '../../../infrastructure/persistence/financeiro/InMemoryPixTransactionRepository'
import { FakePixGateway } from '../../../infrastructure/persistence/financeiro/FakePixGateway'
import { buildGet, buildPost, parseResponse } from '../../helpers/http-test'
import { GET, POST } from '../../../app/api/financeiro/invoices/route'
import { POST as issuePOST } from '../../../app/api/financeiro/invoices/[id]/issue/route'
import { POST as cancelPOST } from '../../../app/api/financeiro/invoices/[id]/cancel/route'
import { POST as pixInitiatePOST } from '../../../app/api/financeiro/payments/pix/initiate/route'
import { POST as refundPOST } from '../../../app/api/financeiro/payments/[id]/refund/route'

async function createInvoice(propertyId: string = 'prop-1'): Promise<string> {
  const req = buildPost('/api/financeiro/invoices', {
    reservationId: 'res-1', guestId: 'guest-1', propertyId,
    startDate: '2026-06-01T00:00:00Z', endDate: '2026-06-05T00:00:00Z',
    items: [{ description: 'Diária', type: 'ROOM', unitPrice: 200, quantity: 4 }],
  })
  const res = await POST(req)
  const { body } = await parseResponse(res)
  return body.data.id
}

describe('GET /api/financeiro/invoices', () => {
  const invoiceRepo = new InMemoryInvoiceRepository()
  const paymentRepo = new InMemoryPaymentRepository()
  const pixTxRepo = new InMemoryPixTransactionRepository()

  beforeEach(() => {
    invoiceRepo.clear()
    FinanceiroControllerFactory.configure({ invoiceRepo, paymentRepo, pixTxRepo })
  })

  it('deve retornar 400 quando propertyId não for informado', async () => {
    const req = buildGet('/api/financeiro/invoices')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('propertyId')
  })

  it('deve retornar 200 com lista vazia quando não há faturas', async () => {
    const req = buildGet('/api/financeiro/invoices?propertyId=prop-1')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.items).toEqual([])
    expect(body.total).toBe(0)
  })

  it('deve retornar 200 com faturas cadastradas', async () => {
    const id = await createInvoice('prop-1')

    const req = buildGet('/api/financeiro/invoices?propertyId=prop-1')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.items).toHaveLength(1)
    expect(body.total).toBe(1)
    expect(body.summary.totalFaturado).toBe(800)
  })
})

describe('POST /api/financeiro/invoices', () => {
  const invoiceRepo = new InMemoryInvoiceRepository()

  beforeEach(() => {
    invoiceRepo.clear()
    FinanceiroControllerFactory.configure({ invoiceRepo })
  })

  it('deve retornar 400 quando campos obrigatórios faltarem', async () => {
    const req = buildPost('/api/financeiro/invoices', {})
    const res = await POST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('deve retornar 201 quando fatura for gerada com sucesso', async () => {
    const req = buildPost('/api/financeiro/invoices', {
      reservationId: 'res-1', guestId: 'guest-1', propertyId: 'prop-1',
      startDate: '2026-06-01T00:00:00Z', endDate: '2026-06-05T00:00:00Z',
      items: [{ description: 'Diária', type: 'ROOM', unitPrice: 200, quantity: 4 }],
    })
    const res = await POST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.number).toBeDefined()
    expect(body.data.totalAmount).toBe(800)
    expect(body.data.status).toBe('DRAFT')
  })

  it('deve retornar 409 quando reserva já possui fatura', async () => {
    await createInvoice()
    const req = buildPost('/api/financeiro/invoices', {
      reservationId: 'res-1', guestId: 'guest-1', propertyId: 'prop-1',
      startDate: '2026-06-01T00:00:00Z', endDate: '2026-06-05T00:00:00Z',
      items: [{ description: 'Diária', type: 'ROOM', unitPrice: 200, quantity: 4 }],
    })
    const res = await POST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(409)
    expect(body.success).toBe(false)
  })
})

describe('POST /api/financeiro/invoices/:id/issue', () => {
  const invoiceRepo = new InMemoryInvoiceRepository()

  beforeEach(() => {
    invoiceRepo.clear()
    FinanceiroControllerFactory.configure({ invoiceRepo })
  })

  it('deve retornar 404 quando fatura não existir', async () => {
    const req = buildPost('/api/financeiro/invoices/notfound/issue', {})
    const res = await issuePOST(req, { params: Promise.resolve({ id: 'notfound' }) })
    const { status, body } = await parseResponse(res)
    expect(status).toBe(404)
    expect(body.success).toBe(false)
  })

  it('deve retornar 200 quando fatura for emitida', async () => {
    const id = await createInvoice()
    const req = buildPost(`/api/financeiro/invoices/${id}/issue`, {})
    const res = await issuePOST(req, { params: Promise.resolve({ id }) })
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('ISSUED')
    expect(body.data.issuedAt).toBeDefined()
  })
})

describe('POST /api/financeiro/invoices/:id/cancel', () => {
  const invoiceRepo = new InMemoryInvoiceRepository()

  beforeEach(() => {
    invoiceRepo.clear()
    FinanceiroControllerFactory.configure({ invoiceRepo })
  })

  it('deve retornar 400 quando motivo for muito curto', async () => {
    const id = await createInvoice()
    const req = buildPost(`/api/financeiro/invoices/${id}/cancel`, { reason: 'ab' })
    const res = await cancelPOST(req, { params: Promise.resolve({ id }) })
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('deve retornar 404 quando fatura não existir', async () => {
    const req = buildPost('/api/financeiro/invoices/notfound/cancel', { reason: 'Motivo válido' })
    const res = await cancelPOST(req, { params: Promise.resolve({ id: 'notfound' }) })
    const { status, body } = await parseResponse(res)
    expect(status).toBe(404)
    expect(body.success).toBe(false)
  })

  it('deve retornar 200 quando fatura for cancelada', async () => {
    const id = await createInvoice()
    const req = buildPost(`/api/financeiro/invoices/${id}/cancel`, { reason: 'Cliente desistiu' })
    const res = await cancelPOST(req, { params: Promise.resolve({ id }) })
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('CANCELLED')
  })
})

describe('POST /api/financeiro/payments/pix/initiate', () => {
  const invoiceRepo = new InMemoryInvoiceRepository()
  const paymentRepo = new InMemoryPaymentRepository()
  const pixTxRepo = new InMemoryPixTransactionRepository()

  beforeEach(() => {
    invoiceRepo.clear()
    paymentRepo.clear()
    pixTxRepo.clear()
    FinanceiroControllerFactory.configure({ invoiceRepo, paymentRepo, pixTxRepo })
  })

  it('deve retornar 400 quando campos obrigatórios faltarem', async () => {
    const req = buildPost('/api/financeiro/payments/pix/initiate', {})
    const res = await pixInitiatePOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('deve retornar 404 quando fatura não existir', async () => {
    const req = buildPost('/api/financeiro/payments/pix/initiate', {
      invoiceId: 'notfound', propertyId: 'prop-1', amount: 800,
      pixKeyType: 'CPF', pixKeyValue: '12345678901',
    })
    const res = await pixInitiatePOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(404)
    expect(body.success).toBe(false)
  })

  it('deve retornar 201 quando PIX for iniciado com sucesso', async () => {
    const id = await createInvoice()
    const issueReq = buildPost(`/api/financeiro/invoices/${id}/issue`, {})
    await issuePOST(issueReq, { params: Promise.resolve({ id }) })

    const req = buildPost('/api/financeiro/payments/pix/initiate', {
      invoiceId: id, propertyId: 'prop-1', amount: 800,
      pixKeyType: 'EMAIL', pixKeyValue: 'teste@example.com',
    })
    const res = await pixInitiatePOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.paymentId).toBeDefined()
    expect(body.data.qrCode).toBeDefined()
    expect(body.data.status).toBe('CONFIRMED')
  })
})

describe('POST /api/financeiro/payments/:id/refund', () => {
  const invoiceRepo = new InMemoryInvoiceRepository()
  const paymentRepo = new InMemoryPaymentRepository()
  const pixTxRepo = new InMemoryPixTransactionRepository()

  beforeEach(() => {
    invoiceRepo.clear()
    paymentRepo.clear()
    pixTxRepo.clear()
    FinanceiroControllerFactory.configure({ invoiceRepo, paymentRepo, pixTxRepo })
  })

  it('deve retornar 404 quando pagamento não existir', async () => {
    const req = buildPost('/api/financeiro/payments/notfound/refund', {})
    const res = await refundPOST(req, { params: Promise.resolve({ id: 'notfound' }) })
    const { status, body } = await parseResponse(res)
    expect(status).toBe(404)
    expect(body.success).toBe(false)
  })
})
