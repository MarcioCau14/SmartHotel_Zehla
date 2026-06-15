import { describe, it, expect } from 'vitest'
import { WhatsAppState } from '../../domain/operacional/value-objects/WhatsAppState'
import { WhatsAppSession } from '../../domain/operacional/entities/WhatsAppSession'

describe('WhatsApp FSM', () => {
  it('deve criar estados válidos e validar comportamento', () => {
    const disconnected = WhatsAppState.create('DISCONNECTED')
    expect(disconnected.isOk).toBe(true)
    expect(disconnected.value.isConnected).toBe(false)
    expect(disconnected.value.isAwaitingQr).toBe(false)

    const awaiting = WhatsAppState.create('AWAITING_QR')
    expect(awaiting.isOk).toBe(true)
    expect(awaiting.value.isConnected).toBe(false)
    expect(awaiting.value.isAwaitingQr).toBe(true)

    const invalid = WhatsAppState.create('INVALID_STATE')
    expect(invalid.isFail).toBe(true)
  })

  it('deve realizar transições de estado corretas na FSM', () => {
    const sessionRes = WhatsAppSession.create('property-1', 'DISCONNECTED')
    expect(sessionRes.isOk).toBe(true)
    const session = sessionRes.value
    expect(session.state.value).toBe('DISCONNECTED')

    // DISCONNECTED -> AWAITING_QR
    const awaitingRes = session.startConnection('mock-qr-code')
    expect(awaitingRes.isOk).toBe(true)
    expect(awaitingRes.value.state.value).toBe('AWAITING_QR')
    expect(awaitingRes.value.qrCode).toBe('mock-qr-code')

    // AWAITING_QR -> CONNECTED
    const connectedRes = awaitingRes.value.connect()
    expect(connectedRes.isOk).toBe(true)
    expect(connectedRes.value.state.value).toBe('CONNECTED')

    // CONNECTED -> DISCONNECTED
    const disconnectedRes = connectedRes.value.disconnect()
    expect(disconnectedRes.isOk).toBe(true)
    expect(disconnectedRes.value.state.value).toBe('DISCONNECTED')
  })

  it('deve rejeitar transições de estado inválidas na FSM', () => {
    const sessionRes = WhatsAppSession.create('property-1', 'DISCONNECTED')
    const session = sessionRes.value

    // DISCONNECTED -> CONNECTED (inválido: precisa passar por AWAITING_QR)
    const connectedRes = session.connect()
    expect(connectedRes.isFail).toBe(true)
  })
})
