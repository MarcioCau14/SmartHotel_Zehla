export enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  MASTER = 'MASTER',
  FAMILY = 'FAMILY',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  BLOCKED = 'BLOCKED',
}

export enum PricingType {
  PER_ROOM = 'PER_ROOM',
  PER_PERSON = 'PER_PERSON',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

const VALID_STATUS_TRANSITIONS: Record<RoomStatus, RoomStatus[]> = {
  [RoomStatus.AVAILABLE]: [RoomStatus.OCCUPIED, RoomStatus.CLEANING, RoomStatus.MAINTENANCE, RoomStatus.BLOCKED],
  [RoomStatus.OCCUPIED]: [RoomStatus.CLEANING],
  [RoomStatus.CLEANING]: [RoomStatus.AVAILABLE],
  [RoomStatus.MAINTENANCE]: [RoomStatus.AVAILABLE],
  [RoomStatus.BLOCKED]: [RoomStatus.AVAILABLE],
}

export function canTransitionRoomStatus(
  current: RoomStatus,
  target: RoomStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[current]?.includes(target) ?? false
}

export function isRoomAvailableForBooking(status: RoomStatus): boolean {
  return status === RoomStatus.AVAILABLE
}
