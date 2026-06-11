import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { PrismaCRMRepository } from '@/infrastructure/persistence/crm/PrismaCRMRepository'
import { ProcessSocialInteractionUseCase } from '@/application/crm/use-cases/ProcessSocialInteractionUseCase'
import { AnalyzeSocialIntentSignature } from '@/domain/crm/cognitive/AnalyzeSocialIntentSignature'

const META_APP_SECRET = process.env.META_APP_SECRET ?? ''

function verifySignature(payload: string, signature: string): boolean {
  if (!META_APP_SECRET) return false
  const expected = 'sha256=' + createHmac('sha256', META_APP_SECRET).update(payload).digest('hex')
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return false
  return timingSafeEqual(sigBuf, expBuf)
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-hub-signature-256')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const rawBody = await req.text()

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const entry = payload.entry?.[0]
    const change = entry?.changes?.[0]
    const comment = change?.value

    if (!comment || !comment.from) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    const repo = new PrismaCRMRepository()
    const useCase = new ProcessSocialInteractionUseCase(repo, AnalyzeSocialIntentSignature.classifyIntent)

    const result = await useCase.execute({
      platform: 'INSTAGRAM',
      username: comment.from.username || comment.from.id,
      content: comment.text || comment.message || '',
      timestamp: Date.now(),
      isDirectMessage: comment.verb === 'direct_message',
    })

    if (result.isFail) {
      console.error('[Social Webhook] Erro ao processar interação:', result.error)
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 })
  } catch (error) {
    console.error('[Social Webhook] Erro na ingestão:', error)
    return new NextResponse('EVENT_RECEIVED', { status: 200 })
  }
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN ?? ''

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}
