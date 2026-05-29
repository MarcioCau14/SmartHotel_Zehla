import crypto from 'crypto'
import { Result } from '../../../shared/Result'

export function verifyHmacSignature(
  rawBody: string,
  signature: string,
  secret: string
): Result<boolean, Error> {
  try {
    if (!signature) {
      return Result.fail(new Error('Missing signature header'))
    }
    if (!secret) {
      return Result.fail(new Error('Missing webhook secret configuration'))
    }

    const hmac = crypto.createHmac('sha256', secret)
    const computedSignature = hmac.update(rawBody).digest('hex')

    // timingSafeEqual exige buffers de mesmo tamanho
    const sigBuffer = Buffer.from(signature, 'hex')
    const compBuffer = Buffer.from(computedSignature, 'hex')

    if (sigBuffer.length !== compBuffer.length) {
      return Result.fail(new Error('Invalid signature size'))
    }

    const isValid = crypto.timingSafeEqual(sigBuffer, compBuffer)
    if (!isValid) {
      return Result.fail(new Error('Signature verification failed'))
    }

    return Result.ok(true)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown HMAC verification error'
    return Result.fail(new Error(msg))
  }
}
