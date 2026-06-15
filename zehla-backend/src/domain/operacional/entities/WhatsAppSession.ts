import { Result } from '../../../shared/Result'
import { WhatsAppState, WhatsAppStateType } from '../value-objects/WhatsAppState'

export class WhatsAppSession {
  private constructor(
    public readonly propertyId: string,
    private _state: WhatsAppState,
    private _qrCode: string | null,
    private _expiresAt: Date | null,
    private _error: string | null,
    private _updatedAt: Date,
  ) {
    Object.freeze(this)
  }

  static create(propertyId: string, initialState: WhatsAppStateType = 'DISCONNECTED'): Result<WhatsAppSession, Error> {
    if (!propertyId || propertyId.trim().length === 0) {
      return Result.fail(new Error('propertyId é obrigatório'))
    }
    const stateResult = WhatsAppState.create(initialState)
    if (stateResult.isFail) {
      return Result.fail(stateResult.error)
    }
    return Result.ok(new WhatsAppSession(
      propertyId.trim(),
      stateResult.value,
      null,
      null,
      null,
      new Date(),
    ))
  }

  get state(): WhatsAppState {
    return this._state
  }

  get qrCode(): string | null {
    return this._qrCode
  }

  get expiresAt(): Date | null {
    return this._expiresAt
  }

  get error(): string | null {
    return this._error
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  private transition(newState: WhatsAppStateType, qrCode?: string | null, error?: string | null): Result<WhatsAppSession, Error> {
    const stateResult = WhatsAppState.create(newState)
    if (stateResult.isFail) return Result.fail(stateResult.error)

    return Result.ok(new WhatsAppSession(
      this.propertyId,
      stateResult.value,
      qrCode ?? this._qrCode,
      newState === 'AWAITING_QR' ? new Date(Date.now() + 40000) : newState === 'CONNECTED' || newState === 'DISCONNECTED' ? null : this._expiresAt,
      error ?? (newState === 'FAILED' ? (error || 'Erro desconhecido') : null),
      new Date(),
    ))
  }

  startConnection(qrCode: string): Result<WhatsAppSession, Error> {
    if (!this._state.isDisconnected) {
      return Result.fail(new Error(`INVALID_TRANSITION: Não é possível iniciar conexão no estado ${this._state.value}. Estado esperado: DISCONNECTED`))
    }
    if (!qrCode || qrCode.trim().length === 0) {
      return Result.fail(new Error('QR Code é obrigatório para iniciar conexão'))
    }
    return this.transition('AWAITING_QR', qrCode)
  }

  connect(): Result<WhatsAppSession, Error> {
    if (!this._state.isAwaitingQr) {
      return Result.fail(new Error(`INVALID_TRANSITION: Não é possível conectar no estado ${this._state.value}. Estado esperado: AWAITING_QR`))
    }
    return this.transition('CONNECTED', null)
  }

  disconnect(): Result<WhatsAppSession, Error> {
    if (!this._state.isConnected) {
      return Result.fail(new Error(`INVALID_TRANSITION: Não é possível desconectar no estado ${this._state.value}. Estado esperado: CONNECTED`))
    }
    return this.transition('DISCONNECTED')
  }

  fail(error: string): Result<WhatsAppSession, Error> {
    if (this._state.isFailed || this._state.isDisconnected) {
      return Result.fail(new Error(`INVALID_TRANSITION: Não é possível falhar no estado ${this._state.value}. Estados esperados: AWAITING_QR, CONNECTED`))
    }
    return this.transition('FAILED', null, error)
  }

  expireQr(): Result<WhatsAppSession, Error> {
    if (!this._state.isAwaitingQr) {
      return Result.fail(new Error(`INVALID_TRANSITION: Não é possível expirar QR no estado ${this._state.value}. Estado esperado: AWAITING_QR`))
    }
    return this.transition('FAILED', null, 'QR Code expirado (timeout de 40s)')
  }

  retry(): Result<WhatsAppSession, Error> {
    if (!this._state.isFailed) {
      return Result.fail(new Error(`INVALID_TRANSITION: Não é possível reiniciar no estado ${this._state.value}. Estado esperado: FAILED`))
    }
    return this.transition('AWAITING_QR', null)
  }
}
