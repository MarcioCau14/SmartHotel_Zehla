export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  [ReservationStatus.PENDING]: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
  [ReservationStatus.CONFIRMED]: [ReservationStatus.AWAITING_PAYMENT, ReservationStatus.CHECKED_IN, ReservationStatus.CANCELLED],
  [ReservationStatus.AWAITING_PAYMENT]: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN, ReservationStatus.CANCELLED],
  [ReservationStatus.CHECKED_IN]: [ReservationStatus.CHECKED_OUT],
  [ReservationStatus.CHECKED_OUT]: [],
  [ReservationStatus.CANCELLED]: [],
  [ReservationStatus.NO_SHOW]: [],
}

export function canTransition(
  current: ReservationStatus,
  target: ReservationStatus
): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false
}

export function isActive(status: ReservationStatus): boolean {
  return status === ReservationStatus.CONFIRMED || status === ReservationStatus.CHECKED_IN
}

export function isFinal(status: ReservationStatus): boolean {
  return (
    status === ReservationStatus.CANCELLED ||
    status === ReservationStatus.CHECKED_OUT ||
    status === ReservationStatus.NO_SHOW
  )
}
