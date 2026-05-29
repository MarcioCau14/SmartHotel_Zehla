import { Result } from '../../../domain/shared/Result'
import { TenantSession } from '../../../domain/hardening/value-objects/TenantSession'

export interface IJwtPort {
  validate(token: string): Promise<Result<TenantSession, Error>>
  sign(payload: Record<string, unknown>, secret: string): Promise<Result<string, Error>>
}
