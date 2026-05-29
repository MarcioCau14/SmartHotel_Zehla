import { Result } from '../../../domain/shared/Result'
import { Room } from '../../../domain/room/entities/Room'
import { MonetaryValue } from '../../../domain/room/value-objects/MonetaryValue'
import { Capacity } from '../../../domain/room/value-objects/Capacity'
import { Amenities } from '../../../domain/room/value-objects/Amenities'
import { RoomType, PricingType } from '../../../domain/room/enums'
import { IRoomRepository } from '../ports/IRoomRepository'

export interface CreateRoomInput {
  number: string
  name?: string
  type?: RoomType
  maxAdults: number
  maxChildren?: number
  basePrice: number
  pricingType?: PricingType
  amenities?: string[]
  description?: string
  images?: string[]
  propertyId: string
}

export interface CreateRoomOutput {
  id: string
  number: string
  status: string
}

export class CreateRoomUseCase {
  constructor(private roomRepo: IRoomRepository) {}

  async execute(input: CreateRoomInput): Promise<Result<CreateRoomOutput, string>> {
    const existing = await this.roomRepo.findByNumber(input.propertyId, input.number)
    if (existing) {
      return Result.fail('Já existe um quarto com este número nesta propriedade')
    }

    const capacityResult = Capacity.create(input.maxAdults, input.maxChildren ?? 0)
    if (capacityResult.isFail) return Result.fail(capacityResult.error)

    const basePriceResult = MonetaryValue.create(input.basePrice)
    if (basePriceResult.isFail) return Result.fail(basePriceResult.error)

    let amenities = Amenities.EMPTY
    if (input.amenities && input.amenities.length > 0) {
      const amenitiesResult = Amenities.create(input.amenities)
      if (amenitiesResult.isFail) return Result.fail(amenitiesResult.error)
      amenities = amenitiesResult.value
    }

    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const roomResult = Room.create({
      id,
      number: input.number,
      name: input.name,
      type: input.type,
      capacity: capacityResult.value,
      basePrice: basePriceResult.value,
      pricingType: input.pricingType,
      amenities,
      description: input.description,
      images: input.images,
      propertyId: input.propertyId,
    })
    if (roomResult.isFail) return Result.fail(roomResult.error)

    const room = roomResult.value
    await this.roomRepo.save(room)
    room.clearEvents()

    return Result.ok({
      id: room.id,
      number: room.number,
      status: room.status,
    })
  }
}
