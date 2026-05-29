import { Result } from '../../../domain/shared/Result'
import { Feedback } from '../../../domain/hospitalidade/entities'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'

export interface IFeedbackPort {
  getById(feedbackId: string): Promise<Result<Feedback, Error>>
  listByPeriod(periodo: DateRange): Promise<Result<Feedback[], Error>>
  listByBooking(bookingId: string): Promise<Result<Feedback[], Error>>
  save(feedback: Feedback): Promise<Result<Feedback, Error>>
  getNPS(periodo: DateRange): Promise<Result<number, Error>>
}
