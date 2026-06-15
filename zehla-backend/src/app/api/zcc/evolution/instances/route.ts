import { NextResponse } from 'next/server'
import { getOrCreateSession, getAllSessions } from '@/lib/evolution/session-store'

export async function GET() {
  try {
    const sessions = getAllSessions()

    if (sessions.length === 0) {
      return NextResponse.json({ instances: [] })
    }

    const instances = sessions.map(s => ({
      propertyId: s.propertyId,
      status: s.state.value,
      qrCode: s.qrCode,
      expiresAt: s.expiresAt?.toISOString() ?? null,
      error: s.error,
      updatedAt: s.updatedAt.toISOString(),
    }))

    return NextResponse.json({ instances })
  } catch (error) {
    console.error('[ZCC EVOLUTION INSTANCES ERROR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { propertyId } = body

    if (!propertyId || typeof propertyId !== 'string') {
      return NextResponse.json({ error: 'propertyId é obrigatório' }, { status: 400 })
    }

    const session = getOrCreateSession(propertyId)

    return NextResponse.json({
      propertyId: session.propertyId,
      status: session.state.value,
      qrCode: session.qrCode,
      expiresAt: session.expiresAt?.toISOString() ?? null,
      error: session.error,
      updatedAt: session.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[ZCC EVOLUTION INSTANCES POST ERROR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
