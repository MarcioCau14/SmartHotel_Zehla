import { Result } from '../../../shared/Result'
import { ReservationSlot } from '../models/SDRSlotFilling'

export interface ExtractedSlot {
  readonly slot: ReservationSlot
  readonly value: string
  readonly confidence: number
}

export interface ISlotExtractorPort {
  extractSlots(conversationText: string): Promise<Result<ExtractedSlot[], Error>>
}
