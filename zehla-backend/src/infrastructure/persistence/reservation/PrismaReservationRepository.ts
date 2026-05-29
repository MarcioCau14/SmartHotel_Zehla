import { PrismaClient } from '@prisma/client'
import { Reservation } from '../../../domain/reservation/entities/Reservation'
import { DateRange } from '../../../domain/reservation/value-objects/DateRange'
import { Money } from '../../../domain/reservation/value-objects/Money'
import { GuestCount } from '../../../domain/reservation/value-objects/GuestCount'
import { GuestInfo } from '../../../domain/reservation/value-objects/GuestInfo'
import { PricingBreakdown } from '../../../domain/reservation/value-objects/PricingBreakdown'
import { ReservationStatus } from '../../../domain/reservation/ReservationStatus'
import { CheckInStatus } from '../../../domain/reservation/CheckInStatus'
import { ReservationItem } from '../../../domain/reservation/entities/ReservationItem'
import { Payment } from '../../../domain/reservation/entities/Payment'
import { IReservationRepository, ReservationFilters } from '../../../application/reservation/ports/IReservationRepository'

export class PrismaReservationRepository implements IReservationRepository {
  constructor(private prisma: PrismaClient) {}

  async save(reservation: Reservation): Promise<Reservation> {
    const data = reservation.toJSON()
    await this.prisma.reservation.create({
      data: {
        id: data.id,
        code: data.code,
        propertyId: data.propertyId,
        roomId: data.roomId,
        guestName: data.guestInfo.name,
        guestEmail: data.guestInfo.email,
        guestPhone: data.guestInfo.phone,
        guestCpf: data.guestInfo.cpf,
        guestCount: data.guestCount.value,
        checkIn: new Date(data.period.checkIn),
        checkOut: new Date(data.period.checkOut),
        nights: data.period.nights,
        roomPrice: data.pricing.roomPrice.amount,
        totalAmount: data.pricing.total.amount,
        discount: data.pricing.discount.amount,
        paidAmount: data.paidAmount.amount,
        status: data.status as any,
        checkInStatus: data.checkInStatus as any,
        source: data.source,
        notes: data.notes,
        fnrhSubmittedAt: data.fnrhSubmittedAt ? new Date(data.fnrhSubmittedAt) : undefined,
      },
    })
    return reservation
  }

  async update(reservation: Reservation): Promise<Reservation> {
    const data = reservation.toJSON()
    await this.prisma.reservation.update({
      where: { id: data.id },
      data: {
        guestName: data.guestInfo.name,
        guestEmail: data.guestInfo.email,
        guestPhone: data.guestInfo.phone,
        guestCpf: data.guestInfo.cpf,
        guestCount: data.guestCount.value,
        checkIn: new Date(data.period.checkIn),
        checkOut: new Date(data.period.checkOut),
        nights: data.period.nights,
        roomPrice: data.pricing.roomPrice.amount,
        totalAmount: data.pricing.total.amount,
        discount: data.pricing.discount.amount,
        paidAmount: data.paidAmount.amount,
        status: data.status as any,
        checkInStatus: data.checkInStatus as any,
        source: data.source,
        notes: data.notes,
        fnrhSubmittedAt: data.fnrhSubmittedAt ? new Date(data.fnrhSubmittedAt) : undefined,
      },
    })
    return reservation
  }

  async findById(id: string): Promise<Reservation | null> {
    const row = await this.prisma.reservation.findUnique({
      where: { id },
      include: { room: true, payment: true, reservation_items: true },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByCode(code: string): Promise<Reservation | null> {
    const row = await this.prisma.reservation.findUnique({
      where: { code },
      include: { room: true, payment: true, reservation_items: true },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findMany(filters: ReservationFilters): Promise<Reservation[]> {
    const where: any = {}
    if (filters.propertyId) where.propertyId = filters.propertyId
    if (filters.status) where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status
    if (filters.roomId) where.roomId = filters.roomId
    if (filters.startDate) where.checkIn = { gte: filters.startDate }
    if (filters.endDate) where.checkOut = { lte: filters.endDate }
    if (filters.guestPhone) where.guestPhone = filters.guestPhone

    const rows = await this.prisma.reservation.findMany({
      where,
      include: { room: true, payment: true, reservation_items: true },
      orderBy: { checkIn: 'asc' },
    })

    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Reservation[]
  }

  async findOverlapping(roomId: string, period: DateRange, excludeId?: string): Promise<Reservation[]> {
    const where: any = {
      roomId,
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      OR: [
        { checkIn: { lt: period.checkOut }, checkOut: { gt: period.checkIn } },
      ],
    }
    if (excludeId) where.id = { not: excludeId }

    const rows = await this.prisma.reservation.findMany({
      where,
      include: { room: true, payment: true, reservation_items: true },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Reservation[]
  }

  async findByGuestPhone(phone: string, propertyId: string, status?: ReservationStatus[]): Promise<Reservation[]> {
    const where: any = { guestPhone: phone, propertyId }
    if (status && status.length > 0) where.status = { in: status }
    const rows = await this.prisma.reservation.findMany({
      where,
      include: { room: true, payment: true, reservation_items: true },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Reservation[]
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reservation.delete({ where: { id } })
  }

  private hydrate(row: any): Reservation | null {
    const guestInfo = GuestInfo.create({
      name: row.guestName,
      email: row.guestEmail ?? undefined,
      phone: row.guestPhone,
      cpf: row.guestCpf ?? undefined,
    })
    if (guestInfo.isFail) return null

    const guestCount = GuestCount.create(row.guestCount)
    if (guestCount.isFail) return null

    const period = DateRange.create(row.checkIn, row.checkOut)
    if (period.isFail) return null

    const roomPrice = Money.create(row.roomPrice)
    const discount = Money.create(row.discount)
    if (roomPrice.isFail || discount.isFail) return null

    const pricing = PricingBreakdown.create({
      roomPrice: roomPrice.value,
      nights: row.nights,
      discount: discount.value,
    })
    if (pricing.isFail) return null

    const paidAmount = Money.create(row.paidAmount)
    if (paidAmount.isFail) return null

    const reservationResult = Reservation.create({
      id: row.id,
      propertyId: row.propertyId,
      roomId: row.roomId,
      guestInfo: guestInfo.value,
      guestCount: guestCount.value,
      period: period.value,
      pricing: pricing.value,
      source: row.source,
      notes: row.notes ?? undefined,
    })
    if (reservationResult.isFail) return null

    const reservation = reservationResult.value
    ;(reservation as any).data.paidAmount = paidAmount.value
    ;(reservation as any).data.status = row.status as ReservationStatus
    ;(reservation as any).data.checkInStatus = row.checkInStatus as CheckInStatus
    ;(reservation as any).data.fnrhSubmittedAt = row.fnrhSubmittedAt ?? undefined

    return reservation
  }
}
