import { Room } from '../../../domain/room/entities/Room'

export interface RoomOutput {
  id: string
  number: string
  name: string | undefined
  type: string
  capacity: { maxAdults: number; maxChildren: number; maxTotal: number }
  basePrice: { amount: number; currency: string }
  pricingType: string
  amenities: string[]
  status: string
  description: string | undefined
  images: string[]
  propertyId: string
  createdAt: string
}

export function roomToOutput(room: Room): RoomOutput {
  return {
    id: room.id,
    number: room.number,
    name: room.name,
    type: room.type,
    capacity: room.capacity.toJSON(),
    basePrice: room.basePrice.toJSON(),
    pricingType: room.pricingType,
    amenities: room.amenities.toJSON(),
    status: room.status,
    description: room.description,
    images: room.images,
    propertyId: room.propertyId,
    createdAt: room.createdAt.toISOString(),
  }
}
