export enum StatusReserva {
  PENDENTE = 'pendente',
  CONFIRMADA = 'confirmada',
  CHECKIN = 'checkin',
  CHECKOUT = 'checkout',
  FINALIZADA = 'finalizada',
  CANCELADA = 'cancelada',
}

export const TRANSICOES_VALIDAS: Record<StatusReserva, StatusReserva[]> = {
  [StatusReserva.PENDENTE]: [StatusReserva.CONFIRMADA, StatusReserva.CANCELADA],
  [StatusReserva.CONFIRMADA]: [StatusReserva.CHECKIN, StatusReserva.CANCELADA],
  [StatusReserva.CHECKIN]: [StatusReserva.CHECKOUT],
  [StatusReserva.CHECKOUT]: [StatusReserva.FINALIZADA, StatusReserva.CANCELADA],
  [StatusReserva.FINALIZADA]: [],
  [StatusReserva.CANCELADA]: [],
}
