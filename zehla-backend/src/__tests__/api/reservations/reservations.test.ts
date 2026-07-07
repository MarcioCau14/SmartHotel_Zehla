// Test file for Reservations API - Clean syntax version
import { describe, it, expect, beforeEach } from 'vitest'
import { clearMockSession, setMockSession } from '@/__tests__/setup'

import { ReservationControllerFactory } from '../../../infrastructure/http/reservation/ReservationControllerFactory'
import { InMemoryReservationRepository } from '../../../infrastructure/persistence/reservation/InMemoryReservationRepository'
import { InMemoryRoomRepository } from '../../../infrastructure/persistence/reservation/InMemoryRoomRepository'
import { InMemoryPaymentRepository } from '../../../infrastructure/persistence/reservation/InMemoryPaymentRepository'
import { InMemoryEventBus } from '../../../infrastructure/persistence/reservation/InMemoryEventBus'
import { Reservation } from '../../../domain/reservation/entities/Reservation'
import { DateRange } from '../../../domain/reservation/value-objects/DateRange'
import { Money } from '../../../domain/reservation/value-objects/Money'
import { GuestInfo } from '../../../domain/reservation/value-objects/GuestInfo'
import { RoomStatus } from '../../../application/reservation/ports/IRoomRepository'
import { PricingBreakdown } from '../../../domain/reservation/value-objects/PricingBreakdown'
import { Payment } from '../../../domain/reservation/entities/Payment'
import { PaymentMethod } from '../../../domain/reservation/PaymentMethod'
import { buildGet, buildPost, parseResponse } from '../../helpers/http-test'
import { GET, PATCH } from '../../../app/api/reservations/route'

async function seedReservation(repo: InMemoryReservationRepository): Promise<Reservation> {
  const periodResult = DateRange.create(new Date('2026-08-01'), new Date('2026-08-03'))
  const period = periodResult.value
  const guestResult = GuestInfo.create({ name: 'Ana', phone: '11999999999' })
  const guest = guestResult.value
  const priceResult = Money.create(400)
  const price = priceResult.value
  const pricingBreakdownResult = PricingBreakdown.create({
    roomPrice: price,
    nights: 2,
    discount: Money.ZERO,
    pricingRulesApplied: [],
  })
  const pricingBreakdown = pricingBreakdownResult.value
  const reservationResult = Reservation.create({
    id: 'res-1', propertyId: 'prop-1', roomId: 'room-1',
    guestInfo: guest, period: period, pricing: pricingBreakdown,
  })
  const reservation = reservationResult.value
  
  // Apply full payment to enable check-in
  const paymentResult = Payment.create({
    id: 'pay-1',
    reservationId: reservation.id,
    propertyId: 'prop-1',
    amount: pricingBreakdown.total,
    method: PaymentMethod.PIX,
  })
  if (paymentResult.isOk) {
    const payment = paymentResult.value
    const confirmResult = payment.confirm()
    if (confirmResult.isOk) {
      const applyResult = reservation.applyPayment(payment.amount)
      if (applyResult.isFail) {
        throw new Error(`Failed to apply payment: ${applyResult.error}`)
      }
    }
  }
  
  await repo.save(reservation)
  return reservation
}

describe('GET /api/reservations', () => {
  const reservationRepo = new InMemoryReservationRepository()
  const roomRepo = new InMemoryRoomRepository()
  const paymentRepo = new InMemoryPaymentRepository()
  const eventBus = new InMemoryEventBus()

  beforeEach(() => {
    clearMockSession()
    reservationRepo.clear()
    roomRepo.clear()
    paymentRepo.clear()
    eventBus.clear()
    ReservationControllerFactory.configure({ reservationRepo, roomRepo, paymentRepo, eventBus })
  })

  it('deve retornar 401 quando não autenticado', async () => {
    const req = buildGet('/api/reservations?propertyId=prop-1')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(401)
    expect(body.error).toContain('Não autorizado')
  })

  it('deve retornar 200 com lista vazia quando não há reservas', async () => {
    // Set mock session for authenticated request
    setMockSession({ user: { id: 'user-1', name: 'Test User' } })
    const req = buildGet('/api/reservations?propertyId=prop-1')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body).toEqual([])
  })

  it('deve retornar 200 com reservas cadastradas', async () => {
    // Set mock session for authenticated request
    setMockSession({ user: { id: 'user-1', name: 'Test User' } })
    const reservation = await seedReservation(reservationRepo)
    const req = buildGet('/api/reservations?propertyId=prop-1')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body).toHaveLength(1)
    // Validate that the code follows the domain pattern (ZEH- followed by timestamp)
    expect(body[0].code).toMatch(/^ZEH-\d+$/)
    expect(body[0].status).toBe('CONFIRMED') // Reservation.create sets status to CONFIRMED
  })
})

describe('PATCH /api/reservations', () => {
  const reservationRepo = new InMemoryReservationRepository()
  const roomRepo = new InMemoryRoomRepository()
  const paymentRepo = new InMemoryPaymentRepository()
  const eventBus = new InMemoryEventBus()

  beforeEach(() => {
    clearMockSession()
    reservationRepo.clear()
    roomRepo.clear()
    paymentRepo.clear()
    eventBus.clear()
    ReservationControllerFactory.configure({ reservationRepo, roomRepo, paymentRepo, eventBus })
  })

  it('deve retornar 400 com ação inválida', async () => {
    // Set mock session for authenticated request
    setMockSession({ user: { id: 'user-1', name: 'Test User' } })
    const req = buildPost('/api/reservations', { id: 'res-1', action: 'INVALID' })
    const res = await PATCH(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it('deve retornar 400 quando reserva não existir', async () => {
    // Set mock session for authenticated request
    setMockSession({ user: { id: 'user-1', name: 'Test User' } })
    const req = buildPost('/api/reservations', { id: 'notfound', action: 'CANCEL' })
    const res = await PATCH(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.error).toContain('encontrada')
  })

  it('deve cancelar reserva com sucesso', async () => {
    // Set mock session for authenticated request
    setMockSession({ user: { id: 'user-1', name: 'Test User' } })
    await seedReservation(reservationRepo)
    roomRepo.clear()
    const req = buildPost('/api/reservations', { id: 'res-1', action: 'CANCEL' })
    const res = await PATCH(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('deve fazer check-in com sucesso', async () => {
    // Set mock session for authenticated request
    setMockSession({ user: { id: 'user-1', name: 'Test User' } })
    await seedReservation(reservationRepo)
    const req = buildPost('/api/reservations', { id: 'res-1', action: 'CHECK_IN' })
    const res = await PATCH(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.roomStatus).toBe('OCCUPIED')
  })

  it('deve fazer check-out com sucesso', async () => {
    // Set mock session for authenticated request
    setMockSession({ user: { id: 'user-1', name: 'Test User' } })
    await seedReservation(reservationRepo)
    await PATCH(buildPost('/api/reservations', { id: 'res-1', action: 'CHECK_IN' }))
    const req = buildPost('/api/reservations', { id: 'res-1', action: 'CHECK_OUT' })
    const res = await PATCH(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
  })
})