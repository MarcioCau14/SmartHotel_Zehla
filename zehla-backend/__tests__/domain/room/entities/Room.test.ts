import { describe, it, expect } from 'vitest'
import { Room } from '../../../../src/domain/room/entities/Room'
import { MonetaryValue } from '../../../../src/domain/room/value-objects/MonetaryValue'
import { Capacity } from '../../../../src/domain/room/value-objects/Capacity'
import { Amenities } from '../../../../src/domain/room/value-objects/Amenities'
import { RoomType, RoomStatus, PricingType } from '../../../../src/domain/room/enums'

function createValidRoom(overrides: Partial<{
  id: string
  number: string
  type: RoomType
  capacity: Capacity
  basePrice: MonetaryValue
  pricingType: PricingType
  amenities: Amenities
  description: string
  propertyId: string
}> = {}) {
  return Room.create({
    id: overrides.id ?? 'room-1',
    number: overrides.number ?? '101',
    type: overrides.type ?? RoomType.STANDARD,
    capacity: overrides.capacity ?? Capacity.create(2).value,
    basePrice: overrides.basePrice ?? MonetaryValue.create(200).value,
    pricingType: overrides.pricingType ?? PricingType.PER_ROOM,
    amenities: overrides.amenities ?? Amenities.create(['TV', 'WiFi']).value,
    description: overrides.description ?? 'Quarto standard',
    propertyId: overrides.propertyId ?? 'prop-1',
  })
}

