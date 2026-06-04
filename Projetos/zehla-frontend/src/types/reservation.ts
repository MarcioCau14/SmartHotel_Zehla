export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  BLOCKED: 'blocked',
} as const

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS]

export interface RoomView {
  readonly id: string
  readonly numero: string
  readonly tipo: string
  readonly status: RoomStatus
  readonly andar: number
  readonly capacidade: number
  readonly precoDiaria: number
  readonly hospedeAtual?: string
  readonly checkinHoje?: string
  readonly checkoutHoje?: string
}

export interface ReservationView {
  readonly id: string
  readonly guestName: string
  readonly roomNumber: string
  readonly checkin: string
  readonly checkout: string
  readonly status: string
  readonly totalValue: number
  readonly telefone?: string
}

export const STATUS_META: Record<RoomStatus, { label: string; cor: string; icone: string }> = {
  [ROOM_STATUS.AVAILABLE]: { label: 'Livre', cor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icone: '●' },
  [ROOM_STATUS.OCCUPIED]: { label: 'Ocupado', cor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', icone: '●' },
  [ROOM_STATUS.CLEANING]: { label: 'Limpeza', cor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icone: '●' },
  [ROOM_STATUS.MAINTENANCE]: { label: 'Manutenção', cor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', icone: '●' },
  [ROOM_STATUS.BLOCKED]: { label: 'Bloqueado', cor: 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400', icone: '●' },
}
