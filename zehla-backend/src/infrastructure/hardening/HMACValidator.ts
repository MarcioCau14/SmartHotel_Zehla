import { createHmac, timingSafeEqual } from 'crypto'
import type { IHmacVerifierPort } from '../../application/hardening/ports/IHmacVerifierPort'

export class HMACValidator implements IHmacVerifierPort {
  private readonly algorithm: string

  constructor(algorithm: string = 'sha256') {
    this.algorithm = algorithm
  }

  sign(payload: string, secret: string): string {
    return createHmac(this.algorithm, secret).update(payload, 'utf-8').digest('hex')
  }

  verify(payload: string, signature: string, secret: string): boolean {
    const computed = this.sign(payload, secret)
    return this.constantTimeCompare(computed, signature)
  }

  private constantTimeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf-8')
    const bufB = Buffer.from(b, 'utf-8')
    if (bufA.length !== bufB.length) {
      return false
    }
    return timingSafeEqual(bufA, bufB)
  }
}
