import { describe, it, expect, beforeEach } from 'vitest'
import { CreateReservationUseCase } from '../../../../src/application/reservation/use-cases/CreateReservationUseCase'
import { InMemoryReservationRepository } from '../../../../src/infrastructure/persistence/reservation/InMemoryReservationRepository'
import { IRoomRepository, RoomData, RoomStatus, RoomType } from '../../../../src/application/reservation/ports/IRoomRepository'
import { IPricingService, PricingRuleData } from '../../../../src/application/reservation/ports/IPricingService'
import { IAvailabilityService } from '../../../../src/application/reservation/ports/IAvailabilityService'
import { IEventBus } from '../../../../src/application/reservation/ports/IEventBus'
import { PricingBreakdown } from '../../../../src/domain/reservation/value-objects/PricingBreakdown'
import { Money } from '../../../../src/domain/reservation/value-objects/Money'
import { DateRange } from '../../../../src/domain/reservation/value-objects/DateRange'
import { DomainEvent } from '../../../../src/domain/shared/DomainEvent'

class FakeRoomRepository implements IRoomRepository {
  private rooms = new Map<string, RoomData>()

  add(room: RoomData) { this.rooms.set(room.id, room) }

  async findById(id: string) { return this.rooms.get(id) ?? null }
  async findByProperty(propertyId: string) {
    return Array.from(this.rooms.values()).filter((r) => r.propertyId === propertyId)
  }
  async findAvailable(propertyId: string, minCapacity?: number) {
    return Array.from(this.rooms.values()).filter((r) => {
      if (r.propertyId !== propertyId || r.status !== 'AVAILABLE') return false
      if (minCapacity && r.capacity < minCapacity) return false
      return true
    })
  }
  async updateStatus(id: string, status: RoomStatus) {
    const room = this.rooms.get(id)
    if (room) this.rooms.set(id, { ...room, status })
  }
}

class FakePricingService implements IPricingService {
  async calculatePrice(basePrice: Money, nights: number, _gc: number, _rt: RoomType, _pid: string, _p: DateRange) {
    return PricingBreakdown.create({ roomPrice: basePrice, nights, discount: Money.ZERO }).value
  }
  async findActiveRules(_pid: string, _rt: RoomType, _p: DateRange) { return [] }
}

class FakeAvailabilityService implements IAvailabilityService {
  private booked: { roomId: string; period: DateRange }[] = []

  block(roomId: string, period: DateRange) { this.booked.push({ roomId, period }) }

  async isRoomAvailable(roomId: string, period: DateRange) {
    return !this.booked.some((b) => b.roomId === roomId && b.period.overlaps(period))
  }
  async findAvailableRooms(_pid: string, _p: DateRange, _mc?: number) { return [] }
  async canAcceptReservation(_pid: string, _p: DateRange) { return { allowed: true } }
}

class FakeEventBus implements IEventBus {
  events: DomainEvent[] = []
  async publish(event: DomainEvent) { this.events.push(event) }
  async publishMany(events: DomainEvent[]) { this.events.push(...events) }
}

describe('CreateReservationUseCase', () => {
  let reservationRepo: InMemoryReservationRepository
  let roomRepo: FakeRoomRepository
  let pricingService: FakePricingService
  let availabilityService: FakeAvailabilityService
  let eventBus: FakeEventBus
  let useCase: CreateReservationUseCase

  beforeEach(() => {
    reservationRepo = new InMemoryReservationRepository()
    roomRepo = new FakeRoomRepository()
    pricingService = new FakePricingService()
    availabilityService = new FakeAvailabilityService()
    eventBus = new FakeEventBus()

    roomRepo.add({
      id: 'room-1',
      number: '101',
      type: RoomType.STANDARD,
      capacity: 2,
      basePrice: 200,
      status: RoomStatus.AVAILABLE,
      propertyId: 'prop-1',
    })

    roomRepo.add({
      id: 'room-2',
      number: '102',
      type: RoomType.SUITE,
      capacity: 4,
      basePrice: 400,
      status: RoomStatus.AVAILABLE,
      propertyId: 'prop-1',
    })

    useCase = new CreateReservationUseCase(
      reservationRepo, roomRepo, pricingService, availabilityService, eventBus
    )
  })

  it('should create a reservation successfully', async () => {
    const result = await useCase.execute({
      propertyId: 'prop-1',
      roomId: 'room-1',
      guestName: 'João Silva',
      guestPhone: '5511999999999',
      guestCount: 2,
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
      source: 'WHATSAPP',
    })

    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('CONFIRMED')
    expect(result.value.totalAmount).toBe(800) // 200 * 4
    expect(result.value.nights).toBe(4)
    expect(result.value.code).toMatch(/^ZEH-\d+$/)
  })

  it('should fail when room does not exist', async () => {
    const result = await useCase.execute({
      propertyId: 'prop-1',
      roomId: 'nonexistent',
      guestName: 'João',
      guestPhone: '5511999999999',
      guestCount: 1,
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
    })

    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrado')
  })

  it('should fail when room is blocked', async () => {
    roomRepo.add({
      id: 'room-blocked',
      number: 'B1',
      type: RoomType.STANDARD,
      capacity: 2,
      basePrice: 100,
      status: RoomStatus.BLOCKED,
      propertyId: 'prop-1',
    })

    const result = await useCase.execute({
      propertyId: 'prop-1',
      roomId: 'room-blocked',
      guestName: 'João',
      guestPhone: '5511999999999',
      guestCount: 1,
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
    })

    expect(result.isFail).toBe(true)
    expect(result.error).toContain('bloqueado')
  })

  it('should fail when guest count exceeds capacity', async () => {
    const result = await useCase.execute({
      propertyId: 'prop-1',
      roomId: 'room-1',
      guestName: 'João',
      guestPhone: '5511999999999',
      guestCount: 10,
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
    })

    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Capacidade')
  })

  it('should fail when dates are invalid', async () => {
    const result = await useCase.execute({
      propertyId: 'prop-1',
      roomId: 'room-1',
      guestName: 'João',
      guestPhone: '5511999999999',
      guestCount: 1,
      checkIn: 'invalid',
      checkOut: '2026-08-05',
    })

    expect(result.isFail).toBe(true)
  })

  it('should fail when room is unavailable', async () => {
    const period = DateRange.createFromStrings('2026-08-01', '2026-08-05').value
    availabilityService.block('room-1', period)

    const result = await useCase.execute({
      propertyId: 'prop-1',
      roomId: 'room-1',
      guestName: 'João',
      guestPhone: '5511999999999',
      guestCount: 1,
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
    })

    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não disponível')
  })

  it('should emit domain events', async () => {
    await useCase.execute({
      propertyId: 'prop-1',
      roomId: 'room-1',
      guestName: 'João Silva',
      guestPhone: '5511999999999',
      guestCount: 1,
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
    })

    expect(eventBus.events.length).toBeGreaterThanOrEqual(1)
    expect(eventBus.events[0].eventName).toBe('ReservationCreated')
  })

  it('should validate guest name', async () => {
    const result = await useCase.execute({
      propertyId: 'prop-1',
      roomId: 'room-1',
      guestName: 'A',
      guestPhone: '5511999999999',
      guestCount: 1,
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
    })

    expect(result.isFail).toBe(true)
  })
})
