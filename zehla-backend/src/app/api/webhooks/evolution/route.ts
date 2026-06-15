import { NextRequest, NextResponse } from 'next/server'
import { getSession, setSession, getOrCreateSession } from '@/lib/evolution/session-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, instance, data } = body

    if (!event || !instance) {
      return NextResponse.json({ error: 'event e instance são obrigatórios' }, { status: 400 })
    }

    const session = getSession(instance) || getOrCreateSession(instance)

    let updatedSession = session

    switch (event) {
      case 'connection.update': {
        const state = data?.state || ''
        if (state === 'open') {
          const result = session.state.isAwaitingQr
            ? session.connect()
            : session.state.isDisconnected
              ? session.startConnection('auto-qr')
              : null

          if (result?.isOk) {
            updatedSession = result.value
          } else if (session.state.isDisconnected) {
            const startResult = session.startConnection('auto-qr')
            if (startResult.isOk) {
              const connectResult = startResult.value.connect()
              if (connectResult.isOk) {
                updatedSession = connectResult.value
              }
            }
          }
        } else if (state === 'close' || state === 'disconnected') {
          if (session.state.isConnected) {
            const result = session.disconnect()
            if (result.isOk) updatedSession = result.value
          }
        } else if (state === 'error' || data?.error) {
          const result = session.fail(data?.error || 'Erro na conexão Evolution')
          if (result.isOk) updatedSession = result.value
        }
        break
      }

      case 'qr.update': {
        if (session.state.isDisconnected || session.state.isAwaitingQr) {
          const qrCode = data?.qrCode || data?.base64 || ''
          const result = session.startConnection(qrCode)
          if (result.isOk) updatedSession = result.value
        }
        break
      }

      case 'connection.error': {
        const errorMsg = data?.error || body?.error || 'Erro desconhecido na conexão'
        const result = session.fail(errorMsg)
        if (result.isOk) updatedSession = result.value
        break
      }

      default:
        console.log(`[EVOLUTION WEBHOOK] Evento não mapeado: ${event}`, { instance, data })
        return NextResponse.json({ received: true, ignored: true, reason: `evento ${event} não requer ação` })
    }

    setSession(updatedSession)

    return NextResponse.json({
      success: true,
      propertyId: updatedSession.propertyId,
      status: updatedSession.state.value,
      event,
    })
  } catch (error) {
    console.error('[EVOLUTION WEBHOOK ERROR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
