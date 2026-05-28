import { Reservation } from '../../../domain/reservation/entities/Reservation'
import { DateRange } from '../../../domain/reservation/value-objects/DateRange'
import { ReservationStatus } from '../../../domain/reservation/ReservationStatus'
import { IReservationRepository, ReservationFilters } from '../../../application/reservation/ports/IReservationRepository'

export class InMemoryReservationRepository implements IReservationRepository {
  private reservations = new Map<string, Reservation>()

  async save(reservation: Reservation): Promise<Reservation> {
    this.reservations.set(reservation.id, reservation)
    return reservation
  }

  async update(reservation: Reservation): Promise<Reservation> {
    this.reservations.set(reservation.id, reservation)
    return reservation
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.reservations.get(id) ?? null
  }

  async findByCode(code: string): Promise<Reservation | null> {
    for (const r of this.reservations.values()) {
      if (r.code === code) return r
    }
    return null
  }

  async findMany(filters: ReservationFilters): Promise<Reservation[]> {
    let result = Array.from(this.reservations.values())

    if (filters.propertyId) result = result.filter((r) => r.propertyId === filters.propertyId)
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      result = result.filter((r) => statuses.includes(r.status))
    }
    if (filters.roomId) result = result.filter((r) => r.roomId === filters.roomId)
    if (filters.startDate) result = result.filter((r) => r.period.checkIn >= filters.startDate!)
    if (filters.endDate) result = result.filter((r) => r.period.checkOut <= filters.endDate!)
    if (filters.guestPhone) result = result.filter((r) => r.guestInfo.phone === filters.guestPhone)

    return result.sort((a, b) => a.period.checkIn.getTime() - b.period.checkIn.getTime())
  }

  async findOverlapping(roomId: string, period: DateRange, excludeId?: string): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter((r) => {
      if (r.roomId !== roomId) return false
      if (excludeId && r.id === excludeId) return false
      if (r.status !== ReservationStatus.CONFIRMED && r.status !== ReservationStatus.CHECKED_IN) return false
      return r.period.overlaps(period)
    })
  }

  async findByGuestPhone(phone: string, propertyId: string, status?: ReservationStatus[]): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter((r) => {
      if (r.guestInfo.phone !== phone) return false
      if (r.propertyId !== propertyId) return false
      if (status && status.length > 0 && !status.includes(r.status)) return false
      return true
    })
  }

  async delete(id: string): Promise<void> {
    this.reservations.delete(id)
  }

  clear(): void {
    this.reservations.clear()
  }
}
