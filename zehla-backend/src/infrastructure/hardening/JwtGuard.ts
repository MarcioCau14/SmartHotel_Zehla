import { jwtVerify, SignJWT } from 'jose'
import { Result } from '../../domain/shared/Result'
import { TenantSession } from '../../domain/hardening/value-objects/TenantSession'
import type { IJwtPort } from '../../application/hardening/ports/IJwtPort'

export class JwtGuard implements IJwtPort {
  private readonly allowedAlgorithms = ['HS256']

  async validate(token: string): Promise<Result<TenantSession, Error>> {
    try {
      const algCheck = this.extractAlgorithm(token)
      if (algCheck.isFail) return Result.fail(algCheck.error)

      if (!this.allowedAlgorithms.includes(algCheck.value)) {
        return Result.fail(new Error(`Algorithm ${algCheck.value} is not allowed`))
      }

      const secret = this.getSecret()
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
        clockTolerance: 60,
      })

      const pousadaId = (payload as Record<string, unknown>).tenantId as string | undefined
        ?? (payload as Record<string, unknown>).pousada_id as string | undefined
        ?? (payload as Record<string, unknown>).sub as string | undefined

      if (!pousadaId) {
        return Result.fail(new Error('Token does not contain tenantId'))
      }

      return TenantSession.create({
        pousadaId,
        userId: (payload as Record<string, unknown>).sub as string | undefined,
        email: (payload as Record<string, unknown>).email as string | undefined,
        role: (payload as Record<string, unknown>).role as string | undefined,
        permissions: (payload as Record<string, unknown>).permissions as string[] | undefined,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown JWT validation error'
      return Result.fail(new Error(message))
    }
  }

  async sign(
    payload: Record<string, unknown>,
    secret: string
  ): Promise<Result<string, Error>> {
    try {
      const key = new TextEncoder().encode(secret)
      const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
      return Result.ok(token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown signing error'
      return Result.fail(new Error(message))
    }
  }

  private extractAlgorithm(token: string): Result<string, Error> {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return Result.fail(new Error('Invalid JWT format'))
      }
      const header = JSON.parse(
        Buffer.from(parts[0], 'base64url').toString('utf-8')
      )
      const alg = (header as Record<string, unknown>).alg as string
      if (!alg) {
        return Result.fail(new Error('JWT header missing algorithm'))
      }
      if (alg.toLowerCase() === 'none') {
        return Result.fail(new Error('Algorithm "none" is explicitly forbidden'))
      }
      return Result.ok(alg)
    } catch {
      return Result.fail(new Error('Failed to parse JWT header'))
    }
  }

  private getSecret(): Uint8Array {
    return new TextEncoder().encode(process.env.JWT_SECRET ?? 'zehla_shield_secret_2026')
  }
}
