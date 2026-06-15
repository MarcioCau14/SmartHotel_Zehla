import { Result } from '../../../shared/Result'

const VALID_STATES = ['DISCONNECTED', 'AWAITING_QR', 'CONNECTED', 'FAILED'] as const
export type WhatsAppStateType = typeof VALID_STATES[number]

export class WhatsAppState {
  private constructor(public readonly value: WhatsAppStateType) {
    Object.freeze(this)
  }

  static create(state: string): Result<WhatsAppState, Error> {
    const normalized = state.toUpperCase().trim() as WhatsAppStateType
    if (!VALID_STATES.includes(normalized)) {
      return Result.fail(
        new Error(`Estado inválido: ${state}. Valores válidos: ${VALID_STATES.join(', ')}`)
      )
    }
    return Result.ok(new WhatsAppState(normalized))
  }

  get isConnected(): boolean {
    return this.value === 'CONNECTED'
  }

  get isAwaitingQr(): boolean {
    return this.value === 'AWAITING_QR'
  }

  get isDisconnected(): boolean {
    return this.value === 'DISCONNECTED'
  }

  get isFailed(): boolean {
    return this.value === 'FAILED'
  }

  equals(other: WhatsAppState): boolean {
    return this.value === other.value
  }
}
