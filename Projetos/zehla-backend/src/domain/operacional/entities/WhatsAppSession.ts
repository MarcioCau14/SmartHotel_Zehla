import { Result } from '../../../shared/Result'
import { WhatsAppState } from '../value-objects/WhatsAppState'

export class WhatsAppSession {
  private constructor(
    public readonly propertyId: string,
    public readonly state: WhatsAppState,
    public readonly qrCode?: string,
    public readonly lastUpdatedAt: Date = new Date()
  ) {
    Object.freeze(this)
  }

  static create(propertyId: string, stateValue: string, qrCode?: string): Result<WhatsAppSession, Error> {
    if (!propertyId || propertyId.trim().length === 0) {
      return Result.fail(new Error('Property ID é obrigatório'))
    }
    const stateResult = WhatsAppState.create(stateValue)
    if (stateResult.isFail) return Result.fail(stateResult.error)

    return Result.ok(new WhatsAppSession(propertyId.trim(), stateResult.value, qrCode))
  }

  startConnection(qrCode?: string): Result<WhatsAppSession, Error> {
    if (this.state.value !== 'DISCONNECTED' && this.state.value !== 'FAILED') {
      return Result.fail(new Error(`Transição inválida de ${this.state.value} para AWAITING_QR`))
    }
    return WhatsAppSession.create(this.propertyId, 'AWAITING_QR', qrCode)
  }

  connect(): Result<WhatsAppSession, Error> {
    if (this.state.value !== 'AWAITING_QR') {
      return Result.fail(new Error(`Transição inválida de ${this.state.value} para CONNECTED`))
    }
    return WhatsAppSession.create(this.propertyId, 'CONNECTED')
  }

  disconnect(): Result<WhatsAppSession, Error> {
    return WhatsAppSession.create(this.propertyId, 'DISCONNECTED')
  }

  fail(): Result<WhatsAppSession, Error> {
    return WhatsAppSession.create(this.propertyId, 'FAILED')
  }
}
