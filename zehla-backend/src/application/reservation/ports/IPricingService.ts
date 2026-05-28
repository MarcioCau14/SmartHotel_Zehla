import { Money } from '../../../domain/reservation/value-objects/Money'
import { PricingBreakdown } from '../../../domain/reservation/value-objects/PricingBreakdown'
import { DateRange } from '../../../domain/reservation/value-objects/DateRange'
import { RoomType } from './IRoomRepository'

export interface PricingRuleData {
  id: string
  roomType: RoomType | null
  startDate: Date
  endDate: Date
  multiplier: number
  fixedAmount: number | null
  isActive: boolean
}

export interface IPricingService {
  calculatePrice(
    basePrice: Money,
    nights: number,
    guestCount: number,
    roomType: RoomType,
    propertyId: string,
    period: DateRange
  ): Promise<PricingBreakdown>

  findActiveRules(propertyId: string, roomType: RoomType, period: DateRange): Promise<PricingRuleData[]>
}
