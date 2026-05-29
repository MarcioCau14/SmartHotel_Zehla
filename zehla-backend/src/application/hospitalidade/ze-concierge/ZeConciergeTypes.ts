export type ZeConciergeIntent =
  | 'CONSULTAR_HOSPEDE'
  | 'CONSULTAR_DISPONIBILIDADE'
  | 'CONSULTAR_SERVICOS'
  | 'CRIAR_RESERVA'
  | 'CONFIRMAR_RESERVA'
  | 'CANCELAR_RESERVA'
  | 'CONSULTAR_RESERVA'
  | 'ADICIONAR_SERVICO'
  | 'CRIAR_FEEDBACK'
  | 'CONSULTAR_CHECKINS'
  | 'CONSULTAR_CHECKOUTS'

export interface ZeConciergeInput {
  intent: ZeConciergeIntent
  messageId: string
  guestId?: string
  channel: 'whatsapp' | 'web' | 'api'
  payload: Record<string, unknown>
}

export interface ZeConciergeOutput {
  responseId: string
  responseText: string
  confidenceScore: number
  needsEscalation: boolean
  suggestedUpsellId: string | null
  data?: unknown
  escalacaoPackage?: EscalacaoPackage
}

export interface EscalacaoInput {
  bookingId: string
  guestId: string
  notaGeral: number
  comentario: string
}

export interface EscalacaoPackage {
  packageId: string
  timestamp: string
  origem: 'ze-concierge'
  destino: 'ze-host'
  bookingId: string
  guestId: string
  notaGeral: number
  comentarioSanitizado: string
  piiTokenizado: boolean
  padroesBloqueados: string[]
  violacoesDogmaticas: string[]
  piiEncontrado: number
  threatDetected: boolean
  canaryTriggersFound: string[]
  zcpSignature: string
  zcpSignedAt: string
}
