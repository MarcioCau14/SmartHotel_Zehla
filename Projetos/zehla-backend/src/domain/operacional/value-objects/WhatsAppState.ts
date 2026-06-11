import { Result } from '../../../shared/Result'

export type WhatsAppStateValue = 'DISCONNECTED' | 'AWAITING_QR' | 'CONNECTED' | 'FAILED'

export class WhatsAppState {
  private constructor(public readonly value: WhatsAppStateValue) {
    Object.freeze(this)
  }

  static create(value: string): Result<WhatsAppState, Error> {
    const validStates: WhatsAppStateValue[] = ['DISCONNECTED', 'AWAITING_QR', 'CONNECTED', 'FAILED']
    if (!validStates.includes(value as WhatsAppStateValue)) {
      return Result.fail(new Error(`Estado inválido de WhatsApp: ${value}`))
    }
    return Result.ok(new WhatsAppState(value as WhatsAppStateValue))
  }

  get isConnected(): boolean {
    return this.value === 'CONNECTED'
  }

  get isAwaitingQr(): boolean {
    return this.value === 'AWAITING_QR'
  }
}