describe('Room', () => {
  describe('create', () => {
    it('should create valid room', () => {
      const room = createValidRoom()
      expect(room.isOk).toBe(true)
      expect(room.value.number).toBe('101')
      expect(room.value.type).toBe(RoomType.STANDARD)
      expect(room.value.status).toBe(RoomStatus.AVAILABLE)
      expect(room.value.isAvailable).toBe(true)
    })

    it('should fail without id', () => {
      const room = createValidRoom({ id: '' })
      expect(room.isFail).toBe(true)
    })

    it('should fail without number', () => {
      const room = createValidRoom({ number: '' })
      expect(room.isFail).toBe(true)
    })

    it('should fail without propertyId', () => {
      const room = createValidRoom({ propertyId: '' })
      expect(room.isFail).toBe(true)
    })

    it('should fail with zero base price', () => {
      const room = createValidRoom({ basePrice: MonetaryValue.ZERO })
      expect(room.isFail).toBe(true)
    })

    it('should trim number', () => {
      const room = createValidRoom({ number: '  102A  ' })
      expect(room.isOk).toBe(true)
      expect(room.value.number).toBe('102A')
    })

    it('should emit RoomCreated event', () => {
      const room = createValidRoom().value
      const events = room.events
      expect(events).toHaveLength(1)
      expect(events[0].eventName).toBe('RoomCreated')
    })

    it('should accept optional amenities', () => {
      const room = Room.create({
        id: 'room-2',
        number: '102',
        capacity: Capacity.create(2).value,
        basePrice: MonetaryValue.create(150).value,
        propertyId: 'prop-1',
      })
      expect(room.isOk).toBe(true)
      expect(room.value.amenities.items).toEqual([])
    })
  })

  describe('status transitions', () => {
    it('should transition AVAILABLE → OCCUPIED', () => {
      const room = createValidRoom().value
      const result = room.markOccupied()
      expect(result.isOk).toBe(true)
      expect(room.status).toBe(RoomStatus.OCCUPIED)
      expect(room.isAvailable).toBe(false)
    })

    it('should transition OCCUPIED → CLEANING', () => {
      const room = createValidRoom().value
      room.markOccupied()
      const result = room.markCleaning()
      expect(result.isOk).toBe(true)
      expect(room.status).toBe(RoomStatus.CLEANING)
    })

    it('should transition CLEANING → AVAILABLE', () => {
      const room = createValidRoom().value
      room.markOccupied()
      room.markCleaning()
      const result = room.markAvailable()
      expect(result.isOk).toBe(true)
      expect(room.status).toBe(RoomStatus.AVAILABLE)
    })

    it('should transition AVAILABLE → MAINTENANCE', () => {
      const room = createValidRoom().value
      const result = room.markMaintenance('Vazamento')
      expect(result.isOk).toBe(true)
      expect(room.status).toBe(RoomStatus.MAINTENANCE)
    })

    it('should transition MAINTENANCE → AVAILABLE', () => {
      const room = createValidRoom().value
      room.markMaintenance()
      const result = room.markAvailable()
      expect(result.isOk).toBe(true)
      expect(room.status).toBe(RoomStatus.AVAILABLE)
    })

    it('should transition AVAILABLE → BLOCKED', () => {
      const room = createValidRoom().value
      const result = room.markBlocked('Reservado para reforma')
      expect(result.isOk).toBe(true)
      expect(room.status).toBe(RoomStatus.BLOCKED)
    })

    it('should transition BLOCKED → AVAILABLE', () => {
      const room = createValidRoom().value
      room.markBlocked()
      const result = room.markAvailable()
      expect(result.isOk).toBe(true)
      expect(room.status).toBe(RoomStatus.AVAILABLE)
    })

    it('should reject OCCUPIED → AVAILABLE directly', () => {
      const room = createValidRoom().value
      room.markOccupied()
      const result = room.markAvailable()
      expect(result.isFail).toBe(true)
      expect(result.error).toContain('Não é possível')
    })

    it('should reject OCCUPIED → MAINTENANCE directly', () => {
      const room = createValidRoom().value
      room.markOccupied()
      const result = room.markMaintenance()
      expect(result.isFail).toBe(true)
    })

    it('should reject same status transition', () => {
      const room = createValidRoom().value
      const result = room.markAvailable() // já AVAILABLE
      expect(result.isFail).toBe(true)
      expect(result.error).toContain('já está')
    })

    it('should emit RoomStatusChanged event', () => {
      const room = createValidRoom().value
      room.clearEvents()
      room.markOccupied()
      const events = room.events
      expect(events).toHaveLength(1)
      expect(events[0].eventName).toBe('RoomStatusChanged')
      const payload = events[0].payload as any
      expect(payload.previousStatus).toBe(RoomStatus.AVAILABLE)
      expect(payload.newStatus).toBe(RoomStatus.OCCUPIED)
    })
  })

  describe('pricing updates', () => {
    it('should update pricing', () => {
      const room = createValidRoom().value
      const newPrice = MonetaryValue.create(350).value

      room.clearEvents()
      const result = room.updatePricing(newPrice, PricingType.PER_PERSON)
      expect(result.isOk).toBe(true)
      expect(room.basePrice.amount).toBe(350)
      expect(room.pricingType).toBe(PricingType.PER_PERSON)
    })

    it('should reject zero price', () => {
      const room = createValidRoom().value
      const result = room.updatePricing(MonetaryValue.ZERO, PricingType.PER_ROOM)
      expect(result.isFail).toBe(true)
    })

    it('should emit RoomPricingUpdated event', () => {
      const room = createValidRoom().value
      room.clearEvents()
      room.updatePricing(MonetaryValue.create(350).value, PricingType.PER_PERSON)
      const events = room.events
      expect(events).toHaveLength(1)
      expect(events[0].eventName).toBe('RoomPricingUpdated')
      const payload = events[0].payload as any
      expect(payload.previousBasePrice).toBe(200)
      expect(payload.newBasePrice).toBe(350)
      expect(payload.previousPricingType).toBe(PricingType.PER_ROOM)
      expect(payload.newPricingType).toBe(PricingType.PER_PERSON)
    })
  })

  describe('info updates', () => {
    it('should update name and type', () => {
      const room = createValidRoom().value
      room.updateInfo({ name: 'Suíte Master', type: RoomType.MASTER })
      expect(room.name).toBe('Suíte Master')
      expect(room.type).toBe(RoomType.MASTER)
    })
  })

  describe('events lifecycle', () => {
    it('should clear events', () => {
      const room = createValidRoom().value
      expect(room.events).toHaveLength(1)
      room.clearEvents()
      expect(room.events).toHaveLength(0)
    })

    it('should accumulate multiple events', () => {
      const room = createValidRoom().value
      room.clearEvents()
      room.markOccupied()
      room.markCleaning()
      expect(room.events).toHaveLength(2)
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON', () => {
      const room = createValidRoom({
        number: '201',
        type: RoomType.DELUXE,
        description: 'Quarto deluxe',
      }).value
      const json = room.toJSON()
      expect(json.number).toBe('201')
      expect(json.type).toBe(RoomType.DELUXE)
      expect(json.status).toBe(RoomStatus.AVAILABLE)
      expect(json.capacity.maxTotal).toBe(2)
      expect(json.basePrice.amount).toBe(200)
      expect(json.amenities).toEqual(['tv', 'wifi'])
    })
  })
})
