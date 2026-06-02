import { NextRequest } from 'next/server'
import { Result } from '../../../shared/Result'
import { JwtGuard } from '../../hardening/JwtGuard'
import { TenantSession } from '../../../domain/hardening/value-objects/TenantSession'

export async function authenticateRequest(
  request: NextRequest
): Promise<Result<TenantSession, Error>> {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return Result.fail(new Error('Missing authorization header'))
    }

    if (!authHeader.startsWith('Bearer ')) {
      return Result.fail(new Error('Invalid authorization format. Must be Bearer <token>'))
    }

    const token = authHeader.substring(7).trim()
    if (!token) {
      return Result.fail(new Error('Empty authorization token'))
    }

    const guard = new JwtGuard()
    const result = await guard.validate(token)
    if (result.isFail) {
      return Result.fail(result.error)
    }
    return Result.ok(result.value)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown authentication error'
    return Result.fail(new Error(msg))
  }
}
