import { NextRequest, NextResponse } from 'next/server'
import { Queue } from 'bullmq'
import { createHmac, timingSafeEqual } from 'crypto'
import { redisWorker } from '@/lib/redis'
import { SOCIAL_QUEUE_NAME, type SocialJobPayload } from '@/infrastructure/queue/BullMQSocialWorker'

const META_APP_SECRET = process.env.META_APP_SECRET ?? ''

function verifySignature(payload: string, signature: string): boolean {
  if (!META_APP_SECRET) return false
  const expected = 'sha256=' + createHmac('sha256', META_APP_SECRET).update(payload).digest('hex')
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
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

    if (!comment || !comment.from || !comment.message) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    const socialQueue = new Queue(SOCIAL_QUEUE_NAME, { connection: redisWorker })

    const jobPayload: SocialJobPayload = {
      platform: 'INSTAGRAM',
      username: comment.from.username || comment.from.id,
      content: comment.message,
      timestamp: Date.now(),
      isDirectMessage: comment.verb === 'direct_message',
    }

    await socialQueue.add('ProcessMetaEvent', jobPayload, {
      jobId: `meta_${entry.id}_${change.field}_${Date.now()}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    })

    await socialQueue.close()

    return new NextResponse('EVENT_RECEIVED', { status: 200 })
  } catch (error) {
    console.error('[Meta Webhook] Erro na ingestão:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
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
