import { Reservation } from '../../../domain/reservation/entities/Reservation'
import { ReservationStatus } from '../../../domain/reservation/ReservationStatus'
import { DateRange } from '../../../domain/reservation/value-objects/DateRange'

export interface ReservationFilters {
  status?: ReservationStatus | ReservationStatus[]
  propertyId?: string
  roomId?: string
  startDate?: Date
  endDate?: Date
  guestPhone?: string
}

export interface IReservationRepository {
  save(reservation: Reservation): Promise<Reservation>
  update(reservation: Reservation): Promise<Reservation>
  findById(id: string): Promise<Reservation | null>
  findByCode(code: string): Promise<Reservation | null>
  findMany(filters: ReservationFilters): Promise<Reservation[]>
  findOverlapping(roomId: string, period: DateRange, excludeId?: string): Promise<Reservation[]>
  findByGuestPhone(phone: string, propertyId: string, status?: ReservationStatus[]): Promise<Reservation[]>
  delete(id: string): Promise<void>
}
