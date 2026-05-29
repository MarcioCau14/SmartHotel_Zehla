import { Result } from '../../shared/Result'

export interface TenantSessionPayload {
  pousadaId: string
  userId?: string
  email?: string
  role?: string
  permissions?: string[]
}

export class TenantSession {
  private constructor(
    public readonly pousadaId: string,
    public readonly userId: string | undefined,
    public readonly email: string | undefined,
    public readonly role: string | undefined,
    public readonly permissions: readonly string[] | undefined
  ) {}

  static create(payload: TenantSessionPayload): Result<TenantSession, Error> {
    if (!payload.pousadaId || payload.pousadaId.trim().length === 0) {
      return Result.fail(new Error('pousadaId is required'))
    }
    return Result.ok(
      new TenantSession(
        payload.pousadaId.trim(),
        payload.userId,
        payload.email,
        payload.role,
        payload.permissions ? [...payload.permissions] : undefined
      )
    )
  }

  hasPermission(permission: string): boolean {
    return this.permissions?.includes(permission) ?? false
  }

  isRole(role: string): boolean {
    return this.role === role
  }
}
