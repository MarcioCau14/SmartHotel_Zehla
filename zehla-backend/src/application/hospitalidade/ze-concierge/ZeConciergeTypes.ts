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
}
