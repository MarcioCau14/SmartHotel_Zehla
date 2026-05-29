import { Result } from '../../../domain/shared/Result'
import { MonetaryValue } from '../../../domain/room/value-objects/MonetaryValue'
import { PricingType } from '../../../domain/room/enums'
import { IRoomRepository } from '../ports/IRoomRepository'

export interface UpdateRoomPricingInput {
  roomId: string
  basePrice: number
  pricingType: PricingType
}

export interface UpdateRoomPricingOutput {
  id: string
  basePrice: number
  pricingType: string
}

export class UpdateRoomPricingUseCase {
  constructor(private roomRepo: IRoomRepository) {}

  async execute(input: UpdateRoomPricingInput): Promise<Result<UpdateRoomPricingOutput, string>> {
    const room = await this.roomRepo.findById(input.roomId)
    if (!room) return Result.fail('Quarto não encontrado')

    const basePriceResult = MonetaryValue.create(input.basePrice)
    if (basePriceResult.isFail) return Result.fail(basePriceResult.error)

    const result = room.updatePricing(basePriceResult.value, input.pricingType)
    if (result.isFail) return Result.fail(result.error)

    await this.roomRepo.update(room)
    room.clearEvents()

    return Result.ok({
      id: room.id,
      basePrice: room.basePrice.amount,
      pricingType: room.pricingType,
    })
  }
}
